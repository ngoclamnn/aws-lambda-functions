const sql = require('mssql')
const https = require('https')

const sqlConfig = {
    user: "sa",
    password: "12345678Aa",
    database: "",
    server: "localhost",
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: false
    }
}
async function main() {
    sql.connect(sqlConfig, err => {
        // ... error checks
        let htmlTr = ""
        const request = new sql.Request()
        request.stream = true // You can set streaming differently for each request
        request.query('SELECT * FROM AccountCore.dbo.Clients') // or request.execute(procedure)
        request.on('row', row => {
            console.log(row.Id)
            htmlTr += `<tr><td>${row.Id}</td><td>${row.ClientId}<td><td>${row.ProtocolType}</td><td>${row.AllowRememberConsent}<td><td>${row.AlwaysIncludeUserClaimsInIdToken}</td></tr>`
        })
        request.on('done', result => {
            let htmlTable = `<table>${htmlTr}<table>`
            const content = `<!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8">
            <meta http-equiv="x-ua-compatible" content="ie=edge">
            <title>Welcome Email</title>
            </head>
            <body>
            <h2>Hello Everyone,</h2>
            <p>Here is the GCMS approval data. </p>
            ${htmlTable}
            </body>
            </html>`
            console.log(content)
            sendEmail(content)
        })

    })

    sql.on('error', err => {
        console.log(err)
    })
}
function sendEmail(htmlContent) {
    console.log('Start Sending Email...');
    const params = {
        from: 'primera@partnersgroup.com',
        to: 'c.axonactive.nguyenngoc@partnersgroup.com',
        subject: "GCMS approval status",
        body: htmlContent,
        sourceSystem: 'AWS CLOUDWATCH ALERT',
        processorDescription: 'LAMBDA ALERT NOTIFICATION',
        createdBy: "LAMBDA GCMS ALERT NOTIFICATION"
    }
    var postData = new URLSearchParams(params).toString();
    var options = {
        hostname: 'primeramail.apps.partnersgroup.net',
        port: 443,
        path: '/rest/addMail',
        method: 'POST',
        rejectUnauthorized: false,
        requestCert: true,
        agent: false,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    var req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        console.log("Done Sending Email.");
        res.on('data', (d) => {
            console.log("Response", d);
            
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });

    req.write(postData);
    req.end();
}
main();
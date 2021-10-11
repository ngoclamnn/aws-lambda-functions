const sql = require('mssql')
var AWS = require("aws-sdk")
const SNS_TOPIC = process.env.SNS_TOPIC_ARN;
const sqlConfig = {
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  server: process.env.RDS_HOST,
  // pool: {
  //   max: 10,
  //   min: 0,
  //   idleTimeoutMillis: 30000
  // },
  port: 1433,
  options: {
    encrypt: false, // for azure
    trustServerCertificate: false // change to true for local dev / self-signed certs
  }
}

exports.handler = async(event, context) => {
 try {
  // make sure that any items are correctly URL encoded in the connection string
  await sql.connect(sqlConfig)
  const result = await sql.query`select * FROM gcms.T_Release WHERE endtime<getdate() AND status not in ('Implemented','Cancelled','Rejected')`
  console.dir(result)
  var eventText = JSON.stringify(event, null, 2);
  console.log("Received event:", eventText);
  var sns = new AWS.SNS();
  var params = {
      Message: eventText, 
      Subject: "Test SNS From Lambda",
      TopicArn: SNS_TOPIC
  };
  sns.publish(params, context.done);

 } catch (err) {
  console.log(err)
 }
}

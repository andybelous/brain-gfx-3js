const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const AWS = require("aws-sdk");
const port = 3000;

const config = require("./config/configuration_keys.json");
const bucketName = config.bucketName;
const accessKeyId = config.accessKeyId;
const secretAccessKey = config.secretAccessKey;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("App is running");
});

app.post("/getSummary", function (req, res) {
  if (!req.body.account_id) {
    return res.status(500).send({
      status: 500,
      error: "AccountId is required",
    });
  }
  getFileFromS3(req.body.account_id)
    .then((summaryData) => {
      if (!summaryData) {
        return res.status(500).send({
          error: "File does not exists.",
        });
      }
      summaryData = JSON.parse(summaryData.Body.toString("utf-8"));
      res.send({
        status: 200,
        summaryData: summaryData,
      });
    })
    .catch((err) => {
      res.status(500).send({
        status: 500,
        error: err.message,
      });
    });
});

app.listen(port, function (err) {
  console.log(`Server is listening at http://localhost:${port}`);
});

function getFileFromS3(account_id) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });
    var params = {
      Bucket: bucketName,
      Key: `${account_id}/simulation/summary.json`,
    };
    s3.getObject(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

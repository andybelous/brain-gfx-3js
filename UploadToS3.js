const fs = require("fs");
const AWS = require("aws-sdk");
const config = require("./config/configuration_keys.json");
const bucketName = config.bucketName;
const accessKeyId = config.accessKeyId;
const secretAccessKey = config.secretAccessKey;

const s3 = new AWS.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  });
function uploadToS3(account_id, file,data) {
    return new Promise((resolve, reject) => {
      const fileContent =  data;//fs.readFileSync(`./${account_id}_${file}`);
      const path = `${account_id}/simulation/SummaryBrainImages/${file}`;
      const uploadParams = {
        Bucket: bucketName,
        Key: path,
        Body: fileContent,
        // ACL: 'public-read'
      };
      s3.upload(uploadParams, (err, data) => {
        if (err) {
          reject(err);
        } else {
         // fs.unlinkSync(`./${account_id}_${file}`);
          resolve({ path: path });
        }
      });
    });
  }
  
  function uploadToS3SingleImage(account_id, event_id, file,data) {
    return new Promise((resolve, reject) => {
      const fileContent = data;//fs.readFileSync(`./${event_id}_${file}`);
      const path = `${account_id}/simulation/${event_id}/BrainImages/${file}`;
      const uploadParams = {
        Bucket: bucketName,
        Key: path,
        Body: fileContent,
        // ACL: 'public-read'
      };
      s3.upload(uploadParams, (err, data) => {
        if (err) {
          reject(err);
        } else {
        //  fs.unlinkSync(`./${event_id}_${file}`);
          resolve({ path: path });
        }
      });
    });
  }

  function getFileFromS3(file_path) {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: bucketName,
        Key: file_path,
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
  

  function uploadToS3SingleLabeledImage(account_id, event_id, file,data) {
    return new Promise((resolve, reject) => {
      const fileContent = data;//fs.readFileSync(`./${event_id}_${file}`);
      const path = `${account_id}/simulation/${event_id}/LabeledBrainImages/${file}`;
      const uploadParams = {
        Bucket: bucketName,
        Key: path,
        Body: fileContent,
        // ACL: 'public-read'
      };
      s3.upload(uploadParams, (err, data) => {
        if (err) {
          reject(err);
        } else {
          // fs.unlinkSync(`./${event_id}_${file}`);
          resolve({ path: path });
        }
      });
    });
  }

  exports.uploadToS3 = uploadToS3;
  exports.uploadToS3SingleImage = uploadToS3SingleImage;
  exports.uploadToS3SingleLabeledImage = uploadToS3SingleLabeledImage;
  exports.getFileFromS3 = getFileFromS3;

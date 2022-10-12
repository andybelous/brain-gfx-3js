const fs = require("fs");
const AWS = require("aws-sdk");
const config = require("./config/configuration_keys.json");
const bucketName = config.usersbucket;
const accessKeyId = config.awsAccessKeyId;
const secretAccessKey = config.awsSecretAccessKey;

const s3 = new AWS.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  });


var s3_without_acceleration = new AWS.S3()

  
function uploadToS3PlayerImages(account_id, file,data, pressure_dashboard = false) {
    return new Promise((resolve, reject) => {
      const fileContent =  data;//fs.readFileSync(`./${account_id}_${file}`);
      const path = pressure_dashboard? `${account_id}/simulation/PressureSummaryBrainImages/${file}` : `${account_id}/simulation/SummaryBrainImages/${file}`;
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


  function uploadToS3TeamImages(team_id, file,data, pressure_dashboard = false) {
    return new Promise((resolve, reject) => {
      const fileContent = data;//fs.readFileSync(`./${account_id}_${file}`);
      const path = pressure_dashboard? `/team/${team_id}/simulation/PressureSummaryBrainImages/${file}` : `/team/${team_id}/simulation/SummaryBrainImages/${file}`;
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

  function getTeamFileFromS3 (url, bucket_name) {
    console.log('url ---------------', url)
    return new Promise((resolve, _reject) => {
        const params = {
            Bucket: bucket_name ? bucket_name : config.usersbucket,
            Key: url
        };
        console.log('params ::: ', params)
        const fetchs3object = bucket_name === 'nsf-defaults' ? s3_without_acceleration : s3
        fetchs3object.getObject(params, function (err, data) {
            if (err) {
                console.log('e',err)
                // reject(err)
                resolve(null);
            }
            else {
                resolve(data);
            }
        });
    })
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

  exports.uploadToS3PlayerImages = uploadToS3PlayerImages;
  exports.uploadToS3SingleImage = uploadToS3SingleImage;
  exports.uploadToS3SingleLabeledImage = uploadToS3SingleLabeledImage;
  exports.getFileFromS3 = getFileFromS3;
  exports.getTeamFileFromS3 = getTeamFileFromS3;

  exports.uploadToS3TeamImages = uploadToS3TeamImages;

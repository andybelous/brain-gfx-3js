const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const AWS = require("aws-sdk");
const port = 3000;
const writeImage = require("./writeImage.js");
const config = require("./config/configuration_keys.json");
const bucketName = config.bucketName;
const accessKeyId = config.accessKeyId;
const secretAccessKey = config.secretAccessKey;

const s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
});

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
  var summaryFilePath =  `${req.body.account_id}/simulation/summary.json`;
  getFileFromS3(summaryFilePath)
    .then((summaryData) => {
      if (!summaryData) {
        return res.status(500).send({
          error: "File does not exists.",
        });
      }
      summaryData = JSON.parse(summaryData.Body.toString("utf-8"));
      console.log("Summary data", summaryData);
      // res.send({
      //   status: 200,
      //   summaryData: summaryData,
      // });

      let brainRegions = {};
      let principal_max_strain = {};
      let principal_min_strain = {};
      let axonal_strain_max = {};
      let csdm_max = {};
      let masXsr_15_max = {};
      let CSDM_5 = {};
      let CSDM_10 = {};
      let CSDM_15 = {};
      let CSDM_30 = {};
      let MPS_95 = {};
      let MPSR_120 = {};
      let MPSxSR_28 = {};
      let MPSxSR_95 = {};
      let maximum_PSxSR = {};

      if (summaryData.Insults) {
        summaryData.Insults.forEach(function (summary_data, index) {
          if (
            summary_data["principal-max-strain"] &&
            summary_data["principal-max-strain"].location
          ) {
            let coordinate = {};
            coordinate.x = summary_data["principal-max-strain"].location[0];
            coordinate.y = summary_data["principal-max-strain"].location[1];
            coordinate.z = summary_data["principal-max-strain"].location[2];
            if (summary_data["principal-max-strain"]["brain-region"]) {
              region = summary_data["principal-max-strain"][
                "brain-region"
              ].toLowerCase();
              principal_max_strain[region] = principal_max_strain[region] || [];
              principal_max_strain[region].push(coordinate);
            }
          }
          if (
            summary_data["principal-min-strain"] &&
            summary_data["principal-min-strain"].location
          ) {
            let coordinate = {};
            coordinate.x = summary_data["principal-min-strain"].location[0];
            coordinate.y = summary_data["principal-min-strain"].location[1];
            coordinate.z = summary_data["principal-min-strain"].location[2];
            if (summary_data["principal-min-strain"]["brain-region"]) {
              region = summary_data["principal-min-strain"][
                "brain-region"
              ].toLowerCase();
              principal_min_strain[region] = principal_min_strain[region] || [];
              principal_min_strain[region].push(coordinate);
            }
          }
          if (
            summary_data["axonal-strain-max"] &&
            summary_data["axonal-strain-max"].location
          ) {
            let coordinate = {};
            coordinate.x = summary_data["axonal-strain-max"].location[0];
            coordinate.y = summary_data["axonal-strain-max"].location[1];
            coordinate.z = summary_data["axonal-strain-max"].location[2];
            if (summary_data["axonal-strain-max"]["brain-region"]) {
              region = summary_data["axonal-strain-max"][
                "brain-region"
              ].toLowerCase();
              axonal_strain_max[region] = axonal_strain_max[region] || [];
              axonal_strain_max[region].push(coordinate);
            }
          }
          if (summary_data["csdm-max"] && summary_data["csdm-max"].location) {
            let coordinate = {};
            coordinate.x = summary_data["csdm-max"].location[0];
            coordinate.y = summary_data["csdm-max"].location[1];
            coordinate.z = summary_data["csdm-max"].location[2];
            if (summary_data["csdm-max"]["brain-region"]) {
              region = summary_data["csdm-max"]["brain-region"].toLowerCase();
              csdm_max[region] = csdm_max[region] || [];
              csdm_max[region].push(coordinate);
            }
          }
          if (
            summary_data["masXsr-15-max"] &&
            summary_data["masXsr-15-max"].location
          ) {
            let coordinate = {};
            coordinate.x = summary_data["masXsr-15-max"].location[0];
            coordinate.y = summary_data["masXsr-15-max"].location[1];
            coordinate.z = summary_data["masXsr-15-max"].location[2];
            if (summary_data["masXsr-15-max"]["brain-region"]) {
              region = summary_data["masXsr-15-max"][
                "brain-region"
              ].toLowerCase();
              masXsr_15_max[region] = masXsr_15_max[region] || [];
              masXsr_15_max[region].push(coordinate);
            }
          }

          if (summary_data["CSDM-5"] && summary_data["CSDM-5"].location) {
            let coordinate = {};
            coordinate.x = summary_data["CSDM-5"].location[0];
            coordinate.y = summary_data["CSDM-5"].location[1];
            coordinate.z = summary_data["CSDM-5"].location[2];
            if (summary_data["CSDM-5"]["brain-region"]) {
              region = summary_data["CSDM-5"]["brain-region"].toLowerCase();
              CSDM_5[region] = CSDM_5[region] || [];
              CSDM_5[region].push(coordinate);
            }
          }

          if (summary_data["CSDM-10"] && summary_data["CSDM-10"].location) {
            let coordinate = {};
            coordinate.x = summary_data["CSDM-10"].location[0];
            coordinate.y = summary_data["CSDM-10"].location[1];
            coordinate.z = summary_data["CSDM-10"].location[2];
            if (summary_data["CSDM-10"]["brain-region"]) {
              region = summary_data["CSDM-10"]["brain-region"].toLowerCase();
              CSDM_10[region] = CSDM_10[region] || [];
              CSDM_10[region].push(coordinate);
            }
          }

          if (summary_data["CSDM-15"] && summary_data["CSDM-15"].location) {
            let coordinate = {};
            coordinate.x = summary_data["CSDM-15"].location[0];
            coordinate.y = summary_data["CSDM-15"].location[1];
            coordinate.z = summary_data["CSDM-15"].location[2];
            if (summary_data["CSDM-15"]["brain-region"]) {
              region = summary_data["CSDM-15"]["brain-region"].toLowerCase();
              CSDM_15[region] = CSDM_15[region] || [];
              CSDM_15[region].push(coordinate);
            }
          }

          if (summary_data["CSDM-30"] && summary_data["CSDM-30"].location) {
            let coordinate = {};
            coordinate.x = summary_data["CSDM-30"].location[0];
            coordinate.y = summary_data["CSDM-30"].location[1];
            coordinate.z = summary_data["CSDM-30"].location[2];
            if (summary_data["CSDM-30"]["brain-region"]) {
              region = summary_data["CSDM-30"]["brain-region"].toLowerCase();
              CSDM_30[region] = CSDM_30[region] || [];
              CSDM_30[region].push(coordinate);
            }
          }

          if (summary_data["MPS-95"] && summary_data["MPS-95"].location) {
            let coordinate = {};
            coordinate.x = summary_data["MPS-95"].location[0];
            coordinate.y = summary_data["MPS-95"].location[1];
            coordinate.z = summary_data["MPS-95"].location[2];
            if (summary_data["MPS-95"]["brain-region"]) {
              region = summary_data["MPS-95"]["brain-region"].toLowerCase();
              MPS_95[region] = MPS_95[region] || [];
              MPS_95[region].push(coordinate);
            }
          }

          if (summary_data["MPSR-120"] && summary_data["MPSR-120"].location) {
            let coordinate = {};
            coordinate.x = summary_data["MPSR-120"].location[0];
            coordinate.y = summary_data["MPSR-120"].location[1];
            coordinate.z = summary_data["MPSR-120"].location[2];
            if (summary_data["MPSR-120"]["brain-region"]) {
              region = summary_data["MPSR-120"]["brain-region"].toLowerCase();
              MPSR_120[region] = MPSR_120[region] || [];
              MPSR_120[region].push(coordinate);
            }
          }

          if (summary_data["MPSxSR-28"] && summary_data["MPSxSR-28"].location) {
            let coordinate = {};
            coordinate.x = summary_data["MPSxSR-28"].location[0];
            coordinate.y = summary_data["MPSxSR-28"].location[1];
            coordinate.z = summary_data["MPSxSR-28"].location[2];
            if (summary_data["MPSxSR-28"]["brain-region"]) {
              region = summary_data["MPSxSR-28"]["brain-region"].toLowerCase();
              MPSxSR_28[region] = MPSxSR_28[region] || [];
              MPSxSR_28[region].push(coordinate);
            }
          }

          if (summary_data["MPSxSR-95"] && summary_data["MPSxSR-95"].location) {
            let coordinate = {};
            coordinate.x = summary_data["MPSxSR-95"].location[0];
            coordinate.y = summary_data["MPSxSR-95"].location[1];
            coordinate.z = summary_data["MPSxSR-95"].location[2];
            if (summary_data["MPSxSR-95"]["brain-region"]) {
              region = summary_data["MPSxSR-95"]["brain-region"].toLowerCase();
              MPSxSR_95[region] = MPSxSR_95[region] || [];
              MPSxSR_95[region].push(coordinate);
            }
          }

          if (
            summary_data["maximum-PSxSR"] &&
            summary_data["maximum-PSxSR"].location
          ) {
            let coordinate = {};
            coordinate.x = summary_data["maximum-PSxSR"].location[0];
            coordinate.y = summary_data["maximum-PSxSR"].location[1];
            coordinate.z = summary_data["maximum-PSxSR"].location[2];
            if (summary_data["maximum-PSxSR"]["brain-region"]) {
              region = summary_data["maximum-PSxSR"][
                "brain-region"
              ].toLowerCase();
              maximum_PSxSR[region] = maximum_PSxSR[region] || [];
              maximum_PSxSR[region].push(coordinate);
            }
          }
        });
      }

      brainRegions["principal-max-strain"] = principal_max_strain;
      brainRegions["principal-min-strain"] = principal_min_strain;
      brainRegions["axonal-strain-max"] = axonal_strain_max;
      brainRegions["csdm-max"] = csdm_max;
      brainRegions["masXsr-15-max"] = masXsr_15_max;

      brainRegions["CSDM-5"] = CSDM_5;
      brainRegions["CSDM-10"] = CSDM_10;
      brainRegions["CSDM-15"] = CSDM_15;
      brainRegions["CSDM-30"] = CSDM_30;
      brainRegions["MPS-95"] = MPS_95;
      brainRegions["MPSR-120"] = MPSR_120;
      brainRegions["MPSxSR-28"] = MPSxSR_28;
      brainRegions["MPSxSR-95"] = MPSxSR_95;
      brainRegions["maximum-PSxSR"] = maximum_PSxSR;

      writeImage(brainRegions, req.body.account_id, "principal-max-strain")
        .then((data) => {
          return uploadToS3(req.body.account_id, "principal-max-strain.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "CSDM-5");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "CSDM-5.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "CSDM-10");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "CSDM-10.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "CSDM-15");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "CSDM-15.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "CSDM-30");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "CSDM-30.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "MPS-95");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "MPS-95.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "MPSR-120");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "MPSR-120.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "MPSxSR-28");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "MPSxSR-28.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "MPSxSR-95");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "MPSxSR-95.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "axonal-strain-max");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "axonal-strain-max.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "masXsr-15-max");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "masXsr-15-max.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "maximum-PSxSR");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "maximum-PSxSR.png");
        })
        .then((data) => {
          return writeImage(brainRegions, req.body.account_id, "principal-min-strain");
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "principal-min-strain.png");
        })
        .then((data) => {
          res.send({
            status: 200,
            message: "Images uploaded successfully.",
          });
        })
        .catch((err) => {
          res.status(500).send({
            status: 500,
            error: err.message,
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        status: 500,
        error: err.message,
      });
    });
});


 app.post("/GetSingleEvent", async function (req, res) {
  if (!req.body.account_id) {
    return res.status(500).send({
      status: 500,
      error: "AccountId is required",
    });
  }else if(!req.body.event_id){
    return res.status(500).send({
      status: 500,
      error: "EventID is required",
    });
  }
  const { account_id, event_id } = req.body;
  
  var outputFilePath =  `${account_id}/simulation/${event_id}/${event_id}_output.json`;
  getFileFromS3(outputFilePath)
  .then((outputData) => {
    if (!outputData) {
      return res.status(500).send({
        error: "File does not exists.",
      });
    }
    brainRegions = JSON.parse(outputData.Body.toString("utf-8"));
    console.log('brainRegions ------------------------\n',brainRegions)

 
    writeImage(brainRegions, event_id, "principal-max-strain")
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id, event_id ,`principal-max-strain.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, `CSDM-5`);
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id,  event_id ,`CSDM-5.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "CSDM-10");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id,  event_id ,`CSDM-10.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "CSDM-15");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id,  event_id ,`CSDM-15.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "CSDM-30");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id,  event_id ,`CSDM-30.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "MPS-95");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id,  event_id ,`MPS-95.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "MPSR-120");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id,  event_id ,`MPSR-120.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "MPSxSR-28");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id,  event_id ,`MPSxSR-28.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "MPSxSR-95");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id,  event_id ,`MPSxSR-95.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "axonal-strain-max");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id,  event_id ,`axonal-strain-max.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "masXsr-15-max");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id, event_id , `masXsr-15-max.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "maximum-PSxSR");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id, event_id , `maximum-PSxSR.png`);
    })
    .then((data) => {
      return writeImage(brainRegions, event_id, "principal-min-strain");
    })
    .then((data) => {
      return uploadToS3SingleImage(req.body.account_id, event_id , `principal-min-strain.png`);
    })
    .then((data) => {
      res.send({
        status: 200,
        message: "Images uploaded successfully.",
      });
    })
    .catch((err) => {
      res.status(500).send({
        status: 500,
        error: err.message,
      });
    });

  })
  .catch((err) => {
    res.status(500).send({
      status: 500,
      error: err.message,
    });
  });
});


app.listen(process.env.PORT || port, function (err) {
  console.log(`Server is listening at http://localhost:${port}`);
});

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

function uploadToS3SingleImage(account_id, event_id ,file) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(`./${event_id}_${file}`);
    const path = `${account_id}/BrainImages/${event_id}/
    ${file}`;
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
        fs.unlinkSync(`./${event_id}_${file}`);
        resolve({ path: path });
      }
    });
  });
}


function uploadToS3(account_id, file) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(`./${account_id}_${file}`);
    const path = `${account_id}/BrainImages/${file}`;
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
        fs.unlinkSync(`./${account_id}_${file}`);
        resolve({ path: path });
      }
    });
  });
}

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
  const summaryFilePath = `${req.body.account_id}/simulation/summary.json`;
  getFileFromS3(summaryFilePath)
    .then((summaryData) => {
      if (!summaryData) {
        return res.status(500).send({
          error: "File does not exists.",
        });
      }
      summaryData = JSON.parse(summaryData.Body.toString("utf-8"));

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
          parseSummaryLocations(summary_data, 
            principal_max_strain,
            principal_min_strain,
            axonal_strain_max,
            csdm_max,
            masXsr_15_max,
            CSDM_5,
            CSDM_10,
            CSDM_15,
            CSDM_30,
            MPS_95,
            MPSR_120,
            MPSxSR_28,
            MPSxSR_95,
            maximum_PSxSR,
          );
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

      const ENABLE_COLOR = true;
      writeImage(
        brainRegions,
        req.body.account_id,
        "principal-max-strain",
        ENABLE_COLOR
      )
        .then((data) => {
          return uploadToS3(req.body.account_id, "principal-max-strain.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "CSDM-5",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "CSDM-5.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "CSDM-10",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "CSDM-10.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "CSDM-15",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "CSDM-15.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "CSDM-30",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "CSDM-30.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "MPS-95",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "MPS-95.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "MPSR-120",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "MPSR-120.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "MPSxSR-28",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "MPSxSR-28.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "MPSxSR-95",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "MPSxSR-95.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "axonal-strain-max",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "axonal-strain-max.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "masXsr-15-max",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "masXsr-15-max.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "maximum-PSxSR",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3(req.body.account_id, "maximum-PSxSR.png");
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            req.body.account_id,
            "principal-min-strain",
            ENABLE_COLOR
          );
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
  } else if (!req.body.event_id) {
    return res.status(500).send({
      status: 500,
      error: "EventID is required",
    });
  }
  const { account_id, event_id } = req.body;

  const outputFilePath = `${account_id}/simulation/${event_id}/${event_id}_output.json`;
  getFileFromS3(outputFilePath)
    .then((outputData) => {
      if (!outputData) {
        return res.status(500).send({
          error: "File does not exists.",
        });
      }

      const summaryData = JSON.parse(outputData.Body.toString("utf-8"));

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

      parseSummaryLocations(summaryData, 
        principal_max_strain,
        principal_min_strain,
        axonal_strain_max,
        csdm_max,
        masXsr_15_max,
        CSDM_5,
        CSDM_10,
        CSDM_15,
        CSDM_30,
        MPS_95,
        MPSR_120,
        MPSxSR_28,
        MPSxSR_95,
        maximum_PSxSR,
      );

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

      const ENABLE_COLOR = true;
      const DISPLAY_CHART = false;

      writeImage(brainRegions, event_id, "principal-max-strain", ENABLE_COLOR, DISPLAY_CHART)
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `principal-max-strain.png`
          );
        })
        .then((data) => {
          return writeImage(brainRegions, event_id, `CSDM-5`, ENABLE_COLOR, DISPLAY_CHART);
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `CSDM-5.png`
          );
        })
        .then((data) => {
          return writeImage(brainRegions, event_id, "CSDM-10", ENABLE_COLOR, DISPLAY_CHART);
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `CSDM-10.png`
          );
        })
        .then((data) => {
          return writeImage(brainRegions, event_id, "CSDM-15", ENABLE_COLOR, DISPLAY_CHART);
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `CSDM-15.png`
          );
        })
        .then((data) => {
          return writeImage(brainRegions, event_id, "CSDM-30", ENABLE_COLOR, DISPLAY_CHART);
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `CSDM-30.png`
          );
        })
        .then((data) => {
          return writeImage(brainRegions, event_id, "MPS-95", ENABLE_COLOR, DISPLAY_CHART);
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `MPS-95.png`
          );
        })
        .then((data) => {
          return writeImage(brainRegions, event_id, "MPSR-120", ENABLE_COLOR, DISPLAY_CHART);
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `MPSR-120.png`
          );
        })
        .then((data) => {
          return writeImage(brainRegions, event_id, "MPSxSR-28", ENABLE_COLOR, DISPLAY_CHART);
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `MPSxSR-28.png`
          );
        })
        .then((data) => {
          return writeImage(brainRegions, event_id, "MPSxSR-95", ENABLE_COLOR, DISPLAY_CHART);
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `MPSxSR-95.png`
          );
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            event_id,
            "axonal-strain-max",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `axonal-strain-max.png`
          );
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            event_id,
            "masXsr-15-max",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `masXsr-15-max.png`
          );
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            event_id,
            "maximum-PSxSR",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `maximum-PSxSR.png`
          );
        })
        .then((data) => {
          return writeImage(
            brainRegions,
            event_id,
            "principal-min-strain",
            ENABLE_COLOR
          );
        })
        .then((data) => {
          return uploadToS3SingleImage(
            req.body.account_id,
            event_id,
            `principal-min-strain.png`
          );
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

function uploadToS3(account_id, file) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(`./${account_id}_${file}`);
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
        fs.unlinkSync(`./${account_id}_${file}`);
        resolve({ path: path });
      }
    });
  });
}

function uploadToS3SingleImage(account_id, event_id, file) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(`./${event_id}_${file}`);
    const path = `${account_id}/simulation/${event_id}/BrainImages/
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

function parseSummaryLocations(summary_data, principal_max_strain, principal_min_strain, axonal_strain_max, csdm_max, masXsr_15_max,
	CSDM_5, CSDM_10, CSDM_15, CSDM_30, MPS_95, MPSR_120, MPSxSR_28, MPSxSR_95, maximum_PSxSR) {
  
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
  
		if (summary_data["principal-max-strain"].value) {
		  coordinate.value = summary_data["principal-max-strain"].value;
		}
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
  
		if (summary_data["principal-min-strain"].value) {
		  coordinate.value = summary_data["principal-min-strain"].value;
		}
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
		region = summary_data["axonal-strain-max"]["brain-region"].toLowerCase();
		axonal_strain_max[region] = axonal_strain_max[region] || [];
		if (summary_data["axonal-strain-max"].value) {
		  coordinate.value = summary_data["axonal-strain-max"].value;
		}
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
		if (summary_data["csdm-max"].value) {
		  coordinate.value = summary_data["csdm-max"].value;
		}
		csdm_max[region].push(coordinate);
	  }
	}
	if (summary_data["masXsr-15-max"] && summary_data["masXsr-15-max"].location) {
	  let coordinate = {};
	  coordinate.x = summary_data["masXsr-15-max"].location[0];
	  coordinate.y = summary_data["masXsr-15-max"].location[1];
	  coordinate.z = summary_data["masXsr-15-max"].location[2];
	  if (summary_data["masXsr-15-max"]["brain-region"]) {
		region = summary_data["masXsr-15-max"]["brain-region"].toLowerCase();
		masXsr_15_max[region] = masXsr_15_max[region] || [];
		if (summary_data["masXsr-15-max"].value) {
		  coordinate.value = summary_data["masXsr-15-max"].value;
		}
		masXsr_15_max[region].push(coordinate);
	  }
	}
  


	function parse_array_data(summary_data, strain_metric, target_object)
	{
		var result = {}
		if(summary_data[strain_metric])
		{
			result.msc = parse_by_property(summary_data, strain_metric, "msc");
			result.stem = parse_by_property(summary_data, strain_metric, "stem");
			result.cerebellum = parse_by_property(summary_data, strain_metric, "cerebellum");
			result.frontal = parse_by_property(summary_data, strain_metric, "frontal");
			result.parietal = parse_by_property(summary_data, strain_metric, "parietal");
			result.occipital = parse_by_property(summary_data, strain_metric, "occipital");
			result.temporal = parse_by_property(summary_data, strain_metric, "temporal");
		}
		Object.assign(target_object, result);
	}

	function parse_by_property(summary_data, strain_metric, brain_region)
	{
		if(summary_data[strain_metric][brain_region])
		{
			var result = summary_data[strain_metric][brain_region].map(element => {
				let coordinate = {};
				coordinate.x = element[0];
				coordinate.y = element[1];
				coordinate.z = element[2];
				if(summary_data[strain_metric].value)
				{
					coordinate.value = summary_data[strain_metric].value;
				}
				return coordinate;
			});

			return result;
	  }
	}

	parse_array_data(summary_data, "MPS-95", MPS_95);
	parse_array_data(summary_data, "CSDM-5", CSDM_5);
	parse_array_data(summary_data, "CSDM-10", CSDM_10);
	parse_array_data(summary_data, "CSDM-15", CSDM_15);
	parse_array_data(summary_data, "CSDM_30", CSDM_30);
	


	if (summary_data["MPSR-120"] && summary_data["MPSR-120"].location) {
	  let coordinate = {};
	  coordinate.x = summary_data["MPSR-120"].location[0];
	  coordinate.y = summary_data["MPSR-120"].location[1];
	  coordinate.z = summary_data["MPSR-120"].location[2];
	  if (summary_data["MPSR-120"]["brain-region"]) {
		region = summary_data["MPSR-120"]["brain-region"].toLowerCase();
		MPSR_120[region] = MPSR_120[region] || [];
		if (summary_data["MPSR-120"].value) {
		  coordinate.value = summary_data["MPSR-120"].value;
		}
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
		if (summary_data["MPSxSR-28"].value) {
		  coordinate.value = summary_data["MPSxSR-28"].value;
		}
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
		if (summary_data["MPSxSR-95"].value) {
		  coordinate.value = summary_data["MPSxSR-95"].value;
		}
		MPSxSR_95[region].push(coordinate);
	  }
	}
  
	if (summary_data["maximum-PSxSR"] && summary_data["maximum-PSxSR"].location) {
	  let coordinate = {};
	  coordinate.x = summary_data["maximum-PSxSR"].location[0];
	  coordinate.y = summary_data["maximum-PSxSR"].location[1];
	  coordinate.z = summary_data["maximum-PSxSR"].location[2];
	  if (summary_data["maximum-PSxSR"]["brain-region"]) {
		region = summary_data["maximum-PSxSR"]["brain-region"].toLowerCase();
		maximum_PSxSR[region] = maximum_PSxSR[region] || [];
		if (summary_data["maximum-PSxSR"].value) {
		  coordinate.value = summary_data["maximum-PSxSR"].value;
		}
		maximum_PSxSR[region].push(coordinate);
	  }
	}
  }

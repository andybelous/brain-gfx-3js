const serverless = require('serverless-http');
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const port = 3006;
const writeImage = require("./writeImage.js");
const parseSummaryLocations = require("./parseSummaryLocations.js");
const parseArrayData = require("./parseArrayData.js")
const {uploadToS3, uploadToS3SingleImage, uploadToS3SingleLabeledImage, getFileFromS3} = require("./UploadToS3.js");
const getLabeledImage = require("./GetLabeledImage.js");

const ENABLE_CSDM_COLOR = false;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
	console.log("req",req.query);
	var type =req.query.ftype;
	console.log("type",type);
        console.log("account_id",req.query.account_id);
	if(type == "getSummary"){
		var account_id = req.query.account_id;
		var result = await getSummaryimage(account_id);
		 res.send(result);
	}else if(type == "GetLabeledImage"){
		var account_id = req.query.account_id;
		var event_id = req.query.event_id;
		var result = await GetLabeledImage1(account_id,event_id);
		res.send(result);
	}else if(type == "GetSingleEvent"){
		var account_id = req.query.account_id;
		var event_id = req.query.event_id;
		var result = await GetSingleEventimage(account_id,event_id);
		res.send(result);
	}else {
		res.send("App is running");
	}
});
function getSummaryimage(accountid){
	return new Promise((resolve, reject) => {
		if (!accountid) {
			reject("AccountId is required");
		  }
		  const summaryFilePath = `${accountid}/simulation/summary.json`;
		  getFileFromS3(summaryFilePath)
			.then((summaryData) => {
			  if (!summaryData) {
				  reject("File does not exists");
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
					maximum_PSxSR
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
				accountid,
				"principal-max-strain",
				ENABLE_COLOR
			  )
				.then((data) => {
				  return uploadToS3(accountid, "principal-max-strain.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"CSDM-5",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "CSDM-5.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"CSDM-10",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "CSDM-10.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"CSDM-15",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "CSDM-15.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"CSDM-30",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "CSDM-30.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"MPS-95",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "MPS-95.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"MPSR-120",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "MPSR-120.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"MPSxSR-28",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "MPSxSR-28.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"MPSxSR-95",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "MPSxSR-95.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"axonal-strain-max",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "axonal-strain-max.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"masXsr-15-max",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "masXsr-15-max.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"maximum-PSxSR",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "maximum-PSxSR.png",data);
				})
				.then((data) => {
				  return writeImage(
					brainRegions,
					accountid,
					"principal-min-strain",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3(accountid, "principal-min-strain.png",data);
				})
				.then((data) => {
				  resolve("Images uploaded successfully.");
				})
				.catch((err) => {
					reject(err.message);
				});
			})
			.catch((err) => {
			  reject(err.message);
			});
	 });
}
function GetLabeledImage1(account_id,event_id){
	return new Promise((resolve, reject) => {
		if (!account_id) {
		  reject("AccountId is required");
		} else if (!event_id) {
		  reject("EventID is required");
		}  
		const outputFilePath = `${account_id}/simulation/${event_id}/${event_id}_output.json`;
		getFileFromS3(outputFilePath)
		  .then((outputData) => {
			if (!outputData) {
			  reject("File does not exists");
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
			const ENABLE_LABELS = true;
	  
			writeImage(brainRegions, event_id, "principal-max-strain", ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS)
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `principal-max-strain.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(brainRegions, event_id, `CSDM-5`, ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `CSDM-5.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(brainRegions, event_id, "CSDM-10", ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `CSDM-10.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(brainRegions, event_id, "CSDM-15", ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `CSDM-15.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(brainRegions, event_id, "CSDM-30", ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `CSDM-30.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(brainRegions, event_id, "MPS-95", ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `MPS-95.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(brainRegions, event_id, "MPSR-120", ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `MPSR-120.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(brainRegions, event_id, "MPSxSR-28", ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `MPSxSR-28.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(brainRegions, event_id, "MPSxSR-95", ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `MPSxSR-95.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(
				  brainRegions,
				  event_id,
				  "axonal-strain-max",
				  ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS
				);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `axonal-strain-max.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(
				  brainRegions,
				  event_id,
				  "masXsr-15-max",
				  ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS
				);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `masXsr-15-max.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(
				  brainRegions,
				  event_id,
				  "maximum-PSxSR",
				  ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS
				);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `maximum-PSxSR.png`,
				  data
				);
			  })
			  .then((data) => {
				return writeImage(
				  brainRegions,
				  event_id,
				  "principal-min-strain",
				  ENABLE_COLOR, DISPLAY_CHART, ENABLE_LABELS
				);
			  })
			  .then((data) => {
				return uploadToS3SingleLabeledImage(
				  account_id,
				  event_id,
				  `principal-min-strain.png`,
				  data
				);
			  })
			  .then((data) => {
				 resolve("Images uploaded successfully.");
			  })
			  .catch((err) => {
				reject(err.message);
			  });
		  })
		  .catch((err) => {
				reject(err.message);
		  });
	})
}
function GetSingleEventimage(account_id,event_id){
	return new Promise((resolve, reject) => {    
		 if (!account_id) {
			 reject("AccountId is required");
		  } else if (!event_id) {
			 reject("EventID is required");
		  }

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
		  const outputFilePath = `${account_id}/simulation/${event_id}/${event_id}_output.json`;
		  getFileFromS3(outputFilePath)
			.then((outputData) => {
			  if (!outputData) {
				reject("File does not exists");
			  }

			  const summaryData = JSON.parse(outputData.Body.toString("utf-8"));


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


        const NextOutputFilePath = `${account_id}/simulation/${event_id}/CSDM-5.json`;

        return getFileFromS3(NextOutputFilePath)}).then((outputData) => {
          if (!outputData) {
			  
          reject("File does not exists");
          }
  
          const summaryData = JSON.parse(outputData.Body.toString("utf-8"));
  
		  console.log("parseArrayData");
          parseArrayData(summaryData,
			CSDM_5
          );

          const NextOutputFilePath = `${account_id}/simulation/${event_id}/CSDM-10.json`;

          return getFileFromS3(NextOutputFilePath)}).then((outputData) => {
            if (!outputData) {
            reject("File does not exists");
            }
    
            const summaryData = JSON.parse(outputData.Body.toString("utf-8"));
    
    
			parseArrayData(summaryData,
				CSDM_10
			  );


            const NextOutputFilePath = `${account_id}/simulation/${event_id}/CSDM-15.json`;
            return getFileFromS3(NextOutputFilePath)}).then((outputData) => {
            if (!outputData) {
            reject("File does not exists");
            }
    
            const summaryData = JSON.parse(outputData.Body.toString("utf-8"));
    
    
			parseArrayData(summaryData,
				CSDM_15
			  );


            const NextOutputFilePath = `${account_id}/simulation/${event_id}/CSDM-30.json`;
            return getFileFromS3(NextOutputFilePath)}).then((outputData) => {
              if (!outputData) {
              reject("File does not exists");
              }
      
              const summaryData = JSON.parse(outputData.Body.toString("utf-8"));
      
      
			  parseArrayData(summaryData,
				CSDM_30
			  );


              const NextOutputFilePath = `${account_id}/simulation/${event_id}/MPS-95.json`;
              return getFileFromS3(NextOutputFilePath)}).then((outputData) => {
                if (!outputData) {
                reject("File does not exists");
                }

				const summaryData = JSON.parse(outputData.Body.toString("utf-8"));
      
      
				parseArrayData(summaryData,
				  MPS_95
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
					account_id,
					event_id,
					`principal-max-strain.png`,
					data
				  );
				})
				.then((data) => {
				  return writeImage(brainRegions, event_id, `CSDM-5`, ENABLE_COLOR, DISPLAY_CHART);
				})
				.then((data) => {
				  return uploadToS3SingleImage(
					account_id,
					event_id,
					`CSDM-5.png`,
					data
				  );
				})
				.then((data) => {
				  return writeImage(brainRegions, event_id, "CSDM-10", ENABLE_COLOR, DISPLAY_CHART);
				})
				.then((data) => {
				  return uploadToS3SingleImage(
					account_id,
					event_id,
					`CSDM-10.png`,
					data
				  );
				})
				.then((data) => {
				  return writeImage(brainRegions, event_id, "CSDM-15", ENABLE_COLOR, DISPLAY_CHART);
				})
				.then((data) => {
				  return uploadToS3SingleImage(
					account_id,
					event_id,
					`CSDM-15.png`,
					data
				  );
				})
				.then((data) => {
				  return writeImage(brainRegions, event_id, "CSDM-30", ENABLE_COLOR, DISPLAY_CHART);
				})
				.then((data) => {
				  return uploadToS3SingleImage(
					account_id,
					event_id,
					`CSDM-30.png`,
					data
				  );
				})
				.then((data) => {
				  return writeImage(brainRegions, event_id, "MPS-95", ENABLE_COLOR, DISPLAY_CHART);
				})
				.then((data) => {
				  return uploadToS3SingleImage(
					account_id,
					event_id,
					`MPS-95.png`,
					data
				  );
				})
				.then((data) => {
				  return writeImage(brainRegions, event_id, "MPSR-120", ENABLE_COLOR, DISPLAY_CHART);
				})
				.then((data) => {
				  return uploadToS3SingleImage(
					account_id,
					event_id,
					`MPSR-120.png`,
					data
				  );
				})
				.then((data) => {
				  return writeImage(brainRegions, event_id, "MPSxSR-28", ENABLE_COLOR, DISPLAY_CHART);
				})
				.then((data) => {
				  return uploadToS3SingleImage(
					account_id,
					event_id,
					`MPSxSR-28.png`,
					data
				  );
				})
				.then((data) => {
				  return writeImage(brainRegions, event_id, "MPSxSR-95", ENABLE_COLOR, DISPLAY_CHART);
				})
				.then((data) => {
				  return uploadToS3SingleImage(
					account_id,
					event_id,
					`MPSxSR-95.png`,
					data
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
					account_id,
					event_id,
					`axonal-strain-max.png`,
					data
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
					account_id,
					event_id,
					`masXsr-15-max.png`,
					data
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
					account_id,
					event_id,
					`maximum-PSxSR.png`,
					data
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
					account_id,
					event_id,
					`principal-min-strain.png`,
					data
				  );
				})
				.then((data) => {
					resolve("Images uploaded successfully.");     
				})
				.catch((err) => {
					reject(err.message);
				});
			})
			.catch((err) => {
				reject(err.message);
			});
	})
}
app.post("/getSummary", function (req, res) {
  if (!req.body.account_id) {
    return res.status(500).send({
      status: 500,
      error: "AccountId is required",
    });
  	}
	  const { account_id} = req.body;
        
        getSummaryimage(account_id).then((data) => {
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
});
app.post("/GetLabeledImage", async function (req, res)
{

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

	  GetLabeledImage1(account_id, event_id).then((data) => {
		  res.send({
			  status: 200,

		  })
	  })
} );
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

  GetSingleEventimage1(account_id, event_id).then((data) => {
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

});

app.listen(process.env.PORT || port, function (err) {
  console.log(`Server is listening at http://localhost:${port}`);
}); 
//module.exports.handler = serverless(app);






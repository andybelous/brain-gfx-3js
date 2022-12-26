const serverless = require('serverless-http');
const express = require("express");
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
const app = express();

const port = 3006;
const writeImage = require("./writeImage.js");
const writeRankedMpsChart = require("./writeRankedMpsChart.js");
const writeMpsVsTimePlotImage = require("./writeMpsVsTimePlotImage.js")
const parseSummaryLocations = require("./parseSummaryLocations.js");
const parseArrayData = require("./parseArrayData.js")
const {uploadToS3PlayerImages, uploadToS3SingleImage, uploadToS3SingleLabeledImage, uploadToS3PlotImage, getFileFromS3, uploadToS3TeamImages, getTeamFileFromS3} = require("./UploadToS3.js");
const getLabeledImage = require("./GetLabeledImage.js");
const SensorDetailsModel = require("./models/sensors/sensorDetailsData");

const generateBrainDetailsData = require("./generateBrainDetailsData.js");

var config = require('./config/configuration_keys.json')

// Mongo connect
var MONGODB_URL = config.MONGODB_URL;
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    //don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
        console.log("Connected to %s", MONGODB_URL);
        console.log("App is running ... \n");
    }
})
    .catch(err => {
        console.error("App starting error:", err.message);
        process.exit(1);
    });

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
	}
	else if(type == "getTeamSummary"){
		var team_id = req.query.team_id;
		var teamSummary = req.query.teamSummary;
		var result = await getTeamSummaryimage(team_id, teamSummary);
		 res.send(result);
	}
	else if(type == "GetLabeledImage"){
		var account_id = req.query.account_id;
		var event_id = req.query.event_id;
		var result = await GetLabeledImage1(account_id,event_id);
		res.send(result);
	}else if(type == "GetSingleEvent"){
		var account_id = req.query.account_id;
		var event_id = req.query.event_id;
		var result = await GetSingleEventimage(account_id,event_id);
		res.send(result);
	}
	else {
		res.send("App is running");
	}
});
function getSummaryimage(accountid, pressure_dashboard){
	return new Promise(async (resolve, reject) => {
		if (!accountid) {
			reject("AccountId is required");
		  }


			let simulationBCtype = "disp"
			let url = `${accountid}/simulation/`;
			// url += id === "625ffce0eaab772ba9b84d76" && pressure_dashboard ? 'p_summary.json' : 'disp_sim_summary.json';
			url +=
				pressure_dashboard === "true"
				? "disp_pressure_sim_summary.json"
				: "disp_strain_sim_summary.json";

			console.log("URL", url)
			let summary = await getFileFromS3(url);

			
			console.log("summarydataa", summary)
			if (!summary) {
				try{
					let urlP = `${accountid}/simulation/`;
					urlP +=
					pressure_dashboard === "true"
						? "pressure_pressure_sim_summary.json"
						: "pressure_strain_sim_summary.json";
					console.log("url122", url);
					summary = await getFileFromS3(urlP);
					console.log("summarydataa press", summary)
					simulationBCtype = "pressure"
					url = urlP

				} catch (err) {
					console.log("No summary found", err)
					reject(err);
					}
			}

			let minimumPS = [[], [], [], [], [], [], []];
			let maximumPS = [[], [], [], [], [], [], []];
			let csdm_15 = [[], [], [], [], [], [], []];
			let csdm_5 = [[], [], [], [], [], [], []];
			let csdm_10 = [[], [], [], [], [], [], []];



			let summaryOutPut = null;
			let brainComponentData = {
			  csdm_10,
			  csdm_5,
			  csdm_15,
			  maximumPS,
			  minimumPS,
			  simulationBCtype
			};
			if (summary && summary.Body)
			  summaryOutPut = JSON.parse(summary.Body.toString("utf-8"));
			if (summaryOutPut) {
			  let brainDetailsColumn
			  console.log("urlurl", url)
			  if (simulationBCtype == "pressure") {
				brainDetailsColumn =
				  url.indexOf("pressure_pressure_sim_summary") > -1
					? "principal-max-pressure"
					: "principal-max-strain";
		
			  } else {
				brainDetailsColumn =
				  url.indexOf("disp_pressure_sim_summary") > -1
					? "principal-max-pressure"
					: "principal-max-strain";
		
			  }
		
			  // column selections
			  brainComponentData = await generateBrainDetailsData(
				summaryOutPut,
				brainDetailsColumn,
				simulationBCtype,
				pressure_dashboard
			  );
			} else {
			  brainComponentData.simulationBCtype = "disp"
			}
		




			const ENABLE_COLOR = true;
			const is_pressure_dashboard = pressure_dashboard === "true";


			writeImage(
				brainComponentData,
			  accountid,
			  "principal-max-strain",
			  ENABLE_COLOR
			)
			  .then((data) => {
				return uploadToS3PlayerImages(accountid, "principal-max-strain.png",data, is_pressure_dashboard);
			  })
			  .then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"principal-min-strain",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3PlayerImages(accountid, "principal-min-strain.png",data, is_pressure_dashboard);
				})
			  .then((data) => {
				return writeImage(
					brainComponentData,
				  accountid,
				  "CSDM-5",
				  ENABLE_COLOR
				);
			  })
			  .then((data) => {
				return uploadToS3PlayerImages(accountid, "CSDM-5.png",data, is_pressure_dashboard);
			  })
			  .then((data) => {
				return writeImage(
					brainComponentData,
				  accountid,
				  "CSDM-10",
				  ENABLE_COLOR
				);
			  })
			  .then((data) => {
				return uploadToS3PlayerImages(accountid, "CSDM-10.png",data, is_pressure_dashboard);
			  })
			  .then((data) => {
				return writeImage(
					brainComponentData,
				  accountid,
				  "CSDM-15",
				  ENABLE_COLOR
				);
			  })
			  .then((data) => {
				return uploadToS3PlayerImages(accountid, "CSDM-15.png",data, is_pressure_dashboard);
			  })
			  	.then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"CSDM-30",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3PlayerImages(accountid, "CSDM-30.png",data, is_pressure_dashboard);
				})
				.then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"MPS-95",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3PlayerImages(accountid, "MPS-95.png",data, is_pressure_dashboard);
				})
				.then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"MPSR-120",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3PlayerImages(accountid, "MPSR-120.png",data, is_pressure_dashboard);
				})
				.then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"MPSxSR-28",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3PlayerImages(accountid, "MPSxSR-28.png",data, is_pressure_dashboard);
				})
				.then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"MPSxSR-95",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3PlayerImages(accountid, "MPSxSR-95.png",data, is_pressure_dashboard);
				})
				.then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"axonal-strain-max",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3PlayerImages(accountid, "axonal-strain-max.png",data, is_pressure_dashboard);
				})
				.then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"masXsr-15-max",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3PlayerImages(accountid, "masXsr-15-max.png",data, is_pressure_dashboard);
				})
				.then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"maximum-PSxSR",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3PlayerImages(accountid, "maximum-PSxSR.png",data, is_pressure_dashboard);
				})	  
			  .then((data) => {
				  resolve("Images uploaded successfully.");
				}).catch((err) => {
				reject(err.message);
			  });
			
			



	 });
}


function getTeamSummaryimage(team_id, teamSummary, pressure_dashboard){
	return new Promise(async (resolve, reject) => {
		if (!team_id) {
			reject("team_id is required");
		  }

		  //we don't need it 
		  const accountid = undefined;

			  if (!teamSummary) {
				  reject("File does not exists");
			  }
			
			
				let simulationBCtype = "disp"
				let url = `/team/${team_id}/`;
				// url += id === "625ffce0eaab772ba9b84d76" && pressure_dashboard ? 'p_summary.json' : 'disp_sim_summary.json';
				url +=
					pressure_dashboard === "true"
					? "disp_pressure_sim_summary.json"
					: "disp_strain_sim_summary.json";

				console.log("URL", url)
				let summary;



					summary = await getFileFromS3(url);

				
					if (!summary) {
				

						try{
							let urlP = `/team/${team_id}/`;
							urlP +=
							pressure_dashboard === "true"
								? "pressure_pressure_sim_summary.json"
								: "pressure_strain_sim_summary.json";
							console.log("url122", url);
							summary = await getFileFromS3(urlP);
							simulationBCtype = "pressure"
							url = urlP
						}
						catch(err)
						{
							reject("no summary file found", err);
						}
					}


			



			let summaryOutPut = null;
			let brainComponentData = null;
			if (summary && summary.Body)
			  summaryOutPut = JSON.parse(summary.Body.toString("utf-8"));
			if (summaryOutPut) {
			  let brainDetailsColumn
			  console.log("urlurl", url)
			  if (simulationBCtype == "pressure") {
				brainDetailsColumn =
				  url.indexOf("pressure_pressure_sim_summary") > -1
					? "principal-max-pressure"
					: "principal-max-strain";
		
			  } else {
				brainDetailsColumn =
				  url.indexOf("disp_pressure_sim_summary") > -1
					? "principal-max-pressure"
					: "principal-max-strain";
		
			  }
		
			  // column selections
			  brainComponentData = await generateBrainDetailsData(
				summaryOutPut,
				brainDetailsColumn,
				simulationBCtype,
				pressure_dashboard
			  );
			} else {
			  brainComponentData.simulationBCtype = "disp"
			}
		



			const is_pressure_dashboard = pressure_dashboard === "true";


			  const ENABLE_COLOR = true;
			  writeImage(
				brainComponentData,
				accountid,
				"principal-max-strain",
				ENABLE_COLOR
			  )
				.then((data) => {
				  return uploadToS3TeamImages(team_id, "principal-max-strain.png",data, is_pressure_dashboard);
				})
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"CSDM-5",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "CSDM-5.png",data);
				// })
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"CSDM-10",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "CSDM-10.png",data);
				// })
				.then((data) => {
				  return writeImage(
					brainComponentData,
					accountid,
					"CSDM-15",
					ENABLE_COLOR
				  );
				})
				.then((data) => {
				  return uploadToS3TeamImages(team_id, "CSDM-15.png",data, is_pressure_dashboard);
				})
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"CSDM-30",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "CSDM-30.png",data);
				// })
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"MPS-95",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "MPS-95.png",data);
				// })
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"MPSR-120",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "MPSR-120.png",data);
				// })
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"MPSxSR-28",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "MPSxSR-28.png",data);
				// })
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"MPSxSR-95",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "MPSxSR-95.png",data);
				// })
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"axonal-strain-max",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "axonal-strain-max.png",data);
				// })
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"masXsr-15-max",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "masXsr-15-max.png",data);
				// })
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"maximum-PSxSR",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "maximum-PSxSR.png",data);
				// })
				// .then((data) => {
				//   return writeImage(
				// 	brainRegions,
				// 	accountid,
				// 	"principal-min-strain",
				// 	ENABLE_COLOR
				//   );
				// })
				// .then((data) => {
				//   return uploadToS3TeamImages(team_id, "principal-min-strain.png",data);
				// })
				.then((data) => {
				  resolve("Images uploaded successfully.");
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
		const outputFilePath = `${account_id}/simulation/${event_id}/${event_id}_disp_sim_output.json`;
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
		  const outputFilePath = `${account_id}/simulation/${event_id}/${event_id}_disp_sim_output.json`;
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



function getSimDeatils (query) {
    console.log('query', query)
    return new Promise(async (resolve, reject) => {
        SensorDetailsModel.aggregate([
            {
                $match: {
                    team_id: {
                        $eq: mongoose.Types.ObjectId(query.team_id)
                    }

                }
            },
            {
                "$lookup": {
                    from: 'users',
                    localField: 'account_id',
                    foreignField: 'account_id',
                    as: 'users'
                }
            },
            {
                $group: {
                    _id: "$account_id",
                    total: { $sum: 1 },
                    doc: { "$first": "$$ROOT" }
                }
            },
            {
                $project: {
                    "doc.players": 1,
                    "doc.simulation_status": 1,
                    "doc.users._id": 1,
                    "doc.account_id": 1,
                    "doc.users.team_status": 1,
                }
            }
        ]).exec((err, result) => {
            if (err) {
				console.log("Error")
                reject(err);
            } else {
				console.log("Result")
                resolve(result);
            }
        });
    })
}

async function getStatsSummaryData (team_id) {
    try {
        const PlayersData = await getSimDeatils({ team_id });
        //console.log('summary data ---------------------------', PlayersData);
        let statSummaryData = [];
        let playerProfile = [];
        if (PlayersData) {

            //console.log('PlayersData :: ', PlayersData)
            var processData = PlayersData.map(function (player, index) {
                //console.log('player', player.doc)
                let playerData = player.doc.users[0];
                if (!playerData || playerData.team_status !== 1) return null;
                let url = `${player.doc.account_id}/simulation/disp_strain_sim_summary.json`;
                // let summary = await getFileFromS3(url);
                return getTeamFileFromS3(url)
                    .then((summary) => {
                        if (summary && summary.Body) {
                            var summaryOutPut = JSON.parse(summary.Body.toString('utf-8'));
                            statSummaryData.push(summaryOutPut);
                            playerProfile.push({ player: player.doc.players });
                            return null
                        } else {
                            return null
                        }
                    })
                    .catch((e) => {
                        console.log(e)
                        return null
                    })
            })
        }

		var result;
		try
		{
			result = await Promise.all(processData);
			return statSummaryData;
		}
		catch (err)
		{
			throw err;
		}
		
    } catch (err) {
        throw err
    }
}

app.post("/getTeamSummary", function (req, res) {
	if (!req.body.team_id) {
	  return res.status(500).send({
		status: 500,
		error: "team_id is required",
	  });
		}
		const { team_id, pressure_dashboard } = req.body;



		
		//console.log("getStatsSummaryData Success", team_summary)
		getStatsSummaryData(team_id).then((team_data) => {
		
			console.log("getStatsSummaryData Success", team_data)

			



			//console.log("newSummary", newSummary)


			getTeamSummaryimage(team_id, team_data, pressure_dashboard).then((data) => {
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
			

			
		  }).catch((err) => {
			  console.log("Error", err)
			res.status(500).send({
			  status: 500,
			  error: err.message,
			});
		  });
		  

  });

app.post("/getSummary", function (req, res) {
  if (!req.body.account_id) {
    return res.status(500).send({
      status: 500,
      error: "AccountId is required",
    });
  	}
	  const { account_id, pressure_dashboard} = req.body;
        
        getSummaryimage(account_id, pressure_dashboard).then((data) => {
          res.send({
            status: 200,
            message: "Images uploaded successfully.",
          });
        })
        .catch((err) => {
          res.status(500).send({
            status: 500,
            error: err,
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
	  }).catch((err) => {
		res.status(500).send({
		  status: 500,
		  error: err,
		});
	  });
	  
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

  GetSingleEventimage(account_id, event_id).then((data) => {
            res.send({
              status: 200,
              message: "Images uploaded successfully.",
            });
          })
          .catch((err) => {
            res.status(500).send({
              status: 500,
              error: err,
            });
          });

});


app.post("/GetPlotImage", async function (req, res) {
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
  
	GetPlotImage(account_id, event_id).then((data) => {
			  res.send({
				status: 200,
				message: "Plot Images uploaded successfully.",
			  });
			})
			.catch((err) => {
			  res.status(500).send({
				status: 500,
				error: err,
			  });
			});
  
  });


  function GetPlotImage(account_id,event_id){
	return new Promise(async (resolve, reject) => {    
		 if (!account_id) {
			 reject("AccountId is required");
		  } else if (!event_id) {
			 reject("EventID is required");
		  }


		  var rankedmpschart_data;
		try{
		  rankedmpschart_data = await getSimulationOfEvent(account_id, event_id);
		}
		catch (error)
		{
			reject(error);
		}


		var mpsVsTimeChart_data = [];
		try{
			mpsVsTimeChart_data = await getMpsVsTimePlotData(account_id, event_id);
		}
		catch (error)
		{
			console.log("error:", error)
			//reject(error);
		}

		let data = JSON.stringify(mpsVsTimeChart_data);


		writeRankedMpsChart(rankedmpschart_data)
		.then((data) => {
		  return uploadToS3PlotImage(
			account_id,
			event_id,
			`RankedMPS.png`,
			data
		  );
		}).then((data) => {
			return writeMpsVsTimePlotImage(
			  mpsVsTimeChart_data
			);
		  }).then((data) => {
			return uploadToS3PlotImage(
			  account_id,
			  event_id,
			  `MpsVsTime.png`,
			  data
			);
		  }).then((data)=>
			{
				resolve("Plot images uploaded correctly")
			}).catch((err) => {
				reject(err.message);
			});



	})
}

	const getMpsVsTimePlotData = (account_id, event_id) => {

		return new Promise(async (resolve, reject)=>
		{
			try {
			const event_key = `${account_id}/simulation/${event_id}/timetraces/MPS95.json`;
			const file_response = await getFileFromS3(event_key);
			const file_body =
				file_response?.Body && typeof file_response?.Body !== "undefined"
				? file_response["Body"]
				: null;
			let file_parse_body = file_body ? JSON.parse(file_body) : {};
			const file_parse_body_keys = Object.keys(file_parse_body);
			if (
				file_parse_body_keys.length > 0 &&
				file_parse_body_keys.indexOf("MPS95") > -1 &&
				file_parse_body["MPS95"] &&
				Array.isArray(file_parse_body["MPS95"])
			) {
				file_parse_body = file_parse_body["MPS95"].map((el, index) => {
				return {
					x: file_parse_body["time"][index] * 1000,
					y: file_parse_body["MPS95"][index] * 100,
				};
				});
			} else {
				file_parse_body = [];
			}
			resolve(file_parse_body);
			} catch (err) {
				console.log("Error", err)
			reject(err);
			}

	});

  };

  const getSimulationOfEvent = (account_id, event_id) => {
	return new Promise(async (resolve, reject)=>
	{

		try {

		let url = `${account_id}/simulation/${event_id}/MPSfile.dat`;
		let mps_dat_output = await getFileFromS3(url);
		let msp_dat_data = [];
		if (mps_dat_output) {
			var enc = new TextDecoder("utf-8");
			var arr = new Uint8Array(mps_dat_output.Body);
			var objdata = enc.decode(arr);
			mpsRankedDataObj = objdata.split("\n");
			for (var i = 0; i < mpsRankedDataObj.length; i++) {
			let mpsval = mpsRankedDataObj[i].split(",");
			let val = parseFloat(mpsval[1]);
			msp_dat_data.push({ id: mpsval[0], val: val });
			}

			resolve(msp_dat_data);
		}
		

		} catch (err) {
		reject(err);
		}
	
	})
  };
  
  



//  app.listen(process.env.PORT || port, function (err) {

//   console.log(`Server is listening at http://localhost:${port}`);
// });  
 module.exports.handler = serverless(app);






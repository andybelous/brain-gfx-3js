const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const port = 3000;
const writeImage = require("./writeImage.js");
const parseSummaryLocations = require("./parseSummaryLocations.js")
const {uploadToS3, uploadToS3SingleImage, getFileFromS3} = require("./UploadToS3.js")
const getLabeledImage = require("./GetLabeledImage.js")



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

app.post("/GetLabeledImage", getLabeledImage );

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





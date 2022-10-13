module.exports = generateBrainDetailsData = (summaryOutPut, column, simulationBCtype, pressure_dashboard) => {
    return new Promise((resolve, reject) => {
      let minimumPS = [[], [], [], [], [], [], []];
      let maximumPS = [[], [], [], [], [], [], []];
      let csdm_15 = [[], [], [], [], [], [], []];
      let csdm_5 = [[], [], [], [], [], [], []];
      let csdm_10 = [[], [], [], [], [], [], []];

      if (!summaryOutPut)
        return resolve({
          csdm_10,
          csdm_5,
          csdm_15,
          maximumPS,
          minimumPS
        });
  
      const AllBrainRegions = Object.keys(summaryOutPut);
      console.log("AllBrainRegions", AllBrainRegions);
      AllBrainRegions.forEach(function (regions) {
        if (regions == "top-five-impact") {
            return;
        } else {
          const mainDoc = summaryOutPut[regions];
          console.log("AllBrainRegions mainDoc", mainDoc);
          const subDoc = mainDoc[column];
          console.log("subDoc", subDoc);
          let keys = 0;
          switch (regions) {
            case "msc":
              keys = 6;
              break;
            case "stem":
              keys = 5;
              break;
            case "cerebellum":
              keys = 4;
              break;
            case "temporal":
              keys = 3;
              break;
            case "occipital":
              keys = 2;
              break;
            case "parietal":
              keys = 1;
              break;
            case "frontal":
              keys = 0;
            default:
              keys = 0;
          }
          // prinicipal-max-strain
          const principalMaxStrainValue = subDoc["value"].map((el, index) => {
            return {
              x: subDoc["location"][index][0],
              y: subDoc["location"][index][1],
              z: subDoc["location"][index][2],
              value: el,
              event_id: mainDoc["event_id"][index],
            };
          });
          maximumPS[keys] = [...principalMaxStrainValue, ...maximumPS[keys]];
  
          // prinicipal-min-strain
          if (
            typeof mainDoc["principal-min-strain"] !== "undefined" &&
            mainDoc["principal-min-strain"]
          ) {
            const principalMinStrainDoc = mainDoc["principal-min-strain"];
            const principalMinStrainValue = principalMinStrainDoc["value"].map(
              (el, index) => {
                return {
                  x: principalMinStrainDoc["location"][0],
                  y: principalMinStrainDoc["location"][1],
                  z: principalMinStrainDoc["location"][2],
                  value: el,
                  event_id: mainDoc["event_id"][index],
                };
              }
            );
  
            minimumPS[keys] = [...principalMinStrainValue, ...minimumPS[keys]];
          }
          

        }
      });






      //convert it to older format to support output.json
      let brainRegions = {
        "principal-max-strain": {},
        "principal-min-strain": {},
        "CSDM-5": {},
        "CSDM-10": {},
        "CSDM-15": {},
        "CSDM-30": {},
        "MPS-95": {},
        "MPSR-120": {},
        "MPSxSR-28": {},
        "MPSxSR-95": {},
        "maximum-PSxSR": {}
    };



    var assign_regions = (metric_name, metric_array)=>
    {
        brainRegions[metric_name].frontal = metric_array[0];
        brainRegions[metric_name].cerebellum = metric_array[4];
        brainRegions[metric_name].occipital = metric_array[2];
        brainRegions[metric_name].pariental = metric_array[1];
        brainRegions[metric_name].temporal = metric_array[3];
        brainRegions[metric_name].msc = metric_array[6];
        brainRegions[metric_name].stem = metric_array[5];
    }

      assign_regions("principal-max-strain", maximumPS);
      assign_regions("principal-min-strain", minimumPS);
      assign_regions("CSDM-5", csdm_5);
      assign_regions("CSDM-10", csdm_10);
      assign_regions("CSDM-15", csdm_15);





      process.nextTick(() => {
        resolve({
            ...brainRegions,
          simulationBCtype
        });
      });
    });
  };






  
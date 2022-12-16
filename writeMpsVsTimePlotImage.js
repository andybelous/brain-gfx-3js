const chromium = require("chrome-aws-lambda");
const fs = require('fs');
const {
  performance
} = require('perf_hooks');


module.exports = function writeMpsVsTimePlotImage(
  chartData
) {
  return new Promise((resolve, reject) => {
    const DATA = chartData;
    

    const html = `<html>
    <head>
      <meta charset="utf-8">
      <style>
    
        body { margin: 0; 
        }
        #c
        {
            width: 100%;
            height: 100%;
            display: block;
        }
    
          </style>
      
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.8.0/chart.min.js" integrity="sha512-sW/w8s4RWTdFFSduOTGtk4isV1+190E/GghVffMA9XczdJ2MDzSzLEubKAs5h0wzgSJOQTRYyaz73L3d6RtJSg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@0.7.0"></script>
    </head>
    <body>
      <div id="blur-container">
    
      <div id="chart-container" style = "display:inline-block; width: 100%; height: 100%;">
        <canvas id="chart" style="width: 100%;height: 100%;"></canvas>
      </div>
    </div>
    
    <script src="MPSVsTimePlot.js"></script>
    </body>
    </html>`;

    async function executeScript () {

  
      const minimal_args = [
        "--enable-webgl",
        "--disable-web-security",
        "--use-cmd-decoder=passthrough"
      ];
     const   browser = await chromium.puppeteer.launch({
      args: minimal_args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

      // console.log("test 1",browser);

      //const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 937 });
      await page.setContent(html);
      // page.on('console', (log) => console[log._type](log._text));

      page
        .on("console", (message) =>
          console.log(
            `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`
          )
        )
        .on("pageerror", ({ message }) => console.log(message))
        .on("response", (response) =>
          console.log(`${response.status()} ${response.url()}`)
        )
        .on("requestfailed", (request) =>
          console.log(`${request.failure().errorText} ${request.url()}`)
        );

      var result = await page.evaluate(
        async ({
          DATA
        }) => {
          return await new Promise((resolve) => {

            setUpChart(DATA);
            function setUpChart(chart_data) {
                var ctx = document.getElementById("chart").getContext("2d");
                var points = chart_data;
              
              
                
                  const data = {
                    datasets: [
                      {
                        label: "MPS vs Time",
                        data: points,
                        pointRadius: 5,
                        pointHoverRadius: 10,
                        backgroundColor: "rgb(0 123 255 / 63%)",
                      },
                    ],
                  };
                  const options = {
                    responsive: true,
                    animation: {
                        onComplete: function() {
                          resolve(true);
                        }
                    },
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        type: "linear",
                        position: "bottom",
                        title: {
                          display: true,
                          font: {
                            size: 14,
                            weight: 600,
                          },
                          text: "Time (ms)",
                        },
                      },
                      y: {
                        type: "linear",
                        title: {
                          display: true,
                          font: {
                            size: 14,
                            weight: 600,
                          },
                          color: "#808080c9",
                          text: "95% MPS",
                        },
                      },
                    },
                    plugins: {
                      datalabels: {
                        color: "#007bff",
                        display: false,
                      },
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        enabled: false,
                      },
                    },
                
                  };
                
                
              
              
                var myChart = new Chart(ctx, {
                  type: "scatter",
                  data: data,
                  options: options,
                });
              }
              


            
          });
        },
        {
          DATA
        }
      );

      console.log("Successfully rendered plot image:", result);
     /*  const screenshot = await page.screenshot({
        path: account_id + "_" + BRAIN_STRAIN_ACTIVE + ".png",
      });  */
      const base64 = await page.screenshot({
        fullPage: true,
        //omitBackground: true,
       encoding: 'binary'
          })
           await browser.close();
           resolve(base64);
    };

    executeScript();
  
  });
  
};
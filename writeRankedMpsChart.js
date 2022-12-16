const chromium = require("chrome-aws-lambda");
const fs = require('fs');
const {
  performance
} = require('perf_hooks');


module.exports = function writeRankedMpsChart(
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
    
    <script src="plot.js"></script>
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
            function setUpChart(data) {
              var ctx = document.getElementById("chart").getContext("2d");
              var points = data;

              let pointsData = [];
              let labelData = [];
              var max_element_val = 10;
              console.log("points ----------------------\n", points);
              for (var i = 0; i < points.length; i++) {
                // console.log('parseFloat(points[i].id)',parseFloat(points[i].id))
                pointsData.push({ y: points[i].val, x: points[i].id });
                labelData.push(points[i].id);
              }

              // console.log('labelData ----------------------/n',JSON.stringify(labelData))
              if (points.length > 0) {
                max_element_val = labelData
                  .map((el) => {
                        return parseFloat(el)})
                  .reduce((a, b) => Math.max(a, b));
              }

              const makeArr = (startValue, stopValue, cardinality) => {
                var arr = [];
                var step = (stopValue - startValue) / (cardinality - 1);
                for (var i = 0; i < cardinality; i++) {
                  arr.push(parseInt(startValue + step * i));
                }
                return arr;
              };
              var label = makeArr(0, max_element_val, max_element_val);
              // var label = makeArr(0, 100, 100);

              pointsData.sort(function (a, b) {
                return b.y - a.y;
              });


              // line options
              const options = {
                responsive: true,
                animation: {
                    onComplete: function() {
                      resolve(true);
                    }
                },
                maintainAspectRatio: false,
                fill: false,
                plugins: {
                  datalabels: {
                    // hide datalabels for all datasets
                    display: false,
                  },
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                    text: "",
                    font: {
                      size: 32,
                    },
                    color: "#000",
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: "Ranked MPS",
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      suggestedMin: 0,
                      display: true,
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Element Count",
                    },
                    ticks: {
                      suggestedMin: 0,
                      precision: 0,
                      color: "#000000",
                      display: false,
                      fontSize: 0.1,
                    },
                    grid: {
                      drawOnChartArea: false,
                      drawBorder: false,
                      color: "#ffffff",
                    },
                  },
                },
              };

              var data = {
                labels: label,
                fill: false,
                datasets: [
                  {
                    lineTension: 0,
                    label: "MPS",
                    backgroundColor: "#88DD88",
                    borderColor: "#88DD88",
                    pointRadius: 1,
                    fill: false,
                    data: pointsData,
                  },
                ],
              };


              var myChart = new Chart(ctx, {
                type: "line",
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
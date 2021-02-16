const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const AWS = require("aws-sdk");
const port = 3000;

const config = require("./config/configuration_keys.json");
const bucketName = config.bucketName;
const accessKeyId = config.accessKeyId;
const secretAccessKey = config.secretAccessKey;

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
  getFileFromS3(req.body.account_id)
    .then((summaryData) => {
      if (!summaryData) {
        return res.status(500).send({
          error: "File does not exists.",
        });
      }
      summaryData = JSON.parse(summaryData.Body.toString("utf-8"));
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
        });
      }
      brainRegions["principal-max-strain"] = principal_max_strain;
      brainRegions["principal-min-strain"] = principal_min_strain;
      brainRegions["axonal-strain-max"] = axonal_strain_max;
      brainRegions["csdm-max"] = csdm_max;
      brainRegions["masXsr-15-max"] = masXsr_15_max;

      writeImage(brainRegions, "principal-max-strain")
        .then((data) => {
          return writeImage(brainRegions, "CSDM-5")
        }).then((data) => {
          res.send({
            status: 200,
            message: 'Images created successfully.',
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

app.listen(port, function (err) {
  console.log(`Server is listening at http://localhost:${port}`);
});

function getFileFromS3(account_id) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });
    var params = {
      Bucket: bucketName,
      Key: `${account_id}/simulation/summary.json`,
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

function writeImage(summaryData, BRAIN_STRAIN_ACTIVE) {
  return new Promise((resolve, reject) => {

    //const SAMPLE_DATA = fs.readFileSync('./data.json', {encoding:'utf8', flag:'r'});
    const SAMPLE_DATA = summaryData;
    const BRAIN_MODEL_RAW_URL = "https://glb-model.s3.amazonaws.com/brain1.glb";
    //const BRAIN_STRAIN_ACTIVE = "principal-max-strain";
    console.log("In writeImage function");

    const html = `<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; }
      #c
      {
          width: 100%;
          height: 100%;
          display: block;
      }
        </style>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.min.js" integrity="sha512-XI02ivhfmEfnk8CEEnJ92ZS6hOqWoWMKF6pxF/tC/DXBVxDXgs2Kmlc9CHA0Aw2dX03nrr8vF54Z6Mqlkuabkw==" crossorigin="anonymous"></script>
    <script src="https://threejs.org/examples/js/loaders/GLTFLoader.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js" integrity="sha512-d9xgZrVZpmmQlfonhQUvTR7lMPtO7NkZMkA0ABN3PHCbKA5nqylQ/yWlFAyY6hYgdF1Qh6nYiuADWwKB4C2WSw==" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@0.7.0"></script>
  </head>
  <body>
    <h1 id="strain-metric" style="position: absolute; top:0; left: 50%; transform: translate(-50%);">Location of Maximum Principal Strain</h1>
    <div id="content" style="margin-top: 70px;"></div>
    <div id="canvas-container" style="width: 40%; height: 80%; display: inline-block;">
    </div>
    <div style = "display:inline-block; width: 50%; height: 80%; margin-left: 5%;">
      <canvas id="chart" style="width: 100%;height: 100%;"></canvas>
    </div>
  <script src="index.js"></script>
  </body>
  </html>`;

    (async () => {
      var args = puppeteer.defaultArgs();
      args.push("--disable-web-security");
      // args = args.filter(arg => arg !== '--headless');
      // Lanch pupeteer with custom arguments
      const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: true,
        args,
      });

      //const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
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
        async ({ SAMPLE_DATA, BRAIN_MODEL_RAW_URL, BRAIN_STRAIN_ACTIVE }) => {
          return await new Promise((resolve) => {
            var threeCanvasContainer;
            var brainRegions;
            let camera,
              scene,
              renderer,
              canvas,
              raycaster,
              root,
              sphereContainer,
              labelSize = 10;
            let brainModel;
            let isClicked = false;
            let aspectRatio,
              width,
              height,
              currentSubCamera,
              initialRatio,
              prevCanvasWidth;
            let previousClicked = null;
            const defaultTransparency = 0.3;
            const highlightTransparency = 0.4;
            const defaultColor = 0x7a5a16;
            const highlightColor = 0xadab24;
            const highlightEmissiveIntensity = 0.6;

            const amount = 2;
            const space = 10;
            const near = 0.1;
            const far = 100;
            const cameraAttArr = [
              {
                x: 0,
                y: 0,
                rotX: 0,
                rotY: -Math.PI / 2,
                rotZ: 0,
                fov: 10,
              },
              {
                x: 1,
                y: 0,
                rotX: -Math.PI / 15,
                rotY: -Math.PI / 5,
                rotZ: 0,
                fov: 10,
              },
              {
                x: 1,
                y: 1,
                rotX: -Math.PI / 2,
                rotY: 0,
                rotZ: 0,
                fov: 10,
              },
            ];
            const defaultCamAtt = {
              x: -1,
              y: -1,
              rotX: 0,
              rotY: 0,
              rotZ: 0,
              fov: 10,
            };
            const pickPosition = { x: 0, y: 0 };

            raycaster = new THREE.Raycaster();
            let pickedObject = null;
            let prevPickedObject = null;
            let pickedObjectSavedColor = 0;
            let defaultBarColors = [
              "#7CB5EC",
              "#7CB5EC",
              "#7CB5EC",
              "#7CB5EC",
              "#7CB5EC",
              "#7CB5EC",
              "#7CB5EC",
            ];

            let stem_json = [];
            // let csf_json = [];
            let frontal_lobe_json = [];
            let cerebellum_lobe_json = [];
            let middle_part_of_the_brain_json = [];
            let occipital_lobe_json = [];
            let pariental_lobe_json = [];
            let temporal_lobe_json = [];
            let all_spheres_json = [];

            const sphereGeo = new THREE.SphereGeometry(0.003, 32, 32);
            const sphereMat = new THREE.MeshStandardMaterial({
              color: 0xff0000,
            });

            var brainStrainActive = BRAIN_STRAIN_ACTIVE;

            // const json = JSON.parse(SAMPLE_DATA);
            // brainRegions = json.brainRegions;
            brainRegions = SAMPLE_DATA;
            startScene();

            function startScene() {
              init();
            }

            function init() {
              sceneSetup();

              cameraSetup();

              lightSetup();

              objectSetup();

              //clearPickPosition();
            }

            function sceneSetup() {
              scene = new THREE.Scene();
              scene.background = new THREE.Color("white");

              renderer = new THREE.WebGLRenderer({
                antialias: true,
                preserveDrawingBuffer: true,
                alpha: true,
              });
              canvas = renderer.domElement;
              threeCanvasContainer = document.getElementById("canvas-container");
              threeCanvasContainer.appendChild(renderer.domElement);
              aspectRatio =
                threeCanvasContainer.offsetWidth /
                threeCanvasContainer.offsetHeight;

              initialRatio = 1 / aspectRatio;

              width =
                (threeCanvasContainer.offsetWidth / amount) *
                window.devicePixelRatio;
              height =
                (threeCanvasContainer.offsetHeight / amount) *
                window.devicePixelRatio;
              renderer.setPixelRatio(window.devicePixelRatio);
              renderer.setSize(
                threeCanvasContainer.offsetWidth,
                threeCanvasContainer.offsetHeight
              );
            }

            function cameraSetup() {
              let cameras = [];

              for (let y = 0; y < amount; y++) {
                for (let x = 0; x < amount; x++) {
                  let cameraAtt = cameraAttArr.filter((item) => {
                    return item.x === x && item.y === y;
                  });

                  if (cameraAtt.length === 0) cameraAtt[0] = defaultCamAtt;

                  const subCamera = new THREE.PerspectiveCamera(
                    cameraAtt[0].fov,
                    aspectRatio,
                    near,
                    far
                  );
                  subCamera.viewport = new THREE.Vector4(
                    Math.floor(x * width + space / 2),
                    Math.floor(y * height + space / 2),
                    Math.ceil(width) - space,
                    Math.ceil(height) - space
                  );

                  const subCameraContainer = new THREE.Object3D();
                  subCameraContainer.add(subCamera);

                  subCamera.position.x = 0;
                  subCamera.position.y = 0;
                  subCamera.position.z = 1;
                  subCameraContainer.rotation.x += cameraAtt[0].rotX;
                  subCameraContainer.rotation.y += cameraAtt[0].rotY;
                  subCameraContainer.rotation.z += cameraAtt[0].rotZ;
                  subCamera.updateProjectionMatrix();
                  subCamera.lookAt(0, 0, 0);
                  subCamera.updateMatrixWorld();
                  cameras.push(subCamera);
                }
              }

              camera = new THREE.ArrayCamera(cameras);
              camera.position.z = 3;
            }

            function lightSetup() {
              const hemLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 1);
              scene.add(hemLight);

              const dirLight = new THREE.DirectionalLight(0xffffff, 1);
              dirLight.position.set(10, 20, 10);
              scene.add(dirLight);
            }

            function objectSetup() {
              // Add background
              const bgGeo = new THREE.PlaneBufferGeometry(100, 100);
              const bgMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

              const background = new THREE.Mesh(bgGeo, bgMat);
              background.name = "background";
              const bg1 = background.clone();
              const bg2 = background.clone();
              const bg3 = background.clone();
              const bg4 = background.clone();
              bg1.position.set(0, 0, -2);
              bg2.position.set(-2, 0, 0);
              bg2.rotation.y = Math.PI / 2;
              bg3.position.set(2, 0, 0);
              bg3.rotation.y = -Math.PI / 2;
              bg4.position.set(0, -2, 0);
              bg4.rotation.x = -Math.PI / 2;
              scene.add(bg1);
              scene.add(bg2);
              scene.add(bg3);
              scene.add(bg4);

              // let me = this;

              // Load&Add brain
              const gltfLoader = new THREE.GLTFLoader();
              gltfLoader.load(
                BRAIN_MODEL_RAW_URL,
                //gltfLoader.parse(BRAIN_MODEL_BUFFER, './',
                (gltf) => {
                  root = gltf.scene;

                  const box = new THREE.Box3().setFromObject(root);
                  // const boxSize = box.getSize(new THREE.Vector3()).length();
                  const boxCenter = box.getCenter(new THREE.Vector3());

                  sphereContainer = new THREE.Object3D();
                  root.add(sphereContainer);
                  showUpdatedRegion();

                  root.position.x -= boxCenter.x;
                  root.position.y -= boxCenter.y;
                  root.position.z -= boxCenter.z;

                  root.traverse((n) => {
                    let match = n.name.match(/pointer/g);

                    if (n.isMesh && !match) {
                      n.material = n.material.clone();
                      n.material.transparent = true;
                      n.material.map = null;
                      n.material.color.set(defaultColor);
                      n.material.opacity = defaultTransparency;

                      if (
                        n.name !==
                        "Brainstem_Spinal_cord_node_Brainstem_Spinal_cord" &&
                        n.name !== "Cerebellum_node_Cerebellum" &&
                        n.name !==
                        "Cerebral_hemispheres_R_node_Cerebral_hemispheres_R" &&
                        n.name !== "Frontal_Lobe_node_Frontal_Lobe" &&
                        n.name !==
                        "Motor_and_Sensor_Cortex_node_Motor_and_Sensor_Cortex" &&
                        n.name !== "node_Mesh_16" &&
                        n.name !== "Temporal_Lobe_node_Temporal_Lobe"
                      )
                        n.visible = false;
                    }
                  });

                  brainModel = new THREE.Object3D();
                  brainModel.add(root);
                  brainModel.rotation.x = Math.PI / 2;
                  brainModel.rotation.y = Math.PI;
                  brainModel.rotation.z = Math.PI;

                  scene.add(brainModel);
                  renderer.render(scene, camera);
                  resolve(true);
                },
                (error) => console.log(error)
              );
            }

            function showUpdatedRegion() {
              console.log("brainRegions", brainStrainActive);
              frontal_lobe_json = brainRegions[brainStrainActive]
                ? brainRegions[brainStrainActive].frontal || []
                : [];
              cerebellum_lobe_json = brainRegions[brainStrainActive]
                ? brainRegions[brainStrainActive].cerebellum || []
                : [];
              occipital_lobe_json = brainRegions[brainStrainActive]
                ? brainRegions[brainStrainActive].occipital || []
                : [];
              pariental_lobe_json = brainRegions[brainStrainActive]
                ? brainRegions[brainStrainActive].parietal || []
                : [];
              temporal_lobe_json = brainRegions[brainStrainActive]
                ? brainRegions[brainStrainActive].temporal || []
                : [];
              middle_part_of_the_brain_json = brainRegions[brainStrainActive]
                ? brainRegions[brainStrainActive].msc || []
                : [];
              stem_json = brainRegions[brainStrainActive]
                ? brainRegions[brainStrainActive].stem || []
                : [];
              //csf_json = this.props.brainRegions[brainStrainActive].csf || []
              console.log("frontal_lobe_json", pariental_lobe_json);
              all_spheres_json = [];
              all_spheres_json = all_spheres_json.concat(frontal_lobe_json);
              all_spheres_json = all_spheres_json.concat(cerebellum_lobe_json);
              all_spheres_json = all_spheres_json.concat(occipital_lobe_json);
              all_spheres_json = all_spheres_json.concat(pariental_lobe_json);
              all_spheres_json = all_spheres_json.concat(temporal_lobe_json);
              all_spheres_json = all_spheres_json.concat(
                middle_part_of_the_brain_json
              );
              all_spheres_json = all_spheres_json.concat(stem_json);
              // all_spheres_json = all_spheres_json.concat(csf_json);

              showAllSpheres();
              setUpChart();
            }

            function showAllSpheres() {
              // console.log('showing allshpere')
              // console.log('showAllSpheres------------------------\n',all_spheres_json)
              all_spheres_json.forEach(function (object, index) {
                var i = parseInt(index + 1);
                generateSphere(object.x, object.y, object.z, "pointer" + i);
              });
            }

            function generateSphere(x, y, z, sphereName) {
              // console.log('creating shaprers')
              if (root) {
                // Add pointer(s) to brain model as children
                // const sphereGeo = new THREE.SphereGeometry(0.003, 32, 32);
                // const sphereMat = new THREE.MeshStandardMaterial({
                // 	color: 0xff0000
                // });
                const sphere = new THREE.Mesh(sphereGeo, sphereMat);
                const pointerPos = new THREE.Vector3(x, y, z);
                // (x, y, z) --> (x, -z, y)
                sphere.position.x += pointerPos.x;
                sphere.position.y += pointerPos.z;
                sphere.position.z -= pointerPos.y;
                sphere.name = sphereName;
                sphereContainer.add(sphere);
              }
            }

            function setUpChart() {
              var ctx = document.getElementById("chart").getContext("2d");
              const data = {
                labels: [
                  "Frontal",
                  "Parietal",
                  "Occipital",
                  "Temporal",
                  "Cerebellum",
                  "Stem",
                  ["Motor/", "Sensor ", "Cortex"],
                ],
                datasets: [
                  {
                    label: "Events",
                    lineTension: 0.1,
                    backgroundColor: defaultBarColors,
                    borderColor: "#1987DD",
                    hoverBackgroundColor: "rgba(255,255,102)",
                    hoverBorderColor: "rgba(255,255,102)",
                    data: [
                      parseFloat(frontal_lobe_json.length),
                      parseFloat(pariental_lobe_json.length),
                      parseFloat(occipital_lobe_json.length),
                      parseFloat(temporal_lobe_json.length),
                      parseFloat(cerebellum_lobe_json.length),
                      parseFloat(stem_json.length),
                      parseFloat(middle_part_of_the_brain_json.length),
                    ],
                  },
                ],
              };
              const options = {
                animation: false,
                responsive: false,
                plugins: {
                  datalabels: {
                    color: "#007bff",
                    font: function (context) {
                      var width = context.chart.width;
                      labelSize = Math.round(width / 20);
                      return {
                        size: labelSize,
                      };
                    },
                    formatter: function (value, context) {
                      switch (context.dataIndex) {
                        case 0:
                          return frontal_lobe_json.length;
                          // eslint-disable-next-line
                          break;
                        case 1:
                          return pariental_lobe_json.length;
                          // eslint-disable-next-line
                          break;
                        case 2:
                          return occipital_lobe_json.length;
                          // eslint-disable-next-line
                          break;
                        case 3:
                          return temporal_lobe_json.length;
                          // eslint-disable-next-line
                          break;
                        case 4:
                          return cerebellum_lobe_json.length;
                          // eslint-disable-next-line
                          break;
                        case 5:
                          return stem_json.length;
                          // eslint-disable-next-line
                          break;
                        case 6:
                          return middle_part_of_the_brain_json.length;
                          // eslint-disable-next-line
                          break;
                        default:
                          break;
                      }
                    },
                  },
                },
                scales: {
                  yAxes: [
                    {
                      scaleLabel: {
                        display: true,
                        labelString: "Number of Events",
                        fontSize: 30,
                        fontColor: "#4c4d4d",
                      },
                      ticks: {
                        min: 0,
                        fontSize: 12,
                      },
                    },
                  ],
                  xAxes: [
                    {
                      scaleLabel: {
                        display: false,
                        labelString: "Angular Acceleration",
                      },
                      ticks: {
                        display: true, //this will remove only the label
                        fontSize: 22,
                      },
                    },
                  ],
                },
                legend: {
                  display: false,
                },
              };
              var myChart = new Chart(ctx, {
                type: "bar",
                data: data,
                options: options,
              });

              document.getElementById(
                "strain-metric"
              ).innerHTML = brainStrainActive;
            }
          });
        },
        { SAMPLE_DATA, BRAIN_MODEL_RAW_URL, BRAIN_STRAIN_ACTIVE }
      );

      console.log("Successfully rendered:", result);
      setTimeout(async () => {
        const screenshot = await page.screenshot({ path: BRAIN_STRAIN_ACTIVE + ".png" });
        await browser.close();
        resolve(screenshot);
      }, 0);
    })();

    // return 1; // Function returns the product of a and b
  });
}

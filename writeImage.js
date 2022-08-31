const chromium = require("chrome-aws-lambda");
const fs = require('fs');


module.exports = function writeImage(
  summaryData,
  account_id,
  BRAIN_STRAIN_ACTIVE,
  ENABLE_COLOR,
  DISPLAY_CHART = true,
  ENABLE_LABELS = false
) {
  return new Promise((resolve, reject) => {
    //const SAMPLE_DATA = fs.readFileSync('./data.json', {encoding:'utf8', flag:'r'});
    const SAMPLE_DATA = summaryData;
    const BRAIN_MODEL_RAW_URL = "https://glb-model.s3.amazonaws.com/brain1.glb";
    //const BRAIN_STRAIN_ACTIVE = "principal-max-strain";
    console.log("In writeImage function");



    function check_if_no_spheres (brainStrainActive, brainRegions)
    {
      var frontal_lobe_json = brainRegions[brainStrainActive]
        ? brainRegions[brainStrainActive].frontal || []
        : [];
      var cerebellum_lobe_json = brainRegions[brainStrainActive]
        ? brainRegions[brainStrainActive].cerebellum || []
        : [];
      var occipital_lobe_json = brainRegions[brainStrainActive]
        ? brainRegions[brainStrainActive].occipital || []
        : [];
      var pariental_lobe_json = brainRegions[brainStrainActive]
        ? brainRegions[brainStrainActive].parietal || []
        : [];
      var temporal_lobe_json = brainRegions[brainStrainActive]
        ? brainRegions[brainStrainActive].temporal || []
        : [];
      var middle_part_of_the_brain_json = brainRegions[brainStrainActive]
        ? brainRegions[brainStrainActive].msc || []
        : [];
      var stem_json = brainRegions[brainStrainActive]
        ? brainRegions[brainStrainActive].stem || []
        : [];
      //csf_json = this.props.brainRegions[brainStrainActive].csf || []
      var all_spheres_json = [];
      all_spheres_json = all_spheres_json.concat(frontal_lobe_json);
      all_spheres_json = all_spheres_json.concat(cerebellum_lobe_json);
      all_spheres_json = all_spheres_json.concat(occipital_lobe_json);
      all_spheres_json = all_spheres_json.concat(pariental_lobe_json);
      all_spheres_json = all_spheres_json.concat(temporal_lobe_json);
      all_spheres_json = all_spheres_json.concat(
        middle_part_of_the_brain_json
      );
      all_spheres_json = all_spheres_json.concat(stem_json);

      return all_spheres_json.length == 0;
  }

    if(check_if_no_spheres(BRAIN_STRAIN_ACTIVE, summaryData))
    {
      console.log("no spheres, return no_data_image")

      if(BRAIN_STRAIN_ACTIVE == "CSDM-10")
      {
        fs.readFile('./CSDM_10_no_data_image.png', (err, no_data_image)=>{
          if (err) {
            console.error(err);
            return;
          }
        
          resolve(no_data_image);
          return;
        });
      }
      else if(BRAIN_STRAIN_ACTIVE == "CSDM-15")
      {
        fs.readFile('./CSDM_15_no_data_image.png', (err, no_data_image)=>{
          if (err) {
            console.error(err);
            return;
          }
        
          resolve(no_data_image);
          return;
        });
      }
      else if(BRAIN_STRAIN_ACTIVE == "CSDM-30")
      {
        fs.readFile('./CSDM_30_no_data_image.png', (err, no_data_image)=>{
          if (err) {
            console.error(err);
            return;
          }
        
          resolve(no_data_image);
          return;
        });
      }
      else
      {

          fs.readFile('./no_data_image.png', (err, no_data_image)=>{
            if (err) {
              console.error(err);
              return;
            }
          
            resolve(no_data_image);
            return;
        });
      
      }




    }
    else 
    {



    const html = `<html>
    <head>
      <meta charset="utf-8">
      <style>
    
        body { margin: 0; }
        #no-spheres-text{
          display: none;
          width: 540px;
          text-align: center;
          position: absolute;
          font-size: 70;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        #c
        {
            width: 100%;
            height: 100%;
            display: block;
        }
        .dot-container
        {
          display: inline-block;
          width: 325px;
          height: 80px;
          /* margin-right: 50px; */
          font-size: 35px;
        }
        .dot-container-small
        {
          width: 170px;
          font-size: 35px;
        }
        .dot {
            height: 25px;
            width: 25px;
            
            border-radius: 50%;
            display: inline-block;
         }
         .green
         {
            height: 10px;
            width: 10px;
            background-color: #00b050;
         }
         .orange
         {
          height: 15px;
          width: 15px;
          background-color: #ed7d31;
         }
         .red
         {
          height: 20px;
          width: 20px;
          background-color: #ff0000;
         }
         .black
         {
          height: 25px;
          width: 25px;
          background-color: #000000;
         }
         .grey-text
         {
           color: grey;
           width: fit-content;
           font-size: 28px;
           position: relative;
           left: 50%;
           transform: translate(-50%);
         }
         .small-grey-text
         {
           font-size: 24;
         }
          </style>
      
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.min.js" integrity="sha512-XI02ivhfmEfnk8CEEnJ92ZS6hOqWoWMKF6pxF/tC/DXBVxDXgs2Kmlc9CHA0Aw2dX03nrr8vF54Z6Mqlkuabkw==" crossorigin="anonymous"></script>
      <script src="https://threejs.org/examples/js/loaders/GLTFLoader.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js" integrity="sha512-d9xgZrVZpmmQlfonhQUvTR7lMPtO7NkZMkA0ABN3PHCbKA5nqylQ/yWlFAyY6hYgdF1Qh6nYiuADWwKB4C2WSw==" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@0.7.0"></script>
      <script src="https://unpkg.com/three-spritetext"></script>
    </head>
    <body>
      <div id="blur-container">
      <!-- <h1 id="strain-metric" style="position: absolute; top:0; left: 50%; transform: translate(-50%);">Location of Maximum Principal Strain</h1> -->
      <div id="three-content" style="width: 40%; height: 80%; display: inline-block;">
      <div id="canvas-container" style="width: 100%; height: 100%;">
      </div> 
        <div id="strain-metric-magnitudes" style="bottom: 25;left: 50%;transform: translate(-50%);width: fit-content;display: block;z-index: 20;position: relative;text-align: center;">
          <div class="dot-container">
            <span class="green dot"></span>
            <strong>Small</strong>
            <div class="grey-text">&lt;10%</div></div>
        
          <div class="dot-container">
            <span class="orange dot"></span>
            <strong>Medium</strong>
            <div class="grey-text">10-18%</div></div>
      
          <div class="dot-container">
            <span class="red dot"></span>
            <strong>Large</strong>
            <div class="grey-text">18-30%</div></div>
      
          <div class="dot-container">
            <span class="black dot"></span>
            <strong>X-Large</strong>
            <div class="grey-text">&gt;30%%</div></div>
        
            <div style="bottom: 0px;position: relative;left: 50%;transform: translate(-50%);font-size: 32px;font-weight: bold;">Strain Metric Magnitudes</div>
        </div>
        <div id="alternative-legend" style="bottom: 25;left: 50%;transform: translate(-50%);width: fit-content;display: none;z-index: 20;position: relative;text-align: center; font-size: 47px;font-weight: bold;">
        Alternative-legend
        </div>
      
      </div>
      <div id="chart-container" style = "display:inline-block; width: 50%; height: 80%; margin-left: 5%;">
        <canvas id="chart" style="width: 100%;height: 100%;"></canvas>
      </div>
    </div>
      <div id="no-spheres-text">No threshold of strain was reached.</div>
    
    <script src="index.js"></script>
    </body>
    </html>`;

    async function executeScript () {
      var args = chromium.args;
      
      args.push("--disable-web-security");
      // args = args.filter(arg => arg !== '--headless');
      // Lanch pupeteer with custom arguments
      
	  // console.log("test 1",args);
/*	const browser = await chromium.puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: true,
        args,
      }); */
     const   browser = await chromium.puppeteer.launch({
      args: chromium.args,
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
          SAMPLE_DATA,
          BRAIN_MODEL_RAW_URL,
          BRAIN_STRAIN_ACTIVE,
          ENABLE_COLOR,
          DISPLAY_CHART,
          ENABLE_LABELS,
        }) => {
          return await new Promise((resolve) => {
            var spheres_array = [];
            const DISPLAY_LABELS = ENABLE_LABELS;
            const ENABLE_COLOR_SPHERES = ENABLE_COLOR;
            const ENABLE_CHART = DISPLAY_CHART;
            if(!ENABLE_CHART)
            {
              document.getElementById("chart-container").style.display = "none";
              document.getElementById("three-content").style.width = "100%";
            }
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


            const SMALL_BOUNDARY = 0.1;
            const MEDIUM_BOUNDARY = 0.18;
            const LARGE_BOUNDARY = 0.3;

            const SMALL_COLOR = new THREE.Color(0x00b050);
            const MEDIUM_COLOR = new THREE.Color(0xed7d31);
            const LARGE_COLOR = new THREE.Color(0xff0000);
            const X_LARGE_COLOR = new THREE.Color(0x000000);

            var SPHERE_SIZE_MULTIPLIER = 1;

            //Scale spheres for labeled images
            if(DISPLAY_LABELS)
            {
              SPHERE_SIZE_MULTIPLIER = 1.5;
            }
            const SMALL_GEOMETRY = new THREE.SphereGeometry(0.0015 * SPHERE_SIZE_MULTIPLIER, 32, 32);
            const MEDIUM_GEOMETRY = new THREE.SphereGeometry(0.002 * SPHERE_SIZE_MULTIPLIER, 32, 32);
            const LARGE_GEOMETRY = new THREE.SphereGeometry(0.003 * SPHERE_SIZE_MULTIPLIER, 32, 32);
            const X_LARGE_GEOMETRY = new THREE.SphereGeometry(0.004 * SPHERE_SIZE_MULTIPLIER, 32, 32);


            



            const amount = 2;
            //const space = 10;
            //extra space between brains
            const space = 0;
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
              threeCanvasContainer = document.getElementById(
                "canvas-container"
              );
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

                  //Changing camera viewport to bring brains closer
                  const brain_closer_offset = 100;
                  if( x==1 && !ENABLE_CHART)
                  {
                    subCamera.viewport = new THREE.Vector4(
                      Math.floor(x * width - brain_closer_offset),
                      Math.floor(y * height + space / 2),
                      Math.ceil(width) - space,
                      Math.ceil(height) - space
                    );
                  }
                  if( x==0 && !ENABLE_CHART)
                  {
                    subCamera.viewport = new THREE.Vector4(
                      Math.floor(x * width + brain_closer_offset),
                      Math.floor(y * height + space / 2),
                      Math.ceil(width) - space,
                      Math.ceil(height) - space
                    );
                  }

                  const subCameraContainer = new THREE.Object3D();
                  subCameraContainer.add(subCamera);

                  subCamera.position.x = 0;
                  subCamera.position.y = 0;
                  //subCamera.position.setZ(1);
                  //Bring camera closer to Scale brains
                  subCamera.position.setZ(0.9);
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
                  if (
                    DISPLAY_LABELS &&
                    brainStrainActive == "principal-max-strain"
                  ) {
                    makeLabel();
                  }
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
              if (all_spheres_json.length == 0) {
                document.getElementById("blur-container").style.filter =
                  "blur(3px)";
                document.getElementById("no-spheres-text").style.display =
                  "block";
              }
              all_spheres_json.forEach(function (object, index) {
                var i = parseInt(index + 1);
                generateSphere(
                  object.x,
                  object.y,
                  object.z,
                  object.value,
                  "pointer" + i,
                  object.region
                );
              });
            }

            function generateSphere(x, y, z, value, sphereName, region) {
              // console.log('creating shaprers')
              if (root) {
                // Add pointer(s) to brain model as children
                // const sphereGeo = new THREE.SphereGeometry(0.003, 32, 32);
                // const sphereMat = new THREE.MeshStandardMaterial({
                // 	color: 0xff0000
                // });



                var sphere_material = sphereMat;
                var sphere_geometry = sphereGeo;
                if (value && ENABLE_COLOR_SPHERES) {
                  sphere_material = sphereMat.clone();
                  //sphere_geometry = sphereGeo.clone();

                  if (value <= SMALL_BOUNDARY) {
                    sphere_material.color = SMALL_COLOR;
                    sphere_geometry = SMALL_GEOMETRY;
                  } else if (value <= MEDIUM_BOUNDARY) {
                    sphere_material.color = MEDIUM_COLOR;
                    sphere_geometry = MEDIUM_GEOMETRY;
                  } else if (value <= LARGE_BOUNDARY) {
                    sphere_material.color = LARGE_COLOR;
                    sphere_geometry = LARGE_GEOMETRY;
                  } else if (value > LARGE_BOUNDARY) {
                    sphere_material.color = X_LARGE_COLOR;
                    sphere_geometry = X_LARGE_GEOMETRY;
                  }
                }
                const sphere = new THREE.Mesh(sphere_geometry, sphere_material);
                const pointerPos = new THREE.Vector3(x, y, z);
                // (x, y, z) --> (x, -z, y)
                sphere.position.x += pointerPos.x;
                sphere.position.y += pointerPos.z;
                sphere.position.z -= pointerPos.y;
                sphere.name = sphereName;
                sphere.value = value;
                sphere.region = region;
                sphereContainer.add(sphere);
                spheres_array.push(sphere);
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
                        fontSize: 40,
                        fontColor: "#4c4d4d",
                      },
                      ticks: {
                        min: 0,
                        fontSize: 30,
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

              //Enable title display
              //document.getElementById("strain-metric").innerHTML = brainStrainActive;
              // if(DISPLAY_LABELS)
              // {
              // 	document.getElementById("strain-metric").style.display = "none";
              // }

              if (!ENABLE_COLOR_SPHERES) {
                document.getElementById(
                  "strain-metric-magnitudes"
                ).style.display = "none";
              }

              if(brainStrainActive == "MPS-95")
              {
                document.getElementById("strain-metric-magnitudes").style.display="none";
                var alternative_legend = document.getElementById("alternative-legend")
                alternative_legend.style.display = "block";
                alternative_legend.innerHTML = "Locations of tissue above 95 Percentile Maximum Principal Strain";
              }


              if(brainStrainActive == "CSDM-10")
              {
                document.getElementById("strain-metric-magnitudes").style.display="none";
                var alternative_legend = document.getElementById("alternative-legend")
                alternative_legend.style.display = "block";
                alternative_legend.innerHTML = "Locations of tissue above CSDM-10";
              }

              if(brainStrainActive == "CSDM-15")
              {
                document.getElementById("strain-metric-magnitudes").style.display="none";
                var alternative_legend = document.getElementById("alternative-legend")
                alternative_legend.style.display = "block";
                alternative_legend.innerHTML = "Locations of tissue above CSDM-15";
              }

              if(brainStrainActive == "CSDM-30")
              {
                document.getElementById("strain-metric-magnitudes").style.display="none";
                var alternative_legend = document.getElementById("alternative-legend")
                alternative_legend.style.display = "block";
                alternative_legend.innerHTML = "Locations of tissue above CSDM-30";
              }

              if (ENABLE_CHART) {
                var elements = document.getElementsByClassName("dot-container");
                for (let i = 0; i < elements.length; i++) {
                  elements[i].classList.add("dot-container-small");
                }

                var elements = document.getElementsByClassName("grey-text");
                for (let i = 0; i < elements.length; i++) {
                  elements[i].classList.add("small-grey-text");
                }
              }


              
            }

            function makeLabel(
              strain_metric_name = "Maximum Principal Strain"
            ) {
              if(spheres_array.length === 0)
              {
                return;
              }
              var sphere = spheres_array[0];

              if (!(sphere.region && sphere.value)) {
                return;
              }

              //sphere.material.color.setHex("0xFF0000");

              var region = sphere.region;
              if (region == "msc") {
                region = "Motor Sensory Cortex";
              }
              //region = "Motor Sensory Cortex"
              var dataLabel = new SpriteText(
                `${strain_metric_name} = ${Math.round(
                  sphere.value * 100
                )}%\nRegion = ${region}`,
                16
              );
              dataLabel.color = "rgba(0,0,0,1)";
              //dataLabel.fontSize  = 280;
              dataLabel.borderWidth = 1.3;
              dataLabel.borderColor = "black";
              dataLabel.backgroundColor = "rgba(255,255,255,1)";
              dataLabel.padding = 4;
              dataLabel.scale.set(0.13, 0.04, 0.1);

              var sphere_position = new THREE.Vector3();
              sphere.getWorldPosition(sphere_position);

              dataLabel.position.set(-0.113, 0.1, 0.04)
              console.log("dataLabel.position", dataLabel.position);
              dataLabel.layers.set(1);
              dataLabel.traverse(function (child) {
                child.layers.set(1);
              });
              scene.add(dataLabel);

              var label_camera = camera.cameras[3];
              label_camera.layers.enable(1);
              camera.layers.enable(1);

              const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x000000,
              });

              let linePoints = [];
              // To make line end before dataLabel
              var offsetPosition = dataLabel.position.clone();
              offsetPosition.y -= 0.02;
              linePoints.push(sphere_position, offsetPosition);

              // Create Tube Geometry to make line thicker
              var tubeGeometry = new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(linePoints),
                512, // path segments
                0.0008, // THICKNESS
                8, //Roundness of Tube
                false //closed
              );

              let line = new THREE.Line(tubeGeometry, lineMaterial);
              line.layers.set(1);
              scene.add(line);
            }
          });
        },
        {
          SAMPLE_DATA,
          BRAIN_MODEL_RAW_URL,
          BRAIN_STRAIN_ACTIVE,
          ENABLE_COLOR,
          DISPLAY_CHART,
          ENABLE_LABELS,
        }
      );

      console.log("Successfully rendered:", result);
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
  
  }

    // return 1; // Function returns the product of a and b
  });
  
};
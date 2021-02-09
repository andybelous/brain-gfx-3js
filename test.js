const puppeteer = require("puppeteer");
const fs = require('fs');

const SAMPLE_DATA = fs.readFileSync('./data.json', {encoding:'utf8', flag:'r'});
const BRAIN_MODEL_RAW_URL = 'https://glb-model.s3.amazonaws.com/brain1.glb';


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
</head>
<body>
  <div id="canvas-container" style="width: 100%; height: 80%; display: block;">  
  </div>

</body>
</html>`;

(async () => {

var args = puppeteer.defaultArgs();
args.push('--disable-web-security')
// args = args.filter(arg => arg !== '--headless');
// Lanch pupeteer with custom arguments
const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: true,
    args
});

  //const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  // page.on('console', (log) => console[log._type](log._text));

  page
    .on('console', message =>
      console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }) => console.log(message))
    .on('response', response =>
      console.log(`${response.status()} ${response.url()}`))
    .on('requestfailed', request =>
      console.log(`${request.failure().errorText} ${request.url()}`))

  var result = await page.evaluate(async ({SAMPLE_DATA, BRAIN_MODEL_RAW_URL}) => {
    
    return await new Promise(resolve => {
    var threeCanvasContainer;
    var brainRegions;
    let camera, scene, renderer, canvas, raycaster, root, sphereContainer, labelSize = 10;
    let brainModel;
    let isClicked = false;
    let aspectRatio, width, height, currentSubCamera, initialRatio, prevCanvasWidth;
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
        fov: 10
      },
      {
        x: 1,
        y: 0,
        rotX: -Math.PI / 15,
        rotY: -Math.PI / 5,
        rotZ: 0,
        fov: 10
      },
      {
        x: 1,
        y: 1,
        rotX: -Math.PI / 2,
        rotY: 0,
        rotZ: 0,
        fov: 10
      }
    ];
    const defaultCamAtt = {
      x: -1,
      y: -1,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      fov: 10
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
      "#7CB5EC"
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
      color: 0xff0000
    });
    
    var brainStrainActive = 'principal-max-strain';


      
      const json = JSON.parse(SAMPLE_DATA);
      brainRegions = json.brainRegions;
      startScene();

    
    
    
    function startScene()
    {
      init();
    }
    
    function init()
    {
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
            alpha: true
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
    };
    
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
    };
    
    function lightSetup() {
      const hemLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 1);
      scene.add(hemLight);
    
      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(10, 20, 10);
      scene.add(dirLight);
    };
    
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
      gltfLoader.load(BRAIN_MODEL_RAW_URL,
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
                n.name !== "Brainstem_Spinal_cord_node_Brainstem_Spinal_cord" &&
                n.name !== "Cerebellum_node_Cerebellum" &&
                n.name !== "Cerebral_hemispheres_R_node_Cerebral_hemispheres_R" &&
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
    
        }
      ,(error)=> console.log(error));
    };
    
    
    function showUpdatedRegion() {
    
      console.log('brainRegions', brainStrainActive)
      frontal_lobe_json = brainRegions[brainStrainActive] ? brainRegions[brainStrainActive].frontal || [] : [];
      cerebellum_lobe_json = brainRegions[brainStrainActive] ? brainRegions[brainStrainActive].cerebellum || [] : [];
      occipital_lobe_json =  brainRegions[brainStrainActive] ? brainRegions[brainStrainActive].occipital || [] : [];
      pariental_lobe_json = brainRegions[brainStrainActive] ? brainRegions[brainStrainActive].parietal || [] : [];
      temporal_lobe_json = brainRegions[brainStrainActive] ? brainRegions[brainStrainActive].temporal || [] : [];
      middle_part_of_the_brain_json = brainRegions[brainStrainActive] ? brainRegions[brainStrainActive].msc || [] : [];
      stem_json = brainRegions[brainStrainActive] ? brainRegions[brainStrainActive].stem || [] : [];
      //csf_json = this.props.brainRegions[brainStrainActive].csf || []
      console.log('frontal_lobe_json',pariental_lobe_json)
      all_spheres_json = [];
      all_spheres_json = all_spheres_json.concat(frontal_lobe_json);
      all_spheres_json = all_spheres_json.concat(cerebellum_lobe_json);
      all_spheres_json = all_spheres_json.concat(occipital_lobe_json);
      all_spheres_json = all_spheres_json.concat(pariental_lobe_json);
      all_spheres_json = all_spheres_json.concat(temporal_lobe_json);
      all_spheres_json = all_spheres_json.concat(middle_part_of_the_brain_json);
      all_spheres_json = all_spheres_json.concat(stem_json);
      // all_spheres_json = all_spheres_json.concat(csf_json);
    
      showAllSpheres();
    }
    
    function showAllSpheres () {
      // console.log('showing allshpere')
      // console.log('showAllSpheres------------------------\n',all_spheres_json)
      all_spheres_json.forEach(function (object, index) {
        var i = parseInt(index + 1);
        generateSphere(object.x, object.y, object.z, "pointer" + i);
      });
    };
    
    function generateSphere (x, y, z, sphereName) {
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
    };
    
      })

  }, {SAMPLE_DATA, BRAIN_MODEL_RAW_URL});

  console.log("Successfully rendered:", result)

  setTimeout(async ()=>{
    await page.screenshot({ path: "example.png" });
    await browser.close()
  }, 0);
})();



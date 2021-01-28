global.THREE = require("three");

var camera, scene, renderer;
var mesh;
var strDownloadMime = "image/octet-stream";

init();

function init() {
  var saveLink = document.createElement("div");
  //saveLink.style.position = "absolute";
  //saveLink.style.top = "10px";
  //saveLink.style.width = "100%";
  //saveLink.style.color = "white !important";
  //saveLink.style.textAlign = "center";
  //saveLink.innerHTML = '<a href="#" id="saveLink">Save Frame</a>';
  //document.body.appendChild(saveLink);
  //document.getElementById("saveLink").addEventListener("click", saveAsImage);
  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
  //renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 400;

  scene = new THREE.Scene();

  var geometry = new THREE.BoxGeometry(200, 200, 200);

  var material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  //

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function saveAsImage() {
  var imgData, imgNode;

  try {
    var strMime = "image/jpeg";
    imgData = renderer.domElement.toDataURL(strMime);

    saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");
  } catch (e) {
    console.log(e);
    return;
  }
}

var saveFile = function (strData, filename) {
  var link = document.createElement("a");
  if (typeof link.download === "string") {
    document.body.appendChild(link); //Firefox requires the link to be in the body
    link.download = filename;
    link.href = strData;
    link.click();
    document.body.removeChild(link); //remove the link when done
  } else {
    location.replace(uri);
  }
};

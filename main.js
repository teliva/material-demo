import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { addGeometriesToScene, addBackdrop } from './add-geometry.js';
import { materialParams } from './material-params.js';

let camera, scene, renderer;
let cameraLight;
let shadowLight;

const render = () => {
    renderer.render(scene, camera);
    cameraLight.position.copy(camera.position);

};

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
};

const init = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    scene = new THREE.Scene();

    new RGBELoader()    
        .setPath('../material-demo/')
        .load('mall_parking_lot_4k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            render();
        });

    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    container.appendChild(renderer.domElement);
    initializeCamera();
    addLights(scene);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 1;
    controls.update();

    window.addEventListener('resize', onWindowResize);

    addBackdrop(scene);
    addGeometriesToScene(materialParams, scene);
    render();
};

const addLights = (scene) => {
    cameraLight = new THREE.DirectionalLight(0xffffff, 0.3);
    cameraLight.name = "CameraLight";
    scene.add(cameraLight);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    shadowLight = new THREE.DirectionalLight(0xffffff, 0.3);
    shadowLight.position.set(-48, 32, 64);

    shadowLight.castShadow = true;
    shadowLight.name = "ShadowLight";

    shadowLight.shadow.mapSize.set(2048, 2048);

    shadowLight.shadow.bias = 1E-4;
};

const initializeCamera = () => {
    camera = new THREE.PerspectiveCamera(60, renderer.domElement.offsetWidth / renderer.domElement.offsetHeight, 0.1, 10000);
    camera.position.copy(new THREE.Vector3(-48, 32, 64));
};

init();
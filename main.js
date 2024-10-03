import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { addGeometriesToScene, addBackdrop } from './add-geometry.js';
import { materialParams } from './material-params.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';

let camera, scene, renderer;
let cameraLight;
let composer;


const render = () => {
    renderer.render(scene, camera);
    composer.render();
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

    //renderer 
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setAnimationLoop( animate );

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


    /** Effects sections */
    composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );
    const ssaoPass = new SSAOPass( scene, camera, window.innerWidth, window.innerHeight );
    composer.addPass( ssaoPass );

    const outputPass = new OutputPass();
    composer.addPass( outputPass );
    
    render();

    scene.traverse(function (o) {
        if (o.isMesh) {
            o.receiveShadow = true;
            o.castShadow = true;
        }
    });
};


const animate = () => {
    render();
};

const addLights = (scene) => {
    cameraLight = new THREE.DirectionalLight(0xffffff, 1);
    cameraLight.name = "CameraLight";
    //scene.add(cameraLight);

    var ambientLight = new THREE.AmbientLight(0xffffff, 1);
    //scene.add(ambientLight);

    createShadowLight();
};

const initializeCamera = () => {
    camera = new THREE.PerspectiveCamera(60, renderer.domElement.offsetWidth / renderer.domElement.offsetHeight, 0.1, 10000);
    camera.position.copy(new THREE.Vector3(-48, 64, 64));
};

const createShadowLight = () => {
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.25);
    light.position.set(40, 40, 40);
    light.target.position.set(10, -10, -10);
    light.shadow.camera.top = 2000;
    light.shadow.camera.bottom = - 100;
    light.shadow.camera.left = - 100;
    light.shadow.camera.right = 100;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 100;
    light.castShadow = true;
    
    scene.add(light);

    let helper = new THREE.DirectionalLightHelper(light, 2000, 0);
    scene.add(helper);
};

init();
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

const PLANE_WIDTH = 2.5;
const PLANE_HEIGHT = 2.5;
const CAMERA_HEIGHT = 0.3;

let shadowGroup, renderTarget, renderTargetBlur, shadowCamera, cameraHelper, depthMaterial, horizontalBlurMaterial, verticalBlurMaterial;
let plane, blurPlane, fillPlane;

const state = {
    shadow: {
        blur: 3.5,
        darkness: 1,
        opacity: 1,
    },
    plane: {
        color: '#ffffff',
        opacity: 1,
    },
    showWireframe: false,
};

const render = () => {
    renderer.render(scene, camera);
    composer.render();

    const initialClearAlpha = renderer.getClearAlpha();
    renderer.setClearAlpha(0);

    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, shadowCamera);

    // and reset the override material
    scene.overrideMaterial = null;
    cameraHelper.visible = true;

    blurShadow(state.shadow.blur);

    // a second pass to reduce the artifacts
    // (0.4 is the minimum blur amout so that the artifacts are gone)
    blurShadow(state.shadow.blur * 0.4);

    // reset and render the normal scene
    renderer.setRenderTarget( null );
    renderer.setClearAlpha( initialClearAlpha );
    
    renderer.render( scene, camera );

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
        });

    // the container, if you need to move the plane just move this
    shadowGroup = new THREE.Group();
    shadowGroup.position.y = - 0.3;
    scene.add(shadowGroup);

    //renderTarget
    renderTarget = new THREE.WebGLRenderTarget(512, 512);
    renderTarget.texture.generateMipmaps = false;

    //renderTargetBlur
    renderTargetBlur = new THREE.WebGL3DRenderTarget(512, 512);
    renderTargetBlur.texture.generateMipmaps = false;

    //faceup plane
    const planeGeometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT).rotateX(Math.PI / 2);
    const planeMaterial = new THREE.MeshBasicMaterial({
        map: renderTarget.texture,
        opacity: state.shadow.opacity,
        transparent: true,
        depthWrite: false
    });

    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.renderOrder = 1;
    shadowGroup.add(plane);

    plane.scale.y = -1;

    //blurPlane
    blurPlane = new THREE.Mesh(planeGeometry);
    blurPlane.visible = false;
    shadowGroup.add(blurPlane);

    // the plane with the color of the ground
    const fillPlaneMaterial = new THREE.MeshBasicMaterial({
        color: state.plane.color,
        opacity: state.plane.opacity,
        transparent: true,
        depthWrite: false
    });
    fillPlane = new THREE.Mesh(planeGeometry, fillPlaneMaterial);
    fillPlane.rotateX(Math.PI);
    shadowGroup.add(fillPlane);

    shadowCamera = new THREE.OrthographicCamera(- PLANE_WIDTH / 2, PLANE_WIDTH / 2, PLANE_HEIGHT / 2, - PLANE_HEIGHT / 2, 0, CAMERA_HEIGHT);
    shadowCamera.rotation.x = Math.PI / 2;
    shadowGroup.add(shadowCamera);

    cameraHelper = new THREE.CameraHelper(shadowCamera);

    // depthMaterial section
    depthMaterial = new THREE.MeshBasicMaterial();
    depthMaterial.userData.darkness = { value: state.shadowdarkness };
    depthMaterial.onBeforeCompile = function (shader) {

        shader.uniforms.darkness = depthMaterial.userData.darkness;
        shader.fragmentShader = /* glsl */`
            uniform float darkness;
            ${shader.fragmentShader.replace(
            'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
            'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
        )}
        `;

    };

    depthMaterial.depthTest = false;
    depthMaterial.depthWrite = false;

    horizontalBlurMaterial = new THREE.ShaderMaterial(HorizontalBlurShader);
    horizontalBlurMaterial.depthTest = false;

    verticalBlurMaterial = new THREE.ShaderMaterial(VerticalBlurShader);
    verticalBlurMaterial.depthTest = false;

    
    addLights(scene);

    //renderer 
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setAnimationLoop(animate);

    addBackdrop(scene);
    initializeCamera();


    container.appendChild(renderer.domElement);
    addGeometriesToScene(materialParams, scene);


    /** Effects sections */
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
    composer.addPass(ssaoPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);
    

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 1;
    controls.update();

    window.addEventListener('resize', onWindowResize);
};


const animate = () => {
    render();
};

const addLights = (scene) => {
    cameraLight = new THREE.DirectionalLight(0xffffff, 0.3);
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
    light.shadow.camera.top = 100;
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

const blurShadow = ( amount ) => {

    blurPlane.visible = true;

    // blur horizontally and draw in the renderTargetBlur
    blurPlane.material = horizontalBlurMaterial;
    blurPlane.material.uniforms.tDiffuse.value = renderTarget.texture;
    horizontalBlurMaterial.uniforms.h.value = amount * 1 / 256;

    renderer.setRenderTarget( renderTargetBlur );
    renderer.render( blurPlane, shadowCamera );

    // blur vertically and draw in the main renderTarget
    blurPlane.material = verticalBlurMaterial;
    blurPlane.material.uniforms.tDiffuse.value = renderTargetBlur.texture;
    verticalBlurMaterial.uniforms.v.value = amount * 1 / 256;

    renderer.setRenderTarget( renderTarget );
    renderer.render( blurPlane, shadowCamera );

    blurPlane.visible = false;

}

init();
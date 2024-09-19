
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { addGeometriesToScene, addBackdrop } from './add-geometry.js';
import { materialParams } from './material-params.js';

let camera, scene, renderer;

const render = () => {
	renderer.render(scene, camera);
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
		.setPath('/sb/material-demo/')
		.load('mall_parking_lot_4k.hdr', function (texture) {

			texture.mapping = THREE.EquirectangularReflectionMapping;

			scene.background = new THREE.Color(0xF9F9F9);
			scene.environment = texture;
			render();
		});
		
	renderer = new THREE.WebGLRenderer({ antialias: false, alpha:true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.toneMapping = THREE.ACESFilmicToneMapping;
	// renderer.toneMappingExposure = 1;
	
	container.appendChild(renderer.domElement);
	initializeCamera();

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render); // use if there is no animation loop
	controls.minDistance = 1;
	controls.update();

	window.addEventListener('resize', onWindowResize);

	addBackdrop(scene);
	addGeometriesToScene(materialParams, scene);		
	render();
};

const initializeCamera = () => {
	camera = new THREE.PerspectiveCamera(60, renderer.domElement.offsetWidth / renderer.domElement.offsetHeight, 0.1, 10000);
    camera.position.copy(new THREE.Vector3(-48, 32, 64));
};

init();
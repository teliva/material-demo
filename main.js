
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let camera, scene, renderer;
const fLoader = new FontLoader();

init();

function init() {

	const container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
	camera.position.set(12, 12, 12);

	scene = new THREE.Scene();

	new RGBELoader()
		.setPath('/sb/')
		.load('mall_parking_lot_4k.hdr', function (texture) {

			texture.mapping = THREE.EquirectangularReflectionMapping;

			scene.background = new THREE.Color(0xf9f9f9);
			scene.environment = texture;

			drawDemoGeometry(1, 0, 0, scene);
			render();
		});

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
	container.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render); // use if there is no animation loop
	 controls.minDistance = 1;
	//  controls.maxDistance = 1000;
	//  controls.target.set(0, 0, - 0.2);
	controls.update();

	window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	render();

}

//

function render() {

	renderer.render(scene, camera);

}

const drawDemoGeometry = (metallic, roughness, offset = 0) => {
    //CUBE
    const geometry = new THREE.SphereGeometry(5);

    var material = new THREE.MeshStandardMaterial({
        metalness: metallic,
        roughness: roughness,
        color: 0xffffff
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0 + offset, 0, 0);
    scene.add(cube);

    //FONT
    fLoader.load('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json', function (font) {
        const textObj = new TextGeometry(`M:${metallic}, R:${roughness}`, {
            font: font,
            size: 2,
            height: 1,
            depth: 0.5
        });

        const material = new THREE.MeshBasicMaterial({ color: 'black' });

        const mesh = new THREE.Mesh(textObj, material);
        mesh.translateZ(10);
        mesh.translateX(offset);
        scene.add(mesh);
    });
};
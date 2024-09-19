import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const fLoader = new FontLoader();

const addSampleGeometry = (matO,  offsetX = 0, offsetZ = 0, scene) => {
    const geometry = new THREE.BoxGeometry(6, 6, 6);

    var material = new THREE.MeshStandardMaterial({
        metalness: matO.metallic,
        roughness: matO.roughness,
        color: 0xb3b3b3
    });

    if (matO.alpha) {
        material.transparent = true;
        material.opacity = matO.alpha;
    }

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0 + offsetX, 0, offsetZ);
    scene.add(cube);

    //FONT
    fLoader.load('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json', function (font) {
        const textObj = new TextGeometry(`${matO.matText} M:${matO.metallic}, R:${matO.roughness}`, {
            font: font,
            size: 2,
            height: 1,
            depth: 0.5
        });

        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const mesh = new THREE.Mesh(textObj, material);
        mesh.translateZ(10 + offsetZ);
        mesh.translateX(offsetX - 20);
        mesh.translateY(-2);
        scene.add(mesh);
    });
};

const addBackdrop = (scene) => {
    const geometry = new THREE.PlaneGeometry(400, 200);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);

    plane.rotateX(Math.PI / 180 * 90);
    plane.position.set(100, -3.1, 20);

    scene.add(plane);
};


const addGeometriesToScene = (mats, scene) => {
    mats.forEach((mat, inx) => {
        if (inx < 5) {
            addSampleGeometry(mat, inx * 50, 0, scene);
        }
        else {
            addSampleGeometry(mat, (inx-5)*50, 50, scene);
        }
    });
};

export { addSampleGeometry, addBackdrop, addGeometriesToScene };
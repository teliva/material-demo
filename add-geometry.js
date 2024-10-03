import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const fLoader = new FontLoader();

const addSampleGeometry = (matO, offsetX = 0, offsetZ = 0, scene) => {
    const geometry = new THREE.BoxGeometry(18, 18, 18);
    const tLoader = new THREE.TextureLoader();
    
    let material;
    if (matO.texture) {
        const texture = tLoader.load(`../material-demo/${matO.texture}`);
        material = new THREE.MeshStandardMaterial({
            metalness: matO.metallic,
            roughness: matO.roughness,
            map: texture,
            side: THREE.DoubleSide
        });
    }
    else {
        material = new THREE.MeshStandardMaterial({
            metalness: matO.metallic,
            roughness: matO.roughness,
            color: 0xcccccc
        });
    }

    if (matO.alpha) {
        material.transparent = true;
        material.opacity = matO.alpha;
    }

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0 + offsetX, 10, offsetZ);
    scene.add(cube);

    //FONT
    fLoader.load('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json', function (font) {
        const textObj = new TextGeometry(`${matO.matText} M:${matO.metallic}, R:${matO.roughness}`, {
            font: font,
            size: 1,
            height: 0.5,
            depth: 0.25
        });

        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const mesh = new THREE.Mesh(textObj, material);
        mesh.translateZ(10 + offsetZ);
        mesh.translateX(offsetX - 20);
        mesh.translateY(10);
        scene.add(mesh);
    });
};

const addBackdrop = (scene) => {
    const geometry = new THREE.PlaneGeometry(400, 200);
    const geometryB = new THREE.PlaneGeometry(400, 200);
    const geometryS = new THREE.PlaneGeometry(200, 200);

    const material = new THREE.MeshStandardMaterial({ color: 0xe6e6e6, side: THREE.DoubleSide });

    const tLoader = new THREE.TextureLoader();
    const texture = tLoader.load('../material-demo/tiletexture.png');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 10);
    const materialH = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });

    const planeH = new THREE.Mesh(geometry, material);
    const planeB = new THREE.Mesh(geometryB, material);
    const planeS = new THREE.Mesh(geometryS, material);

    //floor
    planeH.rotateX(Math.PI / 180 * 90);
    planeH.position.set(100, 0, 20);
    planeH.name = 'floor';
    planeH.receiveShadow = true;

    //back
    planeB.position.set(100, 100, -80);
    planeB.receiveShadow = true;

    //side
    planeS.rotateY(Math.PI / 180 * 90);
    planeS.position.set(-100, 100, 20);

    scene.add(planeH);
    scene.add(planeB);
    scene.add(planeS);
};


const addGeometriesToScene = (mats, scene) => {
    mats.forEach((mat, inx) => {
        if (inx < 5) {
            addSampleGeometry(mat, inx * 50, 0, scene);
        }
        else {
            addSampleGeometry(mat, (inx - 5) * 50, 50, scene);
        }
    });
};

export { addSampleGeometry, addBackdrop, addGeometriesToScene };
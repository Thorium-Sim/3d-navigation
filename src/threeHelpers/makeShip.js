import * as THREE from "three";
import objLoader from "three-obj-loader";

objLoader(THREE);
window.THREE = THREE;

export default function makeShip() {
  return new Promise(resolve => {
    const loader = new window.THREE.OBJLoader();
    const texture = new THREE.TextureLoader().load(require("../img/ship.png"));
    const material = new THREE.MeshBasicMaterial({ map: texture });

    loader.load(require("../img/ship.obj"), obj => {
      obj.scale.set(0.2, 0.2, 0.2);
      obj.children[0].material = material;

      // scene.add(obj);
      resolve(obj);
    });
  });
}

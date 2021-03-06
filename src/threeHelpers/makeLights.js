import * as THREE from "three";

export default function makeLights(scene) {
  // const light1 = new THREE.DirectionalLight(0x88ccff, 0.1);
  // light1.position.z = 1;
  // light1.lookAt(new THREE.Vector3(0, 0, 0));
  // scene.add(light1);

  // const light2 = new THREE.DirectionalLight(0xff8888, 0.1);
  // light2.position.z = -1;
  // light2.lookAt(new THREE.Vector3(0, 0, 0));
  // scene.add(light2);
  const light = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(light);
}

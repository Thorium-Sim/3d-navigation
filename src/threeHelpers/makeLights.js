import * as THREE from "three";

export default function makeLights(scene) {
  const light1 = new THREE.DirectionalLight(0x88ccff, 1);
  light1.position.z = 1;
  light1.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xff8888, 1);
  light2.position.z = -1;
  light2.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(light2);
}

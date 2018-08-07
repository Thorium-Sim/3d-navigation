import * as THREE from "three";

export default function() {
  const sectors = new THREE.Object3D();
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.05
  });
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      for (let k = -5; k <= 5; k++) {
        const cube = new THREE.BoxGeometry(200, 200, 200);
        const edges = new THREE.EdgesGeometry(cube);
        const line = new THREE.LineSegments(edges, material);
        line.position.set(i * 200, j * 200, k * 200);
        line.name = `${String.fromCharCode(82 + i)}${String.fromCharCode(
          75 + j
        )}${35 + k}`;
        sectors.add(line);
      }
    }
  }
  return sectors;
}

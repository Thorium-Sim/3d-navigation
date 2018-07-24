import * as THREE from "three";

export default function makeSkybox(SKY_SIZE) {
  const urls = [
    new THREE.TextureLoader().load(require("../img/StarsRight.png")),
    new THREE.TextureLoader().load(require("../img/StarsLeft.png")),
    new THREE.TextureLoader().load(require("../img/StarsBack.png")),

    new THREE.TextureLoader().load(require("../img/StarsFront.png")),
    new THREE.TextureLoader().load(require("../img/StarsTop.png")),
    new THREE.TextureLoader().load(require("../img/StarsBottom.png"))
  ];

  const materialArray = [];
  urls.forEach(u => {
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: u,
        side: THREE.BackSide,
        opacity: 0.3,
        transparent: true
      })
    );
  });

  const skyGeometry = new THREE.CubeGeometry(SKY_SIZE, SKY_SIZE, SKY_SIZE);
  const skyBox = new THREE.Mesh(skyGeometry, materialArray);
  skyBox.rotation.x += Math.PI / 2;
  skyBox.userData.noRaycast = true;

  return skyBox;
}

import * as THREE from "three";
import objLoader from "three-obj-loader";
import systemNames from "./systemHelpers";

objLoader(THREE);
window.THREE = THREE;

export function makeShip() {
  return new Promise(resolve => {
    const loader = new window.THREE.OBJLoader();
    const texture = new THREE.TextureLoader().load(require("./img/ship.png"));
    const material = new THREE.MeshBasicMaterial({ map: texture });

    loader.load(require("./img/ship.obj"), obj => {
      obj.scale.set(0.2, 0.2, 0.2);
      obj.children[0].material = material;

      // scene.add(obj);
      resolve(obj);
    });
  });
}

function randomFromList(list) {
  if (!list) return;
  const length = list.length;
  const index = Math.floor(Math.random() * length);
  return list[index];
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function makeTextSprite(message, parameters = {}) {
  const {
    fontface = "Arial",
    fontsize = 18,
    borderThickness = 4,
    borderColor = { r: 0, g: 0, b: 0, a: 1.0 },
    backgroundColor = { r: 255, g: 255, b: 255, a: 1.0 },
    textColor = { r: 0, g: 0, b: 0, a: 1.0 }
  } = parameters;
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");
    canvas.width = 1024;
    canvas.height = 512;
    context.font = `Bold ${fontsize}px ${fontface}`;
    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${
      backgroundColor.b
    },${backgroundColor.a})`;
    context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${
      borderColor.b
    },${borderColor.a})`;

    context.lineWidth = borderThickness;
    roundRect(
      context,
      borderThickness / 2,
      borderThickness / 2,
      (textWidth + borderThickness) * 1.1,
      fontsize * 1.4 + borderThickness,
      8
    );

    context.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},${
      textColor.a
    })`;
    context.fillText(
      message,
      borderThickness,
      fontsize + borderThickness,
      canvas.width
    );

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture
    });
    const label = new THREE.Sprite(spriteMaterial);
    label.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    label.userData.isLabel = true;
    return resolve(label);
  });
}

function randomOnSphere(size) {
  let x = 1;
  let y = 1;
  let z = 1;
  while (Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2) > 1) {
    x = (Math.random() - 0.5) * 2;
    y = (Math.random() - 0.5) * 2;
    z = (Math.random() - 0.5) * 2;
  }
  return { x: x * size, y: y * size, z: z * size };
}
export function makeStars(SKY_SIZE, scene) {
  const sprites = [
    new THREE.TextureLoader().load(require("./img/star1.png")),
    new THREE.TextureLoader().load(require("./img/star2.png")),
    new THREE.TextureLoader().load(require("./img/star3.png")),
    new THREE.TextureLoader().load(require("./img/star4.png"))
  ];

  for (let i = 0; i < 1000; i++) {
    const spriteMaterial = new THREE.SpriteMaterial({
      map: randomFromList(sprites),
      alphaTest: 0.5,
      transparent: true
    });
    spriteMaterial.color.setHSL(Math.random(), 0.5, 0.7);

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(30, 30, 1);
    const { x, y, z } = randomOnSphere(SKY_SIZE / 4);

    sprite.position.set(x, y, z);
    const name = randomFromList(systemNames);
    sprite.userData.name = name;
    sprite.name = name;
    makeTextSprite(name, {
      textColor: { r: 255, g: 255, b: 255, a: 1 },
      backgroundColor: { r: 0, g: 0, b: 0, a: 0.5 },
      fontsize: 200
    }).then(label => {
      label.position.set(x, y - 20, z + 10);
      sprite.labelSprite = label;
      label.visible = false;
    });
    scene.add(sprite);
  }
}

export function makeLights(scene) {
  const light1 = new THREE.DirectionalLight(0x88ccff, 1);
  light1.position.z = 1;
  light1.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xff8888, 1);
  light2.position.z = -1;
  light2.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(light2);
}

export function makeSkybox(SKY_SIZE) {
  const urls = [
    new THREE.TextureLoader().load(require("./img/StarsRight.png")),
    new THREE.TextureLoader().load(require("./img/StarsLeft.png")),
    new THREE.TextureLoader().load(require("./img/StarsBack.png")),

    new THREE.TextureLoader().load(require("./img/StarsFront.png")),
    new THREE.TextureLoader().load(require("./img/StarsTop.png")),
    new THREE.TextureLoader().load(require("./img/StarsBottom.png"))
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

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

function makeTextSprite(message, parameters = {}) {
  const {
    fontface = "Arial",
    fontsize = 18,
    borderThickness = 4,
    borderColor = { r: 0, g: 0, b: 0, a: 1.0 },
    backgroundColor = { r: 255, g: 255, b: 255, a: 1.0 },
    textColor = { r: 0, g: 0, b: 0, a: 1.0 }
  } = parameters;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
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
  context.fillText(message, borderThickness, fontsize + borderThickness);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
  return sprite;
}

export function makeStars(SKY_SIZE, scene) {
  const sprites = [
    new THREE.TextureLoader().load(require("./img/star1.png")),
    new THREE.TextureLoader().load(require("./img/star2.png")),
    new THREE.TextureLoader().load(require("./img/star3.png")),
    new THREE.TextureLoader().load(require("./img/star4.png"))
  ];

  for (let i = 0; i < 50; i++) {
    const spriteMaterial = new THREE.SpriteMaterial({
      map: randomFromList(sprites),
      alphaTest: 0.5,
      transparent: true
    });
    spriteMaterial.color.setHSL(Math.random(), 0.5, 0.7);

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(5, 5, 1);
    const x = SKY_SIZE / 2.5 * Math.random() - SKY_SIZE / 5;
    const y = SKY_SIZE / 2.5 * Math.random() - SKY_SIZE / 5;
    const z = SKY_SIZE / 2.5 * Math.random() - SKY_SIZE / 5;
    sprite.position.set(x, y, z);
    const name = randomFromList(systemNames);
    sprite.userData.name = name;
    const label = makeTextSprite(name, {
      textColor: { r: 255, g: 255, b: 255, a: 1 },
      backgroundColor: { r: 0, g: 0, b: 0, a: 0.5 },
      fontsize: 30
    });
    label.position.set(x, y - 20, z + 10);
    label.visible = false;
    label.userData.isLabel = true;
    sprite.userData.labelId = label.uuid;
    scene.add(sprite);
    scene.add(label);
  }
}

export function makeLines(SKY_SIZE, LINE_COUNT) {
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.2,
    transparent: true
  });

  const negEnd = SKY_SIZE / -2;
  const posEnd = SKY_SIZE / 2;
  const lines = new THREE.Object3D();

  for (let i = 0; i < LINE_COUNT + 1; i++) {
    const linePosi = (i - LINE_COUNT / 2) * (SKY_SIZE / LINE_COUNT);
    for (let j = 0; j < LINE_COUNT + 1; j++) {
      const linePosj = (j - LINE_COUNT / 2) * (SKY_SIZE / LINE_COUNT);

      // X
      const lineGeometryX = new THREE.Geometry();
      lineGeometryX.vertices.push(
        new THREE.Vector3(negEnd, linePosi, linePosj)
      );
      lineGeometryX.vertices.push(
        new THREE.Vector3(posEnd, linePosi, linePosj)
      );
      const lineX = new THREE.Line(lineGeometryX, lineMaterial);
      lineX.userData.noRaycast = true;
      lines.add(lineX);

      // Y
      const lineGeometryY = new THREE.Geometry();
      lineGeometryY.vertices.push(
        new THREE.Vector3(linePosi, negEnd, linePosj)
      );
      lineGeometryY.vertices.push(
        new THREE.Vector3(linePosi, posEnd, linePosj)
      );
      const lineY = new THREE.Line(lineGeometryY, lineMaterial);
      lineY.userData.noRaycast = true;
      lines.add(lineY);

      // Z
      const lineGeometryZ = new THREE.Geometry();
      lineGeometryZ.vertices.push(
        new THREE.Vector3(linePosj, linePosi, negEnd)
      );
      lineGeometryZ.vertices.push(
        new THREE.Vector3(linePosj, linePosi, posEnd)
      );
      const lineZ = new THREE.Line(lineGeometryZ, lineMaterial);
      lineZ.userData.noRaycast = true;
      lines.add(lineZ);
    }
  }
  return lines;
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

export function makeSkybox(SKY_SIZE, scene) {
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
  const skyMaterial = new THREE.MeshFaceMaterial(materialArray);
  const skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
  skyBox.rotation.x += Math.PI / 2;
  skyBox.userData.noRaycast = true;

  scene.add(skyBox);
}

import * as THREE from "three";
import { starSprites, makeTextSprite } from ".";

export default function makeStar(params) {
  const {
    id,
    name,
    position,
    image = Math.floor(Math.random() * 4),
    hsl = [Math.random(), 0.5, 0.7],
    scale = [30, 30, 1]
  } = params;
  if (!id || !name || !position) return null;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: starSprites[image],
    alphaTest: 0.5,
    transparent: true
  });
  spriteMaterial.color.setHSL(...hsl);
  const star = new THREE.Object3D();
  star.userData.id = id;
  star.userData.image = image;
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(...(typeof scale === "number" ? [scale, scale, 1] : scale));
  star.position.set(...(position.length ? position : Object.values(position)));
  star.name = name;
  star.userData.isStar = true;
  sprite.userData.parent = star;
  star.add(sprite);
  const light = new THREE.PointLight(0xffffff, 1, 10000, 2);
  light.position.set(...(position.length ? position : Object.values(position)));
  star.add(light);
  makeTextSprite(name).then(label => {
    label.position.set(0, -20, 10);
    label.visible = false;
    label.userData.parent = star;
    star.add(label);
  });
  return star;
}

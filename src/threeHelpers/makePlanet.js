import * as THREE from "three";
import { makeTextSprite } from ".";
import planetImages from "../planetImages";

const planetMaps = planetImages.map(s => new THREE.TextureLoader().load(s));
export default function makeStar(params) {
  const {
    id,
    name,
    position,
    image = Math.floor(Math.random() * planetImages.length),
    hsl = [Math.random(), 0.5, 0.7],
    scale = [30, 30, 30]
  } = params;

  if (!id || !name || !position) return null;
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshLambertMaterial({
    map: planetMaps[image]
  });
  const sphere = new THREE.Mesh(geometry, material);
  //material.color.setHSL(...hsl);

  const planet = new THREE.Object3D();
  planet.userData.id = id;
  planet.userData.image = image;
  const scaleExpand = typeof scale === "number" ? [scale, scale, scale] : scale;
  sphere.scale.set(...scaleExpand);
  planet.position.set(
    ...(position.length ? position : Object.values(position))
  );
  planet.name = name;
  planet.userData.isStar = true;
  sphere.userData.parent = planet;
  planet.add(sphere);
  makeTextSprite(name).then(label => {
    label.position.set(0, -2 * scaleExpand[1], 1 * scaleExpand[2]);
    label.visible = false;
    label.userData.parent = planet;
    planet.add(label);
  });
  return planet;
}

// Update star properties
import * as THREE from "three";
import {
  makeStar,
  makePlanet,
  starSprites,
  makeTextSprite
} from "../../threeHelpers";
import planetImages from "../../planetImages";

const planetMaps = planetImages.map(s => new THREE.TextureLoader().load(s));

export default function updateStars(self, propStars, stars) {
  propStars.forEach(({ id, name, image, scale, position, hsl, type }) => {
    const object = stars.find(st => st.userData.id === id);
    if (object) {
      const sprite = object.children.find(c => !c.userData.isLabel);
      object.position.set(
        ...(typeof position.length === "number"
          ? position
          : Object.values(position))
      );
      if (scale) {
        sprite.scale.set(
          ...(typeof scale === "number" ? [scale, scale, scale] : scale)
        );
      }
      if (object.type === "star") {
        if (hsl) {
          sprite.material.color.setHSL(...hsl);
        }
        if (image || image === 0) {
          if (image !== object.userData.image && starSprites[image]) {
            sprite.material.map = starSprites[image];
          }
        }
      } else {
        if (image || image === 0) {
          if (image !== object.userData.image && planetMaps[image]) {
            sprite.material.map = planetMaps[image];
          }
        }
      }

      if (object.name !== name) {
        // Remove the label and make a new one
        const label = object.children.find(c => c.userData.isLabel);
        const oldVisible = label ? label.visible : false;
        object.remove(label);
        makeTextSprite(name).then(newLabel => {
          newLabel.position.set(0, -20, 10);
          newLabel.visible = oldVisible;
          newLabel.userData.parent = object;
          object.add(newLabel);
        });
      }
    } else {
      // make a new one
      if (type === "star") {
        const newStar = makeStar({ id, name, image, scale, position, hsl });
        newStar && self.scene.add(newStar);
      }
      if (type === "planet") {
        const planet = makePlanet({ id, name, image, scale, position, hsl });
        planet && self.scene.add(planet);
      }
    }
  });
  // Check for any stars that need to be deleted
  stars
    .filter(s => !propStars.find(ps => ps.id === s.userData.id))
    .forEach(s => self.scene.remove(s));
}

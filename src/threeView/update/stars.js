// Update star properties
import { makeStar, starSprites, makeTextSprite } from "../../threeHelpers";
export default function updateStars(self, propStars, stars) {
  propStars.forEach(({ id, name, image, scale, position, hsl }) => {
    const star = stars.find(st => st.userData.id === id);
    if (star) {
      const sprite = star.children.find(c => !c.userData.isLabel);
      star.position.set(
        ...(typeof position.length === "number"
          ? position
          : Object.values(position))
      );
      if (scale) {
        sprite.scale.set(
          ...(typeof scale === "number" ? [scale, scale, 1] : scale)
        );
      }
      if (hsl) {
        sprite.material.color.setHSL(...hsl);
      }
      if (image || image === 0) {
        if (image !== star.userData.image && starSprites[image]) {
          sprite.material.map = starSprites[image];
        }
      }
      if (star.name !== name) {
        // Remove the label and make a new one
        const label = star.children.find(c => c.userData.isLabel);
        const oldVisible = label ? label.visible : false;
        star.remove(label);
        makeTextSprite(name).then(newLabel => {
          newLabel.position.set(0, -20, 10);
          newLabel.visible = oldVisible;
          newLabel.userData.parent = star;
          star.add(newLabel);
        });
      }
    } else {
      // make a new one
      const newStar = makeStar({ id, name, image, scale, position, hsl });
      self.scene.add(newStar);
    }
  });
  // Check for any stars that need to be deleted
  stars
    .filter(s => !propStars.find(ps => ps.id === s.userData.id))
    .forEach(s => self.scene.remove(s));
}

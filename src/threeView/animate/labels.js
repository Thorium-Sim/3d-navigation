export default function labels(self) {
  const { search } = self.props;
  // Raycaster
  // update the picking ray with the camera and mouse position
  self.raycaster.setFromCamera(self.mouse, self.cameras[self.currentCamera]);

  // calculate objects intersecting the picking ray
  const newIntersects = self.raycaster
    .intersectObjects(self.scene.children, true)
    .reduce((prev, next) => {
      if (!next.object.userData.parent) return prev;
      if (!prev.find(p => p.uuid === next.object.userData.parent.uuid)) {
        return prev.concat(next.object.userData.parent);
      }
      return prev;
    }, []);
  const regex = new RegExp(search, "gi");
  const stars = self.scene.children.filter(c => c.userData.isStar);
  const visibleStars = search
    ? stars.filter(c => {
        if (c.name.match(regex)) {
          return true;
        }
        return false;
      })
    : [];
  for (let i = 0; i < self.intersects.length; i++) {
    if (
      !newIntersects.find(ni => ni.uuid === self.intersects[i].uuid) &&
      !self.intersects[i].userData.selected
    ) {
      const label = self.intersects[i].children.find(c => c.userData.isLabel);

      if (label && (visibleStars.length > 10 || visibleStars.length === 0)) {
        label.visible = false;
      }
    }
  }
  self.intersects = newIntersects;
  for (let i = 0; i < self.intersects.length; i++) {
    const label = self.intersects[i].children.find(c => c.userData.isLabel);
    if (label && label.visible === false) {
      label.visible = true;
    }
  }
}

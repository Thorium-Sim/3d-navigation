export default function scale(self) {
  if (self.ship) {
    self.ship.scale.x = 10 / (self.cameras[self.currentCamera].zoom * 2 + 1);
    self.ship.scale.y = 10 / (self.cameras[self.currentCamera].zoom * 2 + 1);
    self.ship.scale.z = 10 / (self.cameras[self.currentCamera].zoom * 2 + 1);
  }
}

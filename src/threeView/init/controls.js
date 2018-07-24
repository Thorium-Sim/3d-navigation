import * as THREE from "three";
const OrbitControls = require("three-orbit-controls")(THREE);
const TransformControls = require("three-transform-controls")(THREE);

export default function makeControls(self) {
  self.controls = new OrbitControls(
    self.cameras[self.currentCamera],
    document.getElementById("three-mount")
  );
  self.controls.maxZoom = 3;
  self.controls.minZoom = 0.65;
  self.controls.maxDistance = 1500;
  self.controls.minDistance = 20;
  self.controls.enableRotate = false;
  self.controls.mouseButtons = {
    ORBIT: THREE.MOUSE.RIGHT,
    ZOOM: THREE.MOUSE.MIDDLE,
    PAN: THREE.MOUSE.LEFT
  };
  self.transformControl = new TransformControls(
    self.cameras[1],
    document.getElementById("three-mount")
  );
  self.transformControl.addEventListener("mouseDown", () => {
    self.controls.enabled = false;
  });
  self.transformControl.addEventListener("mouseUp", () => {
    self.controls.enabled = true;
    const { position: pos, userData } = self.transformControl.object;
    const position = pos.clone();
    if (userData.isStar) {
      self.props.updateStarPosition(userData.id, position);
    }
  });
}

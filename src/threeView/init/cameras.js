import * as THREE from "three";

export default function makeCameras(self) {
  const { width, height } = self.props;
  self.cameras = [];
  self.cameras.push(
    new THREE.PerspectiveCamera(45, width / height, 0.1, 100000)
  );
  self.cameras.push(
    new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      0.01,
      100000
    )
  );
  self.cameras[0].up.z = 1;
  self.cameras[0].up.y = 0;
  self.currentCamera = 1;
  self.cameras[1].position.y = 1000;
  self.cameras[1].position.z = 0;
  self.cameras[1].up.z = 1;
  self.cameras[1].up.y = 0;
  self.cameras[1].lookAt(new THREE.Vector3(0, 0, 0));
}

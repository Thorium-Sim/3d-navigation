import * as THREE from "three";

export default function rotate(self) {
  const { yaw, pitch, roll, quaternion } = self.props;
  const q = new THREE.Quaternion();
  if (pitch || roll || yaw) {
    q.setFromAxisAngle(new THREE.Vector3(pitch, roll, yaw), Math.PI / 2);
    self.setState({
      quaternion: quaternion.multiply(q).normalize()
    });
  }
}

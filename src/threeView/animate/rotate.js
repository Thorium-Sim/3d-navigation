import * as THREE from "three";

export default function rotate(self) {
  const { yaw, pitch, roll, pitchAngle, yawAngle, quaternion } = self.props;
  const q = new THREE.Quaternion();
  if (pitch || roll || yaw) {
    q.setFromAxisAngle(new THREE.Vector3(pitch, yaw, roll), Math.PI / 2);
    self.props.updateRotation({
      quaternion: quaternion.multiply(q).normalize(),
      pitchAngle:
        pitchAngle > Math.PI || pitchAngle < -Math.PI
          ? -pitchAngle - pitch * 2
          : pitchAngle - pitch * 2,
      yawAngle:
        yawAngle > Math.PI || yawAngle < -Math.PI
          ? -yawAngle + yaw * 2
          : yawAngle + yaw * 2
    });
  }
}

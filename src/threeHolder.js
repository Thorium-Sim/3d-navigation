import React, { Component } from "react";
import Three from "./threeView";
import * as THREE from "three";

function randomOnPlane(radius) {
  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return [x, y, 0];
}
function distanceVector(v1, v2) {
  var dx = v1.x - v2.x;
  var dy = v1.y - v2.y;
  var dz = v1.z - v2.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

class ThreeHolder extends Component {
  state = {
    quaternion: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.PI / 2, Math.PI, 0)
    ),
    yaw: 0,
    pitch: 0,
    roll: 0,
    position: new THREE.Vector3(0, 0, 0),
    // For protractor
    yawAngle: 0,
    pitchAngle: 0,
    velocity: 0,
    currentStage: null,
    shipStage: null,
    currentView: "top",
    protractorShown: false,
    dimensions: null
  };
  /*
  componentDidUpdate() {
    const {
      stage,
      currentStage,
      shipStage,
      position,
      selectedStar
    } = this.state;
    const stars = stage.filter(s => s.parentId === currentStage || null);
    const inStar = stars.find(s => distanceVector(s.position, position) < 10);
    if (inStar && selectedStar === inStar.id) {
      this.enterStage(inStar.id, true);
    }
    if (
      distanceVector(position, new THREE.Vector3(0, 0, 0)) > 600 &&
      shipStage
    ) {
      this.leaveStage(true);
    }
  }
  */
  updateShip = () => {
    const { quaternion, position, pitchAngle, yawAngle } = this.state;
    const {
      stage,
      currentStage = null,
      shipStage,
      velocity,
      yaw,
      pitch,
      roll,
      selectedStar,
      enterStage,
      leaveStage
    } = this.props;
    const q = new THREE.Quaternion();
    const update = {};
    if (velocity === 0 && yaw === 0 && pitch === 0 && roll === 0) return;

    // Rotation
    if (pitch || roll || yaw) {
      q.setFromAxisAngle(new THREE.Vector3(pitch, yaw, roll), Math.PI / 2);

      (update.quaternion = quaternion.multiply(q).normalize()),
        (update.pitchAngle =
          pitchAngle > Math.PI || pitchAngle < -Math.PI
            ? -pitchAngle - pitch * 2
            : pitchAngle - pitch * 2),
        (update.yawAngle =
          yawAngle > Math.PI || yawAngle < -Math.PI
            ? -yawAngle + yaw * 2
            : yawAngle + yaw * 2);
    }
    const thisStage = stage.find(s => s.id === currentStage);

    // Position
    const v = new THREE.Vector3();
    const axis = new THREE.Vector3(0, 0, 1);
    v.copy(axis).applyQuaternion(quaternion);
    position.add(
      v.multiplyScalar(velocity * (thisStage ? 1 / thisStage.stageScale : 1))
    );
    update.position = position;

    // Enter or leave
    const objects = stage.filter(s => s.parentId === currentStage || null);
    const enterObject = objects.find(
      s => distanceVector(s.position, position) < 10
    );
    if (enterObject && selectedStar === enterObject.id) {
      enterStage(enterObject.id, true);
      // Set the simulator's position to a random point on the plane of the system
      const newPosition = new THREE.Vector3(...randomOnPlane(500));
      // Update the quaternion to point to the center of the system.
      const newQuaternion = new THREE.Quaternion();
      const center = new THREE.Vector3();
      const m1 = new THREE.Matrix4();
      m1.lookAt(center, newPosition, new THREE.Vector3(0, 0, 1));
      newQuaternion.setFromRotationMatrix(m1);
      update.position = newPosition;
      update.quaternion = newQuaternion;
    } else if (
      distanceVector(position, new THREE.Vector3(0, 0, 0)) > 600 &&
      shipStage
    ) {
      const leavingStage = stage.find(s => s.id === shipStage);
      update.position = new THREE.Vector3(
        ...Object.values(leavingStage.position)
      );

      leaveStage(true);
    }
    this.setState(update);
  };
  render() {
    const { position, yawAngle, pitchAngle, quaternion } = this.state;
    const {
      yaw,
      pitch,
      roll,
      dimensions,
      protractorShown,
      search,
      currentView,
      edit,
      sensorsRangeShown,
      weaponsRangeShown,
      selectStar,
      selectedStar,
      currentStage,
      shipStage,
      stage,
      updateStar,
      enterStage,
      leaveStage
    } = this.props;
    return (
      <Three
        {...dimensions}
        yaw={yaw}
        pitch={pitch}
        roll={roll}
        yawAngle={yawAngle}
        pitchAngle={pitchAngle}
        updateProtractorAngle={angle =>
          this.setState({
            [`${currentView === "top" ? "yaw" : "pitch"}Angle`]: angle
          })
        }
        updateShip={this.updateShip}
        position={position}
        protractorShown={protractorShown}
        quaternion={quaternion}
        currentStage={currentStage}
        shipStage={shipStage}
        search={search}
        stage={stage}
        currentView={currentView}
        selectedStar={selectedStar}
        selectStar={selectStar}
        edit={edit}
        updateStarPosition={(id, pos) => updateStar(id, "position", pos)}
        sensorsRangeShown={sensorsRangeShown}
        weaponsRangeShown={weaponsRangeShown}
        enterStage={enterStage}
        leaveStage={leaveStage}
      />
    );
  }
}
export default ThreeHolder;

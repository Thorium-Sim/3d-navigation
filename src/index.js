import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import Three from "./threeView";
import Measure from "react-measure";
import StarConfig from "./ui/starConfig";
import RotateButtons from "./ui/rotateButtons";
import ViewButtons from "./ui/viewButtons";

import starList from "./systemHelpers";
import planetList from "./planetNames";
import uuid from "uuid";

import "./style.css";
import { randomOnSphere, randomFromList } from "./threeHelpers";

function distanceVector(v1, v2) {
  var dx = v1.x - v2.x;
  var dy = v1.y - v2.y;
  var dz = v1.z - v2.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function randomOnPlane(radius) {
  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return [x, y, 0];
}
function makeObject(objects, params = {}, innerStage) {
  const id = uuid.v4();
  const star = {
    id,
    parentId: params.parentId || null,
    name: params.name || randomFromList(starList),
    position: params.position || randomOnSphere(500),
    image: params.image || Math.floor(Math.random() * 4),
    velocityAdjust: params.velocityAdjust || 1,
    scale: params.scale || 30,
    type: params.type || "star",
    hsl: params.hsl || [Math.random(), 1, 0.5]
  };
  if (innerStage) {
    for (let i = 0; i < 5; i++) {
      objects.push(
        makeObject(
          objects,
          {
            parentId: id,
            velocityAdjust: 4,
            type: "planet",
            scale: Math.random() * 20 + 10,
            name: randomFromList(planetList)
          },
          false
        )
      );
    }
    objects.push(
      makeObject(
        objects,
        {
          ...star,
          id: uuid.v4(),
          parentId: id,
          position: { x: 0, y: 0, z: 0 },
          scale: 100
        },
        false
      )
    );
  }
  return star;
}
function makeStages() {
  const objects = [];
  for (let i = 0; i < 50; i++) {
    objects.push(makeObject(objects, {}, true));
  }
  return objects;
}
class App extends Component {
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
    dimensions: null,
    stage: window.localStorage.getItem("3d-stages")
      ? JSON.parse(window.localStorage.getItem("3d-stages"))
      : makeStages()
  };
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
  enterStage = (id, shipInside) => {
    // If the simulator is moving inside of a smaller stage, set it's position to
    // a random location on the radius of the stage.
    // If it's just the view changing, don't change the simulators position and remove
    // the simulator from the view.
    if (shipInside) {
      // Set the simulator's position to a random point on the plane of the system
      const position = new THREE.Vector3(...randomOnPlane(500));
      // Update the quaternion to point to the center of the system.
      const quaternion = new THREE.Quaternion();
      const center = new THREE.Vector3();
      const m1 = new THREE.Matrix4();
      m1.lookAt(center, position, new THREE.Vector3(0, 0, 1));
      quaternion.setFromRotationMatrix(m1);
      this.setState({
        currentStage: id,
        shipStage: id,
        selectedStar: null,
        position,
        quaternion
      });
    } else {
      this.setState({ currentStage: id, selectedStar: null });
    }
  };
  leaveStage = shipLeaving => {
    if (shipLeaving === true) {
      return this.setState(state => {
        const stage = state.stage.find(s => s.id === state.shipStage);
        const newStage = stage ? stage.parentId : null;
        return {
          shipStage: newStage,
          position: new THREE.Vector3(...Object.values(stage.position)),
          currentStage:
            state.currentStage === state.shipStage
              ? newStage
              : state.currentStage
        };
      });
    }
    this.setState(state => {
      const stage = state.stage.find(s => s.id === state.currentStage);
      return {
        currentStage: stage ? stage.parentId : null,
        selectedStar: null
      };
    });
  };
  updatePosition = () => {
    const {
      velocity,
      quaternion,
      position,
      stage,
      currentStage = null
    } = this.state;
    const thisStage = stage.find(s => s.id === currentStage);
    if (velocity === 0) return;
    const v = new THREE.Vector3();
    const axis = new THREE.Vector3(0, 0, 1);
    v.copy(axis).applyQuaternion(quaternion);
    position.add(
      v.multiplyScalar(velocity * (thisStage ? thisStage.velocityAdjust : 1))
    );
    this.setState({ position });
  };
  deleteStar = id => {
    this.setState(state => ({
      stage: state.stage.filter(s => s.id !== id),
      selectedStar: null
    }));
  };
  updateStar = (id, prop, value) => {
    console.log(id, prop, value);
    this.setState(state => ({
      stage: state.stage.map(s => (s.id === id ? { ...s, [prop]: value } : s))
    }));
  };
  render() {
    const {
      dimensions,
      stage,
      selectedStar,
      yaw,
      pitch,
      roll,
      position,
      yawAngle,
      pitchAngle,
      quaternion,
      search,
      currentView,
      edit,
      velocity,
      protractorShown,
      currentStage,
      shipStage
    } = this.state;
    window.localStorage.setItem("3d-stages", JSON.stringify(stage));
    const stars = stage.filter(s => s.parentId === currentStage || null);
    return (
      <div className="App">
        {selectedStar &&
          edit && (
            <StarConfig
              star={stage.find(s => s.id === selectedStar)}
              deselect={() => this.setState({ selectedStar: null })}
              deleteStar={this.deleteStar}
              updateStar={this.updateStar}
            />
          )}
        <input
          type="range"
          min={-0.5}
          max={0.5}
          step={0.01}
          value={velocity}
          onChange={e =>
            this.setState({ velocity: parseFloat(e.target.value) })
          }
        />
        <div className="view-buttons edit">
          {edit && (
            <button
              onClick={() => {
                const id = uuid.v4();
                const star = {
                  id,
                  parentId: currentStage,
                  name: randomFromList(starList),
                  position: randomOnSphere(500),
                  image: Math.floor(Math.random() * 4),
                  scale: 30,
                  hsl: [Math.random(), 1, 0.5]
                };
                this.setState(state => ({
                  stage: state.stage.concat(star)
                }));
                setTimeout(() => {
                  this.setState({ selectedStar: id });
                }, 100);
              }}
            >
              Add Star
            </button>
          )}

          <button
            className={`${edit ? "active" : ""}`}
            onClick={() =>
              this.setState(state => ({
                edit: !state.edit,
                selectedStar: null,
                quaternion: new THREE.Quaternion().setFromEuler(
                  new THREE.Euler(Math.PI / 2, Math.PI, 0)
                )
              }))
            }
          >
            Edit
          </button>
        </div>
        <div className="view-buttons protractor">
          <button
            className={`${protractorShown ? "active" : ""}`}
            onClick={() =>
              this.setState(state => ({
                protractorShown: !state.protractorShown
              }))
            }
          >
            Protractor
          </button>
          {currentStage && <button onClick={this.leaveStage}>Go Back</button>}
        </div>
        {!edit && (
          <RotateButtons updateRotation={params => this.setState(params)} />
        )}
        <ViewButtons
          setView={view => this.setState({ currentView: view })}
          currentView={currentView}
        />
        <div className="search">
          <input
            type="text"
            value={search}
            onClick={e => {
              e.target.focus();
            }}
            onChange={e => this.setState({ search: e.target.value })}
            placeholder="Search..."
          />
        </div>
        <Measure
          bounds
          onResize={contentRect => {
            this.setState({ dimensions: contentRect.bounds });
          }}
        >
          {({ measureRef }) => (
            <div
              id="three-container"
              ref={measureRef}
              style={{
                width: "100vw",
                height: "100vh"
              }}
            >
              {dimensions && (
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
                  updatePosition={this.updatePosition}
                  position={position}
                  protractorShown={protractorShown}
                  quaternion={quaternion}
                  currentStage={currentStage}
                  shipStage={shipStage}
                  search={search}
                  stage={stars}
                  currentView={currentView}
                  selectedStar={selectedStar}
                  selectStar={id => this.setState({ selectedStar: id })}
                  enterStage={this.enterStage}
                  updateRotation={params => this.setState(params)}
                  edit={edit}
                  updateStarPosition={(id, pos) =>
                    this.updateStar(id, "position", pos)
                  }
                />
              )}
            </div>
          )}
        </Measure>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

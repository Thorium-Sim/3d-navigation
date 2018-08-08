import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import Measure from "react-measure";
import StarConfig from "./ui/starConfig";
import RotateButtons from "./ui/rotateButtons";
import ViewButtons from "./ui/viewButtons";

import starList from "./systemHelpers";
import planetList from "./planetNames";
import uuid from "uuid";

import "./style.css";
import { randomOnSphere, randomFromList } from "./threeHelpers";
import ThreeHolder from "./threeHolder";

function makeObject(objects, params = {}, innerStage) {
  const id = uuid.v4();
  const star = {
    id,
    parentId: params.parentId || null,
    name: params.name || randomFromList(starList),
    position: params.position || randomOnSphere(500),
    image: params.image || Math.floor(Math.random() * 4),
    stageScale: params.stageScale || 1 / 4,
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
            stageScale: 1 / 20,
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
          stageScale: 1 / 4,
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

  enterStage = (id, shipInside) => {
    const { stage, edit } = this.state;
    const innerStages = stage.filter(s => s.parentId === id);
    // If the simulator is moving inside of a smaller stage, set it's position to
    // a random location on the radius of the stage.
    // If it's just the view changing, don't change the simulators position and remove
    // the simulator from the view.
    if (shipInside) {
      if (innerStages.length === 0) return null;

      this.setState({
        currentStage: id,
        shipStage: id,
        selectedStar: null
      });
    } else {
      if (!edit && innerStages.length === 0) return null;
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
  deleteStar = id => {
    this.setState(state => ({
      stage: state.stage.filter(s => s.id !== id),
      selectedStar: null
    }));
  };
  updateStar = (id, prop, value) => {
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
      search,
      currentView,
      edit,
      velocity,
      protractorShown,
      currentStage,
      shipStage,
      sensorsRangeShown,
      weaponsRangeShown,
      orbit
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
            onClick={() =>
              this.setState(state => ({
                orbit: state.selectedStar
              }))
            }
          >
            Orbit
          </button>
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
          <button
            className={`${sensorsRangeShown ? "active" : ""}`}
            onClick={() =>
              this.setState(state => ({
                sensorsRangeShown: !state.sensorsRangeShown
              }))
            }
          >
            Sensors
          </button>
          <button
            className={`${weaponsRangeShown ? "active" : ""}`}
            onClick={() =>
              this.setState(state => ({
                weaponsRangeShown: !state.weaponsRangeShown
              }))
            }
          >
            Weapons
          </button>
          {currentStage && <button onClick={this.leaveStage}>Go Back</button>}
        </div>
        {!edit && (
          <RotateButtons
            updateRotation={params => this.setState({ ...params, orbit: null })}
          />
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
                <ThreeHolder
                  dimensions={dimensions}
                  selectedStar={selectedStar}
                  selectStar={id => this.setState({ selectedStar: id })}
                  protractorShown={protractorShown}
                  search={search}
                  currentView={currentView}
                  edit={edit}
                  sensorsRangeShown={sensorsRangeShown}
                  weaponsRangeShown={weaponsRangeShown}
                  currentStage={currentStage}
                  shipStage={shipStage}
                  stage={stars}
                  velocity={velocity}
                  yaw={yaw}
                  pitch={pitch}
                  roll={roll}
                  orbit={orbit}
                  updateStar={this.updateStar}
                  enterStage={this.enterStage}
                  leaveStage={this.leaveStage}
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

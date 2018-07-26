import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import Three from "./threeView";
import Measure from "react-measure";
import StarConfig from "./ui/starConfig";
import RotateButtons from "./ui/rotateButtons";
import ViewButtons from "./ui/viewButtons";

import starList from "./systemHelpers";
import uuid from "uuid";

import "./style.css";
import { randomOnSphere, randomFromList } from "./threeHelpers";
class App extends Component {
  state = {
    quaternion: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.PI / 2, Math.PI, 0)
    ),
    yaw: 0,
    pitch: 0,
    roll: 0,
    // For protractor
    yawAngle: 0,
    pitchAngle: 0,
    currentView: "top",
    protractorShown: false,
    dimensions: null,
    stars: window.localStorage.getItem("3dStars")
      ? JSON.parse(window.localStorage.getItem("3dStars"))
      : Array(50)
          .fill(0)
          .map(() => ({
            id: uuid.v4(),
            name: randomFromList(starList),
            position: randomOnSphere(500),
            image: Math.floor(Math.random() * 4),
            scale: 30,
            hsl: [Math.random(), 1, 0.5]
          }))
  };
  render() {
    const {
      dimensions,
      stars,
      selectedStar,
      yaw,
      pitch,
      roll,
      yawAngle,
      pitchAngle,
      quaternion,
      search,
      currentView,
      edit,
      protractorShown
    } = this.state;
    window.localStorage.setItem("3dStars", JSON.stringify(this.state.stars));
    return (
      <div className="App">
        {selectedStar &&
          edit && (
            <StarConfig
              star={stars.find(s => s.id === selectedStar)}
              deselect={() => this.setState({ selectedStar: null })}
              deleteStar={id =>
                this.setState(state => ({
                  stars: state.stars.filter(s => s.id !== id),
                  selectedStar: null
                }))
              }
              updateStar={(id, props, value) =>
                this.setState(state => ({
                  stars: state.stars.map(
                    s => (s.id === id ? { ...s, [props]: value } : s)
                  )
                }))
              }
            />
          )}
        <div className="view-buttons edit">
          {edit && (
            <button
              onClick={() => {
                const id = uuid.v4();
                const star = {
                  id,
                  name: randomFromList(starList),
                  position: randomOnSphere(500),
                  image: Math.floor(Math.random() * 4),
                  scale: 30,
                  hsl: [Math.random(), 1, 0.5]
                };
                this.setState(state => ({
                  stars: state.stars.concat(star)
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
                  protractorShown={protractorShown}
                  quaternion={quaternion}
                  search={search}
                  stars={stars}
                  currentView={currentView}
                  selectedStar={selectedStar}
                  selectStar={id => this.setState({ selectedStar: id })}
                  updateRotation={params => this.setState(params)}
                  edit={edit}
                  updateStarPosition={(id, position) => {
                    this.setState(state => ({
                      stars: state.stars.map(
                        s => (s.id === id ? { ...s, position } : s)
                      )
                    }));
                  }}
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

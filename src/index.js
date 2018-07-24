import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import Three from "./threeView";
import Measure from "react-measure";
import Protractor from "./protractor";
import StarConfig from "./starConfig";
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
    currentView: "top",
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
      quaternion,
      search,
      currentView
    } = this.state;
    window.localStorage.setItem("3dStars", JSON.stringify(this.state.stars));
    return (
      <div className="App">
        {selectedStar && (
          <StarConfig
            star={stars.find(s => s.id === selectedStar)}
            updateStar={(id, props, value) =>
              this.setState(state => ({
                stars: state.stars.map(
                  s => (s.id === id ? { ...s, [props]: value } : s)
                )
              }))
            }
          />
        )}
        <div>
          <button
            onMouseDown={() => {
              this.setState({ roll: 0.01 });
            }}
            onMouseUp={() => {
              this.setState({ roll: 0 });
            }}
          >
            -
          </button>
          <button
            onMouseDown={() => {
              this.setState({ roll: -0.01 });
            }}
            onMouseUp={() => {
              this.setState({ roll: 0 });
            }}
          >
            +
          </button>
          <button
            onMouseDown={() => {
              this.setState({ pitch: -0.01 });
            }}
            onMouseUp={() => {
              this.setState({ pitch: 0 });
            }}
          >
            -
          </button>
          <button
            onMouseDown={() => {
              this.setState({ pitch: 0.01 });
            }}
            onMouseUp={() => {
              this.setState({ pitch: 0 });
            }}
          >
            +
          </button>
          <button
            onMouseDown={() => {
              this.setState({ yaw: 0.01 });
            }}
            onMouseUp={() => {
              this.setState({ yaw: 0 });
            }}
          >
            -
          </button>
          <button
            onMouseDown={() => {
              this.setState({ yaw: -0.01 });
            }}
            onMouseUp={() => {
              this.setState({ yaw: 0 });
            }}
          >
            +
          </button>
        </div>
        <div>
          <button onClick={() => this.setState({ selectedStar: null })}>
            Deselect
          </button>
          <button onClick={() => this.setState({ currentView: "side" })}>
            Side
          </button>
          <button onClick={() => this.setState({ currentView: "top" })}>
            Top
          </button>
          <button onClick={() => this.setState({ currentView: "perspective" })}>
            Perspective
          </button>
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
        {/* <Protractor />*/}
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
                height: "calc(100vh - 38px)"
              }}
            >
              {dimensions && (
                <Three
                  {...dimensions}
                  yaw={yaw}
                  pitch={pitch}
                  roll={roll}
                  quaternion={quaternion}
                  search={search}
                  stars={stars}
                  currentView={currentView}
                  selectedStar={selectedStar}
                  selectStar={id => this.setState({ selectedStar: id })}
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

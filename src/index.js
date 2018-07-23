import React, { Component } from "react";
import ReactDOM from "react-dom";
import Three from "./threeview";
import Measure from "react-measure";
import Protractor from "./protractor";

import "./style.css";

class App extends Component {
  state = { dimensions: null };
  render() {
    const { dimensions } = this.state;
    return (
      <div className="App">
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
                height: "80vh"
              }}
            >
              {dimensions && <Three {...dimensions} />}
            </div>
          )}
        </Measure>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

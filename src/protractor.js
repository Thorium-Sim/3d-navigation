import React, { Component } from "react";

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = ((angleInDegrees + 180) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
function cartesianToPolar(x, y) {
  return Math.atan2(y, x) / (Math.PI / 180.0) + 180;
}

export function degtorad(deg) {
  return deg * (Math.PI / 180);
}

function describeArc(x, y, r, sa, ea) {
  let startAngle = degtorad(Math.abs(360 - sa + 180));
  let endAngle = degtorad(Math.abs(360 - ea + 180));
  if (startAngle > endAngle) {
    let s = startAngle;
    startAngle = endAngle;
    endAngle = s;
  }
  if (endAngle - startAngle > Math.PI * 2) {
    endAngle = Math.PI * 1.99999;
  }

  const largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;

  return [
    "M",
    x,
    y,
    "L",
    x + Math.cos(startAngle) * r,
    y - Math.sin(startAngle) * r,
    "A",
    r,
    r,
    0,
    largeArc,
    0,
    x + Math.cos(endAngle) * r,
    y - Math.sin(endAngle) * r,
    "L",
    x,
    y
  ].join(" ");
}

export default class Protractor extends Component {
  state = { position: { x: 0, y: 0 }, rotation: { start: 50, end: 70 } };
  mouseDown = e => {
    e.preventDefault();
    e.stopPropagation();
    document.addEventListener("mouseup", this.mouseUp);
    document.addEventListener("mousemove", this.mouseMove);
  };
  mouseUp = () => {
    document.removeEventListener("mouseup", this.mouseUp);
    document.removeEventListener("mousemove", this.mouseMove);
  };
  mouseMove = e => {
    this.setState(state => ({
      position: {
        x: state.position.x + e.movementX,
        y: state.position.y + e.movementY
      }
    }));
  };
  rotate = which => {
    this.setState({ rotate: which });
    document.addEventListener("mouseup", this.rotateEnd);
    document.addEventListener("mousemove", this.rotateMove);
  };
  rotateEnd = () => {
    this.setState({ rotate: null });
    document.removeEventListener("mouseup", this.rotateEnd);
    document.removeEventListener("mousemove", this.rotateMove);
  };
  rotateMove = e => {
    const { rotate, rotation } = this.state;
    const { clientX, clientY } = e;
    const { x, y, width, height } = document
      .querySelector("#protractor")
      .getBoundingClientRect();
    const xLoc = clientX - x - width / 2;
    const yLoc = clientY - y - height / 2;
    this.setState({
      rotation: { ...rotation, [rotate]: cartesianToPolar(xLoc, yLoc) }
    });
  };
  render() {
    const {
      position: { x, y },
      rotation: { start, end }
    } = this.state;
    return (
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          transform: `translate(${x}px, ${y}px)`,
          pointerEvents: "none"
        }}
      >
        {Math.round(start)}:{Math.round(end)}
        <svg
          id="protractor"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            pointerEvents: "none"
          }}
        >
          <path
            stroke="green"
            strokeWidth={5}
            strokeLinecap="round"
            fill="transparent"
            d={describeArc(150, 150, 100, start, end)}
          />
          <circle
            strokeWidth="4"
            stroke="rgba(255,255,255,0.3)"
            fill="rgba(255,255,255,0.6)"
            cx="150"
            cy="150"
            r="5"
            style={{
              cursor: "pointer",
              pointerEvents: "all"
            }}
            onMouseDown={this.mouseDown}
          />
          <circle
            strokeWidth="4"
            stroke="rgba(255,255,255,0.3)"
            fill="rgba(255,255,255,0.6)"
            cx={polarToCartesian(150, 150, 100, start).x}
            cy={polarToCartesian(150, 150, 100, start).y}
            style={{ cursor: "pointer", pointerEvents: "all" }}
            r="5"
            onMouseDown={() => this.rotate("start")}
          />
          <circle
            strokeWidth="4"
            stroke="rgba(255,255,255,0.3)"
            fill="rgba(255,255,255,0.6)"
            cx={polarToCartesian(150, 150, 100, end).x}
            cy={polarToCartesian(150, 150, 100, end).y}
            r="5"
            style={{ cursor: "pointer", pointerEvents: "all" }}
            onMouseDown={() => this.rotate("end")}
          />
          <line
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="4"
            line
            x1="150"
            y1="150"
            x2={polarToCartesian(150, 150, 100, start).x}
            y2={polarToCartesian(150, 150, 100, start).y}
          />
          <line
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="4"
            line
            x1="150"
            y1="150"
            x2={polarToCartesian(150, 150, 100, end).x}
            y2={polarToCartesian(150, 150, 100, end).y}
          />
        </svg>
      </div>
    );
  }
}

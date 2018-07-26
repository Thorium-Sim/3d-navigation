import React from "react";

const rotateSpeed = 0.01;
const RotateButtons = ({ updateRotation }) => {
  return (
    <div className="view-buttons top">
      <button
        onMouseDown={() => {
          updateRotation({ yaw: rotateSpeed });
        }}
        onMouseUp={() => {
          updateRotation({ yaw: 0 });
        }}
      >
        Yaw -
      </button>
      <button
        onMouseDown={() => {
          updateRotation({ yaw: -rotateSpeed });
        }}
        onMouseUp={() => {
          updateRotation({ yaw: 0 });
        }}
      >
        Yaw +
      </button>
      <button
        onMouseDown={() => {
          updateRotation({ pitch: -rotateSpeed });
        }}
        onMouseUp={() => {
          updateRotation({ pitch: 0 });
        }}
      >
        Pitch -
      </button>
      <button
        onMouseDown={() => {
          updateRotation({ pitch: rotateSpeed });
        }}
        onMouseUp={() => {
          updateRotation({ pitch: 0 });
        }}
      >
        Pitch +
      </button>
      <button
        onMouseDown={() => {
          updateRotation({ roll: rotateSpeed });
        }}
        onMouseUp={() => {
          updateRotation({ roll: 0 });
        }}
      >
        Roll -
      </button>
      <button
        onMouseDown={() => {
          updateRotation({ roll: -rotateSpeed });
        }}
        onMouseUp={() => {
          updateRotation({ roll: 0 });
        }}
      >
        Roll +
      </button>
    </div>
  );
};
export default RotateButtons;

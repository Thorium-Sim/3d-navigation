import React from "react";

const ViewButtons = ({ setView, currentView }) => (
  <div className="view-buttons">
    <button
      className={`${currentView === "side" ? "active" : ""}`}
      onClick={() => setView("side")}
    >
      Side
    </button>
    <button
      className={`${currentView === "top" ? "active" : ""}`}
      onClick={() => setView("top")}
    >
      Top
    </button>
    <button
      className={`${currentView === "perspective" ? "active" : ""}`}
      onClick={() => setView("perspective")}
    >
      Perspective
    </button>
  </div>
);
export default ViewButtons;

import React, { Fragment } from "react";
import { ChromePicker } from "react-color";
import starImages from "../starImages";
import planetImages from "../planetImages";

const StarConfig = ({
  deselect,
  star: { id, name, image, hsl, scale, type },
  updateStar,
  deleteStar
}) => (
  <div className="star-config">
    <h3>Star Config</h3>
    <button onClick={deselect}>Deselect</button>
    <label>
      Name
      <input
        type="text"
        defaultValue={name}
        onBlur={e => updateStar(id, "name", e.target.value)}
      />
    </label>
    <label>
      Scale
      <input
        type="range"
        min={1}
        max={100}
        step={1}
        value={scale}
        onChange={e => updateStar(id, "scale", parseInt(e.target.value, 10))}
      />
    </label>
    {type === "star" && (
      <Fragment>
        <label>Color</label>
        <ChromePicker
          color={{ h: hsl[0] * 360, s: hsl[1], l: hsl[2] }}
          onChange={({ hsl: { h, s, l } }) =>
            updateStar(id, "hsl", [h / 360, s, l])
          }
          disableAlpha
        />
      </Fragment>
    )}
    <label>Image</label>
    <div className="image-holder">
      {(type === "star" ? starImages : planetImages).map((src, i) => (
        <div key={src}>
          <img
            alt="Star"
            className={`${i === image ? "active" : ""}`}
            src={src}
            onClick={() => updateStar(id, "image", i)}
          />
        </div>
      ))}
    </div>
    <button onClick={() => deleteStar(id)}>Delete</button>
  </div>
);

export default StarConfig;

import * as THREE from "three";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export default function makeTextSprite(message, parameters = {}) {
  const {
    fontface = "Arial",
    fontsize = 200,
    borderThickness = 4,
    borderColor = { r: 0, g: 0, b: 0, a: 1.0 },
    backgroundColor = { r: 0, g: 0, b: 0, a: 0.5 },
    textColor = { r: 255, g: 255, b: 255, a: 1 }
  } = parameters;
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");
    canvas.width = 1024;
    canvas.height = 512;
    context.font = `Bold ${fontsize}px ${fontface}`;
    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${
      backgroundColor.b
    },${backgroundColor.a})`;
    context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${
      borderColor.b
    },${borderColor.a})`;

    context.lineWidth = borderThickness;
    roundRect(
      context,
      borderThickness / 2,
      borderThickness / 2,
      (textWidth + borderThickness) * 1.1,
      fontsize * 1.4 + borderThickness,
      8
    );

    context.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},${
      textColor.a
    })`;
    context.fillText(
      message,
      borderThickness,
      fontsize + borderThickness,
      canvas.width
    );

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture
    });
    const label = new THREE.Sprite(spriteMaterial);
    label.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    label.userData.isLabel = true;
    return resolve(label);
  });
}

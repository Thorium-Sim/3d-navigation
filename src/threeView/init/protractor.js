import * as THREE from "three";

function toScreenPosition(obj, camera) {
  var vector = new THREE.Vector3();
  obj.updateMatrixWorld();
  vector.setFromMatrixPosition(obj.matrixWorld);
  vector.project(camera);
  return {
    x: vector.x,
    y: vector.y
  };
}

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

function degtorad(deg) {
  return deg * (Math.PI / 180);
}
function radtodeg(rad) {
  return rad / (Math.PI / 180);
}

const angleRadians = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

// angle in degrees
const angleDeg = (p1, p2) =>
  (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

export default function(self, ship) {
  const font = new THREE.Font(
    require("three/examples/fonts/droid/droid_sans_mono_regular.typeface.json")
  );

  const protractor = new THREE.Object3D();
  const geometry = new THREE.SphereGeometry(5, 8, 8);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: true
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0, 50, 0);
  protractor.add(sphere);
  sphere.cursor = "pointer";

  const circlegeometry = new THREE.CircleGeometry(50, 8, -Math.PI / 2, 0);
  const circlematerial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const circle = new THREE.Mesh(circlegeometry, circlematerial);
  const textSettings = {
    font: font,
    size: 16,
    height: 1,
    curveSegments: 12,
    bevelEnabled: false
  };
  const textGeo = new THREE.TextGeometry("0˚", textSettings);
  const meshMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    flatShading: true
  });
  const text = new THREE.Mesh(textGeo, meshMaterial);
  text.position.set(
    ...Object.values(
      polarToCartesian(ship.position.x, ship.position.y, 10, -90)
    ),
    0
  );
  protractor.add(text);

  function moveSphere(ev) {
    ev.stopPropagation();
    const angle =
      angleDeg(
        toScreenPosition(ship, self.cameras[self.currentCamera]),
        ev.data.global
      ) - 180;

    const angleRad = angleRadians(
      toScreenPosition(ship, self.cameras[self.currentCamera]),
      ev.data.global
    );
    const position = polarToCartesian(
      ship.position.x,
      ship.position.y,
      50,
      angle
    );
    sphere.position.set(...Object.values(position), 0);

    // Update the circle
    circle.geometry.dispose();
    function getCircleAngle(a) {
      if (a > 0) return a - Math.PI / 2;
      if (a < -Math.PI / 2) return a + (Math.PI / 2) * 3;
      return a - Math.PI / 2;
    }
    circle.geometry = new THREE.CircleGeometry(
      50,
      16,
      Math.PI / 2,
      getCircleAngle(angleRad)
    );

    // Update the text
    text.geometry.dispose();
    text.geometry = new THREE.TextGeometry(
      `${-Math.round(radtodeg(getCircleAngle(angleRad)))}˚`,
      textSettings
    );
    text.position.set(
      ...Object.values(
        polarToCartesian(ship.position.x, ship.position.y, 25, angle)
      ),
      10
    );
  }
  function endMove() {
    self.controls.enabled = true;
    self.scene.off("mousemove", moveSphere);
    self.scene.off("mouseup", endMove);
  }
  sphere.on("mousedown", function() {
    self.controls.enabled = false;
    self.scene.on("mousemove", moveSphere);
    self.scene.on("mouseup", endMove);
  });

  protractor.add(circle);
  return protractor;
}

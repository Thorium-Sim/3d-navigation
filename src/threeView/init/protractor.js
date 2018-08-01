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

function radtodeg(rad) {
  return rad / (Math.PI / 180);
}

const angleRadians = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

export default class Protractor extends THREE.Object3D {
  constructor(self, ship) {
    super();
    const font = new THREE.Font(
      require("three/examples/fonts/droid/droid_sans_mono_regular.typeface.json")
    );
    this.visible = false;
    const geometry = new THREE.CircleGeometry(7, 32);
    const geometry2 = new THREE.CircleGeometry(5, 32);

    const material = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      wireframe: false
    });
    const material2 = new THREE.MeshBasicMaterial({
      color: 0x004488,
      wireframe: false
    });
    const sphere = new THREE.Mesh(geometry, material);
    const inner = new THREE.Mesh(geometry2, material2);

    sphere.position.set(0, 50, 1);
    sphere.add(inner);
    this.add(sphere);
    sphere.cursor = "pointer";

    const circlegeometry = new THREE.CircleGeometry(50, 8, -Math.PI / 2, 0);
    const circlematerial = new THREE.MeshBasicMaterial({
      color: 0x002244,
      side: THREE.DoubleSide
    });
    const circlegeometry2 = new THREE.CircleGeometry(52, 8, -Math.PI / 2, 0);
    const circlematerial2 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    const circle = new THREE.Mesh(circlegeometry, circlematerial);
    const circle2 = new THREE.Mesh(circlegeometry2, circlematerial2);
    circle2.position.set(0, 0, -1);

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
    this.add(text);

    const moveSphere = ev => {
      ev.stopPropagation();
      const angle = angleRadians(
        toScreenPosition(ship, self.cameras[self.currentCamera]),
        ev.data.global
      );
      function getAngle(a) {
        if (self.props.currentView === "side") {
          a = a + Math.PI / 2;
        }
        if (a < -Math.PI / 2) return -a - (Math.PI / 2) * 3;
        return -a + Math.PI / 2;
      }
      self.props.updateProtractorAngle(getAngle(angle));
    };
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

    this.add(circle);
    this.add(circle2);

    this.updateAngle = function(rad) {
      const angleRad = rad * -1;
      const angle = radtodeg(angleRad) - 180;

      const position = polarToCartesian(
        ship.position.x,
        ship.position.y,
        50,
        angle + 90
      );
      sphere.position.set(...Object.values(position), 1);

      // Update the circle
      circle.geometry.dispose();
      circle2.geometry.dispose();
      function getCircleAngle(a) {
        // if (self.props.currentView === "side") {
        //   a = a + Math.PI / 2;
        // }
        if (a > 0) return a - Math.PI / 2;
        if (a < -Math.PI / 2) return a + (Math.PI / 2) * 3;
        return a - Math.PI / 2;
      }
      circle.geometry = new THREE.CircleGeometry(
        50,
        16,
        Math.PI / 2,
        getCircleAngle(angleRad + Math.PI / 2)
      );
      circle2.geometry = new THREE.CircleGeometry(
        52,
        16,
        Math.PI / 2,
        getCircleAngle(angleRad + Math.PI / 2)
      );

      // Update the text
      text.geometry.dispose();
      text.geometry = new THREE.TextGeometry(
        `${-Math.round(radtodeg(getCircleAngle(angleRad + Math.PI / 2)))}˚`,
        textSettings
      );
      text.position.set(
        ...Object.values(
          polarToCartesian(ship.position.x, ship.position.y, 25, angle)
        ),
        10
      );
    };
    this.rotation.set((Math.PI / 2) * 3, 0, Math.PI);
  }
}

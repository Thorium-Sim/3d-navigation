import React, { Component } from "react";
import * as THREE from "three";
//import { degtorad } from "./protractor";
import TWEEN from "@tweenjs/tween.js";
import { makeStars, makeLights, makeSkybox, makeShip } from "./threeHelpers";
const OrbitControls = require("three-orbit-controls")(THREE);

class ThreeView extends Component {
  constructor(props) {
    super(props);
    this.timeDelta = 0;
    this.state = {
      quaternion: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(Math.PI / 2, Math.PI, 0)
      ),
      yaw: 0,
      pitch: 0,
      roll: 0,
      names: []
    };
  }
  createScene() {
    const { width, height } = this.props;
    this.scene = new THREE.Scene();
    this.intersects = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.cameras = [];
    this.cameras.push(
      new THREE.PerspectiveCamera(45, width / height, 0.1, 100000)
    );
    this.cameras.push(
      new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        0.01,
        100000
      )
    );
    this.cameras[0].up.z = 1;
    this.cameras[0].up.y = 0;
    this.currentCamera = 1;
    this.cameras[1].position.y = 1000;
    this.cameras[1].position.z = 0;
    this.cameras[1].up.z = 1;
    this.cameras[1].up.y = 0;
    this.cameras[1].lookAt(new THREE.Vector3(0, 0, 0));

    this.controls = new OrbitControls(
      this.cameras[this.currentCamera],
      document.getElementById("three-mount")
    );
    this.controls.maxZoom = 3;
    this.controls.minZoom = 0.65;
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 20;
    this.controls.enableRotate = false;
    this.controls.mouseButtons = {
      ORBIT: THREE.MOUSE.RIGHT,
      ZOOM: THREE.MOUSE.MIDDLE,
      PAN: THREE.MOUSE.LEFT
    };

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(width, height);

    const map = new THREE.TextureLoader().load(require("./img/crosshair.svg"));
    const material = new THREE.SpriteMaterial({
      map: map,
      color: 0xff0000,
      fog: false
    });
    this.crosshair = new THREE.Sprite(material);
    this.crosshair.scale.set(15, 15, 15);
    this.crosshair.visible = false;
    this.scene.add(this.crosshair);

    this.SKY_SIZE = 2500;
    this.LINE_COUNT = 10;

    makeLights(this.scene);
    this.skybox = makeSkybox(this.SKY_SIZE);
    this.scene.add(this.skybox);
    makeShip().then(ship => {
      this.rig = new THREE.Object3D();
      this.ship = ship;
      this.rig.add(this.cameras[1]);
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000
      });
      const lineGeometry = new THREE.CubeGeometry(0.1, 0.1, 2);
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.z = 3;
      this.ship.add(line);
      this.rig.add(this.ship);
      this.rig.setRotationFromQuaternion(this.state.quaternion);
      this.scene.add(this.rig);
    });
    makeStars(this.SKY_SIZE, this.scene);
  }
  componentDidUpdate() {
    const { quaternion, search } = this.state;
    const regex = new RegExp(search, "gi");
    if (this.rig) {
      this.rig.setRotationFromQuaternion(quaternion);
    }
    this.scene.children.forEach(c => {
      if (c.name.match(regex) || !search) {
        c.visible = true;
      } else if (c.name) {
        c.visible = false;
      }
    });
  }
  componentDidMount() {
    this.createScene();
    this.animating = true;
    this.animate();

    document
      .getElementById("three-mount")
      .appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener(
      "mousemove",
      this.onMouseMove,
      false
    );
    this.renderer.domElement.addEventListener(
      "mousedown",
      this.onMouseDown,
      false
    );
  }
  componentWillUnmount() {
    cancelAnimationFrame(this.frame);
    this.animating = false;
    this.renderer.domElement.removeEventListener(
      "mousemove",
      this.onMouseMove,
      false
    );
    this.renderer.domElement.removeEventListener(
      "mousedown",
      this.onMouseDown,
      false
    );
  }
  onMouseMove = event => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    const {
      width,
      height,
      top,
      left
    } = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - left) / width) * 2 - 1;
    this.mouse.y = -((event.clientY - top) / height) * 2 + 1;
  };
  onMouseDown = () => {
    for (let i = 0; i < this.scene.children.length; i++) {
      this.scene.children[i].userData.selected = false;
      this.scene.remove(this.scene.children[i].labelSprite);
      if (this.scene.children[i].labelSprite)
        this.scene.children[i].labelSprite.visible = false;
    }
    if (this.intersects.length > 0) {
      const { x, y, z } = this.intersects[0].object.position;
      this.intersects[0].object.userData.selected = true;
      this.crosshair.position.set(x, y, z);
      this.crosshair.visible = true;
    } else {
      this.crosshair.visible = false;
    }
  };
  setView = which => {
    if (which === "perspective") {
      this.cameras[0].position.z = 300;
      this.cameras[0].position.y = 200;
      this.cameras[0].position.x = 300;
      this.cameras[0].lookAt(new THREE.Vector3(0, 0, 0));
      this.currentCamera = 0;
      this.controls.target.set(0, 0, 0);

      this.controls.enableRotate = true;
      this.controls.enablePan = false;
      this.controls.mouseButtons = {
        ORBIT: THREE.MOUSE.LEFT,
        ZOOM: THREE.MOUSE.MIDDLE,
        PAN: THREE.MOUSE.RIGHT
      };
      // this.lines.visible = false;
      this.controls.object = this.cameras[this.currentCamera];
      this.controls.update();
      return;
    }
    this.currentCamera = 1;

    const { x, y, z } = this.cameras[1].position.clone();
    const { x: ux, y: uy, z: uz } = this.cameras[1].up.clone();
    const { x: tx, y: ty, z: tz } = this.controls.target.clone();
    let [nx, ny, nz, nux, nuy, nuz] = [0, 0, 0, 0, 0, 0];
    this.controls.enableRotate = false;
    this.controls.enablePan = true;
    this.controls.mouseButtons = {
      ORBIT: THREE.MOUSE.RIGHT,
      ZOOM: THREE.MOUSE.MIDDLE,
      PAN: THREE.MOUSE.LEFT
    };
    if (which === "side") {
      nx = -1000;
      nuy = 1;
    }
    if (which === "top") {
      ny = 1000;
      nuz = 1;
    }
    this.tween = new TWEEN.Tween({ x, y, z, ux, uy, uz, tx, ty, tz })
      .to(
        {
          x: nx,
          y: ny,
          z: nz,
          ux: nux,
          uy: nuy,
          uz: nuz,
          tx: 0,
          ty: 0,
          tz: 0
        },
        500
      )
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate(({ x, y, z, ux, uy, uz, tx, ty, tz }) => {
        // Called after tween.js updates 'coords'.
        this.controls.target.set(tx, ty, tz);
        this.cameras[1].position.set(x, y, z);
        this.cameras[1].up.set(ux, uy, uz);
        this.cameras[1].lookAt(new THREE.Vector3(0, 0, 0));
        this.cameras[1].updateProjectionMatrix();
      })
      .start();

    this.controls.object = this.cameras[this.currentCamera];
    this.controls.update();
  };
  animate = time => {
    if (!this.animating) return false;
    TWEEN.update(time);
    const q = new THREE.Quaternion();
    if (this.state.pitch || this.state.roll || this.state.yaw) {
      q.setFromAxisAngle(
        new THREE.Vector3(this.state.pitch, this.state.roll, this.state.yaw),
        Math.PI / 2
      );
      this.setState({
        quaternion: this.state.quaternion.multiply(q).normalize()
      });
    }
    if (this.ship) {
      this.ship.scale.x = 10 / (this.cameras[this.currentCamera].zoom * 2 + 1);
      this.ship.scale.y = 10 / (this.cameras[this.currentCamera].zoom * 2 + 1);
      this.ship.scale.z = 10 / (this.cameras[this.currentCamera].zoom * 2 + 1);
    }

    // Raycaster
    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.cameras[this.currentCamera]);

    // calculate objects intersecting the picking ray
    const newIntersects = this.raycaster
      .intersectObjects(this.scene.children)
      .filter(i => i.object.userData.name);
    for (let i = 0; i < this.intersects.length; i++) {
      if (
        !newIntersects.find(
          ni => ni.object.uuid === this.intersects[i].object.uuid
        ) &&
        !this.intersects[i].object.userData.selected
      ) {
        this.scene.remove(this.intersects[i].object.labelSprite);
        this.intersects[i].object.labelSprite.visible = false;
      }
    }
    this.intersects = newIntersects;
    for (let i = 0; i < this.intersects.length; i++) {
      if (
        this.intersects[i].object.labelSprite &&
        this.intersects[i].object.labelSprite.visible === false
      ) {
        console.log("Added");
        this.scene.add(this.intersects[i].object.labelSprite);
        this.intersects[i].object.labelSprite.visible = true;
      }
    }
    this.controls && this.controls.update();
    this.renderer.render(this.scene, this.cameras[this.currentCamera]);
    this.frame = requestAnimationFrame(this.animate);
  };
  render() {
    const { search } = this.state;
    return (
      <div>
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
          <button onClick={() => this.setView("side")}>Side</button>
          <button onClick={() => this.setView("top")}>Top</button>
          <button onClick={() => this.setView("perspective")}>
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
        <div id="three-mount" />
      </div>
    );
  }
}
export default ThreeView;

import React, { Component } from "react";
import * as THREE from "three";
//import { degtorad } from "./protractor";
import TWEEN from "@tweenjs/tween.js";
import { makeStar, makeLights, makeSkybox, makeShip } from "../threeHelpers";
import { makeCameras, makeControls, makeBase, Protractor } from "./init";
import { rotate, scale, labels } from "./animate";
import { starsUpdate, searchUpdate } from "./update";
import { Interaction } from "three.interaction";

class ThreeView extends Component {
  SKY_SIZE = 2500;
  LINE_COUNT = 10;
  createScene() {
    makeBase(this);
    makeCameras(this);
    makeControls(this);
    this.interaction = new Interaction(
      this.renderer,
      this.scene,
      this.cameras[this.currentCamera]
    );

    const map = new THREE.TextureLoader().load(require("../img/crosshair.svg"));
    const material = new THREE.SpriteMaterial({
      map: map,
      color: 0xff0000,
      fog: false
    });
    this.crosshair = new THREE.Sprite(material);
    this.crosshair.scale.set(15, 15, 15);
    this.crosshair.visible = false;
    this.scene.add(this.crosshair);

    this.scene.add(this.transformControl);

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
      this.protractor = new Protractor(this, ship);
      this.rig.add(this.protractor);

      this.rig.setRotationFromQuaternion(this.props.quaternion);
      this.scene.add(this.rig);
    });

    // Create initial stars
    this.props.stars.forEach(s => {
      const star = makeStar(s);
      star && this.scene.add(star);
    });
  }
  componentDidUpdate(prevProps) {
    const {
      quaternion,
      selectedStar,
      currentView,
      yawAngle,
      pitchAngle,
      protractorShown
    } = this.props;
    const { stars: propStars } = this.props;
    if (this.rig) {
      this.rig.setRotationFromQuaternion(quaternion);
    }
    const stars = this.scene.children.filter(c => c.userData.isStar);

    if (prevProps.selectedStar !== selectedStar) {
      if (!selectedStar) {
        this.deselect();
      } else {
        this.select(selectedStar);
      }
    }
    // Update the view
    if (prevProps.currentView !== currentView) {
      this.setView(currentView);
    }
    starsUpdate(this, propStars, stars);
    searchUpdate(this, stars);
    if (currentView === "side") {
      this.protractor.updateAngle(pitchAngle);
    } else {
      this.protractor.updateAngle(yawAngle);
    }
    this.protractor.visible = protractorShown;
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
    if (this.intersects.length > 0) {
      this.deselect();
      this.props.selectStar(this.intersects[0].userData.id);
    }
  };
  setView = which => {
    this.view = which;
    if (which === "perspective") {
      this.protractor.visible = false;
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
    this.protractor.visible = this.props.protractorShown;

    const { x, y, z } = this.cameras[1].position.clone();
    const { x: ux, y: uy, z: uz } = this.cameras[1].up.clone();
    const { x: tx, y: ty, z: tz } = this.controls.target.clone();
    let [nx, ny, nz, nux, nuy, nuz, nrx, nry, nrz] = [
      0,
      0,
      0,
      0,
      0,
      0,
      (Math.PI / 2) * 3,
      0,
      Math.PI
    ];
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
      nrx = (Math.PI / 2) * 2;
      nry = -Math.PI / 2;
      nrz = Math.PI - Math.PI / 2;
    }
    if (which === "top") {
      ny = 1000;
      nuz = 1;
    }
    const rx = this.protractor.rotation._x;
    const ry = this.protractor.rotation._y;
    const rz = this.protractor.rotation._z;

    this.tween = new TWEEN.Tween({
      x,
      y,
      z,
      ux,
      uy,
      uz,
      tx,
      ty,
      tz,
      rx,
      ry,
      rz
    })
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
          tz: 0,
          rx: nrx,
          ry: nry,
          rz: nrz
        },
        500
      )
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate(({ x, y, z, ux, uy, uz, tx, ty, tz, rx, ry, rz }) => {
        // Called after tween.js updates 'coords'.
        this.controls.target.set(tx, ty, tz);
        this.cameras[1].position.set(x, y, z);
        this.cameras[1].up.set(ux, uy, uz);
        this.cameras[1].lookAt(new THREE.Vector3(0, 0, 0));
        this.cameras[1].updateProjectionMatrix();
        this.protractor.rotation.set(rx, ry, rz);
        this.protractor.children[1].rotation.set(0, 0, ry * -1);
      })
      .start();

    this.controls.object = this.cameras[this.currentCamera];
    this.controls.update();
  };
  select = id => {
    const star = this.scene.children.find(c => c.userData.id === id);
    if (!star) return;
    if (this.props.edit) {
      this.transformControl.attach(star);
    } else {
      const { x, y, z } = star.position;
      this.crosshair.position.set(x, y, z);
      this.crosshair.visible = true;
    }
    star.userData.selected = true;
  };
  deselect = () => {
    this.transformControl.detach();
    this.crosshair.visible = false;

    for (let i = 0; i < this.scene.children.length; i++) {
      this.scene.children[i].userData.selected = false;
      const label = this.scene.children[i].children.find(
        c => c.userData.isLabel
      );
      if (label) label.visible = false;
    }
  };
  animate = time => {
    if (!this.animating) return false;
    TWEEN.update(time);

    rotate(this);
    scale(this);
    labels(this);

    this.controls && this.controls.update();
    this.renderer.render(this.scene, this.cameras[this.currentCamera]);
    this.frame = requestAnimationFrame(this.animate);
  };
  render() {
    return <div id="three-mount" />;
  }
}
export default ThreeView;

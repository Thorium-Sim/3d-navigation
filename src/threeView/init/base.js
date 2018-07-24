import * as THREE from "three";

export default function makeBase(self) {
  // Various things that need to be made first.
  const { width, height } = self.props;
  self.scene = new THREE.Scene();
  self.intersects = [];
  self.raycaster = new THREE.Raycaster();
  self.mouse = new THREE.Vector2();
  self.renderer = new THREE.WebGLRenderer({ alpha: true });
  self.renderer.setSize(width, height);
}

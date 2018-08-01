import * as THREE from "three";
import starImages from "../starImages";
export default starImages.map(s => new THREE.TextureLoader().load(s));

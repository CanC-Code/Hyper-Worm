/// scene.js
/// Purpose: Three.js scene setup with POV camera & controls
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { OrbitControls } from "../../three/OrbitControls.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,5,10);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

export const world = new THREE.Group();
scene.add(world);

// Simple light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5,10,5);
scene.add(light);

let controls = null;

// Resize handler
export function resizeRenderer() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// POV camera follow snake head
export function updateCamera(delta) {
  // For now, camera trails behind snake head at fixed offset
  // Assuming snakeState.headMesh exists
  const offset = new THREE.Vector3(0,3,5);
  if (world.children.length > 0) {
    const head = world.children[0].getObjectByName("Head");
    if (head) {
      const desiredPos = head.position.clone().add(offset);
      camera.position.lerp(desiredPos, 0.1);
      camera.lookAt(head.position);
    }
  }
}

// Optional: mouse drag to rotate world
export function initWorldDragControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.target.set(0,0,0);
  controls.update();
}
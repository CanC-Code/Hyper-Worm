/// scene.js
/// Three.js scene + camera handling
/// Camera locked behind snake
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state as snakeState } from "../game/snake.js";

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
export const renderer = new THREE.WebGLRenderer({ antialias: true });
export const world = new THREE.Group();
scene.add(world);

export function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ---------- Camera follows behind snake ---------- */
export function updateCamera(delta) {
  if (!snakeState.mesh) return;

  const offset = new THREE.Vector3(0, 1.5, -3);
  const desiredPos = snakeState.mesh.position.clone().add(offset);
  camera.position.lerp(desiredPos, 0.1);
  camera.lookAt(snakeState.mesh.position);
}
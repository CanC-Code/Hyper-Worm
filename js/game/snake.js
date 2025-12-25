/// snake.js
/// Dynamic forward-oriented snake with smooth steering
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { getYawInput } from "../input/touchControls.js";

export const state = {
  mesh: null,
  path: [],
  speed: 2,
  direction: new THREE.Vector3(0,0,1),
  length: 5
};

export function initSnakeFromMesh(mesh) {
  state.mesh = mesh;
  state.path = [];
  state.length = 5;
  state.direction.set(0,0,1);
  for (let i=0; i<state.length; i++) {
    state.path.push(mesh.position.clone().add(new THREE.Vector3(0,0,-i)));
  }
}

export function setDirection(dir) {
  // yaw input handled per frame
}

export function getHeadPosition() {
  return state.mesh.position.clone();
}

export function getHeadDirection() {
  return state.direction.clone();
}

export function updateSnake(delta) {
  if (!state.mesh) return;
  const yaw = getYawInput();
  const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), yaw * delta * 5);
  state.direction.applyQuaternion(rotation).normalize();

  const moveVec = state.direction.clone().multiplyScalar(state.speed * delta);
  state.mesh.position.add(moveVec);

  // Update path for tail
  state.path.unshift(state.mesh.position.clone());
  if (state.path.length > state.length * 6) state.path.pop();
}

export function growSnake() {
  state.length++;
}
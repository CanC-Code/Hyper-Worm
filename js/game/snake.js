/// snake.js
/// True 3D free-form snake with smooth steering, infinite growth
/// Camera locked behind head
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

export const state = {
  mesh: null,
  segments: [],
  positions: [],
  speed: 2,
  direction: new THREE.Vector3(0, 0, 1),
  directionInput: new THREE.Vector2(0, 1),
  segmentSpacing: 0.3,
};

export function initSnakeFromMesh(mesh) {
  state.mesh = mesh;
  world.add(state.mesh);
  state.segments = [];
  state.positions = [mesh.position.clone()];
}

export function setDirection(dirVec) {
  state.directionInput.copy(dirVec);
}

export function growSnake() {
  const lastPos = state.positions[state.positions.length - 1].clone();
  state.positions.push(lastPos);
}

export function updateSnake(delta) {
  if (!state.mesh) return;

  // Steering
  const inputDir = new THREE.Vector3(state.directionInput.x, 0, state.directionInput.y);
  if (inputDir.lengthSq() > 0) inputDir.normalize();
  state.direction.lerp(inputDir, 0.1);

  // Head moves forward
  state.mesh.position.addScaledVector(state.direction, state.speed * delta);

  // Add current head position to positions array
  state.positions.unshift(state.mesh.position.clone());

  // Update tail positions
  for (let i = 0; i < state.positions.length - 1; i++) {
    const cur = state.positions[i];
    const next = state.positions[i + 1];
    const dist = cur.distanceTo(next);
    if (dist > state.segmentSpacing) {
      const dir = new THREE.Vector3().subVectors(cur, next).normalize();
      next.addScaledVector(dir, dist - state.segmentSpacing);
    }
  }

  // Limit positions array for memory efficiency
  while (state.positions.length > 2000) state.positions.pop();

  // Mouth animation
  const posAttr = state.mesh.geometry.attributes.position;
  const openAmount = Math.sin(performance.now() * 0.005) * 0.05;
  for (let i = 0; i < posAttr.count; i++) {
    posAttr.setZ(i, posAttr.getZ(i) + openAmount);
  }
  posAttr.needsUpdate = true;
  state.mesh.geometry.computeBoundingSphere();
}

export function getHeadPosition() {
  return state.mesh ? state.mesh.position.clone() : new THREE.Vector3();
}

export function getHeadDirection() {
  return state.direction.clone();
}
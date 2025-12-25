/// snake.js
/// Purpose: Smooth 3D snake with continuous free movement
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

/* ---------- Snake State ---------- */
export const state = {
  mesh: null,
  speed: 2,
  direction: new THREE.Vector3(0, 0, 1),
  mouthVertices: [],
  tailZ: 0,
  directionInput: new THREE.Vector2(0, 1),
};

/* ---------- Initialize Snake from Mesh ---------- */
export function initSnakeFromMesh(mesh) {
  state.mesh = mesh;
  world.add(state.mesh);

  const posAttr = state.mesh.geometry.attributes.position;
  const vertexCount = posAttr.count;
  state.mouthVertices = [];
  for (let i = 0; i < vertexCount; i++) {
    if (posAttr.getZ(i) > 0.4 && posAttr.getY(i) > 0) state.mouthVertices.push(i);
  }
}

/* ---------- Update Input Vector ---------- */
export function setDirection(dirVec) {
  state.directionInput.copy(dirVec);
}

/* ---------- Update Snake ---------- */
export function updateSnake(delta) {
  if (!state.mesh) return;

  // Smoothly interpolate direction toward input
  const desiredDir = new THREE.Vector3(state.directionInput.x, 0, state.directionInput.y);
  if (desiredDir.lengthSq() > 0) desiredDir.normalize();
  state.direction.lerp(desiredDir, 0.15); // smooth steering

  // Move snake along direction
  state.mesh.position.addScaledVector(state.direction, state.speed * delta);

  // Mouth animation placeholder
  const pos = state.mesh.geometry.attributes.position;
  const openAmount = Math.sin(performance.now() * 0.005) * 0.05;
  for (const idx of state.mouthVertices) {
    const z = pos.getZ(idx);
    pos.setZ(idx, z + openAmount);
  }
  pos.needsUpdate = true;
  state.mesh.geometry.computeBoundingSphere();
}

/* ---------- Grow Snake ---------- */
export function growSnake() {
  if (!state.mesh) return;
  const pos = state.mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    pos.setZ(i, z + 0.05); // incremental growth
  }
  pos.needsUpdate = true;
}

/* ---------- Get Head Position ---------- */
export function getHeadPosition() {
  if (!state.mesh) return new THREE.Vector3();
  return state.mesh.position.clone().add(new THREE.Vector3(0, 0, 0.5));
}

/* ---------- Get Head Direction ---------- */
export function getHeadDirection() {
  return state.direction.clone();
}
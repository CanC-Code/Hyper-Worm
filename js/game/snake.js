/// snake.js
/// Purpose: Single-mesh smooth snake with infinite growth
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

/* ---------- Snake State ---------- */
export const state = {
  mesh: null,          // single mesh
  speed: 2,
  direction: new THREE.Vector3(0, 0, 1),
  mouthVertices: [],   // indices for mouth animation
  tailZ: 0,
};

/* ---------- Initialize Snake from existing mesh ---------- */
export function initSnakeFromMesh(mesh) {
  state.mesh = mesh;
  world.add(state.mesh);

  // Identify mouth vertices (top/front of egg)
  const pos = state.mesh.geometry.attributes.position;
  const vertexCount = pos.count;
  state.mouthVertices = [];
  for (let i = 0; i < vertexCount; i++) {
    if (pos.getZ(i) > 0.4) state.mouthVertices.push(i);
  }

  // Tail Z coordinate for growth reference
  const positions = pos.array;
  state.tailZ = Math.min(...positions.filter((_, i) => i % 3 === 2));
}

/* ---------- Set Direction ---------- */
export function setDirection(dirVec) {
  const newDir = new THREE.Vector3(dirVec.x, 0, dirVec.y);
  if (newDir.lengthSq() > 0) {
    newDir.normalize();
    state.direction.lerp(newDir, 0.2); // smooth turning
  }
}

/* ---------- Update Snake ---------- */
export function updateSnake(delta) {
  const moveDist = state.speed * delta;

  // Move mesh along direction
  state.mesh.position.addScaledVector(state.direction, moveDist);

  // Optional: mouth animation shrink back
  const pos = state.mesh.geometry.attributes.position;
  for (const idx of state.mouthVertices) {
    const x = pos.getX(idx);
    const y = pos.getY(idx);
    let z = pos.getZ(idx);
    pos.setZ(idx, z); // placeholder for future mouth expansion
  }
  pos.needsUpdate = true;

  // Update tail Z for growth
  const positions = pos.array;
  state.tailZ += moveDist; // virtual extension
}

/* ---------- Grow Snake ---------- */
export function growSnake() {
  if (!state.mesh) return;
  const pos = state.mesh.geometry.attributes.position;
  const vertexCount = pos.count;
  // Stretch all Z positions forward to simulate growth
  for (let i = 0; i < vertexCount; i++) {
    const z = pos.getZ(i);
    pos.setZ(i, z + 0.05); // small growth increment
  }
  pos.needsUpdate = true;
  state.tailZ += 0.05;
}

/* ---------- Get Head Position ---------- */
export function getHeadPosition() {
  if (!state.mesh) return new THREE.Vector3();
  return state.mesh.position.clone().add(new THREE.Vector3(0, 0, 0.5));
}
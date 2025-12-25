/// snake.js
/// Purpose: Single-mesh smooth snake with infinite growth
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

/* ---------- Snake State ---------- */
export const snakeState = {
  mesh: null,          // single mesh representing snake
  speed: 2,
  direction: new THREE.Vector3(0, 0, 1),
  mouthVertices: [],   // indices for mouth animation
  tailZ: 0,
};

/* ---------- Initialize Snake from Mesh ---------- */
export function initSnakeFromMesh(mesh) {
  snakeState.mesh = mesh;
  world.add(snakeState.mesh);

  // Identify mouth vertices (top/front of egg)
  const pos = snakeState.mesh.geometry.attributes.position;
  const vertexCount = pos.count;
  snakeState.mouthVertices = [];
  for (let i = 0; i < vertexCount; i++) {
    if (pos.getZ(i) > 0.4) snakeState.mouthVertices.push(i);
  }

  // Tail Z coordinate for growth reference
  const positions = pos.array;
  snakeState.tailZ = Math.min(...positions.filter((_, i) => i % 3 === 2));
}

/* ---------- Set Direction ---------- */
export function setDirection(dirVec) {
  const newDir = new THREE.Vector3(dirVec.x, 0, dirVec.y);
  if (newDir.lengthSq() > 0) {
    newDir.normalize();
    // Smooth turning
    snakeState.direction.lerp(newDir, 0.2);
  }
}

/* ---------- Update Snake ---------- */
export function updateSnake(delta) {
  const moveDist = snakeState.speed * delta;

  // Move mesh along direction
  snakeState.mesh.position.addScaledVector(snakeState.direction, moveDist);

  // Optional: mouth animation shrink back
  const pos = snakeState.mesh.geometry.attributes.position;
  for (const idx of snakeState.mouthVertices) {
    const x = pos.getX(idx);
    const y = pos.getY(idx);
    let z = pos.getZ(idx);
    pos.setZ(idx, z); // placeholder for future mouth expansion
  }
  pos.needsUpdate = true;

  // Update tail Z for growth
  snakeState.tailZ += moveDist;
}

/* ---------- Grow Snake ---------- */
export function growSnake() {
  if (!snakeState.mesh) return;
  const pos = snakeState.mesh.geometry.attributes.position;
  const vertexCount = pos.count;

  // Stretch all Z positions forward to simulate growth
  for (let i = 0; i < vertexCount; i++) {
    const z = pos.getZ(i);
    pos.setZ(i, z + 0.05); // small growth increment
  }
  pos.needsUpdate = true;
  snakeState.tailZ += 0.05;
}

/* ---------- Get Head Position ---------- */
export function getHeadPosition() {
  if (!snakeState.mesh) return new THREE.Vector3();
  return snakeState.mesh.position.clone().add(new THREE.Vector3(0, 0, 0.5));
}

/* ---------- Get Head Direction ---------- */
export function getHeadDirection() {
  return snakeState.direction.clone();
}
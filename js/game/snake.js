/// snake.js
/// Smooth 3D snake movement and growth
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export const state = {
  mesh: null,           // snake head mesh
  segments: [],         // array of segment meshes
  speed: 2,             // units/sec
  yaw: 0,               // current heading
  targetYaw: 0,         // desired heading from input
  turnRate: Math.PI,    // radians/sec
  segmentDistance: 0.5, // spacing between segments
};

/* ---------- Initialize snake from mesh ---------- */
export function initSnakeFromMesh(mesh) {
  state.mesh = mesh;
  state.mesh.position.set(0, 0.5, 0);
  state.segments = [];
  state.yaw = 0;
  state.targetYaw = 0;
}

/* ---------- Update heading from input ---------- */
export function setDirection(vec2) {
  if (!vec2 || vec2.length() === 0) return;

  // Desired yaw angle from 2D swipe
  state.targetYaw = Math.atan2(vec2.x, vec2.y);
}

/* ---------- Update snake each frame ---------- */
export function updateSnake(delta) {
  if (!state.mesh) return;

  // Smooth yaw interpolation
  let deltaYaw = state.targetYaw - state.yaw;
  while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI;
  while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI;

  const maxTurn = state.turnRate * delta;
  deltaYaw = THREE.MathUtils.clamp(deltaYaw, -maxTurn, maxTurn);
  state.yaw += deltaYaw;

  // Compute forward vector
  const forward = new THREE.Vector3(Math.sin(state.yaw), 0, Math.cos(state.yaw));

  // Move head
  const moveDelta = forward.clone().multiplyScalar(state.speed * delta);
  state.mesh.position.add(moveDelta);

  // Rotate head mesh
  state.mesh.rotation.y = state.yaw;

  // Update segments
  let prevPos = state.mesh.position.clone();
  for (let seg of state.segments) {
    const diff = prevPos.clone().sub(seg.position);
    const dist = diff.length();
    if (dist > state.segmentDistance) {
      seg.position.add(diff.multiplyScalar(0.3));
      // Align segment to path
      seg.lookAt(prevPos);
    }
    prevPos = seg.position.clone();
  }
}

/* ---------- Grow snake ---------- */
export function growSnake() {
  if (!state.mesh) return;

  // Position new segment behind last
  const lastPos = state.segments.length > 0
    ? state.segments[state.segments.length - 1].position.clone()
    : state.mesh.position.clone().sub(new THREE.Vector3(0, 0, state.segmentDistance));

  const geo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x88ffcc,
    metalness: 0.6,
    roughness: 0.4
  });
  const seg = new THREE.Mesh(geo, mat);
  seg.rotation.x = Math.PI / 2;
  seg.position.copy(lastPos);
  state.segments.push(seg);
  state.mesh.parent.add(seg);
}

/* ---------- Get snake head position ---------- */
export function getHeadPosition() {
  return state.mesh ? state.mesh.position.clone() : new THREE.Vector3();
}
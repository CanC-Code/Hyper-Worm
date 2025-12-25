/// snake.js
/// Purpose: Procedural snake movement, growth, and steering
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state as gameState } from "./gameState.js";

/* ---------- SNAKE STATE ---------- */
export const state = {
  mesh: null,           // THREE.Group from eggSnakeMorph.js
  segments: [],         // individual segment meshes
  head: null,           // reference to head mesh
  direction: new THREE.Vector3(0, 0, 1), // forward
  speed: 2,
  segmentLength: 0.5
};

/* ---------- INIT SNAKE ---------- */
export function initSnakeFromMesh(snakeMesh) {
  state.mesh = snakeMesh;
  state.segments = [];

  // Identify head as first child with geometry roughly radius ~0.22
  for (const child of snakeMesh.children) {
    if (child.geometry) {
      if (child.geometry.parameters?.radiusTop || child.geometry.parameters?.radius) {
        state.segments.push(child);
      }
      if (child.geometry.parameters?.radius === 0.22) state.head = child;
    }
  }

  if (!state.head) state.head = state.segments[0];
}

/* ---------- SNAKE GROWTH ---------- */
export function growSnake() {
  const lastSegment = state.segments[state.segments.length - 1];
  const radius = lastSegment.geometry.parameters.radiusTop || 0.2;

  const geo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, state.segmentLength, 16);
  const mat = lastSegment.material.clone();
  const newSegment = new THREE.Mesh(geo, mat);
  newSegment.rotation.x = Math.PI / 2;
  newSegment.position.copy(lastSegment.position).add(new THREE.Vector3(0, 0, -state.segmentLength));
  state.mesh.add(newSegment);
  state.segments.push(newSegment);
}

/* ---------- GET HEAD POSITION ---------- */
export function getHeadPosition() {
  if (!state.head) return new THREE.Vector3();
  return state.head.getWorldPosition(new THREE.Vector3());
}

/* ---------- GET HEAD DIRECTION ---------- */
export function getHeadDirection() {
  return state.direction.clone().normalize();
}

/* ---------- SET DIRECTION FROM INPUT ---------- */
export function setDirection(vec2) {
  // Rotate current direction by input vector
  const turnSpeed = 1.5; // radians per second
  const desiredAngle = Math.atan2(vec2.x, vec2.y); // x=left/right, y=forward/back

  // Smoothly rotate the direction vector
  const currentAngle = Math.atan2(state.direction.x, state.direction.z);
  let deltaAngle = desiredAngle - currentAngle;
  if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
  if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

  state.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaAngle * 0.15);
}

/* ---------- UPDATE SNAKE ---------- */
export function updateSnake(delta) {
  if (!state.mesh || state.segments.length === 0) return;

  const moveDistance = state.speed * delta;

  // Move head
  state.head.position.add(state.direction.clone().multiplyScalar(moveDistance));

  // Move each segment to follow previous
  for (let i = 1; i < state.segments.length; i++) {
    const prev = state.segments[i - 1];
    const seg = state.segments[i];

    const targetPos = prev.position.clone().add(new THREE.Vector3(0, 0, -state.segmentLength));
    seg.position.lerp(targetPos, 0.3);
  }
}
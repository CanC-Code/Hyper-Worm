/// snake.js
/// Purpose: True 3D free-form snake engine with dynamic steering and infinite tail
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

/* ---------- Snake State ---------- */
export const state = {
  mesh: null,                // reference to head mesh
  segments: [],              // array of segment meshes / positions
  positions: [],             // positions of segments for interpolation
  speed: 2,                  // units per second
  direction: new THREE.Vector3(0, 0, 1), // forward direction
  directionInput: new THREE.Vector2(0, 1), // input from touch
  segmentSpacing: 0.3,       // distance between segments
};

/* ---------- Initialize Snake ---------- */
export function initSnakeFromMesh(mesh) {
  state.mesh = mesh;
  world.add(state.mesh);

  // Initialize tail array
  state.segments = [];
  state.positions = [mesh.position.clone()]; // start with head
}

/* ---------- Update Input Vector ---------- */
export function setDirection(dirVec) {
  state.directionInput.copy(dirVec);
}

/* ---------- Add Segment ---------- */
export function growSnake() {
  const lastPos = state.positions[state.positions.length - 1].clone();
  state.positions.push(lastPos);
}

/* ---------- Update Snake Movement ---------- */
export function updateSnake(delta) {
  if (!state.mesh) return;

  // 1. Compute desired direction from input
  const inputDir = new THREE.Vector3(state.directionInput.x, 0, state.directionInput.y);
  if (inputDir.lengthSq() > 0) inputDir.normalize();

  // Smoothly interpolate head direction
  state.direction.lerp(inputDir, 0.1);

  // Move head forward
  const headPos = state.mesh.position.clone().addScaledVector(state.direction, state.speed * delta);
  state.mesh.position.copy(headPos);

  // Add head position to positions array
  state.positions.unshift(headPos.clone());

  // 2. Update segments to follow previous position
  for (let i = 0; i < state.positions.length - 1; i++) {
    const current = state.positions[i];
    const next = state.positions[i + 1];
    const distance = current.distanceTo(next);

    if (distance > state.segmentSpacing) {
      const dir = new THREE.Vector3().subVectors(current, next).normalize();
      next.addScaledVector(dir, distance - state.segmentSpacing);
    }
  }

  // Remove excess positions to allow infinite growth
  while (state.positions.length > 1000) state.positions.pop();

  // Optionally update segment meshes
  for (let i = 0; i < state.segments.length; i++) {
    const segPos = state.positions[(i + 1) * Math.floor(state.positions.length / state.segments.length)];
    if (segPos) state.segments[i].position.copy(segPos);
  }

  // Mouth animation (slight)
  const posAttr = state.mesh.geometry.attributes.position;
  const openAmount = Math.sin(performance.now() * 0.005) * 0.05;
  for (let i = 0; i < posAttr.count; i++) {
    let z = posAttr.getZ(i);
    posAttr.setZ(i, z + openAmount);
  }
  posAttr.needsUpdate = true;
  state.mesh.geometry.computeBoundingSphere();
}

/* ---------- Get Head Position ---------- */
export function getHeadPosition() {
  return state.mesh ? state.mesh.position.clone() : new THREE.Vector3();
}

/* ---------- Get Head Direction ---------- */
export function getHeadDirection() {
  return state.direction.clone();
}
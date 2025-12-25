/// snake.js
/// Procedural dynamic snake logic
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state as gameState } from "./gameState.js";

export const state = {
  mesh: null,
  mouth: null,
  segments: [],
  segmentSpacing: 0.4,
  speed: 2,
  yaw: 0,
  targetYaw: 0,
  direction: new THREE.Vector3(0, 0, 1),
};

/* ---------- Initialize snake from head mesh ---------- */
export function initSnakeFromMesh(headMesh) {
  state.mesh = headMesh;
  state.segments = [];
  state.yaw = 0;
  state.targetYaw = 0;
  state.direction.set(0, 0, 1);
}

/* ---------- Add a segment at tail ---------- */
export function growSnake() {
  if (!state.mesh) return;
  const last = state.segments.length
    ? state.segments[state.segments.length - 1]
    : state.mesh;

  const segGeo = new THREE.CylinderGeometry(0.18, 0.18, state.segmentSpacing, 16);
  const segMat = new THREE.MeshStandardMaterial({ color: 0x44ff88, metalness: 0.6, roughness: 0.3 });
  const segment = new THREE.Mesh(segGeo, segMat);
  segment.rotation.x = Math.PI / 2;
  segment.position.copy(last.position.clone().add(new THREE.Vector3(0, 0, -state.segmentSpacing)));
  state.segments.push(segment);
  last.parent.add(segment);
}

/* ---------- Get head position ---------- */
export function getHeadPosition() {
  return state.mesh ? state.mesh.position.clone() : new THREE.Vector3();
}

/* ---------- Steering input ---------- */
export function setDirection(dir) {
  if (!state.mesh) return;
  // dir: {x, y} from touch controls
  state.targetYaw = Math.atan2(dir.x, dir.y);
}

/* ---------- Update snake ---------- */
export function updateSnake(delta) {
  if (!state.mesh) return;

  // Smooth yaw
  const yawDiff = state.targetYaw - state.yaw;
  state.yaw += yawDiff * Math.min(delta * 8, 1);

  // Update direction vector
  state.direction.set(Math.sin(state.yaw), 0, Math.cos(state.yaw)).normalize();

  // Move head
  const moveStep = state.speed * delta;
  state.mesh.position.add(state.direction.clone().multiplyScalar(moveStep));

  // Move segments to follow head
  let prevPos = state.mesh.position.clone();
  for (const seg of state.segments) {
    const segPos = seg.position.clone();
    const dir = prevPos.clone().sub(segPos);
    if (dir.length() > state.segmentSpacing) {
      seg.position.add(dir.normalize().multiplyScalar(dir.length() - state.segmentSpacing));
    }
    prevPos = seg.position.clone();
  }

  // Mouth hinge animation (simple open/close)
  if (state.mouth) {
    state.mouth.rotation.x = Math.sin(Date.now() * 0.005) * 0.2;
  }
}

/* ---------- Helper: get head direction ---------- */
export function getHeadDirection() {
  return state.direction.clone();
}
/// snake.js
/// Smooth 3D snake movement with segments and mouth
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

export const state = {
  mesh: null,
  segments: [],
  speed: 2,
  yaw: 0,
  targetYaw: 0,
  turnRate: Math.PI,
  segmentDistance: 0.5,
  mouth: null,
};

export function setDirection(vec2) {
  if (!vec2 || vec2.length() === 0) return;
  state.targetYaw = Math.atan2(vec2.x, vec2.y);
}

export function updateSnake(delta) {
  if (!state.mesh) return;

  // Smooth turning
  let deltaYaw = state.targetYaw - state.yaw;
  while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI;
  while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI;
  deltaYaw = THREE.MathUtils.clamp(deltaYaw, -state.turnRate * delta, state.turnRate * delta);
  state.yaw += deltaYaw;

  const forward = new THREE.Vector3(Math.sin(state.yaw), 0, Math.cos(state.yaw));

  // Move head
  const moveDelta = forward.clone().multiplyScalar(state.speed * delta);
  state.mesh.position.add(moveDelta);
  state.mesh.rotation.y = state.yaw;

  // Animate mouth
  if (state.mouth) state.mouth.rotation.x = Math.sin(performance.now() * 0.01) * 0.4;

  // Update segments
  let prevPos = state.mesh.position.clone();
  for (let seg of state.segments) {
    const diff = prevPos.clone().sub(seg.position);
    if (diff.length() > state.segmentDistance) {
      seg.position.add(diff.multiplyScalar(0.3));
      seg.lookAt(prevPos);
    }
    prevPos = seg.position.clone();
  }
}

export function growSnake() {
  if (!state.mesh) return;

  const lastPos = state.segments.length > 0
    ? state.segments[state.segments.length - 1].position.clone()
    : state.mesh.position.clone().sub(new THREE.Vector3(0, 0, state.segmentDistance));

  const geo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0x88ffcc, metalness: 0.6, roughness: 0.4 });
  const seg = new THREE.Mesh(geo, mat);
  seg.rotation.x = Math.PI / 2;
  seg.position.copy(lastPos);
  state.segments.push(seg);
  world.add(seg);
}

export function getHeadPosition() {
  return state.mesh ? state.mesh.position.clone() : new THREE.Vector3();
}
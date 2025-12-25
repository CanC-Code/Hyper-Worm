/// snake.js
/// Continuous snake movement, press-hold steering
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export const state = {
  mesh: null,       // head mesh
  segments: [],     // array of meshes
  direction: new THREE.Vector3(0, 0, 1),
  speed: 2,
  segmentDistance: 0.5,
};

export function initSnakeFromMesh(headMesh) {
  state.mesh = headMesh;
  state.segments = [headMesh];
}

export function updateSnake(delta) {
  if (!state.mesh) return;

  // Move head forward
  const moveVector = state.direction.clone().multiplyScalar(state.speed * delta);
  state.mesh.position.add(moveVector);

  // Update trailing segments
  for (let i = 1; i < state.segments.length; i++) {
    const seg = state.segments[i];
    const target = state.segments[i - 1].position;
    const dir = target.clone().sub(seg.position);
    if (dir.length() > state.segmentDistance) {
      dir.setLength(state.segmentDistance);
      seg.position.add(dir);
    }
  }
}

export function growSnake() {
  const last = state.segments[state.segments.length - 1];
  const segGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
  const segMat = new THREE.MeshStandardMaterial({ color: 0x88ffcc, metalness: 0.6, roughness: 0.4 });
  const newSeg = new THREE.Mesh(segGeo, segMat);
  newSeg.rotation.x = Math.PI / 2;
  newSeg.position.copy(last.position);
  last.parent.add(newSeg);
  state.segments.push(newSeg);
}

export function setDirection(vec2) {
  if (!vec2) return;
  const steer = new THREE.Vector3(vec2.x, 0, vec2.y).normalize();
  if (steer.length() > 0) {
    state.direction.lerp(steer, 0.1); // smooth turning
  }
}

export function getHeadPosition() {
  return state.mesh ? state.mesh.position.clone() : new THREE.Vector3();
}
/// snake.js
/// Core snake logic, movement, growth, and mesh
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export const state = {
  mesh: null,
  segments: [],
  direction: new THREE.Vector3(0, 0, 1),
  speed: 2,
  length: 1,
};

export function initSnakeFromMesh(headMesh) {
  state.mesh = headMesh;
  state.segments = [headMesh];
  state.direction.set(0, 0, 1);
  state.speed = 2;
  state.length = 1;
}

export function getHeadPosition() {
  return state.mesh ? state.mesh.position.clone() : new THREE.Vector3();
}

export function getHeadDirection() {
  return state.direction.clone().normalize();
}

export function setDirection(dir) {
  // dir = {x, y} from touch input
  if (!state.mesh) return;

  const dirVec = new THREE.Vector3(dir.x, 0, dir.y);
  if (dirVec.length() > 0.001) {
    state.direction.lerp(dirVec.normalize(), 0.15);
  }
}

export function updateSnake(delta) {
  if (!state.mesh) return;

  const moveDistance = state.speed * delta;
  state.mesh.position.add(state.direction.clone().multiplyScalar(moveDistance));

  // Simple segment following
  for (let i = 1; i < state.segments.length; i++) {
    const prev = state.segments[i - 1];
    const seg = state.segments[i];
    const target = prev.position.clone();
    seg.position.lerp(target, 0.5);
  }
}

export function growSnake() {
  if (!state.mesh) return;

  const lastSeg = state.segments[state.segments.length - 1];
  const geo = new THREE.CylinderGeometry(0.2, 0.2, 1, 12);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x88ffcc,
    metalness: 0.6,
    roughness: 0.4,
  });
  const seg = new THREE.Mesh(geo, mat);
  seg.rotation.x = Math.PI / 2;
  seg.position.copy(lastSeg.position.clone().add(state.direction.clone().multiplyScalar(-1)));
  state.segments.push(seg);

  if (state.mesh.parent) state.mesh.parent.add(seg);
  state.length++;
}
/// snake.js
/// Full 3D snake logic for Hyper-Worm
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";
import { state as gameState } from "./gameState.js";

/* ---------- SNAKE STATE ---------- */
export const state = {
  mesh: null,           // snake head mesh (root)
  segments: [],         // array of segment meshes
  direction: new THREE.Vector3(0, 0, 1),
  speed: 2.0,
  segmentSpacing: 0.5,  // distance between segments
};

/* ---------- INIT SNAKE FROM MESH ---------- */
export function initSnakeFromMesh(headMesh) {
  state.mesh = headMesh;
  state.mesh.castShadow = true;
  state.mesh.receiveShadow = true;

  // Clear previous segments
  for (const seg of state.segments) {
    world.remove(seg);
    seg.geometry.dispose();
    seg.material.dispose();
  }
  state.segments = [];

  // Initial segments
  const segmentGeo = new THREE.CylinderGeometry(0.18, 0.18, state.segmentSpacing, 12);
  const segmentMat = new THREE.MeshStandardMaterial({
    color: 0x88ffcc,
    roughness: 0.4,
    metalness: 0.6,
  });

  for (let i = 0; i < 4; i++) {
    const seg = new THREE.Mesh(segmentGeo, segmentMat);
    seg.rotation.x = Math.PI / 2;
    seg.position.copy(headMesh.position.clone().add(new THREE.Vector3(0, 0, -state.segmentSpacing * (i + 1))));
    world.add(seg);
    state.segments.push(seg);
  }
}

/* ---------- UPDATE SNAKE ---------- */
export function updateSnake(delta) {
  if (!state.mesh) return;

  // Compute movement
  const moveVector = state.direction.clone().multiplyScalar(state.speed * delta);
  const prevPos = state.mesh.position.clone();
  state.mesh.position.add(moveVector);

  // Update segments to follow head
  let lastPos = prevPos;
  for (let seg of state.segments) {
    const segPos = seg.position.clone();
    const dir = lastPos.clone().sub(seg.position).normalize();
    seg.position.add(dir.multiplyScalar(state.speed * delta));
    lastPos = segPos;
  }

  // Rotate head to match direction
  const targetQuat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    state.direction.clone().normalize()
  );
  state.mesh.quaternion.slerp(targetQuat, 0.2);
}

/* ---------- GROW SNAKE ---------- */
export function growSnake() {
  const segmentGeo = new THREE.CylinderGeometry(0.18, 0.18, state.segmentSpacing, 12);
  const segmentMat = new THREE.MeshStandardMaterial({
    color: 0x88ffcc,
    roughness: 0.4,
    metalness: 0.6,
  });

  const lastSeg = state.segments[state.segments.length - 1] || state.mesh;
  const seg = new THREE.Mesh(segmentGeo, segmentMat);
  seg.rotation.x = Math.PI / 2;
  seg.position.copy(lastSeg.position.clone().add(new THREE.Vector3(0, 0, -state.segmentSpacing)));
  world.add(seg);
  state.segments.push(seg);
}

/* ---------- DIRECTION CONTROL ---------- */
export function setDirection(vec2) {
  // vec2 = {x, y} from touch controls
  const horizontal = new THREE.Vector3(vec2.x, 0, vec2.y);
  if (horizontal.length() > 0.01) state.direction.lerp(horizontal.normalize(), 0.15);
}

/* ---------- GET HEAD POSITION ---------- */
export function getHeadPosition() {
  return state.mesh ? state.mesh.position.clone() : new THREE.Vector3();
}

/* ---------- GET HEAD DIRECTION ---------- */
export function getHeadDirection() {
  return state.direction.clone().normalize();
}
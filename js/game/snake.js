/// snake.js
/// Purpose: Procedural snake with first-person POV
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

/* ---------- Snake State ---------- */
export const state = {
  head: null,
  segments: [],
  tail: null,
  speed: 2,
  direction: new THREE.Vector3(0, 0, 1), // normalized forward vector
  segmentLength: 0.8,
};

/* ---------- Initialize Snake ---------- */
export function initSnake(worldRef) {
  state.head = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.5, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x33aa33, flatShading: true })
  );
  state.head.position.set(0, 0, 0);
  worldRef.add(state.head);

  // Initial segments (3)
  state.segments = [];
  for (let i = 1; i <= 3; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, state.segmentLength, 8),
      new THREE.MeshStandardMaterial({ color: 0x33aa33, flatShading: true })
    );
    seg.rotation.x = Math.PI / 2;
    seg.position.set(0, 0, -i * state.segmentLength);
    worldRef.add(seg);
    state.segments.push(seg);
  }

  // Tail
  state.tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x33aa33, flatShading: true })
  );
  state.tail.rotation.x = Math.PI / 2;
  state.tail.position.set(0, 0, -(state.segments.length + 1) * state.segmentLength);
  worldRef.add(state.tail);
}

/* ---------- Set Direction ---------- */
export function setDirection(dirVec) {
  // dirVec: {x, y}, normalized input vector from touch / keys
  const newDir = new THREE.Vector3(dirVec.x, 0, dirVec.y);
  if (newDir.lengthSq() > 0) {
    newDir.normalize();
    state.direction.lerp(newDir, 0.2); // smooth turn
  }
}

/* ---------- Get Head Position & Direction ---------- */
export function getHeadPosition() {
  return state.head.position.clone();
}

export function getHeadDirection() {
  return state.direction.clone();
}

/* ---------- Update Snake Movement ---------- */
export function updateSnake(delta) {
  const moveDist = state.speed * delta;

  // Move head
  state.head.position.addScaledVector(state.direction, moveDist);

  // Update segments smoothly
  let prevPos = state.head.position.clone();
  for (const seg of state.segments) {
    const segToPrev = prevPos.clone().sub(seg.position);
    if (segToPrev.length() > state.segmentLength) {
      seg.position.add(segToPrev.setLength(segToPrev.length() - state.segmentLength));
    }
    prevPos = seg.position.clone();
  }

  // Tail follows last segment
  const lastSeg = state.segments[state.segments.length - 1];
  const tailToPrev = lastSeg.position.clone().sub(state.tail.position);
  if (tailToPrev.length() > state.segmentLength) {
    state.tail.position.add(tailToPrev.setLength(tailToPrev.length() - state.segmentLength));
  }
}

/* ---------- Grow Snake ---------- */
export function growSnake(worldRef) {
  const lastSeg = state.segments[state.segments.length - 1];
  const newSeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, state.segmentLength, 8),
    new THREE.MeshStandardMaterial({ color: 0x33aa33, flatShading: true })
  );
  newSeg.rotation.x = Math.PI / 2;
  newSeg.position.copy(lastSeg.position).addScaledVector(state.direction, -state.segmentLength);
  worldRef.add(newSeg);
  state.segments.push(newSeg);

  // Move tail further back
  const tailOffset = state.tail.position.clone().sub(lastSeg.position).normalize().multiplyScalar(state.segmentLength);
  state.tail.position.add(tailOffset);
}
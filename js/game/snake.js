/// snake.js
/// Purpose: Procedural snake with POV and safe infinite growth
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

  state.segments = [];
  // Start with 3 segments
  for (let i = 1; i <= 3; i++) {
    addSegment(worldRef, i);
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

/* ---------- Add Segment ---------- */
export function addSegment(worldRef, indexOffset = 0) {
  const segGeo = new THREE.CylinderGeometry(0.25, 0.25, state.segmentLength, 8);
  const segMat = new THREE.MeshStandardMaterial({ color: 0x33aa33, flatShading: true });
  const seg = new THREE.Mesh(segGeo, segMat);
  seg.rotation.x = Math.PI / 2;

  const zPos = -(state.segments.length + 1 + indexOffset) * state.segmentLength;
  seg.position.set(0, 0, zPos);

  worldRef.add(seg);
  state.segments.push(seg);
}

/* ---------- Set Direction ---------- */
export function setDirection(dirVec) {
  const newDir = new THREE.Vector3(dirVec.x, 0, dirVec.y);
  if (newDir.lengthSq() > 0) {
    newDir.normalize();
    state.direction.lerp(newDir, 0.2); // smooth turning
  }
}

/* ---------- Get Head Info ---------- */
export function getHeadPosition() {
  return state.head.position.clone();
}

export function getHeadDirection() {
  return state.direction.clone();
}

/* ---------- Update Snake ---------- */
export function updateSnake(delta) {
  const moveDist = state.speed * delta;

  // Move head
  state.head.position.addScaledVector(state.direction, moveDist);

  // Smoothly move segments
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

/* ---------- Grow Snake Safely ---------- */
export function growSnake(worldRef) {
  // Add new segment at tail
  addSegment(worldRef);

  // Move tail backward to maintain spacing
  const lastSeg = state.segments[state.segments.length - 1];
  const tailOffset = state.tail.position.clone().sub(lastSeg.position).normalize().multiplyScalar(state.segmentLength);
  state.tail.position.add(tailOffset);
}
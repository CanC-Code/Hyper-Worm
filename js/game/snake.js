/// snake.js
/// Purpose: Pixel worm (snake) entity logic and rendering
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state } from "./gameState.js";

const SEGMENT_SIZE = 1;
const SEGMENT_HEIGHT = 0.6;

// Materials
const headMaterial = new THREE.MeshStandardMaterial({
  color: 0x66ff66,
  flatShading: true
});

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x00cc44,
  flatShading: true
});

// Geometry reused for all segments
const segmentGeometry = new THREE.BoxGeometry(
  SEGMENT_SIZE,
  SEGMENT_HEIGHT,
  SEGMENT_SIZE
);

let segments = [];
let direction = new THREE.Vector2(1, 0);
let nextDirection = direction.clone();

export function initSnake(scene) {
  segments.forEach(s => scene.remove(s));
  segments = [];

  const head = createSegment(headMaterial);
  head.position.set(0, SEGMENT_HEIGHT / 2, 0);

  scene.add(head);
  segments.push(head);

  direction.set(1, 0);
  nextDirection.set(1, 0);
}

function createSegment(material) {
  const mesh = new THREE.Mesh(segmentGeometry, material);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

export function setDirection(vec2) {
  // Prevent direct reversal
  if (vec2.x === -direction.x && vec2.y === -direction.y) return;
  nextDirection.copy(vec2);
}

export function updateSnake() {
  direction.copy(nextDirection);

  const head = segments[0];
  const nextPos = head.position.clone();

  nextPos.x += direction.x * state.gridSize;
  nextPos.z += direction.y * state.gridSize;

  // Wall collision
  const limit = state.roomSize / 2 - 0.5;
  if (Math.abs(nextPos.x) > limit || Math.abs(nextPos.z) > limit) {
    state.alive = false;
    return;
  }

  // Self collision
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].position.distanceTo(nextPos) < 0.1) {
      state.alive = false;
      return;
    }
  }

  // Move body (tail follows)
  for (let i = segments.length - 1; i > 0; i--) {
    segments[i].position.copy(segments[i - 1].position);
  }

  head.position.copy(nextPos);
}

export function growSnake(scene) {
  const tail = segments[segments.length - 1];

  const seg = createSegment(bodyMaterial);
  seg.position.copy(tail.position);

  scene.add(seg);
  segments.push(seg);
}

export function getHeadPosition() {
  return segments[0].position.clone();
}
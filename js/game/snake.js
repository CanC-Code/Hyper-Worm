/// snake.js
/// Dynamic continuous snake mesh
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export const state = {
  mesh: null,          // single dynamic mesh
  path: [],            // array of Vector3 along snake's spine
  direction: new THREE.Vector3(0, 0, 1),
  speed: 2,
  segmentDistance: 0.2,
  segmentLength: 1,     // initial length
  maxSegments: 1000,    // effectively infinite
};

let geometry = null;
let material = null;

export function initSnakeFromMesh(headMesh) {
  // Start path with initial points
  state.path = [headMesh.position.clone()];
  state.mesh = headMesh;

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array( state.maxSegments * 3 ); // x,y,z
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setDrawRange(0, 1);

  material = new THREE.MeshStandardMaterial({
    color: 0x88ffcc,
    metalness: 0.6,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  state.mesh.parent.add(mesh);
  state.mesh = mesh;
}

export function updateSnake(delta) {
  if (!state.mesh) return;

  // --- Move head forward ---
  const lastPos = state.path[state.path.length - 1];
  const moveVec = state.direction.clone().multiplyScalar(state.speed * delta);
  const newPos = lastPos.clone().add(moveVec);
  state.path.push(newPos);

  // Limit path length
  while (state.path.length > state.maxSegments) {
    state.path.shift();
  }

  // --- Update geometry ---
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < state.path.length; i++) {
    positions[i * 3] = state.path[i].x;
    positions[i * 3 + 1] = state.path[i].y;
    positions[i * 3 + 2] = state.path[i].z;
  }
  geometry.setDrawRange(0, state.path.length);
  geometry.attributes.position.needsUpdate = true;
}

export function growSnake() {
  state.segmentLength += state.segmentDistance * 5; // extend length
}

export function setDirection(vec2) {
  if (!vec2) return;
  const steer = new THREE.Vector3(vec2.x, 0, vec2.y).normalize();
  if (steer.length() > 0) {
    state.direction.lerp(steer, 0.15); // smooth turning
  }
}

export function getHeadPosition() {
  return state.path.length ? state.path[state.path.length - 1].clone() : new THREE.Vector3();
}
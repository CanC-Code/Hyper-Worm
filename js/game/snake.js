/// snake.js
/// Dynamic forward-oriented snake with smooth steering and trail - ENHANCED
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { getYawInput } from "../input/touchControls.js";
import { world } from "../render/scene.js";

export const state = {
  mesh: null,
  path: [],
  speed: 3,
  direction: new THREE.Vector3(0, 0, 1),
  length: 3,
  trailMeshes: []
};

export function initSnakeFromMesh(mesh) {
  state.mesh = mesh;
  state.mesh.castShadow = true;
  state.path = [];
  state.length = 3;
  state.direction.set(0, 0, 1);
  state.trailMeshes = [];
  
  // Initialize path
  for (let i = 0; i < state.length; i++) {
    state.path.push(mesh.position.clone().add(new THREE.Vector3(0, 0, -i * 0.1)));
  }
}

export function getHeadPosition() {
  return state.mesh.position.clone();
}

export function getHeadDirection() {
  return state.direction.clone();
}

export function updateSnake(delta) {
  if (!state.mesh) return;
  
  // Steering with smoother yaw
  const yaw = getYawInput();
  const turnSpeed = 3.5; // Degrees per second
  const rotation = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    yaw * delta * turnSpeed
  );
  state.direction.applyQuaternion(rotation).normalize();

  // Move head forward
  const moveVec = state.direction.clone().multiplyScalar(state.speed * delta);
  state.mesh.position.add(moveVec);

  // Update head rotation to face movement direction
  state.mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    state.direction
  );

  // Update path for trail
  state.path.unshift(state.mesh.position.clone());
  
  // Keep path at appropriate length (more segments for smoother trail)
  const segmentSpacing = 0.15;
  const maxPathLength = state.length * (1 / segmentSpacing);
  while (state.path.length > maxPathLength) {
    state.path.pop();
  }

  // Update trail segments
  updateTrail();
}

function updateTrail() {
  // Remove excess trail meshes
  while (state.trailMeshes.length > state.length) {
    const mesh = state.trailMeshes.pop();
    world.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }

  // Add new trail segments if needed
  while (state.trailMeshes.length < state.length) {
    const segmentGeo = new THREE.SphereGeometry(0.2, 24, 24); // Higher poly spheres
    const hue = (state.trailMeshes.length / state.length) * 0.15 + 0.45; // Cyan to green gradient
    const segmentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(hue, 0.85, 0.6),
      metalness: 0.6,
      roughness: 0.25,
      emissive: new THREE.Color().setHSL(hue, 0.85, 0.35),
      emissiveIntensity: 0.3
    });
    const segmentMesh = new THREE.Mesh(segmentGeo, segmentMat);
    segmentMesh.castShadow = true;
    world.add(segmentMesh);
    state.trailMeshes.push(segmentMesh);
  }

  // Position trail segments along path
  const segmentSpacing = 6; // Path indices between segments
  for (let i = 0; i < state.trailMeshes.length; i++) {
    const pathIndex = Math.min(i * segmentSpacing, state.path.length - 1);
    if (pathIndex < state.path.length) {
      state.trailMeshes[i].position.copy(state.path[pathIndex]);
      
      // Scale segments slightly smaller as they go back
      const scale = 1 - (i / state.length) * 0.3;
      state.trailMeshes[i].scale.setScalar(scale);
    }
  }
}

export function growSnake() {
  state.length++;
}

export function checkSelfCollision() {
  if (state.length < 5) return false; // Can't collide with yourself when too short
  
  const headPos = getHeadPosition();
  const collisionRadius = 0.35;
  
  // Check collision with trail segments (skip first few to avoid immediate collision)
  for (let i = 4; i < state.trailMeshes.length; i++) {
    const dist = headPos.distanceTo(state.trailMeshes[i].position);
    if (dist < collisionRadius) {
      return true;
    }
  }
  
  return false;
}
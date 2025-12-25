/// door.js
/// Smooth door spawning, animation, and collision
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state } from "./gameState.js";

let doorMesh = null;
let openProgress = 0;
const OPEN_SPEED = 2.0; // seconds to fully open

const doorMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff88,
  metalness: 0.6,
  roughness: 0.4,
  side: THREE.DoubleSide,
});

const doorGeometry = new THREE.PlaneGeometry(2, 3); // width x height

/**
 * Spawn a smooth door at the center of +Z wall
 * @param {THREE.Group} sceneRoot
 */
export function spawnDoor(sceneRoot) {
  if (doorMesh) return; // already spawned

  doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
  doorMesh.position.set(0, 1.5, sceneRoot.position.z + 6); // front wall
  doorMesh.rotation.y = 0;

  doorMesh.userData.open = 0; // 0 = closed, 1 = fully open
  sceneRoot.add(doorMesh);
}

/**
 * Animate door opening
 * Call every frame in game loop
 * @param {number} delta
 */
export function updateDoor(delta) {
  if (!doorMesh) return;

  if (state.doorOpen && doorMesh.userData.open < 1) {
    doorMesh.userData.open += delta / OPEN_SPEED;
    if (doorMesh.userData.open > 1) doorMesh.userData.open = 1;
  }

  // Smoothly move door aside (sliding)
  const openOffset = doorMesh.userData.open * 1.5; // slide 1.5 units
  doorMesh.position.x = openOffset;
}

/**
 * Check if snake has entered the door
 * @param {THREE.Vector3} headPos
 * @param {THREE.Group} sceneRoot
 * @returns {boolean}
 */
export function checkDoorEntry(headPos, sceneRoot) {
  if (!doorMesh || doorMesh.userData.open < 0.9) return false;

  const dx = headPos.x - doorMesh.position.x;
  const dz = headPos.z - doorMesh.position.z;
  if (Math.abs(dx) < 1 && Math.abs(dz) < 1) {
    state.doorOpen = false; // reset
    sceneRoot.remove(doorMesh);
    doorMesh.geometry.dispose();
    doorMesh.material.dispose();
    doorMesh = null;
    return true;
  }
  return false;
}

/**
 * Force clear door from scene
 * @param {THREE.Group} sceneRoot
 */
export function clearDoor(sceneRoot) {
  if (!doorMesh) return;
  sceneRoot.remove(doorMesh);
  doorMesh.geometry.dispose();
  doorMesh.material.dispose();
  doorMesh = null;
}
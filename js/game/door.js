/// door.js
/// Purpose: Door spawning and room transition
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state, advanceRoom } from "./gameState.js";

let door = null;

const doorMaterial = new THREE.MeshStandardMaterial({
  color: 0xffdd00,
  flatShading: true
});

const doorGeometry = new THREE.BoxGeometry(1.2, 1, 0.5);

export function spawnDoor(scene) {
  if (door) return;

  door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 0.5, state.roomSize / 2 - 0.5);

  scene.add(door);
}

export function checkDoorEntry(headPosition, scene) {
  if (!door) return false;

  if (headPosition.distanceTo(door.position) < 0.6) {
    scene.remove(door);
    door = null;
    advanceRoom();
    return true;
  }
  return false;
}

export function clearDoor(scene) {
  if (!door) return;
  scene.remove(door);
  door = null;
}
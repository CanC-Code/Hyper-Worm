import * as THREE from "../../three/three.module.js";
import { state } from "./gameState.js";

let doorMesh = null;

export function spawnDoor(scene) {
  if (doorMesh) scene.remove(doorMesh);

  const geo = new THREE.BoxGeometry(1.5, 2, 0.2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x44ff44, metalness: 0.3 });
  doorMesh = new THREE.Mesh(geo, mat);
  doorMesh.position.set(0, 1, state.roomSize / 2 - 1);
  scene.add(doorMesh);
}

export function updateDoor(delta) {
  if (!doorMesh) return;
  // optional smooth animation
}

export function checkDoorEntry(headPos, scene) {
  if (!doorMesh) return false;
  return headPos.distanceTo(doorMesh.position) < 0.8;
}

export function clearDoor(scene) {
  if (!doorMesh) return;
  scene.remove(doorMesh);
  doorMesh.geometry.dispose();
  doorMesh.material.dispose();
  doorMesh = null;
}
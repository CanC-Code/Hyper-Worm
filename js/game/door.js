/// door.js
/// Procedurally generate doors on room walls
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";
import { state as roomState } from "./room.js";
import { getHeadPosition } from "./snake.js";

export const state = {
  door: null,
  doorOpen: false,
  doorWidth: 2,
  doorHeight: 3,
  wall: null,  // reference wall plane
};

/* ---------- Spawn Door ---------- */
export function spawnDoor(worldRef) {
  if (state.doorOpen) return;

  // Pick a wall randomly
  const walls = roomState.walls;
  const wallIndex = Math.floor(Math.random() * walls.length);
  state.wall = walls[wallIndex];

  // Create door plane
  const doorGeo = new THREE.PlaneGeometry(state.doorWidth, state.doorHeight);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0xffff00, side: THREE.DoubleSide });
  const door = new THREE.Mesh(doorGeo, doorMat);

  // Position door centered on wall
  const w = state.wall;
  if (Math.abs(w.position.x) > 0.1) { // left/right wall
    door.rotation.y = w.rotation.y;
    door.position.set(w.position.x, state.doorHeight / 2, 0);
  } else { // front/back wall
    door.rotation.y = w.rotation.y;
    door.position.set(0, state.doorHeight / 2, w.position.z);
  }

  worldRef.add(door);
  state.door = door;
  state.doorOpen = true;
}

/* ---------- Check if Snake Entered Door ---------- */
export function checkDoorEntry(headPos) {
  if (!state.doorOpen || !state.door) return false;

  const doorPos = state.door.position;
  const dx = Math.abs(headPos.x - doorPos.x);
  const dy = Math.abs(headPos.y - doorPos.y);
  const dz = Math.abs(headPos.z - doorPos.z);

  const withinX = dx <= state.doorWidth / 2;
  const withinY = dy <= state.doorHeight / 2;
  const withinZ = dz <= state.doorWidth / 2; // assuming square door depth

  return withinX && withinY && withinZ;
}

/* ---------- Clear Door ---------- */
export function clearDoor(worldRef) {
  if (state.door) {
    worldRef.remove(state.door);
    state.door.geometry.dispose();
    state.door.material.dispose();
    state.door = null;
    state.doorOpen = false;
    state.wall = null;
  }
}

/* ---------- Collision Detection with Walls ---------- */
export function checkWallCollision(headPos) {
  const padding = 0.3; // snake head radius
  const w = roomState;

  if (headPos.x < -w.roomWidth/2 + padding) return true;
  if (headPos.x > w.roomWidth/2 - padding) return true;
  if (headPos.z < -w.roomDepth/2 + padding) return true;
  if (headPos.z > w.roomDepth/2 - padding) return true;

  return false;
}
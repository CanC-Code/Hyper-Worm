/// food.js
/// Purpose: Food spawning and collision
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state as gameState, registerBite } from "./gameState.js";
import { state as roomState } from "./room.js";

let food = null;

const foodGeometry = new THREE.SphereGeometry(0.35, 16, 16);

const foodMaterial = new THREE.MeshStandardMaterial({
  color: 0xff5555,
  roughness: 0.3,
  metalness: 0.1,
  emissive: 0x330000,
});

/* ---------- Spawn Food ---------- */
export function spawnFood(worldRef) {
  if (food) {
    worldRef.remove(food);
    food = null;
  }

  food = new THREE.Mesh(foodGeometry, foodMaterial);

  const margin = 1.5;
  const halfW = roomState.roomWidth / 2 - margin;
  const halfD = roomState.roomDepth / 2 - margin;

  food.position.set(
    THREE.MathUtils.randFloat(-halfW, halfW),
    0.35,
    THREE.MathUtils.randFloat(-halfD, halfD)
  );

  worldRef.add(food);
}

/* ---------- Collision ---------- */
export function checkFoodCollision(headPosition) {
  if (!food) return false;

  const dist = food.position.distanceTo(headPosition);
  if (dist < 0.75) {
    registerBite();
    return true;
  }

  return false;
}

/* ---------- Remove ---------- */
export function removeFood(worldRef) {
  if (!food) return;

  worldRef.remove(food);
  food.geometry.dispose();
  food.material.dispose();
  food = null;
}
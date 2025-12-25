/// food.js
/// Food spawning and collision
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state, registerBite } from "./gameState.js";

let foodMesh = null;

export function spawnFood(world) {
  if (foodMesh) world.remove(foodMesh);

  const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
  foodMesh = new THREE.Mesh(geo, mat);

  const range = state.roomSize / 2 - 1;
  foodMesh.position.set(
    Math.floor(Math.random() * range * 2 - range),
    0.3,
    Math.floor(Math.random() * range * 2 - range)
  );
  world.add(foodMesh);
}

export function checkFoodCollision(headPos) {
  if (!foodMesh) return false;
  if (headPos.distanceTo(foodMesh.position) < 0.5) {
    registerBite();
    return true;
  }
  return false;
}

export function removeFood(world) {
  if (!foodMesh) return;
  world.remove(foodMesh);
  foodMesh.geometry.dispose();
  foodMesh.material.dispose();
  foodMesh = null;
}
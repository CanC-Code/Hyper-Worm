/// food.js
/// Purpose: Food spawning and collision
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state, registerBite } from "./gameState.js";

let food = null;

const foodMaterial = new THREE.MeshStandardMaterial({
  color: 0xff4444,
  flatShading: true
});

const foodGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);

export function spawnFood(scene) {
  if (food) scene.remove(food);

  food = new THREE.Mesh(foodGeometry, foodMaterial);

  const range = state.roomSize / 2 - 2;
  food.position.set(
    Math.round((Math.random() * range * 2 - range)),
    0.4,
    Math.round((Math.random() * range * 2 - range))
  );

  scene.add(food);
}

export function checkFoodCollision(headPosition) {
  if (!food) return false;

  if (food.position.distanceTo(headPosition) < 0.6) {
    registerBite();
    return true;
  }
  return false;
}

export function removeFood(scene) {
  if (!food) return;
  scene.remove(food);
  food = null;
}
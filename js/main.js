// main.js
// Hyper-Worm main entry point - ENHANCED
// Made by CCVO + assistant

import * as THREE from "../three/three.module.js";

// ---- GAME MODULES ----
import { Snake } from "../game/snake.js";
import { state, registerBite, resetGameState } from "../game/gameState.js";
import { spawnFood, checkFoodCollision, removeFood } from "../game/food.js";
import { buildRoom, clearRoom, checkWallCollision } from "../game/room.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "../game/door.js";
import { spawnSmoothEggSnake } from "../game/eggSnakeMorph.js";
import { initMinimap, updateMinimap, showMinimap } from "../game/minimap.js";

// ---- RENDERING ----
import { scene, camera, world, renderer } from "./render/scene.js";

// ---- INITIALIZATION ----
let snake = null;
let foodPosition = null;
let doorPosition = null;
const roomSize = 12;

// Initialize minimap
initMinimap();
showMinimap();

// Spawn egg intro first
spawnSmoothEggSnake((snakeMesh) => {
  // Create Snake wrapper with spine following the egg head
  snake = new Snake(world);

  // Reset game state
  resetGameState();

  // Build first room
  buildRoom(world, roomSize);

  // Spawn first food
  spawnFood(world, roomSize);
  foodPosition = spawnFood.__foodPosition;

  // Spawn door but keep it closed until bites threshold
  spawnDoor(scene, roomSize);
  doorPosition = { x: 0, y: 1.4, z: roomSize / 2 - 0.15 };

  // Start main loop
  animate();
});

// ---- INPUT HANDLING ----
const inputState = {
  forward: false,
  left: false,
  right: false
};

// Keyboard input
window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowUp": inputState.forward = true; break;
    case "ArrowLeft": inputState.left = true; break;
    case "ArrowRight": inputState.right = true; break;
  }
});
window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowUp": inputState.forward = false; break;
    case "ArrowLeft": inputState.left = false; break;
    case "ArrowRight": inputState.right = false; break;
  }
});

// ---- MAIN LOOP ----
const headPos = new THREE.Vector3(0, 0.7, 0);
const headDir = new THREE.Vector3(0, 0, 1); // Initially forward along Z

function animate() {
  requestAnimationFrame(animate);

  if (!snake) {
    renderer.render(scene, camera);
    return;
  }

  // ---- MOVE HEAD ----
  const speed = state.speed * 0.05;
  if (inputState.left) headDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.05);
  if (inputState.right) headDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.05);
  if (inputState.forward) headPos.addScaledVector(headDir, speed);

  // ---- COLLISIONS ----
  if (checkWallCollision(headPos, roomSize)) {
    state.alive = false;
    console.log("Hit wall!");
  }

  if (checkFoodCollision(headPos)) {
    snake.grow();
    removeFood(world);
    spawnFood(world, roomSize);
    foodPosition = spawnFood.__foodPosition;
  }

  if (checkDoorEntry(headPos, roomSize) && state.doorOpen) {
    console.log("Entered next room!");
    // Clear current room
    clearRoom(world);
    clearDoor(scene);
    // Reset head
    headPos.set(0, 0.7, 0);
    headDir.set(0, 0, 1);
    // Build new room
    buildRoom(world, roomSize);
    spawnFood(world, roomSize);
    foodPosition = spawnFood.__foodPosition;
    spawnDoor(scene, roomSize);
    state.room++;
    state.doorOpen = false;
  }

  // ---- UPDATE SNAKE ----
  snake.update(headPos);

  // ---- UPDATE MINIMAP ----
  updateMinimap(headPos, foodPosition, state.doorOpen ? doorPosition : null, roomSize);

  // ---- RENDER ----
  renderer.render(scene, camera);
}
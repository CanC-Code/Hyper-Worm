/// main.js
/// Entry point for Hyper-Worm 3D
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";

// Game systems
import { state as gameState, resetGameState, registerBite } from "./game/gameState.js";
import { spawnFood, checkFoodCollision, removeFood } from "./game/food.js";
import { buildRoom, clearRoom, checkWallCollision } from "./game/room.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "./game/door.js";
import { initMinimap, updateMinimap } from "./game/minimap.js";
import { initTouchControls, inputState, updateInputState, getTurnSpeed } from "./input/touchControls.js";

// Rendering
import { initScene } from "./render/scene.js";

// Global variables
let scene, camera, renderer;
let snake;
let worldSize = 12;

// Initialize everything
function init() {
  ({ scene, camera, renderer, snake } = initScene());

  // Touch/mouse/keyboard controls
  initTouchControls();

  // Build initial room
  buildRoom(scene, worldSize);
  spawnFood(scene, worldSize);
  spawnDoor(scene, worldSize);
  initMinimap();

  animate();
}

// Simple restart logic
function restartGame() {
  removeFood(scene);
  clearRoom(scene);
  clearDoor(scene);
  resetGameState();

  buildRoom(scene, worldSize);
  spawnFood(scene, worldSize);
  spawnDoor(scene, worldSize);
}

// Animate loop
function animate() {
  requestAnimationFrame(animate);

  // Update input
  updateInputState();
  const turn = inputState.turn;
  const speed = getTurnSpeed();

  // Move snake
  if (gameState.alive) {
    snake.rotation.y -= turn * 0.05 * speed; // Rotate based on input
    snake.translateZ(0.1 * gameState.speed); // Forward movement

    // Check collisions
    if (checkWallCollision(snake.position, worldSize)) {
      console.log("Hit wall! Restarting...");
      gameState.alive = false;
      restartGame();
      return;
    }

    if (checkFoodCollision(snake.position)) {
      removeFood(scene);
      spawnFood(scene, worldSize);
      spawnDoor(scene, worldSize);
    }

    if (checkDoorEntry(snake.position, worldSize) && gameState.doorOpen) {
      console.log("Next room!");
      gameState.room++;
      restartGame();
    }

    // Update minimap
    const foodPos = checkFoodCollision.__foodPosition || null;
    const doorPos = { x: 0, z: worldSize / 2 - 0.15 }; // door fixed at front
    updateMinimap(snake.position, foodPos, doorPos, worldSize);
  }

  renderer.render(scene, camera);
}

// Start game
init();
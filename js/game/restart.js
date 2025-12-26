/// restart.js
/// Handles game restarts, including future "continue" features
/// Made by CCVO - CanC-Code

import { state as gameState, resetGameState } from "./gameState.js";
import { clearRoom, buildRoom } from "./room.js";
import { clearDoor, spawnDoor } from "./door.js";
import { removeFood, spawnFood } from "./food.js";
import { Snake } from "./snake.js";

let snakeInstance = null;
let sceneRef = null;
let roomSizeRef = 12;

export function initRestart(scene, snake, roomSize = 12) {
  snakeInstance = snake;
  sceneRef = scene;
  roomSizeRef = roomSize;
}

export function restartGame() {
  if (!sceneRef || !snakeInstance) return;

  console.log("Restarting game...");

  // Reset game state
  resetGameState();

  // Clear room and rebuild
  clearRoom(sceneRef);
  buildRoom(sceneRef, roomSizeRef);

  // Reset snake
  const spawnPos = new THREE.Vector3(0, 0.35, 0); // safe center
  snakeInstance.reset(spawnPos);

  // Remove & spawn food
  removeFood(sceneRef);
  spawnFood(sceneRef, roomSizeRef);

  // Remove & spawn door
  clearDoor(sceneRef);
  spawnDoor(sceneRef, roomSizeRef);

  // Reset other variables if needed
}
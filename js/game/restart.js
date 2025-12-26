/// restart.js
/// Restart system for Hyper-Worm
/// Made by CCVO - CanC-Code

import { state as gameState, resetGameState } from "../game/gameState.js";
import * as Room from "../game/room.js";
import * as Food from "../game/food.js";
import * as Door from "../game/door.js";

export function restartGame(scene) {
  // Reset game state
  resetGameState();

  // Clear existing objects
  Room.clearRoom(scene);
  Door.clearDoor(scene);
  Food.removeFood(scene);

  // Rebuild room
  Room.buildRoom(scene, gameState.roomSize);

  // Respawn food
  Food.spawnFood(scene, gameState.roomSize);

  // Respawn door if needed
  if (gameState.doorOpen) {
    Door.spawnDoor(scene, gameState.roomSize);
  }
}
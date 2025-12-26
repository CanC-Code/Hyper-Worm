/// restart.js
/// Handles full game restart / reset
/// Made by CCVO - CanC-Code

import { state as gameState, resetGameState } from "../game/gameState.js";
import { clearRoom, buildRoom } from "../game/room.js";
import { clearDoor, spawnDoor } from "../game/door.js";
import { removeFood, spawnFood } from "../game/food.js";
import { clearScene } from "../render/scene.js";
import * as THREE from "../../three/three.module.js";

/**
 * Restart the game
 * @param {THREE.Scene} scene
 */
export function restartGame(scene) {
  // Reset internal game state
  resetGameState();

  // Clear the scene completely
  clearScene(scene);

  // Rebuild the room
  buildRoom(scene, gameState.roomSize);

  // Spawn the first food
  spawnFood(scene, gameState.roomSize);

  // Door is initially closed, only spawn if room requires
  if (gameState.doorOpen) {
    spawnDoor(scene, gameState.roomSize);
  }

  console.log("Game restarted");
}
/// main.js
/// Hyper-Worm main entry point - ENHANCED
/// CCVO / CanC-Code

import * as THREE from "../three/three.module.js";
import { world, scene, camera, renderer } from "./render/scene.js";
import { buildRoom, clearRoom, checkWallCollision } from "./game/room.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "./game/door.js";
import { spawnSmoothEggSnake } from "./game/eggSnakeMorph.js";
import { inputState, initTouchControls, updateInputState, getTurnSpeed } from "./input/touchControls.js";
import { restartGame } from "./game/restart.js";
import { showRestartMenu } from "./game/restartMenu.js";
import { updateMinimap, initMinimap, showMinimap, hideMinimap } from "./game/minimap.js";
import { gameState } from "./game/gameState.js";
import { Snake } from "./game/snake.js";

let snake = null;
let roomSize = 12;
let gameRunning = false;

// --------------------------------------------------
// Initialize the game
// --------------------------------------------------
function initGame() {
  // Reset room and objects
  clearRoom(world);
  clearDoor(scene);

  if (snake) {
    world.remove(snake.object3D);
    snake.dispose();
    snake = null;
  }

  gameState.reset();

  // Build the room
  buildRoom(world, roomSize, 4);

  // Spawn the exit door
  spawnDoor(scene, roomSize);

  // Initialize minimap
  initMinimap();
  showMinimap();

  // Initialize input
  initTouchControls();

  // Egg → Snake intro
  spawnSmoothEggSnake((spawnedSnake) => {
    snake = spawnedSnake;
    gameRunning = true;

    const hud = document.getElementById("hud");
    if (hud) hud.textContent = "🐍 Go!";

    animate();
  });
}

// --------------------------------------------------
// Main game loop
// --------------------------------------------------
function animate() {
  if (!gameRunning) return;

  requestAnimationFrame(animate);

  // Update input
  updateInputState();

  if (snake) {
    // Move the snake
    const turn = inputState.turn;
    const speed = getTurnSpeed();
    snake.update(turn * speed);

    // Check collisions with walls
    if (checkWallCollision(snake.getHeadPosition(), roomSize)) {
      console.log("Hit wall!");
      gameRunning = false;
      showRestartMenu(() => {
        restartGame(initGame);
      });
      return;
    }

    // Check door
    if (checkDoorEntry(snake.getHeadPosition(), roomSize)) {
      console.log("Door reached!");
      // TODO: implement next room logic
    }

    // Update minimap
    updateMinimap(
      snake.getHeadPosition(),
      gameState.foodPos,
      { x: 0, z: roomSize / 2 - 0.15 },
      roomSize
    );

    // Camera follows the snake dynamically
    const headPos = snake.getHeadPosition();
    const cameraOffset = new THREE.Vector3(0, 2.5, -6);
    camera.position.lerp(headPos.clone().add(cameraOffset), 0.1);
    camera.lookAt(headPos);
  }

  // Render scene
  renderer.render(scene, camera);
}

// --------------------------------------------------
// Start the game when window loads
// --------------------------------------------------
window.addEventListener("load", () => {
  initGame();
});
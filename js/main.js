/// main.js
/// Hyper-Worm main entry point - ENHANCED
/// CCVO / CanC-Code

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
// Initialization
// --------------------------------------------------

function initGame() {
  // Reset state
  clearRoom(world);
  clearDoor(scene);
  if (snake) {
    world.remove(snake.object3D);
    snake.dispose();
    snake = null;
  }
  gameState.reset();

  // Build room
  buildRoom(world, roomSize, 4);

  // Spawn door
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
    document.getElementById("hud").textContent = "🐍 Go!";
    animate();
  });
}

// --------------------------------------------------
// Main game loop
// --------------------------------------------------

function animate() {
  if (!gameRunning) return;

  requestAnimationFrame(animate);

  updateInputState();

  if (snake) {
    // Move snake
    const turn = inputState.turn;
    const speed = getTurnSpeed();
    snake.update(turn * speed);

    // Collision with walls
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
      // TODO: next room logic
    }
  }

  // Update minimap
  if (snake) {
    updateMinimap(
      snake.getHeadPosition(),
      gameState.foodPos,
      { x: 0, z: roomSize / 2 - 0.15 },
      roomSize
    );
  }

  // Camera follows snake dynamically
  if (snake) {
    const headPos = snake.getHeadPosition();
    const cameraOffset = new THREE.Vector3(0, 2.5, -6);
    camera.position.lerp(headPos.clone().add(cameraOffset), 0.1);
    camera.lookAt(headPos);
  }

  renderer.render(scene, camera);
}

// --------------------------------------------------
// Start
// --------------------------------------------------

window.addEventListener("load", () => {
  initGame();
});
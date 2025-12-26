/// main.js
/// Hyper-Worm main entry point
/// CCVO / CanC-Code

import { world, scene, camera, renderer } from "./render/scene.js";
import { initTouchControls, inputState, updateInputState, getTurnSpeed } from "./input/touchControls.js";
import { buildRoom, clearRoom, state as roomState, checkWallCollision } from "./game/room.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "./game/door.js";
import { spawnSmoothEggSnake } from "./game/eggSnakeMorph.js";
import { Snake } from "./game/snake.js";
import { initMinimap, updateMinimap, showMinimap, hideMinimap } from "./game/minimap.js";
import { showRestartMenu } from "./game/restartMenu.js";

let snake = null;
let roomSize = 12;
let gameRunning = false;

// ------------------------------
// Initialize
// ------------------------------
function initGame() {
  // Clear previous world
  clearRoom(world);
  clearDoor(scene);

  // Build new room
  buildRoom(world, roomSize, 4);
  spawnDoor(scene, roomSize);

  // Reset snake
  spawnSmoothEggSnake((newSnake) => {
    snake = newSnake;
    gameRunning = true;
    document.getElementById("hud").classList.remove("loading");
  });

  // Minimap
  initMinimap();
  showMinimap();

  // Camera basic setup
  camera.position.set(-5, 2, 0);
  camera.lookAt(0, 0.7, 0);
}

// ------------------------------
// Game Loop
// ------------------------------
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (!gameRunning || !snake) return;

  updateInputState();

  const turnSpeed = getTurnSpeed();

  // Move snake
  snake.update(inputState.turn * turnSpeed);

  // Collision
  if (checkWallCollision(snake.headPosition(), roomSize)) {
    gameRunning = false;
    showRestartMenu(scene, snake);
  }

  // Update camera behind snake
  updateCameraFollow();

  // Update minimap
  const foodPos = null; // placeholder
  const doorPos = { x: 0, z: roomSize / 2 - 0.15 };
  updateMinimap(snake.headPosition(), foodPos, doorPos, roomSize);

  renderer.render(scene, camera);
}

// ------------------------------
// Camera follow logic
// ------------------------------
function updateCameraFollow() {
  if (!snake) return;
  const offset = new THREE.Vector3(0, 2.5, -6);
  const targetPos = snake.object3D.position.clone().add(offset);
  camera.position.lerp(targetPos, 0.1);
  camera.lookAt(snake.object3D.position);
}

// ------------------------------
// Start everything
// ------------------------------
initTouchControls();
initGame();
gameLoop();

// Expose restart
window.restartGame = () => initGame();
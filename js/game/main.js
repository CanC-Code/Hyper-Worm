/// main.js
/// Purpose: Application entry point and game loop
/// Made by CCVO - CanC-Code

import { scene, camera, renderer, resizeRenderer } from "./render/scene.js";
import { state, resetGameState } from "./game/gameState.js";
import { initSnake, updateSnake, growSnake, getHeadPosition, setDirection } from "./game/snake.js";
import { buildRoom, clearRoom } from "./game/room.js";
import { spawnFood, checkFoodCollision, removeFood } from "./game/food.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "./game/door.js";
import { initTouchControls, getDirectionVector } from "./input/touchControls.js";

/* ---------- HUD ---------- */
const hud = document.getElementById("hud");

function updateHUD() {
  hud.textContent = `Bites: ${state.bites} | Room: ${state.room}`;
}

/* ---------- GAME RESET ---------- */
function resetGame() {
  clearRoom(scene);
  clearDoor(scene);
  resetGameState();
  buildRoom(scene);
  initSnake(scene);
  spawnFood(scene);
  updateHUD();
}

/* ---------- INITIAL SETUP ---------- */
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", resizeRenderer);

initTouchControls();
resetGame();

/* ---------- GAME LOOP ---------- */
let lastTime = performance.now();
let moveAccumulator = 0;

function animate(now) {
  requestAnimationFrame(animate);

  const delta = (now - lastTime) / 1000;
  lastTime = now;

  if (!state.alive) {
    resetGame();
    return;
  }

  // Input → snake direction
  const dir = getDirectionVector();
  setDirection({ x: dir.x, y: dir.y });

  // Timed snake movement
  moveAccumulator += delta;
  const stepTime = 1 / state.speed;

  if (moveAccumulator >= stepTime) {
    updateSnake();
    moveAccumulator = 0;

    const headPos = getHeadPosition();

    // Food
    if (checkFoodCollision(headPos)) {
      growSnake(scene);
      removeFood(scene);
      if (state.doorOpen) {
        spawnDoor(scene);
      } else {
        spawnFood(scene);
      }
      updateHUD();
    }

    // Door
    if (state.doorOpen && checkDoorEntry(headPos, scene)) {
      clearRoom(scene);
      buildRoom(scene);
      spawnFood(scene);
      updateHUD();
    }
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
/// main.js
/// Game loop with fixed camera behind snake, dynamic steering
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";
import { scene, camera, renderer, resizeRenderer, world, updateCamera } from "./render/scene.js";
import { state as snakeState, initSnakeFromMesh, updateSnake, growSnake, getHeadPosition, setDirection } from "./game/snake.js";
import { state, resetGameState } from "./game/gameState.js";
import { buildRoom, clearRoom } from "./game/room.js";
import { spawnFood, checkFoodCollision, removeFood } from "./game/food.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "./game/door.js";
import { initTouchControls, getDirectionVector } from "./input/touchControls.js";
import { spawnSmoothEggSnake } from "./game/eggSnakeMorph.js";

/* ---------- HUD ---------- */
const hud = document.getElementById("hud");
function updateHUD() {
  hud.textContent = `Bites: ${state.bites} | Room: ${state.room}`;
}

/* ---------- GAME RESET ---------- */
function resetGame(snakeMesh) {
  clearRoom(world);
  clearDoor(world);
  resetGameState();
  buildRoom(world);
  initSnakeFromMesh(snakeMesh);
  spawnFood(world);
  updateHUD();
}

/* ---------- INITIAL SETUP ---------- */
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", resizeRenderer);

initTouchControls();

/* ---------- START GAME WITH EGG MORPH ---------- */
spawnSmoothEggSnake((snakeMesh) => {
  resetGame(snakeMesh);

  let lastTime = performance.now();
  const baseSpeed = 2;
  const speedIncrement = 0.05;

  function animate(now) {
    requestAnimationFrame(animate);
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    if (!state.alive) {
      resetGame(snakeMesh);
      return;
    }

    // Progressive speed ramp
    snakeState.speed = baseSpeed + now / 1000 * speedIncrement;

    // Input → snake direction
    const dir = getDirectionVector();
    setDirection({ x: dir.x, y: dir.y });

    // Update snake
    updateSnake(delta);

    const headPos = getHeadPosition();

    // Food
    if (checkFoodCollision(headPos)) {
      growSnake();
      removeFood(world);
      if (state.doorOpen) spawnDoor(world);
      else spawnFood(world);
      updateHUD();
    }

    // Door
    if (state.doorOpen && checkDoorEntry(headPos, world)) {
      clearRoom(world);
      buildRoom(world);
      spawnFood(world);
      updateHUD();
    }

    // Fixed camera behind snake
    updateCamera(delta);

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
});
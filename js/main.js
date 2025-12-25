/// main.js
/// Full snake game loop with egg intro
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";
import { scene, camera, renderer, world, resizeRenderer, updateCamera } from "./render/scene.js";
import { state as snakeState, initSnakeFromMesh, updateSnake, growSnake, getHeadPosition, getHeadDirection } from "./game/snake.js";
import { state, resetGameState } from "./game/gameState.js";
import { buildRoom, clearRoom } from "./game/room.js";
import { spawnFood, checkFoodCollision, removeFood } from "./game/food.js";
import { initTouchControls } from "./input/touchControls.js";
import { spawnSmoothEggSnake } from "./game/eggSnakeMorph.js";

/* ---------- HUD ---------- */
const hud = document.getElementById("hud");
function updateHUD() {
  hud.textContent = `Bites: ${state.bites} | Room: ${state.room}`;
}

/* ---------- INITIAL SETUP ---------- */
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", resizeRenderer);
initTouchControls();

/* ---------- START GAME ---------- */
spawnSmoothEggSnake((snakeMesh) => {
  initSnakeFromMesh(snakeMesh);
  buildRoom(world);

  let lastTime = performance.now();
  const baseSpeed = 2;
  const speedIncrement = 0.05;

  function animate(now) {
    requestAnimationFrame(animate);
    const delta = (now - lastTime)/1000;
    lastTime = now;

    snakeState.speed = baseSpeed + now/1000*speedIncrement;
    updateSnake(delta);

    const headPos = getHeadPosition();

    if (checkFoodCollision(headPos)) {
      growSnake();
      removeFood(world);
      spawnFood(world);
      updateHUD();
    }

    updateCamera(snakeState.mesh, getHeadDirection());
    renderer.render(scene, camera);
  }

  spawnFood(world);
  updateHUD();
  animate(lastTime);
});
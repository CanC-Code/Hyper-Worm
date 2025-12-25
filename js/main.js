/// main.js
/// Full snake game loop with egg intro
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";

import {
  scene,
  camera,
  renderer,
  resizeRenderer,
  world,
  updateCamera
} from "./render/scene.js";

import {
  state as snakeState,
  initSnakeFromMesh,
  updateSnake,
  growSnake,
  getHeadPosition,
  setDirection
} from "./game/snake.js";

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
resizeRenderer();
window.addEventListener("resize", resizeRenderer);

initTouchControls();

/* ---------- INTRO → GAME START ---------- */

spawnSmoothEggSnake((snakeMesh) => {

  // Initial intro framing (egg / hatch moment)
  camera.position.copy(
    snakeMesh.position.clone().add(new THREE.Vector3(0, 3, -6))
  );
  camera.lookAt(snakeMesh.position);

  resetGame(snakeMesh);

  let lastTime = performance.now();

  const BASE_SPEED = 2.0;
  const SPEED_INCREMENT = 0.05;

  function gameLoop(now) {
    requestAnimationFrame(gameLoop);

    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (!state.alive) {
      resetGame(snakeMesh);
      return;
    }

    /* ---------- SPEED ---------- */

    snakeState.speed = BASE_SPEED + now * 0.001 * SPEED_INCREMENT;

    /* ---------- INPUT → STEERING ---------- */

    const inputDir = getDirectionVector();
    setDirection(inputDir); // x = yaw, y unused (reserved)

    /* ---------- UPDATE SNAKE ---------- */

    updateSnake(delta);

    const headPos = getHeadPosition();

    /* ---------- FOOD ---------- */

    if (checkFoodCollision(headPos)) {
      growSnake();
      removeFood(world);

      if (state.doorOpen) {
        spawnDoor(world);
      } else {
        spawnFood(world);
      }

      updateHUD();
    }

    /* ---------- DOOR / ROOM ---------- */

    if (state.doorOpen && checkDoorEntry(headPos, world)) {
      clearRoom(world);
      buildRoom(world);
      spawnFood(world);
      updateHUD();
    }

    /* ---------- CAMERA ---------- */

    updateCamera(delta);

    renderer.render(scene, camera);
  }

  requestAnimationFrame(gameLoop);
});
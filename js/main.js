/// main.js
/// Purpose: Game loop with POV snake and procedural morphing egg
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";
import { scene, camera, renderer, resizeRenderer, world, initWorldDragControls } from "./render/scene.js";
import { updateCamera } from "./render/cameraController.js";
import { state as snakeState, initSnake, updateSnake, growSnake, getHeadPosition, setDirection } from "./game/snake.js";
import { state, resetGameState } from "./game/gameState.js";
import { buildRoom, clearRoom } from "./game/room.js";
import { spawnFood, checkFoodCollision, removeFood } from "./game/food.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "./game/door.js";
import { initTouchControls, getDirectionVector } from "./input/touchControls.js";
import { spawnMorphingEggSnake } from "./game/eggSnakeMorph.js";

/* ---------- HUD ---------- */
const hud = document.getElementById("hud");
function updateHUD() {
  hud.textContent = `Bites: ${state.bites} | Room: ${state.room}`;
}

/* ---------- GAME RESET ---------- */
function resetGame() {
  clearRoom(world);
  clearDoor(world);
  resetGameState();
  buildRoom(world);

  // Spawn morphing egg intro
  spawnMorphingEggSnake(new THREE.Vector3(0, 0, 0), () => {
    initSnake(world);
    spawnFood(world);
    updateHUD();
  });
}

/* ---------- INITIAL SETUP ---------- */
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", resizeRenderer);

initTouchControls();
initWorldDragControls();
resetGame();

/* ---------- GAME LOOP ---------- */
let lastTime = performance.now();
let moveAccumulator = 0;

const baseSpeed = 2;          // starting slow
const speedIncrement = 0.05;  // per second

function animate(now) {
  requestAnimationFrame(animate);
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  if (!state.alive) {
    resetGame();
    return;
  }

  // Progressive speed ramp
  snakeState.speed = baseSpeed + now / 1000 * speedIncrement;

  // Input → snake direction
  const dir = getDirectionVector();
  setDirection({ x: dir.x, y: dir.y });

  // Timed snake movement
  moveAccumulator += delta;
  const stepTime = 1 / snakeState.speed;
  if (moveAccumulator >= stepTime) {
    updateSnake(delta);
    moveAccumulator = 0;

    const headPos = getHeadPosition();

    // Food
    if (checkFoodCollision(headPos)) {
      growSnake(world);
      removeFood(world);
      if (state.doorOpen) {
        spawnDoor(world);
      } else {
        spawnFood(world);
      }
      updateHUD();
    }

    // Door
    if (state.doorOpen && checkDoorEntry(headPos, world)) {
      clearRoom(world);
      buildRoom(world);
      spawnFood(world);
      updateHUD();
    }
  }

  // Camera strictly follows snake head
  updateCamera(delta);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
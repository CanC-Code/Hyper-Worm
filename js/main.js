/// main.js
/// Purpose: Full Hyper-Worm 3D game loop with POV snake, cinematic intro, procedural rooms, doors, and HUD
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";
import { scene, camera, renderer, resizeRenderer, world, initWorldDragControls } from "./render/scene.js";
import { updateCamera } from "./render/cameraController.js";
import { state as snakeState, initSnake, updateSnake, growSnake, getHeadPosition, setDirection } from "./game/snake.js";
import { state, resetGameState } from "./game/gameState.js";
import { buildRoom, clearRoom } from "./game/room.js";
import { spawnFood, checkFoodCollision, removeFood } from "./game/food.js";
import { spawnDoor, checkDoorEntry, clearDoor, checkWallCollision } from "./game/door.js";
import { initTouchControls, getDirectionVector } from "./input/touchControls.js";
import { spawnIntroEgg } from "./game/eggSnakeMorph.js";

/* ---------- HUD ---------- */
const hud = document.getElementById("hud");
function updateHUD() {
  hud.textContent = `Bites: ${state.bites} | Room: ${state.room} | Speed: ${snakeState.speed.toFixed(1)}`;
}

/* ---------- GAME RESET ---------- */
function resetGame() {
  clearRoom(world);
  clearDoor(world);
  resetGameState();

  // Build procedural room
  buildRoom(world, 12, 5, 12);

  // Spawn cinematic intro egg
  spawnIntroEgg(() => {
    // After intro, spawn initial food and update HUD
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
const baseSpeed = 2;
const speedIncrement = 0.05;
let doorTween = null;

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

    // Wall collision → reset game
    if (checkWallCollision(headPos)) {
      resetGame();
      return;
    }

    // Food
    if (checkFoodCollision(headPos)) {
      growSnake(world);
      removeFood(world);

      // Door logic
      if (state.bites % 15 === 0) {
        spawnDoor(world);
      } else {
        spawnFood(world);
      }

      updateHUD();
    }

    // Door entry
    if (state.doorOpen && checkDoorEntry(headPos)) {
      // Smooth door open animation
      if (doorTween) cancelAnimationFrame(doorTween);
      doorTween = animateDoorOpen(state.door);

      clearRoom(world);
      clearDoor(world);
      buildRoom(world, 12, 5, 12);
      spawnFood(world);
      updateHUD();
    }
  }

  // Camera strictly follows snake head
  updateCamera(delta);

  renderer.render(scene, camera);
}

/* ---------- Smooth Door Animation ---------- */
function animateDoorOpen(doorMesh, duration = 1000) {
  if (!doorMesh) return;
  const startY = doorMesh.position.y;
  const endY = startY + 5; // lift door upward
  const startTime = performance.now();

  function step() {
    const t = (performance.now() - startTime) / duration;
    if (t < 1) {
      doorMesh.position.y = startY + (endY - startY) * t;
      requestAnimationFrame(step);
    } else {
      doorMesh.position.y = endY;
    }
  }
  requestAnimationFrame(step);
}

/* ---------- Lighting & Environment ---------- */
if (!scene.getObjectByName("mainLight")) {
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 15, 10);
  dirLight.castShadow = true;
  dirLight.name = "mainLight";
  scene.add(dirLight);

  const ambLight = new THREE.AmbientLight(0x555555);
  ambLight.name = "ambientLight";
  scene.add(ambLight);
}

requestAnimationFrame(animate);
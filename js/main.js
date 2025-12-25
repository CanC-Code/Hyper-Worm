/// main.js
/// Purpose: Game loop with dynamic 3D POV snake
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";
import { scene, camera, renderer, resizeRenderer, world } from "./render/scene.js";
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

  // Start game loop
  let lastTime = performance.now();
  let moveAccumulator = 0;

  const baseSpeed = 2;          // starting slow
  const speedIncrement = 0.05;  // per second

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

    // Update snake movement
    updateSnake(delta);

    const headPos = getHeadPosition();

    // Food
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

    // Door
    if (state.doorOpen && checkDoorEntry(headPos, world)) {
      clearRoom(world);
      buildRoom(world);
      spawnFood(world);
      updateHUD();
    }

    // Camera strictly follows snake head
    const camOffset = new THREE.Vector3(0, 1.5, -3);
    const desiredPos = snakeState.mesh.position.clone().add(camOffset);
    camera.position.lerp(desiredPos, 0.1);
    camera.lookAt(snakeState.mesh.position);

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
});
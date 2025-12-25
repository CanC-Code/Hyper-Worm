/// main.js
/// Full snake game loop with egg intro — CONTINUOUS BODY VERSION
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";

import {
  scene,
  camera,
  renderer,
  world,
  resizeRenderer,
  updateCamera
} from "./render/scene.js";

import { Snake } from "./game/snake.js";
import { state, resetGameState } from "./game/gameState.js";
import { buildRoom, clearRoom, checkWallCollision } from "./game/room.js";
import { spawnFood, checkFoodCollision, removeFood } from "./game/food.js";
import { initTouchControls } from "./input/touchControls.js";
import { spawnSmoothEggSnake } from "./game/eggSnakeMorph.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "./game/door.js";
import { initMinimap, updateMinimap, hideMinimap, showMinimap } from "./game/minimap.js";

/* ---------- GAME STATE ---------- */
let gameActive = false;
let gameOverFlag = false;
let animationId = null;

/* ---------- SNAKE MOTION STATE ---------- */
const headPosition = new THREE.Vector3(0, 0.5, 0);
const headDirection = new THREE.Vector3(0, 0, -1);

/* ---------- HUD ---------- */
const hud = document.getElementById("hud");

function updateHUD(snake) {
  const nextDoor = state.bitesPerRoom - (state.bites % state.bitesPerRoom);
  hud.innerHTML = `
    <div style="display: flex; gap: 20px; align-items: center;">
      <span>🐍 Length: ${snake.currentLength.toFixed(1)}</span>
      <span>🍎 Bites: ${state.bites}</span>
      <span>🚪 Room: ${state.room}</span>
      <span>⏭️ Next Door: ${state.doorOpen ? "OPEN!" : nextDoor}</span>
    </div>
  `;
}

function showGameOver() {
  hud.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h2 style="color: #ff4444; margin: 0 0 10px 0; font-size: 24px;">GAME OVER</h2>
      <p style="margin: 5px 0;">Final Score: ${state.bites}</p>
      <p style="margin: 5px 0;">Rooms Cleared: ${state.room - 1}</p>
      <p style="margin: 15px 0 5px 0; font-size: 12px; opacity: 0.8;">Tap / Click to Restart</p>
    </div>
  `;
}

/* ---------- SCREEN FX ---------- */
function flashScreen(color = 0xff0000) {
  const flash = document.createElement("div");
  flash.style.cssText = `
    position: fixed;
    inset: 0;
    background: ${
      color === 0xff0000
        ? "rgba(255,0,0,0.3)"
        : "rgba(0,255,136,0.2)"
    };
    pointer-events: none;
    z-index: 9;
    animation: fadeOut 0.3s ease-out;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 300);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

/* ---------- COLLISION ---------- */
function checkSelfCollision(snake, headPos) {
  const minIndex = 6;
  const threshold = 0.35;

  for (let i = minIndex; i < snake.spine.length; i++) {
    if (headPos.distanceTo(snake.spine[i]) < threshold) {
      return true;
    }
  }
  return false;
}

/* ---------- GAME FLOW ---------- */
function gameOver() {
  if (gameOverFlag) return;

  gameOverFlag = true;
  gameActive = false;
  flashScreen(0xff0000);

  const originalPos = camera.position.clone();
  let t = 0;

  const shake = setInterval(() => {
    t += 50;
    camera.position.x = originalPos.x + (Math.random() - 0.5) * 0.3;
    camera.position.y = originalPos.y + (Math.random() - 0.5) * 0.3;
    if (t > 500) clearInterval(shake);
  }, 50);

  setTimeout(() => {
    if (animationId) cancelAnimationFrame(animationId);
    showGameOver();

    const restart = () => {
      document.removeEventListener("click", restart);
      document.removeEventListener("touchstart", restart);
      window.location.reload();
    };

    document.addEventListener("click", restart);
    document.addEventListener("touchstart", restart);
  }, 600);
}

function progressToNextRoom(snake) {
  flashScreen(0x00ff88);

  clearRoom(world);
  clearDoor(world);

  state.room++;
  state.doorOpen = false;
  state.roomSize = Math.min(12 + state.room, 25);

  buildRoom(world, state.roomSize);

  headPosition.set(0, 0.5, 0);
  snake.reset(headPosition);

  removeFood(world);
  spawnFood(world, state.roomSize);

  updateHUD(snake);
}

/* ---------- INITIAL SETUP ---------- */
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", resizeRenderer);
initTouchControls();
initMinimap();
hideMinimap();

/* ---------- START GAME ---------- */
spawnSmoothEggSnake((eggMesh) => {
  showMinimap();

  const hint = document.createElement("div");
  hint.className = "control-hint";
  hint.textContent = "🎮 Touch / Drag • WASD / Arrows";
  document.body.appendChild(hint);
  setTimeout(() => hint.remove(), 7000);

  const snake = new Snake(world);
  headPosition.copy(eggMesh.position);
  snake.reset(headPosition);
  world.remove(eggMesh);

  buildRoom(world, state.roomSize);
  spawnFood(world, state.roomSize);
  updateHUD(snake);

  const BASE_SPEED = 3;
  const SPEED_PER_ROOM = 0.3;

  let lastTime = performance.now();
  gameActive = true;
  gameOverFlag = false;

  function animate(now) {
    if (!gameActive) return;
    animationId = requestAnimationFrame(animate);

    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    const speed =
      BASE_SPEED + (state.room - 1) * SPEED_PER_ROOM;

    // Move head (direction updated by input system)
    headPosition.addScaledVector(headDirection, speed * delta);

    // Update snake geometry
    snake.update(headPosition);

    // Collisions
    if (
      checkWallCollision(headPosition, state.roomSize) ||
      checkSelfCollision(snake, headPosition)
    ) {
      gameOver();
      return;
    }

    // Food
    if (checkFoodCollision(headPosition)) {
      state.bites++;
      snake.grow();
      removeFood(world);
      spawnFood(world, state.roomSize);
      updateHUD(snake);

      if (state.bites % state.bitesPerRoom === 0) {
        state.doorOpen = true;
        spawnDoor(world, state.roomSize);
      }
    }

    // Door
    if (state.doorOpen && checkDoorEntry(headPosition, state.roomSize)) {
      progressToNextRoom(snake);
    }

    updateCamera(snake.mesh, headDirection);

    const foodPos = checkFoodCollision.__foodPosition || null;
    const doorPos = state.doorOpen
      ? { x: 0, z: state.roomSize / 2 - 1 }
      : null;

    updateMinimap(
      headPosition,
      foodPos,
      doorPos,
      state.roomSize
    );

    renderer.render(scene, camera);
  }

  animate(lastTime);
});
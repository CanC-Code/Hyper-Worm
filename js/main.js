/// main.js
/// Entry point for Hyper-Worm 3D game - ENHANCED
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";

import { Snake } from "../game/snake.js";
import { spawnFood, checkFoodCollision, removeFood } from "../game/food.js";
import { state as gameState } from "../game/gameState.js";
import { buildRoom, checkWallCollision } from "../game/room.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "../game/door.js";
import { initMinimap, updateMinimap } from "../game/minimap.js";
import { initTouchControls, getTurnInput, getTurnSpeed } from "../input/touchControls.js";
import { initRestart, restartGame } from "../game/restart.js";

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 10, 15);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// --- Room Setup ---
const roomSize = gameState.roomSize;
buildRoom(scene, roomSize);

// --- Snake Setup ---
const snake = new Snake(scene);
snake.reset(new THREE.Vector3(0, 0.35, 0)); // safe spawn center

// --- Food & Door ---
spawnFood(scene, roomSize);
spawnDoor(scene, roomSize);

// --- Minimap ---
initMinimap();

// --- Controls ---
initTouchControls();

// --- Restart integration ---
initRestart(scene, snake, roomSize);

// --- Game Loop ---
let lastTime = performance.now();

function animate() {
  const now = performance.now();
  const delta = (now - lastTime) / 1000; // seconds
  lastTime = now;

  if (!gameState.alive) {
    requestAnimationFrame(animate);
    return;
  }

  // Snake movement
  const turn = getTurnInput();
  const turnSpeed = getTurnSpeed() * delta;
  if (turn !== 0) {
    snake.spine[0].x += turn * turnSpeed; // simple lateral movement
  }

  // Update snake
  const headPos = snake.spine[0].clone();
  snake.update(headPos);

  // Collision checks
  if (checkWallCollision(headPos, roomSize)) {
    console.log("Hit wall!");
    gameState.alive = false;
    restartGame();
  }

  if (checkFoodCollision(headPos)) {
    removeFood(scene);
    spawnFood(scene, roomSize);
  }

  if (checkDoorEntry(headPos, roomSize)) {
    console.log("Entered door! Advancing room...");
    gameState.room++;
    gameState.doorOpen = false;
    restartGame();
  }

  // Update minimap
  updateMinimap(headPos, checkFoodCollision.__foodPosition, new THREE.Vector3(0, 1.4, roomSize / 2 - 0.15), roomSize);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// --- Handle resize ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
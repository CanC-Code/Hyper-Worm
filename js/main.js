// main.js
// Hyper-Worm main entry and game loop - ENHANCED
// Author: CCVO + assistant

import * as THREE from "../three/three.module.js";
import { Snake } from "../game/snake.js";
import { spawnFood, removeFood, checkFoodCollision } from "../game/food.js";
import { state as gameState, resetGameState } from "../game/gameState.js";
import { buildRoom, clearRoom, checkWallCollision } from "../game/room.js";
import { spawnDoor, clearDoor, checkDoorEntry } from "../game/door.js";
import { initMinimap, updateMinimap } from "../game/minimap.js";
import { initTouchControls, getTurnInput, getTurnSpeed } from "../input/touchControls.js";

// --- Renderer setup ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- Scene & camera ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 6, 12);
camera.lookAt(0, 0, 0);

// --- Lights ---
const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// --- Snake ---
const snake = new Snake(scene);
let headPos = new THREE.Vector3(0, 0.35, 0);
let forwardVec = new THREE.Vector3(0, 0, -1);
const MOVE_SPEED = 3.0;

// --- Room setup ---
let roomSize = 12;
buildRoom(scene, roomSize);

// --- Minimap ---
initMinimap();

// --- Input ---
initTouchControls();

// --- Spawn initial food & door ---
spawnFood(scene, roomSize);
spawnDoor(scene, roomSize);

// --- Game loop ---
function animate() {
  requestAnimationFrame(animate);

  // --- Get turn input ---
  const turnInput = getTurnInput();
  const turnMultiplier = getTurnSpeed();

  // --- Apply turning ---
  if (turnInput !== 0) {
    const turnAngle = turnInput * turnMultiplier * 0.016; // ~60fps
    const axis = new THREE.Vector3(0, 1, 0);
    forwardVec.applyAxisAngle(axis, turnAngle).normalize();
  }

  // --- Move forward ---
  const moveStep = MOVE_SPEED * 0.016;
  const deltaMove = forwardVec.clone().multiplyScalar(moveStep);
  headPos.add(deltaMove);

  // Optional vertical bobbing
  headPos.y = 0.35 + Math.sin(Date.now() * 0.005) * 0.05;

  // --- Update snake spine ---
  snake.update(headPos);

  // --- Food collision ---
  if (checkFoodCollision(headPos)) {
    removeFood(scene);
    spawnFood(scene, roomSize);
  }

  // --- Wall collision ---
  if (checkWallCollision(headPos, roomSize)) {
    console.log("Hit wall!");
    gameState.alive = false;
  }

  // --- Door entry ---
  if (gameState.doorOpen && checkDoorEntry(headPos, roomSize)) {
    console.log("Enter door!");
    gameState.room++;
    gameState.doorOpen = false;
    clearRoom(scene);
    buildRoom(scene, roomSize);
    clearDoor(scene);
    spawnDoor(scene, roomSize);
    removeFood(scene);
    spawnFood(scene, roomSize);
    resetGameState();
  }

  // --- Minimap ---
  updateMinimap(headPos, checkFoodCollision.__foodPosition || null, null, roomSize);

  // --- Camera follow ---
  camera.position.lerp(new THREE.Vector3(headPos.x, 6, headPos.z + 12), 0.1);
  camera.lookAt(headPos.x, headPos.y, headPos.z);

  // --- Render ---
  renderer.render(scene, camera);
}

animate();

// --- Handle resize ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
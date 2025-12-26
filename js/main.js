// main.js (or wherever your game loop is)
import * as THREE from "../three/three.module.js";
import { Snake } from "./game/snake.js";
import { state as gameState } from "./game/gameState.js";
import { inputState, updateInputState, getTurnSpeed } from "./input/touchControls.js";
import { spawnFood, checkFoodCollision, removeFood } from "./game/food.js";
import { buildRoom, clearRoom, checkWallCollision } from "./game/room.js";
import { spawnDoor, checkDoorEntry, clearDoor } from "./game/door.js";
import { initMinimap, updateMinimap } from "./game/minimap.js";

let scene, camera, renderer;
let snake, headPos;
let roomSize = 12;

// --- Initialize Scene ---
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0, 6, 10);
  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Initialize snake
  snake = new Snake(scene);
  headPos = new THREE.Vector3(0, 0.35, 0); // Safe starting position

  // Build initial room
  buildRoom(scene, roomSize);

  // Spawn first food
  spawnFood(scene, roomSize);

  // Minimap
  initMinimap();
}

// --- Game Loop ---
function animate() {
  requestAnimationFrame(animate);

  // --- Update input ---
  updateInputState();

  // --- Apply input to head movement ---
  const turnSpeed = getTurnSpeed();
  const delta = inputState.turn * turnSpeed * 0.05; // scale factor for smooth turning

  // Update head rotation / movement
  const angle = delta; // For simplicity, assume Y-up rotation
  headPos.applyAxisAngle(new THREE.Vector3(0,1,0), angle);

  // Move forward
  const moveStep = gameState.speed * 0.05; // speed factor
  headPos.add(new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0), headPos.y));

  // --- Update snake ---
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

  // --- Door check ---
  if (gameState.doorOpen && checkDoorEntry(headPos, roomSize)) {
    console.log("Enter door!");
    // Advance room logic here...
  }

  // --- Minimap update ---
  updateMinimap(headPos, checkFoodCollision.__foodPosition || null, null, roomSize);

  renderer.render(scene, camera);
}

// --- Start ---
init();
animate();
/// main.js
/// Hyper-Worm main entry point
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";
import { state as gameState } from "./game/gameState.js";
import * as Touch from "./input/touchControls.js";
import * as Room from "./game/room.js";
import * as Food from "./game/food.js";
import * as Door from "./game/door.js";
import { restartGame } from "./game/restart.js";
import { initRenderer } from "./render/scene.js";

let scene, camera, renderer;
let snake = null;

const clock = new THREE.Clock();

// --- Initialize everything ---
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Renderer
  renderer = initRenderer(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(5, 10, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Build initial room
  Room.buildRoom(scene, gameState.roomSize);

  // Spawn initial food
  Food.spawnFood(scene, gameState.roomSize);

  // Spawn door if needed
  if (gameState.doorOpen) {
    Door.spawnDoor(scene, gameState.roomSize);
  }

  // Snake
  initSnake();

  // Touch & input
  Touch.initTouchControls();

  // Resize listener
  window.addEventListener("resize", onWindowResize);

  // Start loop
  animate();
}

// --- Snake initialization ---
function initSnake() {
  const geo = new THREE.SphereGeometry(0.3, 16, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0x88ffcc });
  snake = new THREE.Mesh(geo, mat);
  snake.position.set(0, 0.3, 0);
  snake.castShadow = true;
  scene.add(snake);
}

// --- Window resize handler ---
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Camera follow ---
function updateCamera() {
  if (!snake) return;

  const offset = new THREE.Vector3(0, 3, -6);
  offset.applyQuaternion(snake.quaternion);

  camera.position.copy(snake.position.clone().add(offset));
  camera.lookAt(snake.position.clone().add(new THREE.Vector3(0, 1, 0)));
}

// --- Game loop ---
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Update input
  Touch.updateInputState();

  // Move snake
  if (snake) {
    const turnSpeed = Touch.getTurnSpeed();
    snake.rotation.y -= Touch.inputState.turn * turnSpeed * delta;

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(snake.quaternion);
    snake.position.add(forward.multiplyScalar(3 * delta));
  }

  // Check collisions
  if (Room.checkWallCollision(snake.position, gameState.roomSize)) {
    console.log("Hit wall!");
    restartGame(scene);
    return;
  }

  if (Food.checkFoodCollision(snake.position)) {
    Food.removeFood(scene);
    Food.spawnFood(scene, gameState.roomSize);

    // Open door if needed
    if (gameState.doorOpen) {
      Door.spawnDoor(scene, gameState.roomSize);
    }
  }

  if (gameState.doorOpen && Door.checkDoorEntry(snake.position, gameState.roomSize)) {
    console.log("Entered door!");
    gameState.room++;
    restartGame(scene);
  }

  // Update camera
  updateCamera();

  // Render
  renderer.render(scene, camera);
}

// --- Start the game ---
init();
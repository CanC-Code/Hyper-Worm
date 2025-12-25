/// main.js
/// Full snake game loop with egg intro - ENHANCED VERSION
/// Made by CCVO - CanC-Code

import * as THREE from "../three/three.module.js";
import { scene, camera, renderer, world, resizeRenderer, updateCamera } from "./render/scene.js";
import { state as snakeState, initSnakeFromMesh, updateSnake, growSnake, getHeadPosition, getHeadDirection, checkSelfCollision } from "./game/snake.js";
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

/* ---------- HUD ---------- */
const hud = document.getElementById("hud");

function updateHUD() {
  const nextDoor = state.bitesPerRoom - (state.bites % state.bitesPerRoom);
  hud.innerHTML = `
    <div style="display: flex; gap: 20px; align-items: center;">
      <span>🐍 Length: ${snakeState.length}</span>
      <span>🍎 Bites: ${state.bites}</span>
      <span>🚪 Room: ${state.room}</span>
      <span>⏭️ Next Door: ${state.doorOpen ? 'OPEN!' : nextDoor}</span>
    </div>
  `;
}

function showGameOver() {
  hud.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h2 style="color: #ff4444; margin: 0 0 10px 0; font-size: 24px;">GAME OVER</h2>
      <p style="margin: 5px 0;">Final Score: ${state.bites}</p>
      <p style="margin: 5px 0;">Rooms Cleared: ${state.room - 1}</p>
      <p style="margin: 15px 0 5px 0; font-size: 12px; opacity: 0.8;">Tap/Click to Restart</p>
    </div>
  `;
}

/* ---------- PARTICLE EFFECTS ---------- */
function createFoodParticles(position) {
  const particleCount = 15;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      Math.random() * 0.15,
      (Math.random() - 0.5) * 0.1
    ));
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xff4444,
    size: 0.15,
    transparent: true,
    opacity: 1
  });
  
  const particles = new THREE.Points(geometry, material);
  world.add(particles);
  
  let life = 1.0;
  const animateParticles = () => {
    life -= 0.03;
    if (life <= 0) {
      world.remove(particles);
      geometry.dispose();
      material.dispose();
      return;
    }
    
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y - 0.005; // gravity
      positions[i * 3 + 2] += velocities[i].z;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    material.opacity = life;
    
    requestAnimationFrame(animateParticles);
  };
  
  animateParticles();
}

function flashScreen(color = 0xff0000) {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: ${color === 0xff0000 ? 'rgba(255,0,0,0.3)' : 'rgba(0,255,136,0.2)'};
    pointer-events: none;
    z-index: 9;
    animation: fadeOut 0.3s ease-out;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 300);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

/* ---------- GAME LOGIC ---------- */
function gameOver() {
  if (gameOverFlag) return;
  gameOverFlag = true;
  gameActive = false;
  
  flashScreen(0xff0000);
  
  // Shake camera
  const originalPos = camera.position.clone();
  let shakeTime = 0;
  const shakeInterval = setInterval(() => {
    shakeTime += 50;
    if (shakeTime > 500) {
      clearInterval(shakeInterval);
      return;
    }
    camera.position.x = originalPos.x + (Math.random() - 0.5) * 0.3;
    camera.position.y = originalPos.y + (Math.random() - 0.5) * 0.3;
  }, 50);
  
  setTimeout(() => {
    if (animationId) cancelAnimationFrame(animationId);
    showGameOver();
    
    // Setup restart
    const restartGame = () => {
      document.removeEventListener('click', restartGame);
      document.removeEventListener('touchstart', restartGame);
      window.location.reload();
    };
    
    document.addEventListener('click', restartGame);
    document.addEventListener('touchstart', restartGame);
  }, 600);
}

function progressToNextRoom() {
  flashScreen(0x00ff88);
  
  // Clear current room
  clearRoom(world);
  clearDoor(world);
  
  // Increment room and reset door state
  state.room++;
  state.doorOpen = false;
  state.roomSize = Math.min(12 + state.room, 25); // Gradually increase room size
  
  // Rebuild room
  buildRoom(world, state.roomSize);
  
  // Reposition snake to center
  snakeState.mesh.position.set(0, 0.5, 0);
  snakeState.path = [];
  for (let i = 0; i < snakeState.length; i++) {
    snakeState.path.push(snakeState.mesh.position.clone().add(new THREE.Vector3(0, 0, -i * 0.1)));
  }
  
  // Spawn new food
  removeFood(world);
  spawnFood(world, state.roomSize);
  
  updateHUD();
}

/* ---------- INITIAL SETUP ---------- */
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", resizeRenderer);
initTouchControls();
initMinimap();
hideMinimap(); // Hide during intro

/* ---------- START GAME ---------- */
spawnSmoothEggSnake((snakeMesh) => {
  showMinimap(); // Show minimap after hatching
  initSnakeFromMesh(snakeMesh);
  buildRoom(world, state.roomSize);
  
  let lastTime = performance.now();
  const BASE_SPEED = 3;
  const SPEED_PER_ROOM = 0.3;
  
  gameActive = true;
  gameOverFlag = false;

  function animate(now) {
    if (!gameActive) return;
    
    animationId = requestAnimationFrame(animate);
    const delta = Math.min((now - lastTime) / 1000, 0.1); // Cap delta to prevent large jumps
    lastTime = now;

    // Progressive speed increase per room
    snakeState.speed = BASE_SPEED + (state.room - 1) * SPEED_PER_ROOM;
    
    updateSnake(delta);
    const headPos = getHeadPosition();

    // Check collisions
    if (checkWallCollision(headPos, state.roomSize) || checkSelfCollision()) {
      gameOver();
      return;
    }

    // Check food collision
    if (checkFoodCollision(headPos)) {
      const foodPos = headPos.clone();
      createFoodParticles(foodPos);
      
      growSnake();
      removeFood(world);
      spawnFood(world, state.roomSize);
      updateHUD();
      
      // Check if door should open
      if (state.bites % state.bitesPerRoom === 0) {
        state.doorOpen = true;
        spawnDoor(world, state.roomSize);
      }
    }

    // Check door entry
    if (state.doorOpen && checkDoorEntry(headPos, state.roomSize)) {
      progressToNextRoom();
    }

    updateCamera(snakeState.mesh, getHeadDirection());
    
    // Update minimap
    const foodPos = checkFoodCollision.__foodPosition || null;
    const doorPos = state.doorOpen ? { x: 0, z: state.roomSize / 2 - 1 } : null;
    updateMinimap(headPos, foodPos, doorPos, state.roomSize);
    
    renderer.render(scene, camera);
  }

  spawnFood(world, state.roomSize);
  updateHUD();
  animate(lastTime);
});
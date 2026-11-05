import * as THREE from "../three/three.module.js";
import { scene, world, camera, renderer, SPHERE_RADIUS, envRefs, fitCamera } from "./render/scene.js";
import { gameState, resetGameState, addScore } from "./game/gameState.js";
import { Snake } from "./game/snake.js";
import { EnemySnake } from "./game/enemy.js";
import { Food } from "./game/food.js";
import { inputState, initTouchControls, getSteer, getBoost, getOrbit } from "./input/touchControls.js";
import { showRestartMenu, hideRestartMenu } from "./game/restartMenu.js";

let snake = null;
let enemySnake = null;
let food = null;
let lastTime = performance.now();
let dragState = null;

let camAz = 0.9, camPol = 1.05, camDist = SPHERE_RADIUS * 3.6;
let camTargetAz = camAz, camTargetPol = camPol, camTargetDist = camDist;
let idleTime = 0;

const $score = document.getElementById("score");
const $len   = document.getElementById("len");
const $best  = document.getElementById("best");
const $flash = document.getElementById("flash");
const $overlay = document.getElementById("overlay");
const $ovBtn   = document.getElementById("ov-btn");
const canvas = renderer.domElement;

function updateHUD() {
  $score.textContent = gameState.score;
  $len.textContent   = Math.ceil(gameState.segCount);
  $best.textContent  = gameState.highScore;
}

function flashScreen() {
  $flash.classList.add("on");
  void $flash.offsetWidth;
  $flash.classList.remove("on");
}

function initGame() {
  if (snake) { world.remove(snake.object3D); snake = null; }
  if (food)  { world.remove(food.group);     food = null; }
  if (enemySnake) { world.remove(enemySnake.object3D); enemySnake = null; }

  resetGameState();

  const u = Math.random() * 2 - 1;
  const t = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  const startPos = new THREE.Vector3(s * Math.cos(t), u, s * Math.sin(t)).multiplyScalar(SPHERE_RADIUS);
  const u2 = Math.random() * 2 - 1;
  const t2 = Math.random() * Math.PI * 2;
  const s2 = Math.sqrt(1 - u2 * u2);
  const startDir = new THREE.Vector3(s2 * Math.cos(t2), u2, s2 * Math.sin(t2));
  const n = startPos.clone().normalize();
  startDir.addScaledVector(n, -startDir.dot(n)).normalize();

  snake = new Snake({
    sphereRadius: SPHERE_RADIUS,
    segmentLength: 0.5,
    initialSegments: 12,
    radius: 0.4,
    taper: 0.55,
    speed: 4.5
  });
  snake.setHeading(startPos, startDir);
  world.add(snake.object3D);

  food = new Food(SPHERE_RADIUS);
  food.spawn(snake.headPosition());
  world.add(food.group);

  updateHUD();
}

function startGame() {
  initGame();
  gameState.playing = true;
  gameState.over = false;
  $overlay.classList.add("hidden");
  document.body.classList.add("playing");
}


function triggerStageChange() {
  gameState.stage++;
  gameState.nextStageScore += 50 + (gameState.stage * 20); // Gets harder to level up
  
  // Visual "Crack" effect
  flashScreen();
  document.body.style.animation = "shake 0.4s"; // We'll add a shake keyframe
  setTimeout(() => document.body.style.animation = "", 400);

  // Change the world color based on the stage (Crimson on 5, Toxic green on 10, etc.)
  const colors = [0x22e6ff, 0xffaa00, 0xff2fd0, 0x8a5cff, 0xff0000, 0x00ff00];
  const c = colors[Math.min(gameState.stage - 1, colors.length - 1)];
  envRefs.wire.material.color.setHex(c);
  envRefs.atmo.material.uniforms.uColor.value.setHex(c);
  
  // Spawn the Rival at Stage 5
  if (gameState.stage === 5 && !enemySnake) {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const ePos = new THREE.Vector3(s * Math.cos(t), u, s * Math.sin(t)).multiplyScalar(SPHERE_RADIUS);
    
    enemySnake = new EnemySnake({
      sphereRadius: SPHERE_RADIUS, segmentLength: 0.5, initialSegments: 15,
      radius: 0.45, taper: 0.55, speed: 4.8
    });
    
    // Force enemy color to red
    enemySnake.hue = 0.0;
    enemySnake.headGlow.material.color.setHex(0xff0000);
    
    enemySnake.setHeading(ePos, new THREE.Vector3(1, 0, 0));
    world.add(enemySnake.object3D);
    alert("WARNING: Stage 5. A rival worm has entered the arena.");
  }
}

function pauseGame() {
  if (!gameState.playing) return;
  gameState.playing = false;
  document.body.classList.remove("playing");
  showRestartMenu("PAUSED", "Take a breath.<br>The worm can wait.", "RESUME", () => {
    hideRestartMenu();
    gameState.playing = true;
    document.body.classList.add("playing");
  });
}

function gameOver() {
  gameState.playing = false;
  gameState.over = true;
  document.body.classList.remove("playing");
  addScore(0);
  showRestartMenu(
    'GAME <span style="color:#ff2fd0">OVER</span>',
    `Score <b style="color:#22e6ff">${gameState.score}</b> &nbsp;·&nbsp; Length <b style="color:#ff2fd0">${Math.ceil(gameState.segCount)}</b><br><span style="opacity:.6">Best ${gameState.highScore}</span>`,
    "RETRY",
    () => { hideRestartMenu(); startGame(); }
  );
}

function updateCamera(dt) {
  idleTime += dt;
  if (!dragState && idleTime > 4) camTargetAz += dt * 0.08;
  const k = 1 - Math.pow(0.001, dt);
  camAz   += (camTargetAz   - camAz)   * k;
  camPol  += (camTargetPol  - camPol)  * k;
  camDist += (camTargetDist - camDist) * k;

  // The camera now follows the snake's head instead of the center of the globe
  const targetPos = snake ? snake.headPos.clone() : new THREE.Vector3(0, 0, 0);
  const sp = Math.sin(camPol);
  const offset = new THREE.Vector3(
    sp * Math.cos(camAz) * camDist,
    Math.cos(camPol) * camDist,
    sp * Math.sin(camAz) * camDist
  );

  camera.position.lerp(targetPos.clone().add(offset), 0.1);
  camera.lookAt(targetPos);
}

canvas.addEventListener("pointerdown", e => {
  if (!gameState.playing) return;
  canvas.setPointerCapture(e.pointerId);
  dragState = { id: e.pointerId, x: e.clientX, y: e.clientY };
  idleTime = 0;
});
canvas.addEventListener("pointermove", e => {
  if (!dragState || dragState.id !== e.pointerId) return;
  const dx = e.clientX - dragState.x;
  const dy = e.clientY - dragState.y;
  camTargetAz -= dx * 0.0062;
  camTargetPol = THREE.MathUtils.clamp(camTargetPol - dy * 0.0062, 0.28, Math.PI - 0.28);
  dragState.x = e.clientX;
  dragState.y = e.clientY;
  idleTime = 0;
});
const endDrag = e => { if (dragState && dragState.id === e.pointerId) dragState = null; };
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);
canvas.addEventListener("wheel", e => {
  if (!gameState.playing) return;
  e.preventDefault();
  camTargetDist = THREE.MathUtils.clamp(
    camTargetDist * (1 + Math.sign(e.deltaY) * 0.12),
    SPHERE_RADIUS * 2.2,
    SPHERE_RADIUS * 7
  );
}, { passive: false });
canvas.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("visibilitychange", () => {
  if (document.hidden && gameState.playing) pauseGame();
});

function loop(now) {
  requestAnimationFrame(loop);
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(dt, 0.05);

  gameState.time += dt;

  if (gameState.playing && snake) {
    // Progressive speed: starts at 4.5, caps at 9.0
    snake.speed = 4.5 + Math.min(gameState.score * 0.05, 4.5);
    snake.update(dt, getSteer(), getBoost());
    gameState.segCount = snake.segCount;

    if (food.checkEaten(snake.headPosition())) {
      addScore(10);
      snake.grow(2);
      food.spawn(snake.headPosition());
      flashScreen();
      updateHUD();
      
      if (gameState.score >= gameState.nextStageScore) {
        triggerStageChange();
      }
    }

    if (snake.checkSelfCollision()) gameOver();

    // Enemy AI Logic
    if (enemySnake) {
      enemySnake.speed = 4.5 + Math.min(gameState.stage * 0.2, 3.0); // AI gets faster
      enemySnake.updateAI(dt, food.pos, false);
      
      if (food.checkEaten(enemySnake.headPosition())) {
        enemySnake.grow(2);
        food.spawn(enemySnake.headPosition()); // Respawn food away from enemy
      }
      
      // Player dies if they touch the enemy
      const distToEnemy = snake.headPosition().distanceTo(enemySnake.headPosition());
      if (distToEnemy < (snake.radius + enemySnake.radius) * 1.5) {
        gameOver();
      }
    }
  }

  if (food) food.update(dt);
  if (enemySnake) enemySnake.updateSegments();

  /* right-stick / Q-E orbit — continuous velocity while deflected */
  {
    const o = getOrbit();
    if (o.x !== 0 || o.y !== 0) {
      camTargetAz -= o.x * 2.2 * dt;
      camTargetPol = THREE.MathUtils.clamp(
        camTargetPol - o.y * 1.8 * dt,
        0.28, Math.PI - 0.28
      );
      idleTime = 0;
    }
  }

  updateCamera(dt);

  envRefs.atmo.material.uniforms.uStrength.value = 0.75 + 0.12 * Math.sin(gameState.time * 1.3);
  envRefs.wire.material.opacity = 0.10 + 0.05 * Math.sin(gameState.time * 0.9 + 1.0);

  renderer.render(scene, camera);
}

initTouchControls();
updateHUD();
$ovBtn.addEventListener("click", () => {
  try {
    startGame();
  } catch (err) {
    alert("Start Error: " + err.message);
    console.error(err);
  }
});
fitCamera();
requestAnimationFrame(loop);

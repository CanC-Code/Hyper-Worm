import * as THREE from "../three/three.module.js";
import { scene, world, camera, renderer, envRefs, fitCamera, pillars } from "./render/scene.js";
import { gameState, resetGameState, addScore } from "./game/gameState.js";
import { Snake } from "./game/snake.js";
import { EnemySnake } from "./game/enemy.js";
import { AudioEngine } from "./render/audio.js";
import { Food } from "./game/food.js";
import { inputState, initTouchControls, getSteer, getBoost, getOrbit } from "./input/touchControls.js";
import { showRestartMenu, hideRestartMenu } from "./game/restartMenu.js";

const audio = new AudioEngine();
let snake = null;
let enemies = [];
let respawnTimers = [];
let droppedFood = [];
let food = null;
let lastTime = performance.now();
let dragState = null;

let camAz = 0, camPol = Math.PI / 2 - 0.45, camDist = 22;
let camTargetAz = camAz, camTargetPol = camPol, camTargetDist = camDist;
let idleTime = 0;
let targetFov = 58;

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
  enemies.forEach(e => world.remove(e.object3D));
  enemies = [];

  resetGameState();

  const startPos = new THREE.Vector3((Math.random() - 0.5) * 40, 0.5, (Math.random() - 0.5) * 40);
  const startDir = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();

  snake = new Snake({
    sphereRadius: 50,
    segmentLength: 0.5,
    initialSegments: 12,
    radius: 0.4,
    taper: 0.55,
    speed: 4.5
  });
  snake.setHeading(startPos, startDir);
  world.add(snake.object3D);

  food = new Food(50);
  food.spawn(snake.headPosition());
  world.add(food.group);

  updateHUD();
}

function startGame() {
  audio.init();
  initGame();
  gameState.playing = true;
  gameState.over = false;
  $overlay.classList.add("hidden");
  document.body.classList.add("playing");
}


function triggerStageChange() {
  gameState.stage++;
  gameState.nextStageScore += 50; // Every 5 foods (50 points) is a new stage
  
  // Violent screen crack effect
  flashScreen();
  document.body.style.animation = "shake 0.6s"; 
  setTimeout(() => document.body.style.animation = "", 600);

  // Massive neon center-screen announcement
  const ann = document.getElementById("stage-announce");
  if (ann) {
    ann.textContent = "STAGE " + gameState.stage;
    ann.style.animation = "stagePop 2s forwards";
  }

  // Shift the world's neon palette
  const colors = [0x22e6ff, 0xffaa00, 0xff2fd0, 0x8a5cff, 0xff0000, 0x00ff00];
  const c = colors[Math.min(gameState.stage - 1, colors.length - 1)];
  envRefs.wire.material.color.setHex(c);
  envRefs.atmo.material.uniforms.uColor.value.setHex(c);
  envRefs.rings.forEach(r => r.material.color.setHex(c));

  // Spawn AI at Stage 3
  if (gameState.stage === 3 && enemies.length === 0) {
    spawnRival();
  }
  // Spawn second AI at Stage 5
  if (gameState.stage === 5 && enemies.length === 1) {
    spawnRival();
  }
}

function spawnRival() {
  const ePos = new THREE.Vector3((Math.random() - 0.5) * 80, 0.5, (Math.random() - 0.5) * 80);
  
  // Spawn them far away from the player
  if (snake && ePos.distanceTo(snake.headPosition()) < 50 * 0.8) {
      ePos.negate(); 
  }

  const newEnemy = new EnemySnake({
    sphereRadius: 50, segmentLength: 0.5, initialSegments: 15,
    radius: 0.45, taper: 0.55, speed: 4.8
  });
  
  newEnemy.hue = 0.0;
  newEnemy.headGlow.material.color.setHex(0xff0000);
  newEnemy.setHeading(ePos, new THREE.Vector3(1, 0, 0));
  world.add(newEnemy.object3D);
  enemies.push(newEnemy);
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
  audio.die();
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
  
  // Auto-align camera behind the snake
  if (snake && !dragState && idleTime > 1.0) {
    const targetAz = Math.atan2(snake.headDir.x, snake.headDir.z) + Math.PI;
    let diff = targetAz - camTargetAz;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    camTargetAz += diff * 3.0 * dt; // Fast alignment for racing feel
  }

  const k = 1 - Math.exp(-10 * dt);
  camAz   += (camTargetAz   - camAz)   * k;
  camPol  += (camTargetPol  - camPol)  * k;
  camDist += (camTargetDist - camDist) * k;

  const targetPos = snake ? snake.headPos.clone() : new THREE.Vector3(0, 0, 0);
  const sp = Math.sin(camPol);
  
  const offset = new THREE.Vector3(
    sp * Math.cos(camAz) * camDist,
    Math.cos(camPol) * camDist,
    sp * Math.sin(camAz) * camDist
  );

  // Smooth camera tracking
  camera.position.lerp(targetPos.clone().add(offset), 1 - Math.exp(-8 * dt));
  
  // Look far ahead into the horizon
  const lookTarget = targetPos.clone();
  if (snake) lookTarget.add(snake.headDir.clone().multiplyScalar(15));
  lookTarget.y += 2;
  camera.lookAt(lookTarget);
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
  camTargetAz -= dx * 0.008;
  camTargetPol = THREE.MathUtils.clamp(camTargetPol - dy * 0.008, 0.05, Math.PI - 0.05);
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
    50 * 1.2,
    50 * 4.0
  );
}, { passive: false });
canvas.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("visibilitychange", () => {
  if (document.hidden && gameState.playing) pauseGame();
});


function checkBodyHit(headPos, targetSnake) {
  const threshold = (0.4 + 0.45) * 1.2;
  const skip = 10;
  for (let s = skip; s < targetSnake.segCount; s++) {
    if (targetSnake.segments[s].visible && headPos.distanceTo(targetSnake.segments[s].position) < threshold) {
      return s;
    }
  }
  return -1;
}


function enemyDeathDrop(enemy, hitIndex) {
  // Scatter food orbs from the severed pieces
  const dropCount = Math.floor(enemy.segCount / 2);
  for (let i = 0; i < dropCount; i++) {
    const p = enemy.segments[hitIndex + i]?.position;
    if (p) {
      const newFood = new Food(50);
      newFood.pos.copy(p);
      newFood.core.material.color.setHex(0xff0000);
      newFood.glow.material.color.setHex(0xff0000);
      world.add(newFood.group);
      // We will push these to a temporary array and handle them in the loop
      droppedFood.push(newFood);
    }
  }
}

function handleBite(biter, bitten, hitIndex) {
  // If the biter is smaller or equal, the biter dies.
  if (biter.segCount <= bitten.segCount) {
    if (biter !== snake) {
      const idx = enemies.indexOf(biter);
      if (idx !== -1) { 
        enemyDeathDrop(biter, 0);
        world.remove(biter.object3D); 
        enemies.splice(idx, 1); 
        respawnTimers.push(3.0); // Respawn in 3 seconds
      }
    }
    return false; // If biter is player, this returns false and triggers gameOver
  }

  // Biter is larger. Bitten splits.
  const severedLength = bitten.segCount - hitIndex;
  bitten.targetSegCount = hitIndex;
  bitten.segCount = hitIndex;

  if (severedLength < 5) return true;

  const spawnPos = bitten.segments[hitIndex].position.clone();
  const spawnDir = bitten.segments[hitIndex].position.clone().sub(bitten.segments[hitIndex+1].position).normalize();

  const spawnEnemy = (length, dir) => {
    const newEnemy = new EnemySnake({
      sphereRadius: 50, segmentLength: 0.5, initialSegments: length,
      radius: 0.45, taper: 0.55, speed: 4.8
    });
    newEnemy.setHeading(spawnPos, dir);
    newEnemy.hue = 0.0;
    newEnemy.headGlow.material.color.setHex(0xff0000);
    world.add(newEnemy.object3D);
    enemies.push(newEnemy);
  };

  // HYRDA RULE: If the bitten snake is at least double the biter's length, split the severed part into two enemies
  if (bitten.segCount > biter.segCount * 2) {
    spawnEnemy(severedLength / 2, spawnDir);
    spawnEnemy(severedLength / 2, spawnDir.clone().negate());
  } else {
    spawnEnemy(severedLength, spawnDir);
  }
  return true;
}


// ── MINIMAP LOGIC ──────────────────────────────────────────────────────────
const mapCanvas = document.getElementById("minimap");
const mapCtx = mapCanvas.getContext("2d");

function drawMinimap() {
  if (!mapCtx || !gameState.playing || !snake) return;
  const w = mapCanvas.width;
  const h = mapCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const scale = w / 120; // Show 120x120 area

  mapCtx.clearRect(0, 0, w, h);
  mapCtx.fillStyle = "rgba(10, 2, 30, 0.8)";
  mapCtx.fillRect(0, 0, w, h);
  mapCtx.strokeStyle = "rgba(34, 230, 255, 0.3)";
  mapCtx.strokeRect(0, 0, w, h);

  const pX = snake.headPos.x;
  const pZ = snake.headPos.z;

  const drawDot = (x, z, color, size) => {
    const dx = (x - pX) * scale;
    const dz = (z - pZ) * scale;
    mapCtx.fillStyle = color;
    mapCtx.shadowColor = color;
    mapCtx.shadowBlur = 5;
    mapCtx.beginPath(); mapCtx.arc(cx + dx, cy + dz, size, 0, Math.PI * 2); mapCtx.fill();
  };

  if (food) drawDot(food.pos.x, food.pos.z, "#ff2fd0", 3);
  droppedFood.forEach(df => drawDot(df.pos.x, df.pos.z, "#ff0000", 2));
  enemies.forEach(e => drawDot(e.headPos.x, e.headPos.z, "#ff0000", 4));
  drawDot(pX, pZ, "#44ff88", 4);

  // Directional line
  mapCtx.strokeStyle = "#44ff88";
  mapCtx.lineWidth = 2;
  mapCtx.beginPath();
  mapCtx.moveTo(cx, cy);
  mapCtx.lineTo(cx + snake.headDir.x * 15, cy + snake.headDir.z * 15);
  mapCtx.stroke();
  mapCtx.shadowBlur = 0;
}

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
      snake.bite();
      
      if (food.type === "shield") {
        snake.hasShield = 5.0; // 5 seconds of shield
        audio.powerup();
      } else if (food.type === "magnet") {
        snake.hasMagnet = 5.0;
        audio.powerup();
      } else {
        addScore(10);
        snake.grow(2);
        audio.eat();
      }
      
      food.spawn(snake.headPosition());
      flashScreen();
      updateHUD();
      
      if (gameState.score >= gameState.nextStageScore) {
        triggerStageChange();
      }
    }

    // Tick Powerup Timers
    if (snake.hasShield > 0) snake.hasShield -= dt;
    if (snake.hasMagnet > 0) snake.hasMagnet -= dt;
    
    // Magnet Pull effect
    if (snake.hasMagnet > 0) {
      const dist = food.pos.distanceTo(snake.headPosition());
      if (dist < 10) {
        food.pos.lerp(snake.headPosition(), 5 * dt);
      }
    }

    
    if (snake.checkSelfCollision()) gameOver();

    // Handle Respawn Timers
    for (let i = respawnTimers.length - 1; i >= 0; i--) {
      respawnTimers[i] -= dt;
      if (respawnTimers[i] <= 0) {
        spawnRival();
        respawnTimers.splice(i, 1);
      }
    }

    // Enemy AI Logic (Array-based for multiple enemies)
    let playerDied = false;
    
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      
      // Smarter AI: Target food, but if player is close, target player!
      let targetPos = food.pos;
      if (snake.headPosition().distanceTo(enemy.headPosition()) < 5.0) {
        targetPos = snake.headPosition();
      }

      enemy.speed = 4.5 + Math.min(gameState.stage * 0.2, 3.0);
      enemy.updateAI(dt, targetPos, false);
      
      // Enemy eats food
      if (food.checkEaten(enemy.headPosition())) {
        enemy.grow(2);
        enemy.bite();
        food.spawn(enemy.headPosition());
      }

      // Enemy hits itself
      if (enemy.checkSelfCollision()) {
        enemyDeathDrop(enemy, 10);
        world.remove(enemy.object3D);
        enemies.splice(i, 1);
        respawnTimers.push(2.0);
        continue;
      }

      // HEAD-TO-HEAD COLLISION
      if (snake.headPosition().distanceTo(enemy.headPosition()) < 1.2) {
         if (snake.segCount > enemy.segCount) {
             enemyDeathDrop(enemy, 10);
             world.remove(enemy.object3D); enemies.splice(i, 1);
             respawnTimers.push(3.0);
         } else if (snake.hasShield > 0) { /* Ignore damage */ } else if (snake.segCount < enemy.segCount) {
             playerDied = true; break;
         } else {
             enemyDeathDrop(enemy, 10);
             world.remove(enemy.object3D); enemies.splice(i, 1);
             playerDied = true; break;
         }
         continue;
      }

      // PLAYER HEAD HITS ENEMY BODY
      const hitEnemyBody = checkBodyHit(snake.headPosition(), enemy);
      if (hitEnemyBody !== -1) {
          const survived = handleBite(snake, enemy, hitEnemyBody);
          if (!survived) { playerDied = true; break; }
          continue;
      }

      // ENEMY HEAD HITS PLAYER BODY
      const hitPlayerBody = checkBodyHit(enemy.headPosition(), snake);
      if (hitPlayerBody !== -1) {
          handleBite(enemy, snake, hitPlayerBody);
          continue;
      }
    }

    if (playerDied) { gameOver(); return; }

    // Handle Dropped Food Magnet & Consumption
    for (let i = droppedFood.length - 1; i >= 0; i--) {
      const df = droppedFood[i];
      df.update(dt);
      // Magnet effect
      const dist = df.pos.distanceTo(snake.headPosition());
      if (dist < 3.0) {
        df.pos.lerp(snake.headPosition(), 10 * dt);
      }
      if (df.checkEaten(snake.headPosition())) {
        addScore(5);
        snake.grow(1);
        snake.bite();
        world.remove(df.group);
        droppedFood.splice(i, 1);
        updateHUD();
        flashScreen();
      }
    }
  }

  if (food) food.update(dt);
  enemies.forEach(e => e.updateSegments());

  /* right-stick / Q-E orbit — continuous velocity while deflected */
  {
    const o = getOrbit();
    if (o.x !== 0 || o.y !== 0) {
      camTargetAz -= o.x * 3.5 * dt;
      camTargetPol = THREE.MathUtils.clamp(
        camTargetPol - o.y * 3.0 * dt,
        0.05, Math.PI - 0.05
      );
      idleTime = 0;
    }
  }

  updateCamera(dt);

  // Pulse the neon grid
  if (envRefs.wire) {
    envRefs.wire.material.opacity = 0.5 + 0.2 * Math.sin(gameState.time * 2.0);
  }

  drawMinimap();
  // Animate environment
  gameState.time += dt;
  if (envRefs.rings) {
    envRefs.rings.forEach((r, i) => {
      r.rotation.z += dt * (0.5 + i * 0.2);
      r.rotation.x += dt * 0.1;
    });
  }
  if (envRefs.wire) {
    envRefs.wire.rotation.y += dt * 0.02;
  }

  // Endless World: Recycle pillars
  if (snake) {
    pillars.forEach(p => {
      const dist = p.mesh.position.distanceTo(snake.headPos);
      if (dist > 200) {
        // Teleport the pillar ahead of the player
        p.mesh.position.x = snake.headPos.x + (Math.random() - 0.5) * 250;
        p.mesh.position.z = snake.headPos.z + (Math.random() - 0.5) * 250;
      }
    });
    // Snap the grid to the player to create an illusion of infinite movement
    envRefs.wire.position.x = Math.floor(snake.headPos.x / 10) * 10;
    envRefs.wire.position.z = Math.floor(snake.headPos.z / 10) * 10;
  }

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

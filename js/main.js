import * as THREE from "../three/three.module.js";
import { scene, camera, renderer, resizeRenderer, world, updateCamera } from "./render/scene.js";
import { state as snakeState, updateSnake, growSnake, getHeadPosition, setDirection } from "./game/snake.js";
import { state, resetGameState } from "./game/gameState.js";
import { buildRoom, clearRoom } from "./game/room.js";
import { spawnFood, checkFoodCollision, removeFood } from "./game/food.js";
import { initTouchControls, getDirectionVector } from "./input/touchControls.js";
import { spawnSmoothEggSnake } from "./game/eggSnakeMorph.js";

/* HUD */
const hud = document.getElementById("hud");
function updateHUD() {
  hud.textContent = `Bites: ${state.bites} | Room: ${state.room}`;
}

/* RESET GAME */
function resetGame() {
  clearRoom(world);
  resetGameState();
  buildRoom(world);
  spawnFood(world);
  updateHUD();
}

/* SETUP */
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", resizeRenderer);
initTouchControls();

/* START WITH EGG */
spawnSmoothEggSnake((snakeMesh)=>{
  resetGame();

  let lastTime = performance.now();
  const baseSpeed = 2;
  const speedIncrement = 0.05;

  function gameLoop(now){
    requestAnimationFrame(gameLoop);
    const delta = (now-lastTime)/1000;
    lastTime=now;

    if(!state.alive){
      resetGame();
      return;
    }

    snakeState.speed = baseSpeed + now/1000*speedIncrement;

    const dir = getDirectionVector();
    setDirection(dir);

    updateSnake(delta);

    const headPos = getHeadPosition();

    if(checkFoodCollision(headPos)){
      growSnake();
      removeFood(world);
      spawnFood(world);
      updateHUD();
    }

    updateCamera(delta);

    renderer.render(scene,camera);
  }

  requestAnimationFrame(gameLoop);
});
/// restartMenu.js
/// Interactive restart / continue menu for Hyper-Worm
/// Made by CCVO - CanC-Code

import { restartGame } from "./restart.js";
import { state as gameState } from "./gameState.js";

let menuContainer = null;
let continueTimeout = null;

export function showRestartMenu(scene) {
  if (menuContainer) menuContainer.remove();
  
  menuContainer = document.createElement("div");
  menuContainer.id = "restart-menu";
  menuContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(10, 10, 26, 0.95);
    border: 2px solid #00ff88;
    border-radius: 12px;
    padding: 24px;
    color: #00ff88;
    font-family: monospace;
    text-align: center;
    z-index: 100;
  `;
  
  menuContainer.innerHTML = `
    <h2>Game Over</h2>
    <button id="watch-ad" style="margin:10px;padding:8px 12px;">Watch Ad to Continue</button>
    <button id="restart-game" style="margin:10px;padding:8px 12px;">Restart Game</button>
    <div id="ad-countdown" style="margin-top:10px;"></div>
  `;
  
  document.body.appendChild(menuContainer);

  const watchBtn = document.getElementById("watch-ad");
  const restartBtn = document.getElementById("restart-game");
  const countdownDiv = document.getElementById("ad-countdown");

  watchBtn.onclick = () => {
    watchBtn.disabled = true;
    let seconds = 5;
    countdownDiv.textContent = `Ad placeholder: ${seconds}s remaining...`;
    continueTimeout = setInterval(() => {
      seconds--;
      countdownDiv.textContent = `Ad placeholder: ${seconds}s remaining...`;
      if (seconds <= 0) {
        clearInterval(continueTimeout);
        hideRestartMenu();
        continueGame(scene);
      }
    }, 1000);
  };

  restartBtn.onclick = () => {
    hideRestartMenu();
    restartGame(scene);
  };
}

export function hideRestartMenu() {
  if (menuContainer) {
    menuContainer.remove();
    menuContainer = null;
  }
}

function continueGame(scene) {
  // Continue without resetting score or room
  gameState.alive = true;
  gameState.bites = Math.max(0, gameState.bites - 1); // optional tweak
  // Respawn food and rebuild door if needed
  import("./food.js").then(({ spawnFood }) => spawnFood(scene, gameState.roomSize));
  import("./door.js").then(({ spawnDoor }) => {
    if (gameState.doorOpen) spawnDoor(scene, gameState.roomSize);
  });
  console.log("Game continued after placeholder ad");
}
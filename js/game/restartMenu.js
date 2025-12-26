/// restartMenu.js
/// Interactive restart menu for Hyper-Worm
/// CCVO / CanC-Code

export function showRestartMenu(scene, snake = null) {
  let menu = document.getElementById("restart-menu");
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "restart-menu";
    menu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(10,10,26,0.95);
      border: 2px solid #00ff88;
      border-radius: 12px;
      padding: 20px 30px;
      color: #00ff88;
      font-family: monospace;
      text-align: center;
      z-index: 999;
      backdrop-filter: blur(10px);
    `;
    document.body.appendChild(menu);
  }

  menu.innerHTML = `
    <div>💀 You hit a wall!</div>
    <button id="watch-ad-btn">Watch Ad to Continue</button>
    <button id="restart-btn">Restart Game</button>
  `;
  menu.style.display = "block";

  // Watch ad simulation
  document.getElementById("watch-ad-btn").onclick = () => {
    menu.innerHTML = "<div>📺 Watching ad...</div>";
    setTimeout(() => {
      menu.style.display = "none";
      if (snake) snake.reset(); // reset snake position
      window.restartGame();
    }, 5000);
  };

  // Restart button
  document.getElementById("restart-btn").onclick = () => {
    menu.style.display = "none";
    window.restartGame();
  };
}
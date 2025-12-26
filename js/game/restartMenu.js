/// restartMenu.js
/// Display interactive restart menu
/// CCVO / CanC-Code

export function showRestartMenu(callback) {
  let menu = document.getElementById("restart-menu");

  if (!menu) {
    menu = document.createElement("div");
    menu.id = "restart-menu";
    menu.style.position = "fixed";
    menu.style.top = "50%";
    menu.style.left = "50%";
    menu.style.transform = "translate(-50%, -50%)";
    menu.style.padding = "20px 30px";
    menu.style.background = "rgba(10, 10, 26, 0.9)";
    menu.style.border = "2px solid #00ff88";
    menu.style.borderRadius = "10px";
    menu.style.color = "#00ff88";
    menu.style.fontFamily = "Courier New, monospace";
    menu.style.fontSize = "18px";
    menu.style.textAlign = "center";
    menu.style.zIndex = "100";
    menu.style.boxShadow = "0 4px 20px rgba(0,255,136,0.3)";
    document.body.appendChild(menu);
  }

  menu.innerHTML = `
    <p>Game Over 🐍</p>
    <button id="restart-button">Restart</button>
    <p style="margin-top:10px;">Or <button id="ad-button">Watch Ad to Continue</button></p>
  `;

  const restartBtn = document.getElementById("restart-button");
  const adBtn = document.getElementById("ad-button");

  restartBtn.onclick = () => {
    menu.remove();
    callback();
  };

  adBtn.onclick = () => {
    adBtn.disabled = true;
    adBtn.textContent = "Watching ad...";
    // Simulate ad duration
    setTimeout(() => {
      menu.remove();
      callback();
    }, 5000); // 5 seconds
  };
}
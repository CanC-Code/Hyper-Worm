let menuEl = null;

export function showRestartMenu(titleHTML, bodyHTML, btnText, onAction) {
  if (!menuEl) {
    menuEl = document.createElement("div");
    menuEl.id = "restart-menu";
    menuEl.style.cssText = "position:fixed;inset:0;z-index:20;display:flex;align-items:center;" +
      "justify-content:center;padding:24px;" +
      "background:radial-gradient(circle at 50% 45%,rgba(20,0,50,.55),rgba(2,0,8,.88) 75%);" +
      "backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);" +
      "transition:opacity .3s ease,visibility .3s ease";
    menuEl.innerHTML = `
      <div class="panel" style="text-align:center;max-width:520px;width:100%">
        <h1 id="rm-title" style="margin:0 0 14px;font-size:clamp(26px,9vw,48px);" +
          "letter-spacing:.14em;font-weight:800;color:#fff;" +
          "text-shadow:0 0 8px #22e6ff,0 0 26px rgba(34,230,255,.8)"></h1>
        <p id="rm-body" style="margin:0 0 26px;font-size:clamp(12px,3.6vw,15px);" +
          "line-height:1.7;letter-spacing:.08em;opacity:.75"></p>
        <button id="rm-btn" style="appearance:none;padding:15px 44px;font:inherit;" +
          "font-size:clamp(14px,4.2vw,17px);letter-spacing:.28em;font-weight:700;color:#04121a;" +
          "background:linear-gradient(180deg,#8ff4ff,#22e6ff);border:none;border-radius:999px;" +
          "cursor:pointer;box-shadow:0 0 18px rgba(34,230,255,.7),0 0 50px rgba(34,230,255,.35)"></button>
      </div>`;
    document.body.appendChild(menuEl);
  }
  menuEl.querySelector("#rm-title").innerHTML = titleHTML;
  menuEl.querySelector("#rm-body").innerHTML  = bodyHTML;
  const btn = menuEl.querySelector("#rm-btn");
  btn.textContent = btnText;
  btn.onclick = onAction;
  menuEl.style.display = "flex";
  menuEl.style.opacity = "0";
  requestAnimationFrame(() => { menuEl.style.opacity = "1"; });
}

export function hideRestartMenu() {
  if (!menuEl) return;
  menuEl.style.opacity = "0";
  setTimeout(() => { menuEl.style.display = "none"; }, 300);
}

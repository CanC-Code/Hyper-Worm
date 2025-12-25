/// touchControls.js
/// Purpose: Touch and swipe input handling
/// Made by CCVO - CanC-Code

let startX = 0;
let startY = 0;
let active = false;

let direction = { x: 1, y: 0 };

export function initTouchControls() {
  window.addEventListener("touchstart", onStart, { passive: false });
  window.addEventListener("touchend", onEnd, { passive: false });

  // Desktop fallback (arrow keys)
  window.addEventListener("keydown", onKey);
}

function onStart(e) {
  if (e.touches.length !== 1) return;
  active = true;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}

function onEnd(e) {
  if (!active) return;
  active = false;

  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    direction = { x: dx > 0 ? 1 : -1, y: 0 };
  } else {
    direction = { x: 0, y: dy > 0 ? 1 : -1 };
  }
}

function onKey(e) {
  switch (e.key) {
    case "ArrowUp":    direction = { x: 0, y: -1 }; break;
    case "ArrowDown":  direction = { x: 0, y: 1 }; break;
    case "ArrowLeft":  direction = { x: -1, y: 0 }; break;
    case "ArrowRight": direction = { x: 1, y: 0 }; break;
  }
}

export function getDirectionVector() {
  return direction;
}
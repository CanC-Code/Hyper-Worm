/// touchControls.js
/// Purpose: touch input to control snake
/// Made by CCVO - CanC-Code

let touchStart = null;
let touchDelta = {x:0, y:0};

export function initTouchControls() {
  window.addEventListener("touchstart", e => {
    const t = e.touches[0];
    touchStart = { x:t.clientX, y:t.clientY };
  });
  window.addEventListener("touchmove", e => {
    const t = e.touches[0];
    if (!touchStart) return;
    touchDelta = {
      x: (t.clientX - touchStart.x)/100,
      y: (t.clientY - touchStart.y)/100
    };
  });
  window.addEventListener("touchend", e => {
    touchDelta = {x:0, y:0};
    touchStart = null;
  });
}

export function getDirectionVector() {
  return { x: touchDelta.x, y: touchDelta.y };
}
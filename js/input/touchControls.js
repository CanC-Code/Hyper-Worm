/// touchControls.js
/// Press-and-hold swipe steering input
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

let yawInput = 0;
let touchStart = null;

export function initTouchControls() {
  window.addEventListener("touchstart", (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener("touchmove", (e) => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    yawInput = dx * 0.002; // sensitivity factor
  });

  window.addEventListener("touchend", () => {
    touchStart = null;
    yawInput = 0;
  });
}

export function getYawInput() {
  return yawInput;
}
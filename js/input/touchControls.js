/// touchControls.js
/// Purpose: Dynamic press-and-hold swipe steering
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

// Current input vector
let currentDir = new THREE.Vector2(0, 0);
let touchStart = null;

export function initTouchControls() {
  window.addEventListener("touchstart", (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener("touchmove", (e) => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    const vec = new THREE.Vector2(dx, -dy); // swipe up = forward
    if (vec.length() > 0) vec.normalize();
    currentDir.copy(vec);
  });

  window.addEventListener("touchend", () => {
    // Keep currentDir to maintain last direction
    touchStart = null;
  });
}

// Called every frame
export function getDirectionVector() {
  // If no input, keep last direction
  if (currentDir.lengthSq() === 0) return new THREE.Vector2(0, 1);
  return currentDir.clone();
}
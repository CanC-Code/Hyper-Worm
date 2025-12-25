// Press-and-hold steering input
import * as THREE from "../../three/three.module.js";

let currentDir = new THREE.Vector2(0, 1);
let touchStart = null;

export function initTouchControls() {
  window.addEventListener("touchstart", (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener("touchmove", (e) => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    const vec = new THREE.Vector2(dx, -dy);
    if (vec.length() > 0) vec.normalize();
    currentDir.copy(vec);
  });

  window.addEventListener("touchend", () => { touchStart = null; });
}

export function getDirectionVector() { return currentDir.clone(); }
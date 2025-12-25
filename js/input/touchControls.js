/// touchControls.js
/// Press-and-hold steering (yaw only)
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

let steering = 0; // -1 (left) → +1 (right)
let touchStartX = null;

const MAX_STEER_PIXELS = 120; // swipe distance for full turn

export function initTouchControls() {
  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartX === null) return;

      const dx = e.touches[0].clientX - touchStartX;

      // Normalize to -1..1
      steering = THREE.MathUtils.clamp(
        dx / MAX_STEER_PIXELS,
        -1,
        1
      );
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    () => {
      touchStartX = null;
      steering = 0; // go straight when released
    },
    { passive: true }
  );
}

/**
 * Returns steering vector:
 * x = yaw input (-1..1)
 * y unused (reserved for future pitch/speed)
 */
export function getDirectionVector() {
  return new THREE.Vector2(steering, 0);
}
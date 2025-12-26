/// touchControls.js
/// Intuitive tap-and-hold steering for 3D runner - ENHANCED
/// Made by CCVO - CanC-Code

// Global input state exported for game loop
export const inputState = {
  turn: 0,      // -1 (left) to +1 (right)
  forward: false // For potential forward swipes
};

// Configuration
const SCREEN_DEAD_ZONE = 0.15; // % of screen for dead zone
const HOLD_TURN_SPEED = 1.0;
const SWIPE_TURN_SPEED = 2.5;

let touchActive = false;
let touchCenterX = 0;
let swipeMode = false;
let swipeStartTime = 0;

let mouseDown = false;
let mouseCenterX = 0;
let mouseStartTime = 0;

const keyState = { left: false, right: false };

export function initTouchControls() {
  // --- Touch Controls ---
  window.addEventListener("touchstart", (e) => {
    e.preventDefault();
    touchActive = true;
    swipeMode = false;
    swipeStartTime = Date.now();
    touchCenterX = e.touches[0].clientX;
    inputState.forward = true;
  });

  window.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!touchActive) return;

    const deltaX = e.touches[0].clientX - touchCenterX;
    const screenWidth = window.innerWidth;

    const elapsed = Date.now() - swipeStartTime;
    if (elapsed < 200 && Math.abs(deltaX) > 30) swipeMode = true;

    let normalized = deltaX / (screenWidth * 0.5);

    // Dead zone
    if (Math.abs(normalized) < SCREEN_DEAD_ZONE) inputState.turn = 0;
    else {
      const sign = normalized > 0 ? 1 : -1;
      const magnitude = (Math.abs(normalized) - SCREEN_DEAD_ZONE) / (1 - SCREEN_DEAD_ZONE);
      inputState.turn = sign * Math.min(magnitude * 1.5, 1.0);
    }
  });

  window.addEventListener("touchend", () => {
    touchActive = false;
    inputState.turn = 0;
    inputState.forward = false;
    swipeMode = false;
  });

  window.addEventListener("touchcancel", () => {
    touchActive = false;
    inputState.turn = 0;
    inputState.forward = false;
    swipeMode = false;
  });

  // --- Mouse Controls ---
  window.addEventListener("mousedown", (e) => {
    mouseDown = true;
    swipeMode = false;
    mouseStartTime = Date.now();
    mouseCenterX = e.clientX;
    inputState.forward = true;
  });

  window.addEventListener("mousemove", (e) => {
    if (!mouseDown) return;

    const deltaX = e.clientX - mouseCenterX;
    const screenWidth = window.innerWidth;

    const elapsed = Date.now() - mouseStartTime;
    if (elapsed < 200 && Math.abs(deltaX) > 30) swipeMode = true;

    let normalized = deltaX / (screenWidth * 0.5);

    if (Math.abs(normalized) < SCREEN_DEAD_ZONE) inputState.turn = 0;
    else {
      const sign = normalized > 0 ? 1 : -1;
      const magnitude = (Math.abs(normalized) - SCREEN_DEAD_ZONE) / (1 - SCREEN_DEAD_ZONE);
      inputState.turn = sign * Math.min(magnitude * 1.5, 1.0);
    }
  });

  window.addEventListener("mouseup", () => {
    mouseDown = false;
    inputState.turn = 0;
    inputState.forward = false;
    swipeMode = false;
  });

  // --- Keyboard Controls ---
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keyState.left = true;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keyState.right = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keyState.left = false;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keyState.right = false;
  });
}

// --- Call this inside your main game loop ---
export function updateInputState() {
  // Keyboard overrides if no touch/mouse input
  if (!touchActive && !mouseDown) {
    if (keyState.left) inputState.turn = -1.0;
    else if (keyState.right) inputState.turn = 1.0;
    else inputState.turn = 0;
  }
}

// --- Query functions ---
export function getTurnSpeed() {
  return swipeMode ? SWIPE_TURN_SPEED : HOLD_TURN_SPEED;
}
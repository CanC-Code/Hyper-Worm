/// touchControls.js
/// Intuitive tap-and-hold steering for 3D runner - ENHANCED
/// Made by CCVO - CanC-Code

let turnInput = 0; // -1 (left) to +1 (right)
let touchActive = false;
let touchCenterX = 0;
let swipeMode = false;
let swipeStartTime = 0;

const SCREEN_DEAD_ZONE = 0.15; // 15% dead zone in center
const HOLD_TURN_SPEED = 1.0; // Smooth gradual turns
const SWIPE_TURN_SPEED = 2.5; // Fast swipes

export function initTouchControls() {
  // Touch controls for mobile
  window.addEventListener("touchstart", (e) => {
    e.preventDefault();
    touchActive = true;
    touchCenterX = e.touches[0].clientX;
    swipeStartTime = Date.now();
    swipeMode = false;
  });

  window.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!touchActive) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchCenterX;
    const screenWidth = window.innerWidth;
    
    // Detect swipe vs hold
    const timeSinceStart = Date.now() - swipeStartTime;
    const absDelta = Math.abs(deltaX);
    
    if (timeSinceStart < 200 && absDelta > 30) {
      // Fast swipe detected
      swipeMode = true;
    }
    
    // Normalize to -1 to +1 range
    const normalizedDelta = deltaX / (screenWidth * 0.5);
    
    // Apply dead zone
    const deadZone = SCREEN_DEAD_ZONE;
    if (Math.abs(normalizedDelta) < deadZone) {
      turnInput = 0;
    } else {
      // Remove dead zone from calculation
      const sign = normalizedDelta > 0 ? 1 : -1;
      const magnitude = (Math.abs(normalizedDelta) - deadZone) / (1 - deadZone);
      turnInput = sign * Math.min(magnitude * 1.5, 1.0);
    }
  });

  window.addEventListener("touchend", () => {
    touchActive = false;
    turnInput = 0;
    swipeMode = false;
  });

  window.addEventListener("touchcancel", () => {
    touchActive = false;
    turnInput = 0;
    swipeMode = false;
  });

  // Mouse controls for desktop (tap and hold)
  let mouseDown = false;
  let mouseCenterX = 0;
  let mouseStartTime = 0;

  window.addEventListener("mousedown", (e) => {
    mouseDown = true;
    mouseCenterX = e.clientX;
    mouseStartTime = Date.now();
    swipeMode = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!mouseDown) return;
    
    const currentX = e.clientX;
    const deltaX = currentX - mouseCenterX;
    const screenWidth = window.innerWidth;
    
    // Detect swipe vs hold
    const timeSinceStart = Date.now() - mouseStartTime;
    const absDelta = Math.abs(deltaX);
    
    if (timeSinceStart < 200 && absDelta > 30) {
      swipeMode = true;
    }
    
    const normalizedDelta = deltaX / (screenWidth * 0.5);
    
    const deadZone = SCREEN_DEAD_ZONE;
    if (Math.abs(normalizedDelta) < deadZone) {
      turnInput = 0;
    } else {
      const sign = normalizedDelta > 0 ? 1 : -1;
      const magnitude = (Math.abs(normalizedDelta) - deadZone) / (1 - deadZone);
      turnInput = sign * Math.min(magnitude * 1.5, 1.0);
    }
  });

  window.addEventListener("mouseup", () => {
    mouseDown = false;
    turnInput = 0;
    swipeMode = false;
  });

  // Keyboard controls (A/D or Arrow keys)
  const keyState = { left: false, right: false };
  
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      keyState.left = true;
      e.preventDefault();
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      keyState.right = true;
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      keyState.left = false;
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      keyState.right = false;
    }
  });

  // Update turn input from keyboard
  setInterval(() => {
    if (!touchActive && !mouseDown) {
      if (keyState.left) turnInput = -1.0;
      else if (keyState.right) turnInput = 1.0;
      else if (!keyState.left && !keyState.right) turnInput = 0;
    }
  }, 16);
}

export function getTurnInput() {
  return turnInput;
}

export function getTurnSpeed() {
  return swipeMode ? SWIPE_TURN_SPEED : HOLD_TURN_SPEED;
}
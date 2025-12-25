/// touchControls.js
/// Press-and-hold swipe steering input with keyboard support - ENHANCED
/// Made by CCVO - CanC-Code

let yawInput = 0;
let touchStart = null;
let keyState = { left: false, right: false };

export function initTouchControls() {
  // Touch controls for mobile
  window.addEventListener("touchstart", (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Prevent scrolling
    if (!touchStart) return;
    
    const dx = e.touches[0].clientX - touchStart.x;
    const screenWidth = window.innerWidth;
    
    // Normalize to screen width for consistent feel across devices
    yawInput = (dx / screenWidth) * 4;
    
    // Clamp to reasonable values
    yawInput = Math.max(-1.5, Math.min(1.5, yawInput));
  });

  window.addEventListener("touchend", () => {
    touchStart = null;
    yawInput = 0;
  });

  window.addEventListener("touchcancel", () => {
    touchStart = null;
    yawInput = 0;
  });

  // Keyboard controls for desktop
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

  // Mouse drag controls for desktop
  let mouseDown = false;
  let mouseStartX = 0;

  window.addEventListener("mousedown", (e) => {
    mouseDown = true;
    mouseStartX = e.clientX;
  });

  window.addEventListener("mousemove", (e) => {
    if (!mouseDown) return;
    
    const dx = e.clientX - mouseStartX;
    const screenWidth = window.innerWidth;
    yawInput = (dx / screenWidth) * 4;
    yawInput = Math.max(-1.5, Math.min(1.5, yawInput));
  });

  window.addEventListener("mouseup", () => {
    mouseDown = false;
    yawInput = 0;
  });
}

export function getYawInput() {
  // Combine keyboard and touch/mouse input
  let input = yawInput;
  
  if (keyState.left) input -= 1.0;
  if (keyState.right) input += 1.0;
  
  return input;
}
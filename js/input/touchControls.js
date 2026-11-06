/// touchControls.js — dual thumbsticks + keyboard
/// CCVO — CanC-Code

export const inputState = {
  steer: 0, orbitX: 0, orbitY: 0, boost: false,
  keyLeft: false, keyRight: false, keyBoost: false,
  
};

const DZ = 0.08;

function stick(base, knob, cb) {
  let id = null, maxR = 1;
  const measure = () => { maxR = Math.max(1, (base.clientWidth - knob.clientWidth) / 2); };
  measure();
  window.addEventListener("resize", measure);

  const move = (e) => {
    const r = base.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > maxR) { const k = maxR / d; dx *= k; dy *= k; }
    knob.style.transition = "none";
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    cb(dx / maxR, dy / maxR);
  };

  base.addEventListener("pointerdown", (e) => {
    if (id !== null) return;
    e.preventDefault();
    id = e.pointerId;
    base.setPointerCapture(id);
    base.classList.add("active");
    move(e);
    if (navigator.vibrate) navigator.vibrate(6);
  });

  base.addEventListener("pointermove", (e) => {
    if (e.pointerId === id) move(e);
  });

  const end = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    base.classList.remove("active");
    knob.style.transition = "transform .22s cubic-bezier(.2,1.3,.4,1)";
    knob.style.transform = "translate(0px, 0px)";
    cb(0, 0);
  };
  base.addEventListener("pointerup", end);
  base.addEventListener("pointercancel", end);
  base.addEventListener("contextmenu", (e) => e.preventDefault());
}

export function initTouchControls() {
  const $ = (id) => document.getElementById(id);
  const lb = $("stick-left-base"), lk = $("stick-left-knob");
  const rb = $("stick-right-base"), rk = $("stick-right-knob");
  const bb = $("btn-boost");

  if (lb && lk) stick(lb, lk, (x) => { inputState.steer = x; });
  

  if (bb) {
    const on = (e) => {
      e.preventDefault(); e.stopPropagation();
      inputState.boost = true;
      bb.classList.add("active");
      if (navigator.vibrate) navigator.vibrate(12);
    };
    const off = (e) => {
      e.preventDefault(); e.stopPropagation();
      inputState.boost = false;
      bb.classList.remove("active");
    };
    bb.addEventListener("pointerdown", on);
    bb.addEventListener("pointerup", off);
    bb.addEventListener("pointercancel", off);
    bb.addEventListener("pointerleave", off);
    bb.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  const km = { ArrowLeft: "keyLeft", a: "keyLeft", ArrowRight: "keyRight", d: "keyRight" };

  window.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (km[k]) inputState[km[k]] = true;
    if (e.key === "Shift" || e.key === " ") { inputState.keyBoost = true; e.preventDefault(); }
  });

  window.addEventListener("keyup", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (km[k]) inputState[km[k]] = false;
    if (e.key === "Shift" || e.key === " ") inputState.keyBoost = false;
  });

  window.addEventListener("blur", () => {
    inputState.steer = inputState.orbitX = inputState.orbitY = 0;
    inputState.boost = inputState.keyBoost = false;
    inputState.keyLeft = inputState.keyRight = false;
    document.querySelectorAll(".stick-zone.active, .boost-btn.active").forEach((el) => el.classList.remove("active"));
    document.querySelectorAll(".stick-knob").forEach((el) => {
      el.style.transition = "transform .22s";
      el.style.transform = "translate(0px, 0px)";
    });
  });
}

export function getSteer() {
  if (inputState.keyLeft) return -1;
  if (inputState.keyRight) return 1;
  const s = inputState.steer, a = Math.abs(s);
  if (a < DZ) return 0;
  const sign = s < 0 ? -1 : 1;
  return sign * (a - DZ) / (1 - DZ);
}

export function getBoost() {
  return inputState.boost || inputState.keyBoost;
}

export function getOrbit() {
  let x = inputState.orbitX, y = inputState.orbitY;
  if (inputState.keyOrbitL) x = -1;
  if (inputState.keyOrbitR) x = 1;
  return { x, y };
}

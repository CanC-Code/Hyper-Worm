/// snake.js
/// Core snake logic: movement, growth, heading, and mesh
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export const state = {
  mesh: null,        // main snake mesh (head)
  segments: [],      // additional segments
  speed: 2,
  direction: new THREE.Vector3(0, 0, 1), // initially forward along Z
  turnRate: Math.PI, // radians per second
};

/* ---------- Initialize snake from mesh ---------- */
export function initSnakeFromMesh(mesh) {
  state.mesh = mesh;
  state.mesh.position.set(0, 0.5, 0);
  state.segments = [];
}

/* ---------- Update snake each frame ---------- */
export function updateSnake(delta) {
  if (!state.mesh) return;

  // Move forward
  const moveDelta = state.direction.clone().multiplyScalar(state.speed * delta);
  state.mesh.position.add(moveDelta);

  // Update segments to follow head
  let prevPos = state.mesh.position.clone();
  for (let seg of state.segments) {
    const diff = prevPos.clone().sub(seg.position);
    if (diff.length() > 0.3) {
      seg.position.add(diff.multiplyScalar(0.2));
    }
    prevPos = seg.position.clone();
  }
}

/* ---------- Grow snake ---------- */
export function growSnake() {
  if (!state.mesh) return;

  const lastPos = state.segments.length > 0
    ? state.segments[state.segments.length - 1].position.clone()
    : state.mesh.position.clone().sub(state.direction.clone().multiplyScalar(0.5));

  const geo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12);
  const mat = new THREE.MeshStandardMaterial({ color: 0x88ffcc, metalness: 0.6, roughness: 0.4 });
  const seg = new THREE.Mesh(geo, mat);
  seg.rotation.x = Math.PI / 2;
  seg.position.copy(lastPos);
  state.segments.push(seg);
  state.mesh.parent.add(seg);
}

/* ---------- Get head position ---------- */
export function getHeadPosition() {
  return state.mesh ? state.mesh.position.clone() : new THREE.Vector3();
}

/* ---------- Set heading from input ---------- */
export function setDirection(vec2) {
  if (!state.mesh) return;
  if (vec2.length() === 0) return;

  // Convert input vector to yaw rotation
  const targetAngle = Math.atan2(vec2.x, vec2.y);
  const currentAngle = Math.atan2(state.direction.x, state.direction.z);
  let deltaAngle = targetAngle - currentAngle;

  // Keep within [-PI, PI]
  while (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
  while (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

  // Apply turn rate
  const maxTurn = state.turnRate * 0.016; // 60fps approx
  deltaAngle = THREE.MathUtils.clamp(deltaAngle, -maxTurn, maxTurn);

  const newAngle = currentAngle + deltaAngle;
  state.direction.set(Math.sin(newAngle), 0, Math.cos(newAngle));
  state.direction.normalize();

  // Rotate head mesh to face direction
  state.mesh.rotation.y = newAngle;
}
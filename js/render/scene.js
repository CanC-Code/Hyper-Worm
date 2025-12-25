/// scene.js
/// Purpose: Three.js scene, camera, renderer, lighting, world group
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

// Scene
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// World group (everything rotates as a unit)
export const world = new THREE.Group();
scene.add(world);

// Perspective camera
export const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 5, -10);
camera.lookAt(0, 0, 0);

// Renderer
export const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 0.6);
directional.position.set(10, 20, 10);
scene.add(directional);

// Resize handler
export function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Camera follow update
export function updateCamera(headPosition, snakeDirection) {
  const offset = new THREE.Vector3(0, 5, -10); // behind and above
  const lookAt = headPosition.clone();

  // Rotate offset to align with snake direction
  const dirAngle = Math.atan2(snakeDirection.y, snakeDirection.x);
  const rotatedOffset = offset.clone().applyAxisAngle(new THREE.Vector3(0,1,0), -dirAngle);

  camera.position.copy(headPosition.clone().add(rotatedOffset));
  camera.lookAt(lookAt);
}

// User drag rotation
let isDragging = false;
let prevX = 0;

export function initWorldDragControls() {
  // Mouse
  window.addEventListener("mousedown", e => { isDragging = true; prevX = e.clientX; });
  window.addEventListener("mouseup", () => { isDragging = false; });
  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevX;
    world.rotation.y += deltaX * 0.005;
    prevX = e.clientX;
  });

  // Touch
  window.addEventListener("touchstart", e => { if(e.touches.length===1){ isDragging=true; prevX=e.touches[0].clientX; }});
  window.addEventListener("touchend", () => { isDragging=false; });
  window.addEventListener("touchmove", e => {
    if (!isDragging || e.touches.length!==1) return;
    const deltaX = e.touches[0].clientX - prevX;
    world.rotation.y += deltaX * 0.005;
    prevX = e.touches[0].clientX;
  });
}
/// scene.js
/// Scene, renderer, lighting, camera, and world - ENHANCED
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

/* ---------- SCENE ---------- */
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.Fog(0x0a0a1a, 10, 35);

/* ---------- CAMERA ---------- */
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, -5);

/* ---------- RENDERER ---------- */
export const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

/* ---------- WORLD ROOT ---------- */
export const world = new THREE.Group();
scene.add(world);

/* ---------- ENHANCED LIGHTING ---------- */
// Ambient light for base illumination
const ambient = new THREE.AmbientLight(0x4466ff, 0.3);
scene.add(ambient);

// Main directional light (sun)
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 15, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 50;
sun.shadow.camera.left = -20;
sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;
sun.shadow.bias = -0.0001;
scene.add(sun);

// Rim light for depth
const rimLight = new THREE.DirectionalLight(0x6688ff, 0.4);
rimLight.position.set(-8, 10, -8);
scene.add(rimLight);

// Hemisphere light for natural lighting
const hemiLight = new THREE.HemisphereLight(0x4466ff, 0x223344, 0.5);
scene.add(hemiLight);

/* ---------- FLOOR (MASSIVE) ---------- */
const floorGeo = new THREE.PlaneGeometry(1000, 1000);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  roughness: 0.9,
  metalness: 0.1
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
floor.receiveShadow = true;
world.add(floor);

/* ---------- RESIZE ---------- */
export function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ---------- ENHANCED CAMERA FOLLOW ---------- */
let targetPosition = new THREE.Vector3();
let targetLookAt = new THREE.Vector3();

export function updateCamera(snakeHead, forwardVec) {
  const CAMERA_DISTANCE = 5.5; // Further back
  const CAMERA_HEIGHT = 3.5; // Higher up for better view
  const CAMERA_LERP = 0.06; // Even smoother following
  const LOOK_AHEAD = 4.0; // Look further ahead

  // Calculate desired camera position with side offset for better view
  const offset = forwardVec.clone().multiplyScalar(-CAMERA_DISTANCE);
  const rightVec = new THREE.Vector3().crossVectors(forwardVec, new THREE.Vector3(0, 1, 0));
  const sideOffset = rightVec.multiplyScalar(0.5); // Slight side offset
  
  targetPosition.copy(snakeHead.position)
    .add(offset)
    .add(sideOffset)
    .add(new THREE.Vector3(0, CAMERA_HEIGHT, 0));

  // Smoothly interpolate camera position
  camera.position.lerp(targetPosition, CAMERA_LERP);

  // Look ahead of the snake with slight upward tilt
  targetLookAt.copy(snakeHead.position)
    .add(forwardVec.clone().multiplyScalar(LOOK_AHEAD))
    .add(new THREE.Vector3(0, 1.0, 0)); // Look slightly above snake

  // Smooth look-at
  const currentLookAt = new THREE.Vector3();
  camera.getWorldDirection(currentLookAt);
  currentLookAt.multiplyScalar(10).add(camera.position);
  currentLookAt.lerp(targetLookAt, CAMERA_LERP * 1.5);
  
  camera.lookAt(currentLookAt);
}
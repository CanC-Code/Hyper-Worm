/// scene.js
/// Scene, renderer, lighting, camera, and world - ENHANCED
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

/* ---------- SCENE ---------- */
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.035); // Exponential fog for better depth

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

/* ---------- ENHANCED CAMERA FOLLOW - 3RD PERSON RUNNER ---------- */
let currentCameraOffset = new THREE.Vector3();
let currentLookTarget = new THREE.Vector3();

export function updateCamera(snakeHead, forwardVec) {
  // Runner-style camera: fixed behind snake
  const CAMERA_DISTANCE = 6.0; // Behind snake
  const CAMERA_HEIGHT = 2.5; // Above snake
  const CAMERA_LERP = 0.12; // Smooth but responsive
  const LOOK_AHEAD_DISTANCE = 5.0; // Look where we're going

  // Calculate camera position directly behind snake
  const backwardVec = forwardVec.clone().multiplyScalar(-CAMERA_DISTANCE);
  const upVec = new THREE.Vector3(0, CAMERA_HEIGHT, 0);
  
  const targetCameraPos = snakeHead.position.clone()
    .add(backwardVec)
    .add(upVec);

  // Smooth camera movement
  currentCameraOffset.lerp(targetCameraPos, CAMERA_LERP);
  camera.position.copy(currentCameraOffset);

  // Look ahead in the direction snake is moving
  const lookTarget = snakeHead.position.clone()
    .add(forwardVec.clone().multiplyScalar(LOOK_AHEAD_DISTANCE))
    .add(new THREE.Vector3(0, 0.5, 0)); // Slightly above ground

  // Smooth look target
  currentLookTarget.lerp(lookTarget, CAMERA_LERP);
  camera.lookAt(currentLookTarget);
}
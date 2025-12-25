/// scene.js
/// Scene, renderer, lighting, world container, and camera logic
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state as snakeState } from "../game/snake.js";

/* ---------- SCENE ---------- */

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 6, 60);

/* ---------- CAMERA ---------- */

export const camera = new THREE.PerspectiveCamera(
  85, // wide POV for snake vision
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

/* ---------- RENDERER ---------- */

export const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});

renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

/* ---------- WORLD ROOT ---------- */
/* EVERYTHING goes inside world */

export const world = new THREE.Group();
scene.add(world);

/* ---------- LIGHTING ---------- */

const ambient = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(8, 12, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

/* ---------- FLOOR ---------- */

const floorGeo = new THREE.PlaneGeometry(500, 500);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  roughness: 0.85,
  metalness: 0.15,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
world.add(floor);

/* ---------- RESIZE ---------- */

export function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ---------- CAMERA FOLLOW (SNAKE POV) ---------- */

export function updateCamera(delta) {
  if (!snakeState.mesh) return;

  const head = snakeState.mesh;
  const forward = snakeState.direction.clone().normalize();

  const CAMERA_DISTANCE = 3.5;
  const CAMERA_HEIGHT = 1.2;
  const CAMERA_LERP = 0.15;

  // Position camera behind snake along its direction
  const desiredPosition = head.position.clone()
    .add(forward.clone().multiplyScalar(-CAMERA_DISTANCE))
    .add(new THREE.Vector3(0, CAMERA_HEIGHT, 0));

  camera.position.lerp(desiredPosition, CAMERA_LERP);

  // Look ahead, not at the head
  const lookTarget = head.position.clone()
    .add(forward.clone().multiplyScalar(6));

  camera.lookAt(lookTarget);
}
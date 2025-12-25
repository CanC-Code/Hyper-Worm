/// scene.js
/// Purpose: Three.js scene setup with dynamic POV camera and 3D environment
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { OrbitControls } from "../../three/OrbitControls.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// World container
export const world = new THREE.Group();
scene.add(world);

// Lighting
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const ambLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambLight);

// Floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// Walls
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
const wallHeight = 5;
const wallLength = 50;

// Back wall
const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(wallLength, wallHeight, 1),
  wallMaterial
);
backWall.position.set(0, wallHeight / 2, -wallLength / 2);
scene.add(backWall);

// Front wall
const frontWall = backWall.clone();
frontWall.position.set(0, wallHeight / 2, wallLength / 2);
scene.add(frontWall);

// Left wall
const leftWall = new THREE.Mesh(
  new THREE.BoxGeometry(1, wallHeight, wallLength),
  wallMaterial
);
leftWall.position.set(-wallLength / 2, wallHeight / 2, 0);
scene.add(leftWall);

// Right wall
const rightWall = leftWall.clone();
rightWall.position.set(wallLength / 2, wallHeight / 2, 0);
scene.add(rightWall);

// Resize handler
export function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Dynamic POV camera follow behind the snake
let snakeOffset = new THREE.Vector3(0, 3, 6); // default behind & above

export function updateCamera(delta) {
  if (world.children.length === 0) return;

  // Assume the first child is snake root
  const snakeRoot = world.children.find(obj => obj.getObjectByName && obj.getObjectByName("Head"));
  if (!snakeRoot) return;

  const head = snakeRoot.getObjectByName("Head");
  if (!head) return;

  // Calculate camera position behind the head
  const behind = head.position.clone().sub(
    snakeOffset.clone().applyAxisAngle(new THREE.Vector3(0,1,0), head.rotation.y)
  );

  // Smooth camera movement
  camera.position.lerp(behind, 0.1);
  camera.lookAt(head.position);
}

// Optional: mouse drag to rotate world
let controls = null;
export function initWorldDragControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.target.set(0,0,0);
  controls.update();
}
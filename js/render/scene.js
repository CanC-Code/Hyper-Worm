import * as THREE from "../../three/three.module.js";
import { state as snakeState } from "../game/snake.js";

export const scene = new THREE.Scene();

// Add fog for depth
scene.fog = new THREE.Fog(0x000000, 5, 50);

export const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;

export const world = new THREE.Group();
scene.add(world);

/* ---------- LIGHTING ---------- */

// Ambient light for basic illumination
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// Directional light for shadows and depth
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

/* ---------- FLOOR ---------- */
const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.2 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

export function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ---------- Camera follows behind snake ---------- */
export function updateCamera(delta) {
  if (!snakeState.mesh) return;

  const offset = new THREE.Vector3(0, 1.5, -3);
  const desiredPos = snakeState.mesh.position.clone().add(offset);
  camera.position.lerp(desiredPos, 0.1);
  camera.lookAt(snakeState.mesh.position);
}
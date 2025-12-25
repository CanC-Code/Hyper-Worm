/// scene.js (enhanced floor & walls)
/// Procedural dungeon floor & wall textures for Hyper-Worm
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 6, 60);

export const camera = new THREE.PerspectiveCamera(
  85,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

export const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

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
// Use a grid texture for orientation
const floorSize = 500;
const floorDivisions = 50;

const gridHelper = new THREE.GridHelper(floorSize, floorDivisions, 0x00ff88, 0x008844);
gridHelper.position.y = 0.01; // slight offset to prevent z-fighting
world.add(gridHelper);

const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.85,
  metalness: 0.1,
  side: THREE.DoubleSide,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
world.add(floor);

/* ---------- WALLS ---------- */
// Simple procedural wall panels with subtle lines
const wallMat = new THREE.MeshStandardMaterial({
  color: 0x222244,
  roughness: 0.6,
  metalness: 0.2,
  side: THREE.BackSide,
});

const wallHeight = 6;
const wallWidth = 12;
const wallGeoH = new THREE.PlaneGeometry(wallWidth, wallHeight);
const wallGeoD = new THREE.PlaneGeometry(wallWidth, wallHeight);

// +Z wall
const wallFront = new THREE.Mesh(wallGeoH, wallMat);
wallFront.position.set(0, wallHeight / 2, wallWidth / 2);
wallFront.rotation.y = Math.PI;
world.add(wallFront);

// -Z wall
const wallBack = new THREE.Mesh(wallGeoH, wallMat);
wallBack.position.set(0, wallHeight / 2, -wallWidth / 2);
world.add(wallBack);

// +X wall
const wallRight = new THREE.Mesh(wallGeoD, wallMat);
wallRight.position.set(wallWidth / 2, wallHeight / 2, 0);
wallRight.rotation.y = -Math.PI / 2;
world.add(wallRight);

// -X wall
const wallLeft = new THREE.Mesh(wallGeoD, wallMat);
wallLeft.position.set(-wallWidth / 2, wallHeight / 2, 0);
wallLeft.rotation.y = Math.PI / 2;
world.add(wallLeft);

/* ---------- RESIZE ---------- */
export function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
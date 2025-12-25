/// scene.js
/// Scene, renderer, lighting, and camera
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state as snakeState } from "../game/snake.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 5, 60);

export const camera = new THREE.PerspectiveCamera(85, window.innerWidth/window.innerHeight, 0.1, 1000);

export const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:"high-performance" });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

export const world = new THREE.Group();
scene.add(world);

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(8, 12, 6);
sun.castShadow = true;
scene.add(sun);

// Floor
const floorGeo = new THREE.PlaneGeometry(500,500);
const floorMat = new THREE.MeshStandardMaterial({ color:0x1a1a1a, roughness:0.85, metalness:0.15 });
const floor = new THREE.Mesh(floorGeo,floorMat);
floor.rotation.x = -Math.PI/2;
floor.receiveShadow = true;
world.add(floor);

export function resizeRenderer() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function updateCamera(delta){
  if(!snakeState.mesh) return;

  const head = snakeState.mesh;
  const forward = new THREE.Vector3(Math.sin(snakeState.yaw),0,Math.cos(snakeState.yaw));

  const CAMERA_DISTANCE = 2.5;
  const CAMERA_HEIGHT = 1.0;
  const CAMERA_LOOK_AHEAD = 1.0;
  const CAMERA_LERP = 0.15;

  const desiredPos = head.position.clone()
    .add(forward.clone().multiplyScalar(-CAMERA_DISTANCE))
    .add(new THREE.Vector3(0,CAMERA_HEIGHT,0));
  camera.position.lerp(desiredPos,CAMERA_LERP);

  const lookTarget = head.position.clone()
    .add(forward.clone().multiplyScalar(CAMERA_LOOK_AHEAD));
  camera.lookAt(lookTarget);
}
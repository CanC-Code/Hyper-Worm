/// scene.js
/// Purpose: Three.js scene, camera, renderer, lighting
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Orthographic camera for true overhead view
const aspect = window.innerWidth / window.innerHeight;
const viewSize = 18;

export const camera = new THREE.OrthographicCamera(
  -viewSize * aspect,
   viewSize * aspect,
   viewSize,
  -viewSize,
   0.1,
   100
);

camera.position.set(0, 30, 0);
camera.lookAt(0, 0, 0);

// Renderer
export const renderer = new THREE.WebGLRenderer({
  antialias: false,   // keeps pixel aesthetic crisp
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
  const aspect = window.innerWidth / window.innerHeight;
  camera.left   = -viewSize * aspect;
  camera.right  =  viewSize * aspect;
  camera.top    =  viewSize;
  camera.bottom = -viewSize;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
/// scene.js
/// Hyper-Worm 3D scene setup
/// CCVO / CanC-Code

import * as THREE from "../../three/three.module.js";

export const scene = new THREE.Scene();
export const world = new THREE.Group();
scene.add(world);

// Camera
export const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
scene.add(dirLight);

// --------------------------------------------------
// Handle resize
// --------------------------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --------------------------------------------------
// Helper: clear all objects in scene
// --------------------------------------------------
export function clearScene() {
  // Keep camera and lights, remove everything else
  const preserved = [camera, ambientLight, dirLight, world];
  scene.children.slice().forEach((child) => {
    if (!preserved.includes(child)) {
      scene.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
  // Also clear children of the main world group
  world.children.slice().forEach((child) => world.remove(child));
}
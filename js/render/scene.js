/// scene.js
/// Three.js scene setup for Hyper-Worm
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export function initScene() {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Snake placeholder
  const snakeGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
  const snakeMat = new THREE.MeshStandardMaterial({ color: 0x88ffcc });
  const snake = new THREE.Mesh(snakeGeo, snakeMat);
  snake.position.y = 0.5;
  snake.castShadow = true;
  scene.add(snake);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 5);
  directional.castShadow = true;
  scene.add(directional);

  // Handle resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, snake };
}
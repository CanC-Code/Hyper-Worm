// main.js
// Hyper Snake – stable segmented growth main loop
// CCVO / CanC-Code

import * as THREE from "./three/three.module.js";
import { Snake } from "./snake.js";
import { initTouchControls, getTurnInput, getTurnSpeed } from "./touchControls.js";

// --------------------------------------------------
// Scene setup
// --------------------------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0b);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 6, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// --------------------------------------------------
// Lighting (stable, no flicker)
// --------------------------------------------------

scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
keyLight.position.set(5, 10, 6);
keyLight.castShadow = false;
scene.add(keyLight);

// --------------------------------------------------
// Floor reference (helps orientation)
// --------------------------------------------------

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({
    color: 0x121212,
    roughness: 0.9,
    metalness: 0.0
  })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
scene.add(floor);

// --------------------------------------------------
// Snake
// --------------------------------------------------

const snake = new Snake({
  segmentLength: 0.5,
  initialLength: 6,
  radius: 0.35,
  taper: 0.55,
  speed: 6.5
});

scene.add(snake.object3D);

// --------------------------------------------------
// Controls
// --------------------------------------------------

initTouchControls();

// --------------------------------------------------
// Resize handling
// --------------------------------------------------

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --------------------------------------------------
// Game loop
// --------------------------------------------------

let lastTime = performance.now();

function animate(time) {
  requestAnimationFrame(animate);

  const delta = Math.min((time - lastTime) / 1000, 0.033);
  lastTime = time;

  const turnInput = getTurnInput();
  const turnSpeed = getTurnSpeed();

  snake.update(delta, turnInput, turnSpeed);

  // Camera follow (smooth, no jitter)
  const headPos = snake.getHeadPosition();

  camera.position.lerp(
    new THREE.Vector3(
      headPos.x,
      headPos.y + 6,
      headPos.z + 10
    ),
    0.08
  );

  camera.lookAt(headPos);

  renderer.render(scene, camera);
}

animate(performance.now());

// --------------------------------------------------
// Debug growth (remove later)
// --------------------------------------------------

window.addEventListener("keydown", (e) => {
  if (e.key === "g") {
    snake.grow(1);
  }
});
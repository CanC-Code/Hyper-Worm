/// snake.js
/// Purpose: Procedural 3D GLTF snake with dynamic growth and mouth animation
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { GLTFLoader } from "../../three/GLTFLoader.js";
import { world } from "../render/scene.js";

export const state = {
  headMesh: null,
  mouthMesh: null,
  segments: [],
  headPosition: new THREE.Vector3(0,0,0),
  velocity: new THREE.Vector3(0,0,1),
  speed: 2,
  segmentLength: 1
};

const loader = new GLTFLoader();

// Initialize the snake
export function initSnake(scene) {
  loader.load(
    "/models/snake.gltf",
    (gltf) => {
      state.headMesh = gltf.scene.getObjectByName("Head");
      state.mouthMesh = gltf.scene.getObjectByName("Mouth");
      if (!state.headMesh) state.headMesh = gltf.scene;

      state.headMesh.position.copy(state.headPosition);
      scene.add(gltf.scene);

      // Initialize initial segments behind head
      for (let i = 0; i < 2; i++) {
        addSegment(scene);
      }
    },
    undefined,
    (err) => console.error("Error loading snake GLTF:", err)
  );
}

// Update snake movement and segments each frame
export function updateSnake(delta) {
  if (!state.headMesh) return;

  // Move head forward
  const moveDelta = state.velocity.clone().multiplyScalar(state.speed * delta);
  state.headPosition.add(moveDelta);
  state.headMesh.position.copy(state.headPosition);

  // Rotate head to match velocity
  const angle = Math.atan2(state.velocity.x, state.velocity.z);
  state.headMesh.rotation.y = angle;

  // Update segments following
  updateSegments();
}

// Update segment positions
function updateSegments() {
  let previousPos = state.headPosition.clone();
  state.segments.forEach(seg => {
    const dir = previousPos.clone().sub(seg.position);
    const dist = dir.length();
    if (dist > state.segmentLength) {
      dir.normalize();
      seg.position.add(dir.multiplyScalar(dist - state.segmentLength));
    }
    previousPos = seg.position.clone();
  });
}

// Add a new segment dynamically
export function addSegment(scene) {
  if (!state.headMesh) return;

  const geometry = new THREE.BoxGeometry(1,1,1);
  const material = new THREE.MeshStandardMaterial({ color: 0x33ff33 });
  const segment = new THREE.Mesh(geometry, material);

  // Start at last segment or head
  const last = state.segments[state.segments.length-1];
  segment.position.copy(last ? last.position : state.headPosition);
  segment.scale.set(0.1,0.1,0.1); // start tiny for growth

  scene.add(segment);
  state.segments.push(segment);

  // Animate growth
  const growDuration = 0.25;
  let elapsed = 0;
  function animateGrow(delta) {
    elapsed += delta;
    const t = Math.min(elapsed / growDuration,1);
    segment.scale.setScalar(t);
    if (t < 1) requestAnimationFrame((now)=>animateGrow(0.016));
  }
  requestAnimationFrame((now)=>animateGrow(0.016));
}

// Set turning direction based on input vector {x,y} (XZ plane)
export function setDirection(vec2) {
  const dir = new THREE.Vector3(vec2.x,0,vec2.y).normalize();
  state.velocity.lerp(dir,0.15); // smooth turning
}

// Grow snake on eating and animate mouth
export function growSnake(scene) {
  addSegment(scene);

  // Animate mouth: simple open/close rotation
  if (state.mouthMesh) {
    const duration = 150; // ms
    const openAngle = -0.5;
    const closeAngle = 0;
    // Open
    state.mouthMesh.rotation.x = openAngle;
    setTimeout(()=>{ if(state.mouthMesh) state.mouthMesh.rotation.x = closeAngle; }, duration);
  }
}

// Get head position for collisions
export function getHeadPosition() {
  return state.headPosition.clone();
}
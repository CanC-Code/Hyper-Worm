/// snake.js
/// Purpose: Dynamic 3D GLTF snake with segments, eating animation
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { GLTFLoader } from "../../three/GLTFLoader.js";
import { world } from "../render/scene.js";

export const state = {
  headPosition: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 1),
  speed: 2,
  segments: [],
  segmentLength: 1,
  headMesh: null,
  isGrowing: false
};

const loader = new GLTFLoader();
let mouthAnimationMixer = null;

// Initialize snake with GLTF head
export function initSnake(scene) {
  loader.load(
    "/models/snake.glb",  // replace with your GLB snake model
    (gltf) => {
      state.headMesh = gltf.scene;
      state.headMesh.position.copy(state.headPosition);
      scene.add(state.headMesh);

      // If gltf has animations
      if (gltf.animations && gltf.animations.length > 0) {
        mouthAnimationMixer = new THREE.AnimationMixer(state.headMesh);
        const clip = gltf.animations[0]; // assuming first animation is mouth
        mouthAnimationMixer.clipAction(clip).play();
      }

      // Add initial segments
      addSegment(scene);
    },
    undefined,
    (err) => console.error("Error loading snake GLTF:", err)
  );
}

// Update snake each frame
export function updateSnake(delta) {
  if (!state.headMesh) return;

  // Move head forward
  const moveDelta = state.velocity.clone().multiplyScalar(state.speed * delta);
  state.headPosition.add(moveDelta);
  state.headMesh.position.copy(state.headPosition);

  // Rotate head to match velocity
  const angle = Math.atan2(state.velocity.x, state.velocity.z);
  state.headMesh.rotation.y = angle;

  // Update mouth animation if any
  if (mouthAnimationMixer) mouthAnimationMixer.update(delta);

  // Update segments
  updateSegments();
}

// Update all segments to follow head
export function updateSegments() {
  let previousPos = state.headPosition.clone();
  state.segments.forEach(seg => {
    const direction = previousPos.clone().sub(seg.position);
    const distance = direction.length();
    if (distance > state.segmentLength) {
      direction.normalize();
      seg.position.add(direction.multiplyScalar(distance - state.segmentLength));
    }
    previousPos = seg.position.clone();
  });
}

// Add a new segment (called when eating)
export function addSegment(scene) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x33ff33 });
  const segment = new THREE.Mesh(geometry, material);

  // Position at last segment or head
  const last = state.segments[state.segments.length - 1];
  segment.position.copy(last ? last.position : state.headPosition);

  segment.scale.set(0.1, 0.1, 0.1); // start tiny for growth
  scene.add(segment);
  state.segments.push(segment);

  // Animate growth
  const growDuration = 0.25; // seconds
  let elapsed = 0;
  function animateGrow(delta) {
    elapsed += delta;
    const t = Math.min(elapsed / growDuration, 1);
    segment.scale.setScalar(t);
    if (t < 1) requestAnimationFrame((now) => animateGrow(0.016));
  }
  requestAnimationFrame((now) => animateGrow(0.016));
}

// Get head position for collisions
export function getHeadPosition() {
  return state.headPosition.clone();
}

// Set snake turning velocity
export function setDirection(vec2) {
  // Convert 2D input into rotation in XZ plane
  const dir = new THREE.Vector3(vec2.x, 0, vec2.y).normalize();
  state.velocity.lerp(dir, 0.15); // smooth turning
}

// Grow snake on eating
export function growSnake(scene) {
  addSegment(scene);

  // Optionally trigger mouth animation
  if (mouthAnimationMixer) {
    mouthAnimationMixer.timeScale = 2.0; // speed up mouth animation briefly
    setTimeout(() => { if(mouthAnimationMixer) mouthAnimationMixer.timeScale = 1.0; }, 250);
  }
}
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
  headPosition: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 1),
  speed: 2,
  segmentLength: 1
};

const loader = new GLTFLoader();

/**
 * Initialize the snake.
 * Loads the GLTF snake and sets up initial segments.
 */
export function initSnake(scene) {
  loader.load(
    "/models/snake.gltf",
    (gltf) => {
      const snakeRoot = gltf.scene;
      scene.add(snakeRoot);

      // Access head and mouth nodes
      state.headMesh = snakeRoot.getObjectByName("Head") || snakeRoot;
      state.mouthMesh = snakeRoot.getObjectByName("Mouth") || null;

      // Position head at starting location
      state.headMesh.position.copy(state.headPosition);

      // Initialize 2 body segments
      for (let i = 0; i < 2; i++) {
        addSegment(scene);
      }

      console.log("Snake initialized:", state.headMesh, state.mouthMesh);
    },
    undefined,
    (err) => console.error("Error loading snake GLTF:", err)
  );
}

/**
 * Update snake movement and segment positions each frame.
 * @param {number} delta - Time delta in seconds
 */
export function updateSnake(delta) {
  if (!state.headMesh) return;

  // Move head forward
  const moveDelta = state.velocity.clone().multiplyScalar(state.speed * delta);
  state.headPosition.add(moveDelta);
  state.headMesh.position.copy(state.headPosition);

  // Rotate head to match velocity (free-turn)
  const angle = Math.atan2(state.velocity.x, state.velocity.z);
  state.headMesh.rotation.y = angle;

  // Update body segments to follow the head
  updateSegments();
}

/**
 * Smoothly updates all body segments to follow the snake head.
 */
function updateSegments() {
  let previousPos = state.headPosition.clone();
  state.segments.forEach((seg) => {
    const dir = previousPos.clone().sub(seg.position);
    const dist = dir.length();
    if (dist > state.segmentLength) {
      dir.normalize();
      seg.position.add(dir.multiplyScalar(dist - state.segmentLength));
    }
    previousPos = seg.position.clone();
  });
}

/**
 * Add a new segment behind the last segment (or head) and animate growth.
 */
export function addSegment(scene) {
  if (!state.headMesh) return;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x33ff33 });
  const segment = new THREE.Mesh(geometry, material);

  const last = state.segments[state.segments.length - 1];
  segment.position.copy(last ? last.position : state.headPosition);
  segment.scale.set(0.1, 0.1, 0.1); // start tiny for growth

  scene.add(segment);
  state.segments.push(segment);

  // Animate segment growth
  const growDuration = 0.25;
  let elapsed = 0;
  function animateGrow(delta) {
    elapsed += delta;
    const t = Math.min(elapsed / growDuration, 1);
    segment.scale.setScalar(t);
    if (t < 1) requestAnimationFrame((now) => animateGrow(0.016));
  }
  requestAnimationFrame((now) => animateGrow(0.016));
}

/**
 * Set the snake's turning direction based on a 2D input vector.
 * @param {{x:number, y:number}} vec2 - Direction vector on XZ plane
 */
export function setDirection(vec2) {
  const dir = new THREE.Vector3(vec2.x, 0, vec2.y).normalize();
  state.velocity.lerp(dir, 0.15); // smooth turning
}

/**
 * Trigger snake growth and animate mouth when eating.
 */
export function growSnake(scene) {
  addSegment(scene);

  if (state.mouthMesh) {
    const duration = 150; // ms
    const openAngle = -0.5; // radians
    const closeAngle = 0;

    // Open mouth
    state.mouthMesh.rotation.x = openAngle;

    // Close mouth after short delay
    setTimeout(() => {
      if (state.mouthMesh) state.mouthMesh.rotation.x = closeAngle;
    }, duration);
  }
}

/**
 * Get the current head position for collisions or game logic.
 * @returns {THREE.Vector3}
 */
export function getHeadPosition() {
  return state.headPosition.clone();
}
/// eggSnakeMorph.js
/// Purpose: Spawn an egg that safely morphs into snake
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";
import { initSnake } from "./snake.js";

/**
 * Spawn morphing egg at position
 * @param {THREE.Vector3} position 
 * @param {function} onComplete - called when morph finishes
 */
export function spawnMorphingEggSnake(position, onComplete) {
  // Create egg geometry
  const eggGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const eggMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, flatShading: true });
  const egg = new THREE.Mesh(eggGeo, eggMat);
  egg.position.copy(position);
  world.add(egg);

  const duration = 2000; // 2s morph
  const startTime = performance.now();

  function morphStep() {
    const t = (performance.now() - startTime) / duration;

    if (t < 1) {
      // Shrink egg gradually
      egg.scale.setScalar(1 - t);
      requestAnimationFrame(morphStep);
    } else {
      // Remove egg
      world.remove(egg);
      egg.geometry.dispose();
      egg.material.dispose();

      // Initialize real snake
      initSnake(world);

      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(morphStep);
}
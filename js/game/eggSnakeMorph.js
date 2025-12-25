/// eggSnakeMorph.js
/// Creates egg intro that morphs into the snake
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

export function spawnSmoothEggSnake(callback) {
  // Create egg mesh
  const eggGeo = new THREE.SphereGeometry(0.5, 32, 32);
  eggGeo.scale(1, 1.3, 1); // slightly oblong
  const eggMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.8,
  });
  const eggMesh = new THREE.Mesh(eggGeo, eggMat);
  eggMesh.position.set(0, 0.5, 0);
  world.add(eggMesh);

  // Morph animation into snake
  let progress = 0;
  const duration = 2.0; // seconds
  const clock = new THREE.Clock();

  function animateEgg() {
    const delta = clock.getDelta();
    progress += delta / duration;
    if (progress >= 1) {
      // Replace egg with final snake mesh
      world.remove(eggMesh);

      // Create snake head mesh
      const snakeGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
      const snakeMat = new THREE.MeshStandardMaterial({
        color: 0x88ffcc,
        metalness: 0.6,
        roughness: 0.4,
      });
      const snakeMesh = new THREE.Mesh(snakeGeo, snakeMat);
      snakeMesh.rotation.x = Math.PI / 2; // point forward along Z
      snakeMesh.position.copy(eggMesh.position);
      world.add(snakeMesh);

      callback(snakeMesh);
      return;
    }

    // Egg “scaling hatch” effect
    const scaleY = 1.3 - 0.8 * progress;
    eggMesh.scale.set(1, scaleY, 1);

    requestAnimationFrame(animateEgg);
  }

  animateEgg();
}
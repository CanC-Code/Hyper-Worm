/// eggSnakeMorph.js
/// Egg intro morphs into snake
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";
import { state as snakeState } from "./snake.js";
import { GLTFLoader } from "../../three/GLTFLoader.js";

export function spawnSmoothEggSnake(callback) {
  // Egg
  const eggGeo = new THREE.SphereGeometry(0.5, 64, 64);
  eggGeo.scale(1, 1.3, 1);
  const eggMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.7 });
  const eggMesh = new THREE.Mesh(eggGeo, eggMat);
  eggMesh.position.set(0, 0.5, 0);
  world.add(eggMesh);

  let progress = 0;
  const duration = 2.5;
  const clock = new THREE.Clock();

  function animateEgg() {
    const delta = clock.getDelta();
    progress += delta / duration;

    if (progress >= 1) {
      world.remove(eggMesh);

      // Load snake GLTF
      const loader = new GLTFLoader();
      loader.load("models/snake.gltf", (gltf) => {
        const snakeMesh = gltf.scene;
        snakeMesh.position.copy(eggMesh.position);
        snakeMesh.rotation.x = Math.PI / 2; // align forward
        world.add(snakeMesh);

        // Initialize snake state
        snakeState.mesh = snakeMesh;
        snakeState.segments = [];
        snakeState.yaw = 0;
        snakeState.targetYaw = 0;

        callback(snakeMesh);
      });

      return;
    }

    // Egg “hatch” scaling
    const scaleY = 1.3 - 0.8 * progress;
    eggMesh.scale.set(1, scaleY, 1);

    requestAnimationFrame(animateEgg);
  }

  animateEgg();
}
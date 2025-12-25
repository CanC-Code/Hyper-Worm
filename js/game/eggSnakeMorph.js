/// eggSnakeMorph.js
/// Purpose: Egg hatching intro sequence
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";
import { initSnake } from "./snake.js";
import { camera } from "../render/scene.js";

export function spawnIntroEgg(onComplete) {
  // 1️⃣ Nest
  const nestGeo = new THREE.TorusGeometry(1.2, 0.3, 16, 100);
  const nestMat = new THREE.MeshStandardMaterial({ color: 0x886633, flatShading: true });
  const nest = new THREE.Mesh(nestGeo, nestMat);
  nest.rotation.x = Math.PI / 2;
  nest.position.y = 0;
  world.add(nest);

  // 2️⃣ Egg
  const eggGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const eggMat = new THREE.MeshStandardMaterial({ color: 0xffccaa, flatShading: true });
  const egg = new THREE.Mesh(eggGeo, eggMat);
  egg.position.set(0, 0.5, 0);
  world.add(egg);

  // 3️⃣ Camera initial position (black fade simulated by black background)
  camera.position.set(0, 3, 8);
  camera.lookAt(egg.position);

  const duration = 2500; // 2.5s zoom
  const startTime = performance.now();

  function zoomStep() {
    const t = (performance.now() - startTime) / duration;
    if (t < 1) {
      // Lerp camera toward egg
      camera.position.lerpVectors(
        new THREE.Vector3(0, 3, 8),
        new THREE.Vector3(0, 1.5, 3),
        t
      );
      camera.lookAt(egg.position);
      requestAnimationFrame(zoomStep);
    } else {
      camera.position.set(0, 1.5, 3);
      camera.lookAt(egg.position);
      hatchEgg();
    }
  }

  function hatchEgg() {
    const morphDuration = 2000;
    const morphStart = performance.now();

    function morphStep() {
      const t = (performance.now() - morphStart) / morphDuration;
      if (t < 1) {
        egg.scale.setScalar(1 - t); // shrink egg
        requestAnimationFrame(morphStep);
      } else {
        // Remove egg, spawn snake
        world.remove(egg);
        egg.geometry.dispose();
        egg.material.dispose();
        world.remove(nest);
        nest.geometry.dispose();
        nest.material.dispose();

        initSnake(world);

        // Align camera behind snake head
        const headPos = { x: 0, y: 0, z: 0 };
        camera.position.set(headPos.x, 1, headPos.z - 3);
        camera.lookAt(headPos.x, 0, headPos.z + 2);

        if (onComplete) onComplete();
      }
    }
    requestAnimationFrame(morphStep);
  }

  requestAnimationFrame(zoomStep);
}
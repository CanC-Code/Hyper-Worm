import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";
import { camera } from "../render/scene.js";
import { state as snakeState } from "./snake.js";

/**
 * Spawn a smooth egg that morphs into a snake.
 * Single mesh approach.
 */
export function spawnSmoothEggSnake(onComplete) {
  // High-poly sphere
  const sphereGeo = new THREE.SphereGeometry(0.5, 64, 64);
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffccaa, flatShading: false });
  const egg = new THREE.Mesh(sphereGeo, sphereMat);
  egg.position.set(0, 0.5, 0);

  // Stretch along Z to make oblong egg
  egg.scale.set(1, 1, 1.8);

  // Add nest
  const nestGeo = new THREE.TorusGeometry(1.2, 0.3, 32, 100);
  const nestMat = new THREE.MeshStandardMaterial({ color: 0x886633 });
  const nest = new THREE.Mesh(nestGeo, nestMat);
  nest.rotation.x = Math.PI / 2;
  nest.position.y = 0;

  world.add(nest);
  world.add(egg);

  // Camera initial zoom
  camera.position.set(0, 3, 8);
  camera.lookAt(egg.position);

  const zoomDuration = 2000;
  const morphDuration = 2500;
  const startTime = performance.now();

  function animateIntro() {
    const now = performance.now();
    const t = (now - startTime) / zoomDuration;

    // Zoom camera toward egg
    if (t < 1) {
      camera.position.lerpVectors(new THREE.Vector3(0, 3, 8), new THREE.Vector3(0, 1.5, 3), t);
      camera.lookAt(egg.position);
      requestAnimationFrame(animateIntro);
    } else {
      camera.position.set(0, 1.5, 3);
      camera.lookAt(egg.position);
      // Start morphing egg → snake
      morphEgg();
    }
  }

  function morphEgg() {
    const morphStart = performance.now();
    const origPositions = egg.geometry.attributes.position.array.slice();
    const vertexCount = egg.geometry.attributes.position.count;

    function step() {
      const now = performance.now();
      const t = (now - morphStart) / morphDuration;

      if (t < 1) {
        // Morph vertices: stretch along Z for body
        const pos = egg.geometry.attributes.position.array;
        for (let i = 0; i < vertexCount; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          // Simple linear morph: elongate Z progressively
          pos[ix] = origPositions[ix];
          pos[iy] = origPositions[iy];
          pos[iz] = origPositions[iz] * (1 + t * 4); // scale Z from egg → snake
        }
        egg.geometry.attributes.position.needsUpdate = true;

        // Optional: taper tail by scaling vertices near one pole
        // TODO: implement smooth taper

        requestAnimationFrame(step);
      } else {
        // Morph complete, set final snake geometry
        egg.scale.set(1, 1, 5);
        if (onComplete) onComplete(egg);
      }
    }
    requestAnimationFrame(step);
  }

  requestAnimationFrame(animateIntro);
}
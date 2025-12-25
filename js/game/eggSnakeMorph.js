/// eggSnakeMorph.js
/// Dynamic egg → snake morph (procedural)
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";
import { state as snakeState } from "./snake.js";

export function spawnSmoothEggSnake(callback) {
  // Create egg geometry
  const sphereGeo = new THREE.SphereGeometry(0.5, 64, 64);
  const eggMat = new THREE.MeshStandardMaterial({
    color: 0x88ffcc,
    metalness: 0.6,
    roughness: 0.3,
  });
  const eggMesh = new THREE.Mesh(sphereGeo, eggMat);
  eggMesh.position.set(0, 0.5, 0);
  world.add(eggMesh);

  let progress = 0;
  const duration = 3.0;
  const clock = new THREE.Clock();

  function animateEgg() {
    const delta = clock.getDelta();
    progress += delta / duration;

    if (progress >= 1) {
      // Remove egg and create snake mesh
      world.remove(eggMesh);

      // Snake head geometry
      const headGeo = new THREE.CylinderGeometry(0.2, 0.25, 1, 32);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x88ffcc,
        metalness: 0.6,
        roughness: 0.3,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.rotation.x = Math.PI / 2;
      headMesh.position.copy(eggMesh.position);

      // Add simple “mouth” hinge
      const mouthGeo = new THREE.BoxGeometry(0.15, 0.05, 0.3);
      const mouthMat = new THREE.MeshStandardMaterial({ color: 0x006644, metalness: 0.7 });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.position.set(0, -0.15, 0.5);
      headMesh.add(mouth);

      // Initialize snake state
      snakeState.mesh = headMesh;
      snakeState.mouth = mouth;
      snakeState.segments = [];
      snakeState.yaw = 0;
      snakeState.targetYaw = 0;

      world.add(headMesh);

      callback(headMesh);
      return;
    }

    // Morph egg shape: elongate Y, compress X/Z
    const scaleY = 1.3 + progress * 1.2;
    const scaleXZ = 1 - progress * 0.5;
    eggMesh.scale.set(scaleXZ, scaleY, scaleXZ);

    requestAnimationFrame(animateEgg);
  }

  animateEgg();
}
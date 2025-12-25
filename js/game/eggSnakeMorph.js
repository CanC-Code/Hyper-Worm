/// eggSnakeMorph.js
/// Purpose: Smooth egg → snake morph with metallic mint green, procedural scales
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { scene, camera, world } from "../render/scene.js";
import { state as snakeState } from "./snake.js";

/* ---------- Spawn Egg and Morph into Snake ---------- */
export function spawnSmoothEggSnake(callback) {
  // High-poly sphere for smooth deformation
  const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
  
  // Metallic mint green material
  const snakeMat = new THREE.MeshStandardMaterial({
    color: 0x66ffcc,
    metalness: 0.8,
    roughness: 0.3,
    flatShading: false,
  });

  const eggMesh = new THREE.Mesh(sphereGeo, snakeMat);
  eggMesh.position.set(0, 1, 0);
  world.add(eggMesh);

  // Camera initial view: central, slightly above
  camera.position.set(0, 2, 6);
  camera.lookAt(eggMesh.position);

  // Morph parameters
  const duration = 2000; // 2s for hatch
  const startTime = performance.now();

  // Precompute target snake shape: elongated along Z
  const targetScale = new THREE.Vector3(0.5, 0.5, 4);

  function morphStep() {
    const t = Math.min((performance.now() - startTime) / duration, 1);

    // Scale egg → elongated snake
    eggMesh.scale.lerpVectors(new THREE.Vector3(1,1,1), targetScale, t);

    // Optionally bend/taper tail
    const pos = eggMesh.geometry.attributes.position;
    const vertexCount = pos.count;
    for (let i = 0; i < vertexCount; i++) {
      let z = pos.getZ(i);
      z *= THREE.MathUtils.lerp(1, targetScale.z, t);
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;

    // Camera smoothly moves behind head
    const camTarget = new THREE.Vector3(0, 1.5, -1.5).applyMatrix4(eggMesh.matrixWorld);
    camera.position.lerp(camTarget, 0.05);
    camera.lookAt(eggMesh.position);

    if (t < 1) {
      requestAnimationFrame(morphStep);
    } else {
      // Morph complete → call callback with snake mesh
      callback(eggMesh);
    }
  }

  requestAnimationFrame(morphStep);
}
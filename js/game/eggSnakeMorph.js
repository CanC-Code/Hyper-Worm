/// eggSnakeMorph.js
/// Purpose: Smooth egg → snake morph with safe geometry updates, metallic mint green, procedural scales, mouth animation
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { camera, world } from "../render/scene.js";
import { state as snakeState } from "./snake.js";

/* ---------- Spawn Egg and Morph into Snake ---------- */
export function spawnSmoothEggSnake(callback) {
  // High-poly sphere for smooth deformation
  const sphereGeo = new THREE.SphereGeometry(1, 128, 128);

  // Store original positions to prevent repeated in-place modifications
  const originalPositions = Float32Array.from(sphereGeo.attributes.position.array);

  // Procedural scale normal map (simple sine-based)
  const scaleMap = new THREE.DataTexture(
    new Uint8Array(128 * 128 * 3).map((v, i) => {
      const x = i % 128;
      const y = Math.floor(i / 128);
      const val = ((Math.sin(x * 0.5) + Math.sin(y * 0.5)) * 0.5 + 0.5) * 255;
      return val;
    }),
    128, 128, THREE.RGBFormat
  );
  scaleMap.needsUpdate = true;

  // Metallic mint green material
  const snakeMat = new THREE.MeshStandardMaterial({
    color: 0x66ffcc,
    metalness: 0.8,
    roughness: 0.3,
    flatShading: false,
    normalMap: scaleMap,
    normalScale: new THREE.Vector2(0.2, 0.2),
  });

  const eggMesh = new THREE.Mesh(sphereGeo, snakeMat);
  eggMesh.position.set(0, 1, 0);
  world.add(eggMesh);

  // Camera initial view: central, slightly above
  camera.position.set(0, 2, 6);
  camera.lookAt(eggMesh.position);

  // Morph parameters
  const duration = 2000; // 2 seconds
  const startTime = performance.now();
  const targetScale = new THREE.Vector3(0.5, 0.5, 4); // elongate along Z

  // Mouth animation setup
  const mouthVertices = [];
  const posAttr = eggMesh.geometry.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    if (posAttr.getZ(i) > 0.4 && posAttr.getY(i) > 0) mouthVertices.push(i);
  }

  function morphStep() {
    const t = Math.min((performance.now() - startTime) / duration, 1);

    // Update geometry safely using original positions
    for (let i = 0; i < posAttr.count; i++) {
      const x = originalPositions[i * 3];
      const y = originalPositions[i * 3 + 1];
      const z = originalPositions[i * 3 + 2] * THREE.MathUtils.lerp(1, targetScale.z, t);
      posAttr.setXYZ(i, x, y, z);
    }

    // Mouth animation: open slightly
    const openAmount = Math.sin(t * Math.PI) * 0.1;
    for (const idx of mouthVertices) {
      const z = posAttr.getZ(idx);
      posAttr.setZ(idx, z + openAmount);
    }

    posAttr.needsUpdate = true;
    eggMesh.geometry.computeBoundingSphere();

    // Camera transition behind snake
    const camTarget = new THREE.Vector3(0, 1.5, -1.5).applyMatrix4(eggMesh.matrixWorld);
    camera.position.lerp(camTarget, 0.05);
    camera.lookAt(eggMesh.position);

    if (t < 1) {
      requestAnimationFrame(morphStep);
    } else {
      // Morph complete → call callback with final snake mesh
      callback(eggMesh);
    }
  }

  requestAnimationFrame(morphStep);
}
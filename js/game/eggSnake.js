/// eggSnake.js
/// Purpose: Dynamically generate egg GLTF and warp into snake
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

/**
 * Generates a runtime egg that warps into a snake.
 * @param {THREE.Vector3} position - spawn location
 * @param {function} onHatch - callback with {head, mouth, segment} after warp
 */
export function spawnEggSnake(position = new THREE.Vector3(0,0,0), onHatch) {
  const group = new THREE.Group();
  group.position.copy(position);

  // 1️⃣ Egg sphere
  const eggGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const eggMat = new THREE.MeshStandardMaterial({ color: 0xffff66 });
  const eggMesh = new THREE.Mesh(eggGeo, eggMat);
  eggMesh.name = "Egg";
  group.add(eggMesh);

  // 2️⃣ Snake head (start tiny inside egg)
  const headGeo = new THREE.BoxGeometry(1,1,1);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x33ff33 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.name = "Head";
  head.scale.set(0.01,0.01,0.01);
  group.add(head);

  // 3️⃣ Mouth
  const mouthGeo = new THREE.BoxGeometry(0.5,0.5,0.5);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0xff3333 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.name = "Mouth";
  mouth.position.set(0,-0.25,0.5);
  head.add(mouth);

  // 4️⃣ First segment
  const segmentGeo = new THREE.BoxGeometry(1,1,1);
  const segmentMat = new THREE.MeshStandardMaterial({ color: 0x33ff33 });
  const segment = new THREE.Mesh(segmentGeo, segmentMat);
  segment.name = "SegmentMesh";
  segment.scale.set(0.01,0.01,0.01);
  group.add(segment);

  // Add to world
  world.add(group);

  // 5️⃣ Animate warp: egg shrinks, snake grows
  let elapsed = 0;
  const duration = 2.0; // seconds
  function animateWarp(delta) {
    elapsed += delta;
    const t = Math.min(elapsed / duration, 1);

    eggMesh.scale.setScalar(1 - t);        // shrink egg
    head.scale.setScalar(t);               // grow snake head
    segment.scale.setScalar(t);            // grow first segment

    if (t < 1) {
      requestAnimationFrame(() => animateWarp(0.016));
    } else {
      // Warp complete: remove egg, trigger callback
      group.remove(eggMesh);
      if (onHatch) onHatch({ head, mouth, segment });
    }
  }

  animateWarp(0.016);
}
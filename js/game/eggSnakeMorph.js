/// eggSnakeMorph.js
/// Purpose: Egg intro that morphs into a procedural 3D snake
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

export function spawnSmoothEggSnake(callback) {
  // ---------- Create Egg ----------
  const eggGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const eggMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.8,
  });
  const eggMesh = new THREE.Mesh(eggGeo, eggMat);
  eggMesh.position.set(0, 0.5, 0);
  world.add(eggMesh);

  // ---------- Morph Parameters ----------
  const duration = 2.5; // seconds
  let elapsed = 0;
  const clock = new THREE.Clock();

  function animateEgg() {
    const delta = clock.getDelta();
    elapsed += delta;
    const progress = Math.min(elapsed / duration, 1);

    // Egg stretches into snake
    const scaleY = 1.3 + 2.0 * progress; // elongate
    const scaleXZ = 1 - 0.3 * progress;  // slight slimming
    eggMesh.scale.set(scaleXZ, scaleY, scaleXZ);

    // Slight wobble effect
    eggMesh.rotation.z = Math.sin(progress * Math.PI * 2) * 0.1;

    if (progress < 1) {
      requestAnimationFrame(animateEgg);
      return;
    }

    // ---------- Create Snake Mesh ----------
    world.remove(eggMesh);

    const segments = 6;
    const segmentLength = 0.5;

    const snakeGroup = new THREE.Group();
    snakeGroup.position.copy(eggMesh.position);

    for (let i = 0; i < segments; i++) {
      const radius = 0.2 * (1 - i * 0.05); // tail tapers
      const geo = new THREE.CylinderGeometry(radius, radius, segmentLength, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x88ffcc,
        metalness: 0.5,
        roughness: 0.3,
        flatShading: false,
      });
      const segment = new THREE.Mesh(geo, mat);
      segment.rotation.x = Math.PI / 2;
      segment.position.z = -i * segmentLength;
      snakeGroup.add(segment);
    }

    // Head features (simple eyes and mouth)
    const headRadius = 0.22;
    const headGeo = new THREE.SphereGeometry(headRadius, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x88ffcc,
      metalness: 0.6,
      roughness: 0.2
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.z = 0.25;
    snakeGroup.add(head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.08, 0.08, 0.35);
    eyeR.position.set(0.08, 0.08, 0.35);
    snakeGroup.add(eyeL);
    snakeGroup.add(eyeR);

    // Mouth
    const mouthGeo = new THREE.BoxGeometry(0.12, 0.02, 0.06);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xff5555 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.05, 0.35);
    snakeGroup.add(mouth);

    world.add(snakeGroup);

    // Callback with snake group
    callback(snakeGroup);
  }

  animateEgg();
}
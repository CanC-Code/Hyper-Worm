/// eggSnakeMorph.js
/// Creates egg intro that morphs into the snake with enhanced visuals - ENHANCED
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world, scene } from "../render/scene.js";

export function spawnSmoothEggSnake(callback) {
  // Position camera for cinematic intro
  const { camera } = await import("../render/scene.js");
  camera.position.set(3, 2, 3);
  camera.lookAt(0, 0.7, 0);

  // Hide HUD during intro
  const hud = document.getElementById("hud");
  if (hud) {
    hud.style.opacity = "0";
    hud.textContent = "Hatching...";
  }

  // Create egg with glow
  const eggGeo = new THREE.SphereGeometry(0.5, 64, 64); // High poly
  eggGeo.scale(1, 1.4, 1);
  const eggMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.3,
    roughness: 0.6,
    emissive: 0xccffee,
    emissiveIntensity: 0.3
  });
  const eggMesh = new THREE.Mesh(eggGeo, eggMat);
  eggMesh.position.set(0, 0.7, 0);
  eggMesh.castShadow = true;
  world.add(eggMesh);

  // Add outer glow
  const glowGeo = new THREE.SphereGeometry(0.65, 64, 64); // High poly
  glowGeo.scale(1, 1.4, 1);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xaaffee,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.copy(eggMesh.position);
  world.add(glowMesh);

  // Add spotlight on egg
  const spotLight = new THREE.SpotLight(0xaaffee, 2, 10, Math.PI / 6, 0.5);
  spotLight.position.set(0, 5, 0);
  spotLight.target = eggMesh;
  scene.add(spotLight);

  // Crack particles
  const crackParticles = [];
  
  let progress = 0;
  const duration = 2.5; // Slightly longer for more drama
  const clock = new THREE.Clock();

  function animateEgg() {
    const delta = clock.getDelta();
    progress += delta / duration;

    if (progress >= 1) {
      // Morph complete - create snake
      world.remove(eggMesh);
      world.remove(glowMesh);
      scene.remove(spotLight);
      
      // Clean up crack particles
      crackParticles.forEach(p => {
        world.remove(p);
        p.geometry.dispose();
        p.material.dispose();
      });

      // Create enhanced high-poly snake head
      const snakeGeo = new THREE.CapsuleGeometry(0.25, 0.8, 16, 32); // Higher poly
      const snakeMat = new THREE.MeshStandardMaterial({
        color: 0x88ffcc,
        metalness: 0.7,
        roughness: 0.25,
        emissive: 0x44aa88,
        emissiveIntensity: 0.4
      });
      const snakeMesh = new THREE.Mesh(snakeGeo, snakeMat);
      snakeMesh.rotation.x = Math.PI / 2;
      snakeMesh.position.copy(eggMesh.position);
      snakeMesh.castShadow = true;
      world.add(snakeMesh);

      // Fade HUD back in
      if (hud) {
        hud.style.transition = "opacity 1s ease";
        hud.style.opacity = "1";
      }

      callback(snakeMesh);
      return;
    }

    // Wobble effect intensifies near the end
    const wobbleIntensity = Math.pow(progress, 2) * 0.3;
    const wobbleX = Math.sin(progress * 20) * wobbleIntensity;
    const wobbleZ = Math.cos(progress * 15) * wobbleIntensity;
    eggMesh.rotation.set(wobbleX, 0, wobbleZ);
    glowMesh.rotation.copy(eggMesh.rotation);

    // Pulse glow
    const pulse = 0.2 + Math.sin(progress * 10) * 0.1;
    glowMat.opacity = pulse;
    eggMat.emissiveIntensity = 0.3 + Math.sin(progress * 8) * 0.2;

    // Vertical squash/stretch as it "hatches"
    const squash = 1.4 - (progress * 0.9); // 1.4 -> 0.5
    const stretch = 1 + (progress * 0.2);   // 1.0 -> 1.2
    eggMesh.scale.set(stretch, squash, stretch);
    glowMesh.scale.set(stretch * 1.15, squash * 1.15, stretch * 1.15);

    // Create crack particles as it breaks
    if (progress > 0.6 && Math.random() < 0.15) {
      const crackGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const crackMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const crack = new THREE.Mesh(crackGeo, crackMat);
      
      // Random position around egg
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.4;
      crack.position.set(
        eggMesh.position.x + Math.cos(angle) * radius,
        eggMesh.position.y + (Math.random() - 0.5) * 0.8,
        eggMesh.position.z + Math.sin(angle) * radius
      );
      
      crack.userData.velocity = new THREE.Vector3(
        Math.cos(angle) * 0.02,
        Math.random() * 0.02,
        Math.sin(angle) * 0.02
      );
      
      world.add(crack);
      crackParticles.push(crack);
    }

    // Animate crack particles
    crackParticles.forEach(p => {
      p.position.add(p.userData.velocity);
      p.userData.velocity.y -= 0.001; // Gravity
      p.material.opacity *= 0.98; // Fade out
      
      if (p.material.opacity < 0.1) {
        world.remove(p);
        p.geometry.dispose();
        p.material.dispose();
      }
    });

    // Bounce effect
    const bounce = Math.abs(Math.sin(progress * 15)) * 0.1 * (1 - progress);
    eggMesh.position.y = 0.7 + bounce;
    glowMesh.position.y = 0.7 + bounce;

    requestAnimationFrame(animateEgg);
  }

  animateEgg();
}
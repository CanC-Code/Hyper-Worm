/// eggSnakeMorph.js
/// Creates egg intro that morphs into the snake with enhanced visuals - ENHANCED
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world, scene, camera } from "../render/scene.js";

export function spawnSmoothEggSnake(callback) {
  // Position camera for cinematic intro - side view
  camera.position.set(-5, 2, 0);
  camera.lookAt(0, 0.7, 0);

  // Hide HUD during intro
  const hud = document.getElementById("hud");
  const originalHudContent = hud ? hud.innerHTML : "";
  if (hud) {
    hud.style.opacity = "0.5";
    hud.textContent = "🥚 Hatching...";
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
  eggMesh.position.set(-3, 0.7, 0); // Start on left side
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
  const spotLight = new THREE.SpotLight(0xaaffee, 3, 15, Math.PI / 5, 0.5);
  spotLight.position.set(-3, 6, 0);
  spotLight.target = eggMesh;
  spotLight.castShadow = true;
  scene.add(spotLight);

  // Crack particles
  const crackParticles = [];
  
  let progress = 0;
  const duration = 3.0; // Duration for hatching
  const clock = new THREE.Clock();
  let snakeMesh = null;

  function animateIntro() {
    const delta = clock.getDelta();
    progress += delta / duration;

    // Phase 1: Hatching (0.0 - 0.6)
    if (progress < 0.6) {
      // Wobble effect intensifies
      const wobbleIntensity = Math.pow(progress / 0.6, 2) * 0.4;
      const wobbleX = Math.sin(progress * 20) * wobbleIntensity;
      const wobbleZ = Math.cos(progress * 15) * wobbleIntensity;
      eggMesh.rotation.set(wobbleX, 0, wobbleZ);
      glowMesh.rotation.copy(eggMesh.rotation);

      // Pulse glow
      const pulse = 0.2 + Math.sin(progress * 12) * 0.15;
      glowMat.opacity = pulse;
      eggMat.emissiveIntensity = 0.3 + Math.sin(progress * 10) * 0.3;

      // Squash/stretch
      const squash = 1.4 - (progress / 0.6) * 0.9;
      const stretch = 1 + (progress / 0.6) * 0.2;
      eggMesh.scale.set(stretch, squash, stretch);
      glowMesh.scale.set(stretch * 1.15, squash * 1.15, stretch * 1.15);

      // Crack particles
      if (progress > 0.3 && Math.random() < 0.2) {
        const crackGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const crackMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9
        });
        const crack = new THREE.Mesh(crackGeo, crackMat);
        
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.4;
        crack.position.set(
          eggMesh.position.x + Math.cos(angle) * radius,
          eggMesh.position.y + (Math.random() - 0.5) * 0.8,
          eggMesh.position.z + Math.sin(angle) * radius
        );
        
        crack.userData.velocity = new THREE.Vector3(
          Math.cos(angle) * 0.03,
          Math.random() * 0.03,
          Math.sin(angle) * 0.03
        );
        
        world.add(crack);
        crackParticles.push(crack);
      }

      // Bounce
      const bounce = Math.abs(Math.sin(progress * 18)) * 0.15 * (1 - progress / 0.6);
      eggMesh.position.y = 0.7 + bounce;
      glowMesh.position.y = 0.7 + bounce;

    } 
    // Phase 2: Transform to snake (0.6 - 0.7)
    else if (progress < 0.7 && !snakeMesh) {
      world.remove(eggMesh);
      world.remove(glowMesh);
      
      // Create high-poly snake head
      const snakeGeo = new THREE.CapsuleGeometry(0.25, 0.8, 16, 32);
      const snakeMat = new THREE.MeshStandardMaterial({
        color: 0x88ffcc,
        metalness: 0.7,
        roughness: 0.25,
        emissive: 0x44aa88,
        emissiveIntensity: 0.4
      });
      snakeMesh = new THREE.Mesh(snakeGeo, snakeMat);
      snakeMesh.rotation.x = Math.PI / 2;
      snakeMesh.position.copy(eggMesh.position);
      snakeMesh.castShadow = true;
      world.add(snakeMesh);
      
      if (hud) {
        hud.textContent = "🐍 Ready!";
      }
    }
    // Phase 3: Demonstrate movement (0.7 - 1.0)
    else if (progress < 1.0 && snakeMesh) {
      const demoProgress = (progress - 0.7) / 0.3;
      
      // Move snake to center, turn to face forward
      const startPos = new THREE.Vector3(-3, 0.7, 0);
      const endPos = new THREE.Vector3(0, 0.7, 0);
      snakeMesh.position.lerpVectors(startPos, endPos, demoProgress);
      
      // Rotate to face forward (positive Z)
      const startRot = new THREE.Euler(Math.PI / 2, 0, Math.PI / 2);
      const endRot = new THREE.Euler(Math.PI / 2, 0, 0);
      snakeMesh.rotation.x = THREE.MathUtils.lerp(startRot.x, endRot.x, demoProgress);
      snakeMesh.rotation.z = THREE.MathUtils.lerp(startRot.z, endRot.z, demoProgress);
      
      // Camera follows to gameplay position
      const camStart = new THREE.Vector3(-5, 2, 0);
      const camEnd = new THREE.Vector3(0, 2.5, -6);
      camera.position.lerpVectors(camStart, camEnd, demoProgress);
      camera.lookAt(snakeMesh.position);
      
      spotLight.intensity = 3 * (1 - demoProgress);
    }
    // Phase 4: Complete - start game
    else if (progress >= 1.0) {
      scene.remove(spotLight);
      
      // Cleanup crack particles
      crackParticles.forEach(p => {
        world.remove(p);
        p.geometry.dispose();
        p.material.dispose();
      });

      // Fade HUD back in
      if (hud) {
        hud.style.transition = "opacity 0.5s ease";
        hud.style.opacity = "1";
      }

      callback(snakeMesh);
      return;
    }

    // Animate crack particles
    crackParticles.forEach((p, i) => {
      if (!p.parent) return;
      p.position.add(p.userData.velocity);
      p.userData.velocity.y -= 0.002;
      p.material.opacity *= 0.96;
      
      if (p.material.opacity < 0.1) {
        world.remove(p);
        p.geometry.dispose();
        p.material.dispose();
      }
    });

    requestAnimationFrame(animateIntro);
  }

  animateIntro();
}
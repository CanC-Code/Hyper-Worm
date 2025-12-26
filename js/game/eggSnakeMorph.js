/// eggSnakeMorph.js
/// Egg intro that morphs directly into the REAL segmented snake
/// CCVO / CanC-Code

import * as THREE from "../../three/three.module.js";
import { world, scene, camera } from "../render/scene.js";
import { Snake } from "./snake.js";

export function spawnSmoothEggSnake(callback) {

  // --------------------------------------------------
  // Camera setup (cinematic side view)
  // --------------------------------------------------

  camera.position.set(-5, 2, 0);
  camera.lookAt(0, 0.7, 0);

  // --------------------------------------------------
  // HUD handling
  // --------------------------------------------------

  const hud = document.getElementById("hud");
  if (hud) {
    hud.style.opacity = "0.5";
    hud.textContent = "🥚 Hatching...";
  }

  // --------------------------------------------------
  // Egg + glow
  // --------------------------------------------------

  const eggGeo = new THREE.SphereGeometry(0.5, 64, 64);
  eggGeo.scale(1, 1.4, 1);

  const eggMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.3,
    roughness: 0.6,
    emissive: 0xccffee,
    emissiveIntensity: 0.3
  });

  const egg = new THREE.Mesh(eggGeo, eggMat);
  egg.position.set(-3, 0.7, 0);
  world.add(egg);

  const glowGeo = eggGeo.clone();
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xaaffee,
    transparent: true,
    opacity: 0.25,
    side: THREE.BackSide
  });

  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.scale.multiplyScalar(1.15);
  glow.position.copy(egg.position);
  world.add(glow);

  // --------------------------------------------------
  // Spotlight
  // --------------------------------------------------

  const light = new THREE.SpotLight(0xaaffee, 3, 15, Math.PI / 5, 0.5);
  light.position.set(-3, 6, 0);
  light.target = egg;
  scene.add(light);

  // --------------------------------------------------
  // Timing
  // --------------------------------------------------

  const clock = new THREE.Clock();
  const duration = 3.2;
  let progress = 0;

  let snake = null;

  // --------------------------------------------------
  // Animation loop
  // --------------------------------------------------

  function animateIntro() {
    const delta = clock.getDelta();
    progress += delta / duration;

    // -------------------------------
    // Phase 1: Egg wobble + cracks
    // -------------------------------

    if (progress < 0.6) {
      const t = progress / 0.6;

      const wobble = Math.sin(progress * 18) * t * 0.4;
      egg.rotation.set(wobble, 0, wobble * 0.6);
      glow.rotation.copy(egg.rotation);

      eggMat.emissiveIntensity = 0.3 + Math.sin(progress * 12) * 0.25;
      glowMat.opacity = 0.15 + Math.sin(progress * 10) * 0.15;

      const squash = 1.4 - t * 0.9;
      const stretch = 1 + t * 0.2;
      egg.scale.set(stretch, squash, stretch);
      glow.scale.set(stretch * 1.15, squash * 1.15, stretch * 1.15);

      egg.position.y = 0.7 + Math.abs(Math.sin(progress * 20)) * 0.12;
      glow.position.y = egg.position.y;
    }

    // -------------------------------
    // Phase 2: Egg → REAL snake
    // -------------------------------

    else if (progress >= 0.6 && !snake) {
      world.remove(egg);
      world.remove(glow);

      snake = new Snake({
        segmentLength: 0.5,
        initialLength: 1,        // CRITICAL
        radius: 0.35,
        taper: 0.55,
        speed: 0                // no movement yet
      });

      snake.object3D.position.set(-3, 0.7, 0);
      snake.object3D.rotation.y = Math.PI / 2;
      world.add(snake.object3D);

      if (hud) hud.textContent = "🐍 Awakening…";
    }

    // -------------------------------
    // Phase 3: Grow + align
    // -------------------------------

    else if (progress < 1.0 && snake) {
      const t = (progress - 0.6) / 0.4;

      // Grow smoothly (no popping)
      snake.setTargetLength(1 + t * 5);

      // Slide to center
      snake.object3D.position.lerp(
        new THREE.Vector3(0, 0.7, 0),
        0.05
      );

      // Rotate to forward-facing
      snake.object3D.rotation.y = THREE.MathUtils.lerp(
        Math.PI / 2,
        0,
        t
      );

      // Camera move
      camera.position.lerp(
        new THREE.Vector3(0, 2.5, -6),
        0.05
      );
      camera.lookAt(snake.object3D.position);

      light.intensity = 3 * (1 - t);
    }

    // -------------------------------
    // Phase 4: Done
    // -------------------------------

    else {
      scene.remove(light);
      if (hud) hud.style.opacity = "1";

      callback(snake);
      return;
    }

    requestAnimationFrame(animateIntro);
  }

  animateIntro();
}
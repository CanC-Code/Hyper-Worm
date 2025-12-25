/// eggSnakeMorph.js
/// Egg intro that stretches into the initial snake mesh
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

/**
 * Spawns an egg that morphs into the initial snake mesh
 * @param {THREE.Object3D} parent - scene or world to attach to
 * @param {Function} callback - receives the final snake mesh
 */
export function spawnSmoothEggSnake(parent, callback) {
  // Base sphere (will become snake seed)
  const geo = new THREE.SphereGeometry(0.5, 48, 48);

  const mat = new THREE.MeshStandardMaterial({
    color: 0x6fffd2,        // mint green
    metalness: 0.75,
    roughness: 0.35,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0.5, 0);
  parent.add(mesh);

  const clock = new THREE.Clock();
  const duration = 2.0;
  let t = 0;

  function animate() {
    const delta = clock.getDelta();
    t += delta / duration;

    if (t >= 1) {
      // Final snake seed shape
      mesh.scale.set(0.6, 0.6, 1.6);
      mesh.rotation.x = Math.PI / 2; // forward along Z

      callback(mesh);
      return;
    }

    // Egg → snake stretch
    const squash = 1.2 - 0.6 * t;
    const stretch = 1.0 + 0.8 * t;

    mesh.scale.set(squash, squash, stretch);

    requestAnimationFrame(animate);
  }

  animate();
}
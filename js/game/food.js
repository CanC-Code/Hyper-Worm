/// food.js
/// Food spawning and collision with enhanced visuals - ENHANCED
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state, registerBite } from "./gameState.js";

let foodMesh = null;
let foodGlow = null;

export function spawnFood(world, roomSize = 12) {
  if (foodMesh) world.remove(foodMesh);
  if (foodGlow) world.remove(foodGlow);

  // Main food mesh - higher poly
  const geo = new THREE.IcosahedronGeometry(0.4, 2); // More subdivisions
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff3333,
    roughness: 0.2,
    metalness: 0.7,
    emissive: 0xff0000,
    emissiveIntensity: 0.6
  });
  foodMesh = new THREE.Mesh(geo, mat);
  foodMesh.castShadow = true;

  // Glow effect - larger and more prominent
  const glowGeo = new THREE.IcosahedronGeometry(0.6, 2);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff6666,
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide
  });
  foodGlow = new THREE.Mesh(glowGeo, glowMat);

  // Position food randomly within room bounds (avoid edges)
  const range = (roomSize / 2) - 2;
  const x = (Math.random() * 2 - 1) * range;
  const z = (Math.random() * 2 - 1) * range;
  
  foodMesh.position.set(x, 0.35, z);
  foodGlow.position.set(x, 0.35, z);
  
  world.add(foodMesh);
  world.add(foodGlow);

  // Animate food (bobbing and rotating)
  const startTime = Date.now();
  function animateFood() {
    if (!foodMesh || !foodGlow) return;
    
    const elapsed = (Date.now() - startTime) / 1000;
    
    // Bobbing motion
    const bob = Math.sin(elapsed * 3) * 0.1;
    foodMesh.position.y = 0.35 + bob;
    foodGlow.position.y = 0.35 + bob;
    
    // Rotation
    foodMesh.rotation.y = elapsed * 2;
    foodGlow.rotation.y = -elapsed * 1.5;
    
    // Pulsing glow
    const pulse = 0.3 + Math.sin(elapsed * 4) * 0.15;
    glowMat.opacity = pulse;
    
    requestAnimationFrame(animateFood);
  }
  animateFood();
}

export function checkFoodCollision(headPos) {
  if (!foodMesh) return false;
  checkFoodCollision.__foodPosition = foodMesh.position; // Store for minimap
  const distance = headPos.distanceTo(foodMesh.position);
  if (distance < 0.6) {
    registerBite();
    return true;
  }
  return false;
}

export function removeFood(world) {
  if (!foodMesh) return;
  
  world.remove(foodMesh);
  foodMesh.geometry.dispose();
  foodMesh.material.dispose();
  foodMesh = null;
  
  if (foodGlow) {
    world.remove(foodGlow);
    foodGlow.geometry.dispose();
    foodGlow.material.dispose();
    foodGlow = null;
  }
}
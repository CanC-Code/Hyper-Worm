/// door.js
/// Door system for room progression - ENHANCED
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

let doorMesh = null;
let doorFrame = null;
let doorGlow = null;

export function spawnDoor(scene, roomSize = 12) {
  if (doorMesh) scene.remove(doorMesh);
  if (doorFrame) scene.remove(doorFrame);
  if (doorGlow) scene.remove(doorGlow);

  // Door frame
  const frameGeo = new THREE.BoxGeometry(2.2, 2.8, 0.3);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x666666,
    roughness: 0.8,
    metalness: 0.5
  });
  doorFrame = new THREE.Mesh(frameGeo, frameMat);
  doorFrame.position.set(0, 1.4, roomSize / 2 - 0.2);
  doorFrame.castShadow = true;
  scene.add(doorFrame);

  // Door itself
  const doorGeo = new THREE.BoxGeometry(1.8, 2.4, 0.2);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x44ff44,
    roughness: 0.3,
    metalness: 0.7,
    emissive: 0x22ff22,
    emissiveIntensity: 0.4
  });
  doorMesh = new THREE.Mesh(doorGeo, doorMat);
  doorMesh.position.set(0, 1.4, roomSize / 2 - 0.15);
  doorMesh.castShadow = true;
  scene.add(doorMesh);

  // Glow effect
  const glowGeo = new THREE.BoxGeometry(2.0, 2.6, 0.3);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x44ff44,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
  });
  doorGlow = new THREE.Mesh(glowGeo, glowMat);
  doorGlow.position.set(0, 1.4, roomSize / 2 - 0.15);
  scene.add(doorGlow);

  // Animate door appearance
  doorMesh.scale.set(0, 0, 1);
  doorFrame.scale.set(0, 0, 1);
  doorGlow.scale.set(0, 0, 1);

  const startTime = Date.now();
  function animateDoorOpen() {
    const elapsed = (Date.now() - startTime) / 1000;
    const scale = Math.min(elapsed / 0.5, 1);
    
    doorMesh.scale.set(scale, scale, 1);
    doorFrame.scale.set(scale, scale, 1);
    doorGlow.scale.set(scale, scale, 1);

    if (scale < 1) {
      requestAnimationFrame(animateDoorOpen);
    } else {
      startDoorPulse();
    }
  }
  animateDoorOpen();

  function startDoorPulse() {
    function pulseDoor() {
      if (!doorMesh || !doorGlow) return;
      
      const time = Date.now() / 1000;
      const pulse = 0.4 + Math.sin(time * 4) * 0.2;
      doorMat.emissiveIntensity = pulse;
      
      const glowPulse = 0.2 + Math.sin(time * 4) * 0.1;
      glowMat.opacity = glowPulse;
      
      requestAnimationFrame(pulseDoor);
    }
    pulseDoor();
  }
}

export function checkDoorEntry(headPos, roomSize) {
  if (!doorMesh) return false;
  
  const doorZ = roomSize / 2 - 0.15;
  const distance = new THREE.Vector3(
    headPos.x - 0,
    headPos.y - 1.4,
    headPos.z - doorZ
  ).length();
  
  return distance < 1.2;
}

export function clearDoor(scene) {
  if (doorMesh) {
    scene.remove(doorMesh);
    doorMesh.geometry.dispose();
    doorMesh.material.dispose();
    doorMesh = null;
  }
  
  if (doorFrame) {
    scene.remove(doorFrame);
    doorFrame.geometry.dispose();
    doorFrame.material.dispose();
    doorFrame = null;
  }
  
  if (doorGlow) {
    scene.remove(doorGlow);
    doorGlow.geometry.dispose();
    doorGlow.material.dispose();
    doorGlow = null;
  }
}
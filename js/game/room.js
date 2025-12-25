/// room.js
/// Procedurally generate 3D room with enhanced visuals - ENHANCED
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export const state = {
  walls: [],
  floor: null,
  decorations: []
};

export function buildRoom(worldRef, size = 12, height = 4) {
  // Enhanced materials with better visuals
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x3366cc,
    roughness: 0.7,
    metalness: 0.3,
    emissive: 0x112244,
    emissiveIntensity: 0.2
  });
  
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a3a,
    roughness: 0.9,
    metalness: 0.1
  });

  // Enhanced floor with grid pattern
  const floorGeo = new THREE.PlaneGeometry(size, size, 10, 10);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  worldRef.add(floor);
  state.floor = floor;

  // Add grid lines on floor
  const gridHelper = new THREE.GridHelper(size, 20, 0x444466, 0x333344);
  gridHelper.position.y = 0.01;
  worldRef.add(gridHelper);
  state.decorations.push(gridHelper);

  // Walls with thickness
  const wallThickness = 0.3;
  
  // Front wall
  const wallFrontGeo = new THREE.BoxGeometry(size, height, wallThickness);
  const wallFront = new THREE.Mesh(wallFrontGeo, wallMat);
  wallFront.position.set(0, height / 2, size / 2);
  wallFront.castShadow = true;
  wallFront.receiveShadow = true;
  worldRef.add(wallFront);
  state.walls.push(wallFront);

  // Back wall
  const wallBack = new THREE.Mesh(wallFrontGeo, wallMat);
  wallBack.position.set(0, height / 2, -size / 2);
  wallBack.castShadow = true;
  wallBack.receiveShadow = true;
  worldRef.add(wallBack);
  state.walls.push(wallBack);

  // Right wall
  const wallSideGeo = new THREE.BoxGeometry(wallThickness, height, size);
  const wallRight = new THREE.Mesh(wallSideGeo, wallMat);
  wallRight.position.set(size / 2, height / 2, 0);
  wallRight.castShadow = true;
  wallRight.receiveShadow = true;
  worldRef.add(wallRight);
  state.walls.push(wallRight);

  // Left wall
  const wallLeft = new THREE.Mesh(wallSideGeo, wallMat);
  wallLeft.position.set(-size / 2, height / 2, 0);
  wallLeft.castShadow = true;
  wallLeft.receiveShadow = true;
  worldRef.add(wallLeft);
  state.walls.push(wallLeft);

  // Add corner pillars for visual interest
  const pillarGeo = new THREE.CylinderGeometry(0.3, 0.4, height, 8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x5577dd,
    roughness: 0.6,
    metalness: 0.4
  });

  const corners = [
    [size / 2 - 0.5, -size / 2 + 0.5],
    [-size / 2 + 0.5, -size / 2 + 0.5],
    [size / 2 - 0.5, size / 2 - 0.5],
    [-size / 2 + 0.5, size / 2 - 0.5]
  ];

  corners.forEach(([x, z]) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(x, height / 2, z);
    pillar.castShadow = true;
    worldRef.add(pillar);
    state.decorations.push(pillar);
  });

  // Add ambient light markers in corners
  corners.forEach(([x, z]) => {
    const lightMarkerGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const lightMarkerMat = new THREE.MeshStandardMaterial({
      color: 0x88ffff,
      emissive: 0x88ffff,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.8
    });
    const lightMarker = new THREE.Mesh(lightMarkerGeo, lightMarkerMat);
    lightMarker.position.set(x, height - 0.5, z);
    worldRef.add(lightMarker);
    state.decorations.push(lightMarker);
  });
}

export function clearRoom(worldRef) {
  if (state.floor) {
    worldRef.remove(state.floor);
    state.floor.geometry.dispose();
    state.floor.material.dispose();
    state.floor = null;
  }
  
  for (const wall of state.walls) {
    worldRef.remove(wall);
    wall.geometry.dispose();
    wall.material.dispose();
  }
  state.walls = [];

  for (const deco of state.decorations) {
    worldRef.remove(deco);
    if (deco.geometry) deco.geometry.dispose();
    if (deco.material) deco.material.dispose();
  }
  state.decorations = [];
}

export function checkWallCollision(position, roomSize) {
  const buffer = 0.4; // Collision buffer
  const halfSize = roomSize / 2 - buffer;
  
  return (
    position.x > halfSize ||
    position.x < -halfSize ||
    position.z > halfSize ||
    position.z < -halfSize
  );
}
/// room.js
/// Procedurally generate 3D room
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

export const state = {
  walls: [],
  floor: null
};

export function buildRoom(worldRef, size = 12, height = 4) {
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x4444aa, side: THREE.BackSide });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.DoubleSide });

  // Floor
  const floorGeo = new THREE.PlaneGeometry(size, size);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  worldRef.add(floor);
  state.floor = floor;

  // Walls
  const wallGeoH = new THREE.PlaneGeometry(size, height);
  const wallGeoD = new THREE.PlaneGeometry(size, height);

  const wallFront = new THREE.Mesh(wallGeoH, wallMat);
  wallFront.position.set(0, height / 2, size / 2);
  wallFront.rotation.y = Math.PI;
  worldRef.add(wallFront);
  state.walls.push(wallFront);

  const wallBack = new THREE.Mesh(wallGeoH, wallMat);
  wallBack.position.set(0, height / 2, -size / 2);
  worldRef.add(wallBack);
  state.walls.push(wallBack);

  const wallRight = new THREE.Mesh(wallGeoD, wallMat);
  wallRight.position.set(size / 2, height / 2, 0);
  wallRight.rotation.y = -Math.PI / 2;
  worldRef.add(wallRight);
  state.walls.push(wallRight);

  const wallLeft = new THREE.Mesh(wallGeoD, wallMat);
  wallLeft.position.set(-size / 2, height / 2, 0);
  wallLeft.rotation.y = Math.PI / 2;
  worldRef.add(wallLeft);
  state.walls.push(wallLeft);
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
}
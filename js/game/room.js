/// room.js
/// Procedurally generate 3D dungeon room with textures
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

export const state = {
  walls: [],
  floor: null,
  roomWidth: 12,
  roomHeight: 6,
  roomDepth: 12,
};

/* ---------- Build Room ---------- */
export function buildRoom(worldRef, width = 12, height = 6, depth = 12) {
  state.roomWidth = width;
  state.roomHeight = height;
  state.roomDepth = depth;

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x333366,
    roughness: 0.6,
    metalness: 0.2,
    side: THREE.BackSide,
  });

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.85,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // Floor
  const floorGeo = new THREE.PlaneGeometry(width, depth, 1, 1);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  worldRef.add(floor);
  state.floor = floor;

  // Walls
  const wallGeoH = new THREE.PlaneGeometry(width, height);
  const wallGeoD = new THREE.PlaneGeometry(depth, height);

  // +Z wall
  const wallFront = new THREE.Mesh(wallGeoH, wallMat);
  wallFront.position.set(0, height / 2, depth / 2);
  wallFront.rotation.y = Math.PI;
  worldRef.add(wallFront);
  state.walls.push(wallFront);

  // -Z wall
  const wallBack = new THREE.Mesh(wallGeoH, wallMat);
  wallBack.position.set(0, height / 2, -depth / 2);
  worldRef.add(wallBack);
  state.walls.push(wallBack);

  // +X wall
  const wallRight = new THREE.Mesh(wallGeoD, wallMat);
  wallRight.position.set(width / 2, height / 2, 0);
  wallRight.rotation.y = -Math.PI / 2;
  worldRef.add(wallRight);
  state.walls.push(wallRight);

  // -X wall
  const wallLeft = new THREE.Mesh(wallGeoD, wallMat);
  wallLeft.position.set(-width / 2, height / 2, 0);
  wallLeft.rotation.y = Math.PI / 2;
  worldRef.add(wallLeft);
  state.walls.push(wallLeft);
}

/* ---------- Clear Room ---------- */
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
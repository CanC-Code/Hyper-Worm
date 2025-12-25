/// room.js
/// Procedurally generate 3D room for Hyper-Worm
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

export const state = {
  walls: [],
  floor: null,
  roomWidth: 10,
  roomHeight: 4,
  roomDepth: 10,
};

/* ---------- Build Room ---------- */
export function buildRoom(worldRef, width = 10, height = 4, depth = 10) {
  state.roomWidth = width;
  state.roomHeight = height;
  state.roomDepth = depth;

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x4444aa, side: THREE.BackSide });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.DoubleSide });

  // Floor
  const floorGeo = new THREE.PlaneGeometry(width, depth);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  worldRef.add(floor);
  state.floor = floor;

  // Ceiling (optional)
  // const ceiling = new THREE.Mesh(floorGeo, floorMat);
  // ceiling.rotation.x = Math.PI / 2;
  // ceiling.position.y = height;
  // worldRef.add(ceiling);
  // state.walls.push(ceiling);

  // Walls
  const wallGeoH = new THREE.PlaneGeometry(width, height);
  const wallGeoD = new THREE.PlaneGeometry(depth, height);

  // +Z wall (front)
  const wallFront = new THREE.Mesh(wallGeoH, wallMat);
  wallFront.position.set(0, height / 2, depth / 2);
  wallFront.rotation.y = Math.PI;
  worldRef.add(wallFront);
  state.walls.push(wallFront);

  // -Z wall (back)
  const wallBack = new THREE.Mesh(wallGeoH, wallMat);
  wallBack.position.set(0, height / 2, -depth / 2);
  wallBack.rotation.y = 0;
  worldRef.add(wallBack);
  state.walls.push(wallBack);

  // +X wall (right)
  const wallRight = new THREE.Mesh(wallGeoD, wallMat);
  wallRight.position.set(width / 2, height / 2, 0);
  wallRight.rotation.y = -Math.PI / 2;
  worldRef.add(wallRight);
  state.walls.push(wallRight);

  // -X wall (left)
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
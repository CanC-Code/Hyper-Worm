/// room.js
/// Procedural 3D room generation
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

/**
 * Safe add to world
 */
function safeAdd(parent, child) {
  if (child instanceof THREE.Object3D) parent.add(child);
  else console.error("Attempted to add non-Object3D to world:", child);
}

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
  safeAdd(worldRef, floor);
  state.floor = floor;

  // Walls
  const wallGeoH = new THREE.PlaneGeometry(width, height);
  const wallGeoD = new THREE.PlaneGeometry(depth, height);

  const walls = [
    { geo: wallGeoH, pos: [0, height / 2, depth / 2], rotY: Math.PI },      // front
    { geo: wallGeoH, pos: [0, height / 2, -depth / 2], rotY: 0 },           // back
    { geo: wallGeoD, pos: [width / 2, height / 2, 0], rotY: -Math.PI / 2 }, // right
    { geo: wallGeoD, pos: [-width / 2, height / 2, 0], rotY: Math.PI },     // left
  ];

  for (const w of walls) {
    const mesh = new THREE.Mesh(w.geo, wallMat);
    mesh.position.set(...w.pos);
    mesh.rotation.y = w.rotY;
    safeAdd(worldRef, mesh);
    state.walls.push(mesh);
  }
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
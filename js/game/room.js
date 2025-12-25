/// room.js
/// Purpose: Room construction and wall collision logic
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { state } from "./gameState.js";

let walls = [];

const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x3333aa,
  flatShading: true
});

export function clearRoom(scene) {
  walls.forEach(w => scene.remove(w));
  walls.length = 0;
}

export function buildRoom(scene) {
  clearRoom(scene);

  const half = state.roomSize / 2;
  const wallThickness = 1;

  const horizGeo = new THREE.BoxGeometry(
    state.roomSize + wallThickness,
    1,
    wallThickness
  );

  const vertGeo = new THREE.BoxGeometry(
    wallThickness,
    1,
    state.roomSize
  );

  // North / South
  [-half, half].forEach(z => {
    const wall = new THREE.Mesh(horizGeo, wallMaterial);
    wall.position.set(0, 0.5, z);
    scene.add(wall);
    walls.push(wall);
  });

  // East / West
  [-half, half].forEach(x => {
    const wall = new THREE.Mesh(vertGeo, wallMaterial);
    wall.position.set(x, 0.5, 0);
    scene.add(wall);
    walls.push(wall);
  });
}

export function isOutsideRoom(position) {
  const limit = state.roomSize / 2 - 0.5;
  return (
    Math.abs(position.x) > limit ||
    Math.abs(position.z) > limit
  );
}
/// cameraController.js
/// Purpose: First-person / POV camera following snake
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { camera } from "./scene.js";
import { getHeadPosition, getHeadDirection } from "../game/snake.js";

let cameraOffset = new THREE.Vector3(0, 1, -2); // behind the head
let targetPosition = new THREE.Vector3();
let targetLook = new THREE.Vector3();

/**
 * Updates camera to follow the snake in first-person POV
 * @param {number} delta - frame delta time
 */
export function updateCamera(delta) {
  const headPos = getHeadPosition();
  const headDir = getHeadDirection();

  targetPosition.copy(headPos).addScaledVector(headDir, cameraOffset.z);
  targetPosition.y += cameraOffset.y;

  camera.position.lerp(targetPosition, 0.1);

  targetLook.copy(headPos).addScaledVector(headDir, 2);
  camera.lookAt(targetLook);
}

/**
 * Allows adjusting camera offset (height / distance behind snake)
 */
export function setCameraOffset(offsetVec3) {
  cameraOffset.copy(offsetVec3);
}
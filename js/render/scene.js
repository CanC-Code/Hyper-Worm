/// scene.js
/// Renderer and scene utilities for Hyper-Worm
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";

let rendererInstance = null;

/**
 * Initializes the WebGLRenderer with shadows and proper settings
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {THREE.WebGLRenderer}
 */
export function initRenderer(width, height) {
  rendererInstance = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  rendererInstance.setSize(width, height);
  rendererInstance.setPixelRatio(window.devicePixelRatio);
  rendererInstance.shadowMap.enabled = true;
  rendererInstance.shadowMap.type = THREE.PCFSoftShadowMap;
  rendererInstance.outputEncoding = THREE.sRGBEncoding;

  return rendererInstance;
}

/**
 * Clears the scene completely, disposing geometries and materials
 * @param {THREE.Scene} scene
 */
export function clearScene(scene) {
  scene.traverse((obj) => {
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });

  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
}

/**
 * Returns the current renderer instance
 */
export function getRenderer() {
  return rendererInstance;
}
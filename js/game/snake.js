// snake.js
// Purpose: Continuous segmented snake body using a tapered TubeGeometry
// Author: CCVO + assistant
// Drop-in replacement for sphere/segment based snakes

import * as THREE from "./three/three.module.js";

export class Snake {
  constructor(scene) {
    this.scene = scene;

    // --- Physical parameters ---
    this.currentLength = 2.2;     // starting length (world units)
    this.maxLength = 30.0;
    this.growRate = 0.8;

    this.bodyRadius = 0.28;
    this.tailRadius = 0.10;

    // --- Spine ---
    this.spine = [];
    this.minPointDistance = 0.04; // controls smoothness vs performance

    // --- Mesh ---
    this.mesh = null;
    this.radialSegments = 12;
    this.tubularSegments = 72;

    this._initMesh();
  }

  /* ---------------------------------------------------------------- */
  /* Initialization                                                   */
  /* ---------------------------------------------------------------- */

  _initMesh() {
    // Temporary straight curve to initialize geometry
    const p0 = new THREE.Vector3(0, 0, 0);
    const p1 = new THREE.Vector3(0, 0, -0.1);
    this.spine.push(p0, p1);

    const curve = new THREE.CatmullRomCurve3(this.spine, false, "catmullrom", 0.4);

    const geometry = new THREE.TubeGeometry(
      curve,
      this.tubularSegments,
      this.bodyRadius,
      this.radialSegments,
      false
    );

    this._applyTaper(geometry);

    const material = new THREE.MeshStandardMaterial({
      color: 0x33ff88,
      roughness: 0.35,
      metalness: 0.08
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;

    this.scene.add(this.mesh);
  }

  /* ---------------------------------------------------------------- */
  /* Public API                                                       */
  /* ---------------------------------------------------------------- */

  /**
   * Call once per frame AFTER head movement
   * @param {THREE.Vector3} headPosition
   */
  update(headPosition) {
    this._updateSpine(headPosition);
    this._rebuildGeometry();
  }

  /**
   * Call when food is eaten
   */
  grow() {
    this.currentLength = Math.min(
      this.currentLength + this.growRate,
      this.maxLength
    );
  }

  /**
   * Optional: reset on death / room transition
   */
  reset(position) {
    this.spine.length = 0;
    this.spine.push(
      position.clone(),
      position.clone().add(new THREE.Vector3(0, 0, -0.1))
    );
    this.currentLength = 2.2;
  }

  /* ---------------------------------------------------------------- */
  /* Spine logic                                                      */
  /* ---------------------------------------------------------------- */

  _updateSpine(headPos) {
    const last = this.spine[0];

    // Prevent oversampling
    if (last && last.distanceToSquared(headPos) < this.minPointDistance ** 2) {
      return;
    }

    this.spine.unshift(headPos.clone());

    // Trim spine to physical length
    let accumulated = 0;
    for (let i = 0; i < this.spine.length - 1; i++) {
      accumulated += this.spine[i].distanceTo(this.spine[i + 1]);
      if (accumulated > this.currentLength) {
        this.spine.length = i + 1;
        break;
      }
    }
  }

  /* ---------------------------------------------------------------- */
  /* Geometry                                                         */
  /* ---------------------------------------------------------------- */

  _rebuildGeometry() {
    if (this.spine.length < 2) return;

    const curve = new THREE.CatmullRomCurve3(
      this.spine,
      false,
      "catmullrom",
      0.4
    );

    const geometry = new THREE.TubeGeometry(
      curve,
      this.tubularSegments,
      this.bodyRadius,
      this.radialSegments,
      false
    );

    this._applyTaper(geometry);
    geometry.computeVertexNormals();

    this.mesh.geometry.dispose();
    this.mesh.geometry = geometry;
  }

  _applyTaper(geometry) {
    const pos = geometry.attributes.position;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
      // t = 0 head, 1 tail
      const t = i / (count - 1);

      // Smooth exponential taper (avoids pinching)
      const radius = THREE.MathUtils.lerp(
        this.bodyRadius,
        this.tailRadius,
        t * t
      );

      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      const scale = radius / this.bodyRadius;

      pos.setXYZ(
        i,
        x * scale,
        y * scale,
        z
      );
    }

    pos.needsUpdate = true;
  }
}
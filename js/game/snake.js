// snake.js
// Continuous segmented snake body using tapered TubeGeometry
// CCVO + assistant — FINALIZED ARCHITECTURE

import * as THREE from "./three/three.module.js";

export class Snake {
  constructor({
    segmentLength = 0.5,
    initialLength = 2.2,
    maxLength = 30,
    radius = 0.28,
    tailRadius = 0.10,
    radialSegments = 12,
    tubularSegments = 72,
    growSpeed = 4.0
  } = {}) {

    // ---------------------------------
    // Public root
    // ---------------------------------
    this.object3D = new THREE.Group();

    // ---------------------------------
    // Length control
    // ---------------------------------
    this.currentLength = initialLength;
    this.targetLength = initialLength;
    this.maxLength = maxLength;
    this.growSpeed = growSpeed;

    // ---------------------------------
    // Geometry params
    // ---------------------------------
    this.bodyRadius = radius;
    this.tailRadius = tailRadius;
    this.radialSegments = radialSegments;
    this.tubularSegments = tubularSegments;

    // ---------------------------------
    // Spine
    // ---------------------------------
    this.spine = [];
    this.minPointDistance = 0.04;

    // ---------------------------------
    // Mesh
    // ---------------------------------
    this.mesh = null;

    this._initMesh();
  }

  /* ============================================================= */
  /* Initialization                                                */
  /* ============================================================= */

  _initMesh() {
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

    this.object3D.add(this.mesh);
  }

  /* ============================================================= */
  /* Public API                                                    */
  /* ============================================================= */

  /**
   * Smoothly grow toward a length (used by egg intro + gameplay)
   */
  setTargetLength(length) {
    this.targetLength = THREE.MathUtils.clamp(
      length,
      0.5,
      this.maxLength
    );
  }

  /**
   * Discrete growth (food pickup)
   */
  grow(amount = 0.8) {
    this.setTargetLength(this.targetLength + amount);
  }

  /**
   * Update AFTER head transform moves
   */
  update(headWorldPosition, delta) {
    this._updateLength(delta);
    this._updateSpine(headWorldPosition);
    this._rebuildGeometry();
  }

  reset(position) {
    this.spine.length = 0;
    this.spine.push(
      position.clone(),
      position.clone().add(new THREE.Vector3(0, 0, -0.1))
    );
    this.currentLength = this.targetLength;
  }

  /* ============================================================= */
  /* Length logic                                                  */
  /* ============================================================= */

  _updateLength(delta) {
    if (this.currentLength === this.targetLength) return;

    this.currentLength = THREE.MathUtils.damp(
      this.currentLength,
      this.targetLength,
      this.growSpeed,
      delta
    );
  }

  /* ============================================================= */
  /* Spine logic                                                   */
  /* ============================================================= */

  _updateSpine(headPos) {
    const last = this.spine[0];
    if (last && last.distanceToSquared(headPos) < this.minPointDistance ** 2) {
      return;
    }

    this.spine.unshift(headPos.clone());

    let accumulated = 0;
    for (let i = 0; i < this.spine.length - 1; i++) {
      accumulated += this.spine[i].distanceTo(this.spine[i + 1]);
      if (accumulated > this.currentLength) {
        this.spine.length = i + 1;
        break;
      }
    }
  }

  /* ============================================================= */
  /* Geometry                                                     */
  /* ============================================================= */

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
      const t = i / (count - 1);
      const radius = THREE.MathUtils.lerp(
        this.bodyRadius,
        this.tailRadius,
        t * t
      );

      const scale = radius / this.bodyRadius;

      pos.setXYZ(
        i,
        pos.getX(i) * scale,
        pos.getY(i) * scale,
        pos.getZ(i)
      );
    }

    pos.needsUpdate = true;
  }
}
/// snake.js
/// Hyper-Worm tubular snake entity
/// CCVO / CanC-Code

import * as THREE from "../../three/three.module.js";

export class Snake {
  constructor({ segmentLength = 0.5, initialLength = 1, radius = 0.3, taper = 0.5, speed = 1 }) {
    this.segmentLength = segmentLength;
    this.radius = radius;
    this.taper = taper;
    this.speed = speed;

    this.length = initialLength;
    this.targetLength = initialLength;
    this.segments = [];

    this.object3D = new THREE.Group();
    this.head = new THREE.Object3D();
    this.object3D.add(this.head);

    this.initSegments();
  }

  initSegments() {
    this.segments = [];
    for (let i = 0; i < this.length; i++) {
      const segRadius = this.radius * (1 - (i / this.length) * this.taper);
      const geo = new THREE.CylinderGeometry(segRadius, segRadius, this.segmentLength, 12);
      geo.rotateX(Math.PI / 2);

      const mat = new THREE.MeshStandardMaterial({
        color: 0x44ff44,
        roughness: 0.5,
        metalness: 0.3,
        emissive: 0x22ff22,
        emissiveIntensity: 0.2
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-i * this.segmentLength, 0, 0);
      mesh.castShadow = true;
      this.object3D.add(mesh);
      this.segments.push(mesh);
    }
  }

  update(turnInput = 0) {
    // Move head forward
    this.head.position.x += this.speed * 0.1;
    this.head.rotation.y += turnInput * 0.05;

    // Update segments
    let prevPos = this.head.position.clone();
    let prevQuat = this.head.quaternion.clone();

    this.segments.forEach((seg) => {
      // Smooth follow
      seg.position.lerp(prevPos, 0.2);
      seg.quaternion.slerp(prevQuat, 0.2);

      prevPos = seg.position.clone();
      prevQuat = seg.quaternion.clone();
    });

    // Grow towards target length
    if (this.segments.length < this.targetLength) {
      this.addSegment();
    }
  }

  addSegment() {
    const lastSeg = this.segments[this.segments.length - 1];
    const segRadius = this.radius * (1 - (this.segments.length / this.targetLength) * this.taper);
    const geo = new THREE.CylinderGeometry(segRadius, segRadius, this.segmentLength, 12);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x44ff44,
      roughness: 0.5,
      metalness: 0.3,
      emissive: 0x22ff22,
      emissiveIntensity: 0.2
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(lastSeg.position);
    mesh.castShadow = true;
    this.object3D.add(mesh);
    this.segments.push(mesh);
  }

  setTargetLength(length) {
    this.targetLength = length;
  }

  headPosition() {
    return this.head.position.clone();
  }

  reset() {
    this.segments.forEach((seg) => this.object3D.remove(seg));
    this.head.position.set(0, 0.7, 0);
    this.segments = [];
    this.initSegments();
    this.length = 1;
    this.targetLength = 1;
  }
}
import * as THREE from "../../three/three.module.js";
import { GLOW_TEX } from "../render/scene.js";

const MAX_SEGMENTS = 100;

export class Snake {
  constructor({ sphereRadius, segmentLength = 0.5, initialSegments = 12,
                radius = 0.4, taper = 0.55, speed = 4.5 }) {
    this.sphereRadius = sphereRadius;
    this.segmentLength = segmentLength;
    this.radius = radius;
    this.taper = taper;
    this.speed = speed;
    this.turboMultiplier = 1.65;
    this.turnRate = 2.6;
    this.time = 0;
    this.hue = 0.55;

    this.headPos = new THREE.Vector3(0, sphereRadius, 0);
    this.headDir = new THREE.Vector3(1, 0, 0);
    { const n = this.headPos.clone().normalize();
      this.headDir.addScaledVector(n, -this.headDir.dot(n)).normalize(); }

    this.trail = [];
    this.segments = [];
    this.segCount = initialSegments;
    this.targetSegCount = initialSegments;
    this.object3D = new THREE.Group();

    this.headGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: GLOW_TEX, color: 0x9ff6ff, blending: THREE.AdditiveBlending,
      transparent: true, depthWrite: false, opacity: 0.9
    }));
    this.headGlow.scale.setScalar(2.6);
    this.object3D.add(this.headGlow);

    this.segGeo = new THREE.IcosahedronGeometry(1, 1);
    this.initSegments();

    this.glowPositions = new Float32Array(MAX_SEGMENTS * 3);
    this.glowColors    = new Float32Array(MAX_SEGMENTS * 3);
    this.glowGeo = new THREE.BufferGeometry();
    this.glowGeo.setAttribute("position", new THREE.BufferAttribute(this.glowPositions, 3));
    this.glowGeo.setAttribute("color",    new THREE.BufferAttribute(this.glowColors, 3));
    this.glowPoints = new THREE.Points(this.glowGeo, new THREE.PointsMaterial({
      size: 1.4, map: GLOW_TEX, vertexColors: true,
      transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, sizeAttenuation: true, opacity: 0.75
    }));
    this.object3D.add(this.glowPoints);

    this.seedTrail();
    this.updateSegments();
    this.headGlow.position.copy(this.headPos);
  }

  initSegments() {
    for (let i = 0; i < MAX_SEGMENTS; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x44ff88, toneMapped: false });
      const mesh = new THREE.Mesh(this.segGeo, mat);
      mesh.visible = false;
      mesh.frustumCulled = false;
      this.object3D.add(mesh);
      this.segments.push(mesh);
    }
  }

  seedTrail() {
    this.trail.length = 0;
    this.trail.push(this.headPos.clone());
    let bp = this.headPos.clone();
    let bd = this.headDir.clone().negate();
    const steps = Math.ceil((MAX_SEGMENTS * this.segmentLength + 12) / 0.08);
    for (let i = 0; i < steps; i++) {
      const next = bp.clone().addScaledVector(bd, 0.08);
      next.normalize().multiplyScalar(this.sphereRadius);
      const n = next.clone().normalize();
      bd.copy(next).sub(bp).normalize();
      bd.addScaledVector(n, -bd.dot(n)).normalize();
      this.trail.push(next.clone());
      bp.copy(next);
    }
  }

  setHeading(pos, dir) {
    this.headPos.copy(pos).normalize().multiplyScalar(this.sphereRadius);
    this.headDir.copy(dir);
    const n = this.headPos.clone().normalize();
    this.headDir.addScaledVector(n, -this.headDir.dot(n)).normalize();
    this.seedTrail();
    this.updateSegments();
    this.headGlow.position.copy(this.headPos);
  }

  addTrailPoint(pos) {
    if (this.trail.length > 0 && this.trail[0].distanceToSquared(pos) < 0.0004) return;
    this.trail.unshift(pos.clone());
    const maxLen = this.targetSegCount * this.segmentLength + 10;
    let acc = 0;
    for (let i = 0; i < this.trail.length - 1; i++) {
      acc += this.trail[i].distanceTo(this.trail[i + 1]);
      if (acc > maxLen) { this.trail.length = i + 2; return; }
    }
  }

  update(dt, turnInput, boost) {
    this.time += dt;
    this.hue = (this.hue + dt * 0.05) % 1;

    if (turnInput !== 0) {
      const n = this.headPos.clone().normalize();
      const q = new THREE.Quaternion().setFromAxisAngle(n, -turnInput * this.turnRate * dt);
      this.headDir.applyQuaternion(q);
    }
    { const n = this.headPos.clone().normalize();
      this.headDir.addScaledVector(n, -this.headDir.dot(n)).normalize(); }

    const speed = this.speed * (boost ? this.turboMultiplier : 1);
    const next = this.headPos.clone().addScaledVector(this.headDir, speed * dt);
    next.normalize().multiplyScalar(this.sphereRadius);

    { const nd = next.clone().sub(this.headPos).normalize();
      const nn = next.clone().normalize();
      nd.addScaledVector(nn, -nd.dot(nn)).normalize();
      this.headDir.copy(nd); }
    this.headPos.copy(next);

    this.addTrailPoint(this.headPos);

    if (this.segCount < this.targetSegCount)
      this.segCount = Math.min(this.targetSegCount, this.segCount + dt * 20);
    else if (this.segCount > this.targetSegCount)
      this.segCount = Math.max(this.targetSegCount, this.segCount - dt * 20);

    this.updateSegments();

    this.headGlow.position.copy(this.headPos);
    this.headGlow.material.color.setHSL((this.hue + 0.5) % 1, 1, 0.75);
    this.headGlow.scale.setScalar(2.6 * (1 + 0.1 * Math.sin(this.time * 8)));
  }

  updateSegments() {
    const n = Math.ceil(this.segCount);
    let trailIdx = 0, arc = 0;
    const trailLen = this.trail.length;

    for (let s = 0; s < n; s++) {
      const targetArc = s * this.segmentLength;
      let placed = false;
      while (trailIdx < trailLen - 2) {
        const a = this.trail[trailIdx];
        const b = this.trail[trailIdx + 1];
        const segLen = a.distanceTo(b);
        if (arc + segLen >= targetArc) {
          const t = (targetArc - arc) / segLen;
          const p = a.clone().lerp(b, t);
          p.normalize().multiplyScalar(this.sphereRadius);
          const mesh = this.segments[s];
          mesh.visible = true;
          mesh.position.copy(p);
          const k = s / Math.max(n, 1);
          const r = this.radius * (1 - k * this.taper);
          mesh.scale.setScalar(r * (1 + 0.08 * Math.sin(this.time * 7 - s * 0.55)));
          mesh.material.color.setHSL((this.hue - s * 0.012 + 2) % 1, 1.0, 0.55 + 0.2 * (1 - k));
          this.glowPositions[s*3] = p.x;
          this.glowPositions[s*3+1] = p.y;
          this.glowPositions[s*3+2] = p.z;
          const c = mesh.material.color;
          this.glowColors[s*3] = c.r;
          this.glowColors[s*3+1] = c.g;
          this.glowColors[s*3+2] = c.b;
          placed = true;
          break;
        }
        arc += segLen;
        trailIdx++;
      }
      if (!placed) {
        this.segments[s].visible = false;
        this.glowPositions[s*3] = 0;
        this.glowPositions[s*3+1] = 0;
        this.glowPositions[s*3+2] = 0;
        this.glowColors[s*3] = 0;
        this.glowColors[s*3+1] = 0;
        this.glowColors[s*3+2] = 0;
      }
    }
    for (let s = n; s < MAX_SEGMENTS; s++) {
      if (this.segments[s].visible) this.segments[s].visible = false;
      this.glowPositions[s*3] = 0;
      this.glowPositions[s*3+1] = 0;
      this.glowPositions[s*3+2] = 0;
      this.glowColors[s*3] = 0;
      this.glowColors[s*3+1] = 0;
      this.glowColors[s*3+2] = 0;
    }
    this.glowGeo.attributes.position.needsUpdate = true;
    this.glowGeo.attributes.color.needsUpdate = true;
  }

  grow(n) { this.targetSegCount = Math.min(MAX_SEGMENTS, this.targetSegCount + n); }
  headPosition() { return this.headPos.clone(); }
  headDirection() { return this.headDir.clone(); }

  checkSelfCollision() {
    const skip = 10;
    const threshold = (this.radius * 2.4) ** 2;
    const n = Math.ceil(this.segCount);
    for (let s = skip; s < n; s++) {
      const m = this.segments[s];
      if (m.visible && this.headPos.distanceToSquared(m.position) < threshold) return true;
    }
    return false;
  }
}

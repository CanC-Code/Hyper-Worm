import * as THREE from "../../three/three.module.js";
import { GLOW_TEX } from "../render/scene.js";

const MAX_SEGMENTS = 100;

// Procedural Canvas Texture for Scales
function createScaleTexture() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#444"; ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#111"; ctx.lineWidth = 3;
  for (let y = 0; y < 128; y += 16) {
    for (let x = 0; x < 128; x += 16) {
      ctx.beginPath();
      const offset = (y % 32 === 0) ? 8 : 0;
      ctx.arc(x + offset, y, 10, 0, Math.PI);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}
const SCALE_TEX = createScaleTexture();

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
    this.biteTimer = 0; // Controls jaw animation

    this.headPos = new THREE.Vector3(0, sphereRadius, 0);
    this.headDir = new THREE.Vector3(1, 0, 0);
    { const n = this.headPos.clone().normalize();
      this.headDir.addScaledVector(n, -this.headDir.dot(n)).normalize(); }

    this.trail = [];
    this.segments = [];
    this.segCount = initialSegments;
    this.targetSegCount = initialSegments;
    this.object3D = new THREE.Group();

    // --- BUILD THE HEAD ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.copy(this.headPos);
    
    // Head Material
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x44ff88, emissive: 0x22aa44, emissiveIntensity: 0.6,
      metalness: 0.8, roughness: 0.2, bumpMap: SCALE_TEX, bumpScale: 0.05
    });

    // Skull
    const skullGeo = new THREE.SphereGeometry(0.45, 16, 16);
    skullGeo.scale(1, 0.8, 1.6);
    this.skull = new THREE.Mesh(skullGeo, headMat);
    this.skull.position.set(0, 0, 0.2);
    this.headGroup.add(this.skull);

    // Lower Jaw (Pivoted at the back)
    this.jaw = new THREE.Group();
    this.jaw.position.set(0, -0.1, 0.1); // pivot point
    const jawGeo = new THREE.SphereGeometry(0.4, 16, 16);
    jawGeo.scale(0.9, 0.3, 1.4);
    const jawMesh = new THREE.Mesh(jawGeo, headMat);
    jawMesh.position.set(0, -0.05, 0.2);
    this.jaw.add(jawMesh);
    
    // Glowing Mouth Interior
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xff2fd0 });
    const mouthGeo = new THREE.SphereGeometry(0.3, 8, 8);
    mouthGeo.scale(0.8, 0.1, 1.2);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.05, 0.2);
    this.jaw.add(mouth);

    // Teeth
    const toothMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 6; i++) {
        const tGeo = new THREE.ConeGeometry(0.03, 0.15, 4);
        const tooth = new THREE.Mesh(tGeo, toothMat);
        tooth.rotation.x = Math.PI; // Point down
        tooth.position.set((i % 2 === 0 ? 1 : -1) * 0.15, 0.1, 0.2 + Math.floor(i/2) * 0.15);
        this.jaw.add(tooth);
    }
    this.headGroup.add(this.jaw);

    // Glowing Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat); eyeL.position.set(-0.3, 0.2, 0.3);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat); eyeR.position.set(0.3, 0.2, 0.3);
    this.headGroup.add(eyeL, eyeR);

    this.object3D.add(this.headGroup);

    this.headGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: GLOW_TEX, color: 0x9ff6ff, blending: THREE.AdditiveBlending,
      transparent: true, depthWrite: false, opacity: 0.9
    }));
    this.headGlow.scale.setScalar(3.0);
    this.object3D.add(this.headGlow);

    // --- BUILD THE BODY SEGMENTS ---
    this.segGeo = new THREE.SphereGeometry(1, 12, 12);
    this.segGeo.scale(1, 0.8, 1.5);
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
      const mat = new THREE.MeshStandardMaterial({
        color: 0x44ff88, emissive: 0x22aa44, emissiveIntensity: 0.5,
        metalness: 0.8, roughness: 0.3, bumpMap: SCALE_TEX, bumpScale: 0.05
      });
      const mesh = new THREE.Mesh(this.segGeo, mat);
      mesh.visible = false;
      mesh.frustumCulled = false;
      this.object3D.add(mesh);
      this.segments.push(mesh);
    }
  }

  bite() {
    this.biteTimer = 0.35; // Trigger the jaw animation
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
    this.headGroup.position.copy(this.headPos);
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

    // Animate Jaw
    if (this.biteTimer > 0) {
      this.biteTimer -= dt;
      const t = Math.max(0, this.biteTimer / 0.35); // 1 to 0
      this.jaw.rotation.x = Math.sin(t * Math.PI) * 0.6; // open and close
    } else {
      this.jaw.rotation.x = 0;
    }

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

    // Orient the head to look forward
    this.headGroup.position.copy(this.headPos);
    const up = this.headPos.clone().normalize();
    const matrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0), this.headDir, up);
    this.headGroup.quaternion.setFromRotationMatrix(matrix);

    // Color shifts
    const hue = (this.hue + 0.5) % 1;
    this.headGlow.material.color.setHSL(hue, 1, 0.75);
    this.headGlow.position.copy(this.headPos);
    this.headGlow.scale.setScalar(3.0 * (1 + 0.1 * Math.sin(this.time * 8)));
    
    // Update head materials
    const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
    this.skull.material.color.copy(color);
    this.skull.material.emissive.copy(color);
    this.jaw.children[0].material.color.copy(color);
    this.jaw.children[0].material.emissive.copy(color);
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
          
          // Align segment with the trail
          const tangent = b.clone().sub(a).normalize();
          const up = p.clone().normalize();
          const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0), tangent, up);
          mesh.quaternion.setFromRotationMatrix(m);

          const color = new THREE.Color().setHSL((this.hue - s * 0.012 + 2) % 1, 1.0, 0.55 + 0.2 * (1 - k));
          mesh.material.color.copy(color);
          mesh.material.emissive.copy(color);
          
          this.glowPositions[s*3] = p.x;
          this.glowPositions[s*3+1] = p.y;
          this.glowPositions[s*3+2] = p.z;
          this.glowColors[s*3] = color.r;
          this.glowColors[s*3+1] = color.g;
          this.glowColors[s*3+2] = color.b;
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

import * as THREE from "../../three/three.module.js";
import { GLOW_TEX } from "../render/scene.js";

const MAX_SEGMENTS = 100;

// 1. Procedural Scale Normal Map (Creates 3D bumpiness without high poly count)
function createScaleNormalMap() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  
  // Base normal color (flat)
  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);
  
  // Draw overlapping scale shapes
  for (let y = 0; y < size; y += 16) {
    for (let x = 0; x < size; x += 16) {
      const offset = (y % 32 === 0) ? 8 : 0;
      const grad = ctx.createRadialGradient(x + offset, y, 2, x + offset, y, 10);
      grad.addColorStop(0, "rgb(160, 160, 255)"); // Bump up
      grad.addColorStop(1, "rgb(128, 128, 255)"); // Flat
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x + offset, y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}
const SCALE_NORMAL_MAP = createScaleNormalMap();

export class Snake {
  constructor({ sphereRadius, segmentLength = 0.4, initialSegments = 12,
                radius = 0.45, taper = 0.55, speed = 4.5 }) {
    
    this.segmentLength = segmentLength;
    this.radius = radius;
    this.taper = taper;
    this.speed = speed;
    this.turboMultiplier = 1.65;
    this.turnRate = 2.6;
    this.time = 0;
    this.hue = 0.55;
    this.biteTimer = 0;
    this.hasShield = 0;

    this.headPos = new THREE.Vector3(0, sphereRadius, 0);
    this.headDir = new THREE.Vector3(1, 0, 0);
    {  }

    this.trail = [];
    this.segments = [];
    this.segCount = initialSegments;
    this.targetSegCount = initialSegments;
    this.object3D = new THREE.Group();

    // 2. PBR Material (Physically Based Rendering)
    this.material = new THREE.MeshPhysicalMaterial({
      color: 0x22e6ff,
      emissive: 0x22e6ff,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1.0,      // Wet look
      clearcoatRoughness: 0.1,
      normalMap: SCALE_NORMAL_MAP,
      normalScale: new THREE.Vector2(1.5, 1.5)
    });

    // --- ANATOMICAL VIPER HEAD ---
    this.headGroup = new THREE.Group();
    
    // Upper Skull
    const skullGeo = new THREE.SphereGeometry(0.5, 32, 32);
    skullGeo.scale(1.0, 0.7, 1.6);
    this.skull = new THREE.Mesh(skullGeo, this.material);
    this.skull.position.set(0, 0.1, 0.3);
    this.headGroup.add(this.skull);

    // Snout (Angled down slightly)
    const snoutGeo = new THREE.ConeGeometry(0.4, 0.8, 32);
    snoutGeo.rotateX(Math.PI / 2);
    const snout = new THREE.Mesh(snoutGeo, this.material);
    snout.position.set(0, 0.05, 0.9);
    snout.rotation.x = 0.1; 
    this.headGroup.add(snout);

    // Lower Jaw
    this.jaw = new THREE.Group();
    this.jaw.position.set(0, -0.1, 0.2);
    const jawGeo = new THREE.SphereGeometry(0.4, 32, 32);
    jawGeo.scale(0.9, 0.2, 1.4);
    const jawMesh = new THREE.Mesh(jawGeo, this.material);
    jawMesh.position.z = 0.3;
    this.jaw.add(jawMesh);
    
    // Glowing Mouth Interior
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xff2fd0 });
    const mouthGeo = new THREE.SphereGeometry(0.35, 16, 16);
    mouthGeo.scale(0.8, 0.1, 1.2);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.05, 0.3);
    this.jaw.add(mouth);

    // Fangs
    const fangMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 4; i++) {
        const fangGeo = new THREE.ConeGeometry(0.04, 0.2, 8);
        const fang = new THREE.Mesh(fangGeo, fangMat);
        fang.rotation.x = Math.PI; // Point down
        fang.position.set((i < 2 ? 1 : -1) * 0.15, 0.1, 0.4 + (i%2)*0.2);
        this.jaw.add(fang);
    }
    
    // Forked Tongue
    this.tongue = new THREE.Group();
    this.tongue.position.set(0, 0, 0.8);
    const tongueMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const tBase = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.4), tongueMat);
    tBase.position.z = 0.2;
    this.tongue.add(tBase);
    const tLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.2), tongueMat);
    tLeft.position.set(-0.05, 0, 0.4); tLeft.rotation.y = 0.3;
    const tRight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.2), tongueMat);
    tRight.position.set(0.05, 0, 0.4); tRight.rotation.y = -0.3;
    this.tongue.add(tLeft, tRight);
    this.jaw.add(this.tongue);

    this.headGroup.add(this.jaw);

    // Eyes (Deep set)
    const eyeWhite = new THREE.MeshPhysicalMaterial({ color: 0xffcc00, metalness: 1, roughness: 0.1 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const pupilGeo = new THREE.SphereGeometry(0.06, 8, 8);
    
    const eL = new THREE.Mesh(eyeGeo, eyeWhite); eL.position.set(-0.35, 0.2, 0.5);
    const eLp = new THREE.Mesh(pupilGeo, pupilMat); eLp.position.set(-0.4, 0.2, 0.55);
    const eR = new THREE.Mesh(eyeGeo, eyeWhite); eR.position.set(0.35, 0.2, 0.5);
    const eRp = new THREE.Mesh(pupilGeo, pupilMat); eRp.position.set(0.4, 0.2, 0.55);
    this.headGroup.add(eL, eLp, eR, eRp);

    this.object3D.add(this.headGroup);

    // Dynamic Head Light (Illuminates the ground)
    this.headLight = new THREE.PointLight(0x22e6ff, 2, 10);
    this.headLight.position.set(0, 0, 0.5);
    this.headGroup.add(this.headLight);

    this.headGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: GLOW_TEX, color: 0x9ff6ff, blending: THREE.AdditiveBlending,
      transparent: true, depthWrite: false, opacity: 0.8
    }));
    this.headGlow.scale.setScalar(4.0);
    this.object3D.add(this.headGlow);

    // --- CAPSULE BODY ---
    this.segGeo = new THREE.CapsuleGeometry(1, 1.5, 8, 16);
    this.segGeo.rotateX(Math.PI / 2); // Point along Z axis
    this.initSegments();

    this.seedTrail();
    this.updateSegments();
    this.headGlow.position.copy(this.headPos);
  }

  initSegments() {
    for (let i = 0; i < MAX_SEGMENTS; i++) {
      const mesh = new THREE.Mesh(this.segGeo, this.material);
      mesh.visible = false;
      mesh.frustumCulled = false;
      this.object3D.add(mesh);
      this.segments.push(mesh);
    }
  }

  bite() { 
    this.biteTimer = 0.4; 
  }

  seedTrail() {
    this.trail.length = 0;
    this.trail.push(this.headPos.clone());
    let bp = this.headPos.clone();
    let bd = this.headDir.clone().negate();
    const steps = Math.ceil((MAX_SEGMENTS * this.segmentLength + 12) / 0.08);
    for (let i = 0; i < steps; i++) {
      const next = bp.clone().addScaledVector(bd, 0.08);
      next.y = 0.5;
      const n = next.clone().normalize();
      bd.copy(next).sub(bp).normalize();
      bd.addScaledVector(n, -bd.dot(n)).normalize();
      this.trail.push(next.clone());
      bp.copy(next);
    }
  }

  setHeading(pos, dir) {
    this.headPos.copy(pos); this.headPos.y = 0.5;
    this.headDir.copy(dir);
    const n = this.headPos.clone().normalize();
    this.headDir.addScaledVector(n, -this.headDir.dot(n)).normalize();
    this.seedTrail();
    this.updateSegments();
    this.headGroup.position.copy(this.headPos);
  }

  addTrailPoint(pos) {
    if (this.trail.length > 0 && this.trail[0].distanceToSquared(pos) < 0.0005) return;
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
    this.hue = (this.hue + dt * 0.1) % 1;

    // Animate Jaw & Tongue
    if (this.biteTimer > 0) {
      this.biteTimer -= dt;
      const t = Math.max(0, this.biteTimer / 0.4);
      this.jaw.rotation.x = Math.sin(t * Math.PI) * 0.8; // Open jaw
      this.tongue.rotation.x = Math.sin(t * Math.PI * 2) * 0.3; // Flick tongue
    } else {
      this.jaw.rotation.x = THREE.MathUtils.lerp(this.jaw.rotation.x, 0, 10 * dt);
      this.tongue.rotation.x = 0;
      // Idle tongue flicking
      if (Math.random() < 0.02) this.tongue.rotation.x = 0.4;
      else this.tongue.rotation.x = THREE.MathUtils.lerp(this.tongue.rotation.x, 0, 10 * dt);
    }

    if (turnInput !== 0) {
      const up = new THREE.Vector3(0, 1, 0);
      const q = new THREE.Quaternion().setFromAxisAngle(up, -turnInput * this.turnRate * dt);
      this.headDir.applyQuaternion(q);
    }
    {  }

    const speed = this.speed * (boost ? this.turboMultiplier : 1);
    const next = this.headPos.clone().addScaledVector(this.headDir, speed * dt);
    next.y = 0.5;

    this.headDir.copy(next).sub(this.headPos).normalize();
    this.headPos.copy(next);

    this.addTrailPoint(this.headPos);

    if (this.segCount < this.targetSegCount)
      this.segCount = Math.min(this.targetSegCount, this.segCount + dt * 20);
    else if (this.segCount > this.targetSegCount)
      this.segCount = Math.max(this.targetSegCount, this.segCount - dt * 20);

    this.updateSegments();

    this.headGroup.position.copy(this.headPos);
    const up = new THREE.Vector3(0, 1, 0);
    const forward = this.headDir.clone();
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    const correctedForward = new THREE.Vector3().crossVectors(up, right).normalize();
    const m = new THREE.Matrix4().makeBasis(right, up, correctedForward);
    const targetQ = new THREE.Quaternion().setFromRotationMatrix(m);
    this.headGroup.quaternion.slerp(targetQ, 1 - Math.exp(-20 * dt));

    const hue = (this.hue + 0.5) % 1;
    const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
    
    if (this.hasShield > 0) {
      this.material.color.setHex(0x22e6ff);
      this.material.emissive.setHex(0x22e6ff);
      this.headLight.color.setHex(0x22e6ff);
    } else {
      this.material.color.copy(color);
      this.material.emissive.copy(color);
      this.headLight.color.copy(color);
    }
    
    this.headGlow.material.color.copy(color);
    this.headGlow.position.copy(this.headPos);
    this.headGlow.scale.setScalar(4.0 * (1 + 0.05 * Math.sin(this.time * 10)));
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
          
          // Stretch the capsule seamlessly along the path
          mesh.scale.set(r, r, r * 1.5); 
          
          const forward = b.clone().sub(a).normalize();
          const up = new THREE.Vector3(0, 1, 0);
          const right = new THREE.Vector3().crossVectors(forward, up).normalize();
          const correctedForward = new THREE.Vector3().crossVectors(up, right).normalize();
          const m = new THREE.Matrix4().makeBasis(right, up, correctedForward);
          mesh.quaternion.setFromRotationMatrix(m);
          
          placed = true;
          break;
        }
        arc += segLen;
        trailIdx++;
      }
      if (!placed) this.segments[s].visible = false;
    }
    for (let s = n; s < MAX_SEGMENTS; s++) {
      if (this.segments[s].visible) this.segments[s].visible = false;
    }
  }

  grow(n) { this.targetSegCount = Math.min(MAX_SEGMENTS, this.targetSegCount + n); }
  headPosition() { return this.headPos.clone(); }
  headDirection() { return this.headDir.clone(); }

  checkSelfCollision() {
    if (this.hasShield > 0) return false;
    const skip = 10;
    const threshold = (this.radius * 1.5) ** 2;
    const n = Math.ceil(this.segCount);
    for (let s = skip; s < n; s++) {
      const m = this.segments[s];
      if (m.visible && this.headPos.distanceToSquared(m.position) < threshold) return true;
    }
    return false;
  }
}

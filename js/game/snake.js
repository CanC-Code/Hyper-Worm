import * as THREE from "../../three/three.module.js";
import { GLOW_TEX } from "../render/scene.js";

const MAX_SEGMENTS = 100;

// Custom Shader for Liquid Metal look
const snakeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color(0x22e6ff) }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      float fresnel = dot(normalize(vNormal), normalize(vViewPosition));
      fresnel = pow(1.0 - fresnel, 2.0);
      vec3 baseColor = uColor * 0.2;
      vec3 glowColor = uColor * 3.0;
      vec3 finalColor = mix(baseColor, glowColor, fresnel);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
});

export class Snake {
  constructor({ sphereRadius, segmentLength = 0.25, initialSegments = 12,
                radius = 0.45, taper = 0.55, speed = 4.5 }) {
    this.sphereRadius = sphereRadius;
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
    { const n = this.headPos.clone().normalize();
      this.headDir.addScaledVector(n, -this.headDir.dot(n)).normalize(); }

    this.trail = [];
    this.segments = [];
    this.segCount = initialSegments;
    this.targetSegCount = initialSegments;
    this.object3D = new THREE.Group();

    // --- HIGH QUALITY VIPER HEAD ---
    this.headGroup = new THREE.Group();
    
    // Skull (Sleek capsule)
    const skullGeo = new THREE.CapsuleGeometry(0.45, 0.8, 8, 16);
    skullGeo.rotateX(Math.PI / 2); // Point forward
    this.skull = new THREE.Mesh(skullGeo, snakeMaterial);
    this.skull.position.z = 0.3;
    this.headGroup.add(this.skull);

    // Snout (Pointed cone)
    const snoutGeo = new THREE.ConeGeometry(0.45, 0.8, 16);
    snoutGeo.rotateX(Math.PI / 2);
    const snout = new THREE.Mesh(snoutGeo, snakeMaterial);
    snout.position.z = 0.9;
    this.headGroup.add(snout);

    // Lower Jaw
    this.jaw = new THREE.Group();
    this.jaw.position.set(0, -0.15, 0.2);
    const jawGeo = new THREE.BoxGeometry(0.7, 0.15, 1.2);
    const jawMesh = new THREE.Mesh(jawGeo, snakeMaterial);
    jawMesh.position.z = 0.3;
    this.jaw.add(jawMesh);
    
    // Glowing Mouth
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xff2fd0 });
    const mouthGeo = new THREE.BoxGeometry(0.6, 0.05, 1.0);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.05, 0.2);
    this.jaw.add(mouth);
    this.headGroup.add(this.jaw);

    // Reptilian Eyes (Glowing)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const pupilGeo = new THREE.SphereGeometry(0.06, 8, 8);
    
    const eL = new THREE.Mesh(eyeGeo, eyeMat); eL.position.set(-0.3, 0.2, 0.5);
    const eLp = new THREE.Mesh(pupilGeo, pupilMat); eLp.position.set(-0.35, 0.2, 0.55);
    const eR = new THREE.Mesh(eyeGeo, eyeMat); eR.position.set(0.3, 0.2, 0.5);
    const eRp = new THREE.Mesh(pupilGeo, pupilMat); eRp.position.set(0.35, 0.2, 0.55);
    this.headGroup.add(eL, eLp, eR, eRp);

    this.object3D.add(this.headGroup);

    // Head Glow
    this.headGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: GLOW_TEX, color: 0x9ff6ff, blending: THREE.AdditiveBlending,
      transparent: true, depthWrite: false, opacity: 0.9
    }));
    this.headGlow.scale.setScalar(4.0);
    this.object3D.add(this.headGlow);

    // --- SMOOTH BODY (Overlapping elongated spheres) ---
    this.segGeo = new THREE.SphereGeometry(1, 16, 16);
    this.initSegments();

    this.seedTrail();
    this.updateSegments();
    this.headGlow.position.copy(this.headPos);
  }

  initSegments() {
    for (let i = 0; i < MAX_SEGMENTS; i++) {
      const mesh = new THREE.Mesh(this.segGeo, snakeMaterial);
      mesh.visible = false;
      mesh.frustumCulled = false;
      this.object3D.add(mesh);
      this.segments.push(mesh);
    }
  }

  bite() { this.biteTimer = 0.3; }

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

    if (this.biteTimer > 0) {
      this.biteTimer -= dt;
      const t = Math.max(0, this.biteTimer / 0.3);
      this.jaw.rotation.x = Math.sin(t * Math.PI) * 1.1;
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

    const up = this.headPos.clone().normalize();
    this.headGroup.position.copy(this.headPos);
    
    const forward = this.headDir.clone();
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    const correctedForward = new THREE.Vector3().crossVectors(up, right).normalize();
    const m = new THREE.Matrix4().makeBasis(right, up, correctedForward);
    const targetQ = new THREE.Quaternion().setFromRotationMatrix(m);
    this.headGroup.quaternion.slerp(targetQ, 1 - Math.exp(-20 * dt));

    const hue = (this.hue + 0.5) % 1;
    const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
    
    if (this.hasShield > 0) {
      snakeMaterial.uniforms.uColor.value.setHex(0x22e6ff);
    } else {
      snakeMaterial.uniforms.uColor.value.copy(color);
    }
    
    this.headGlow.material.color.copy(color);
    this.headGlow.position.copy(this.headPos);
    this.headGlow.scale.setScalar(4.0 * (1 + 0.1 * Math.sin(this.time * 10)));
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
          
          // Elongate the sphere along the Z axis to create a seamless tube
          mesh.scale.set(r, r * 0.8, r * 2.0); 
          
          const forward = b.clone().sub(a).normalize();
          const up = p.clone().normalize();
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

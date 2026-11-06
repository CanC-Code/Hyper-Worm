import * as THREE from "../../three/three.module.js";
import { GLOW_TEX } from "../render/scene.js";

export class Food {
  constructor(sphereRadius) {
    this.sphereRadius = sphereRadius;
    this.pos = new THREE.Vector3(0, sphereRadius, 0);
    this.age = 0;
    this.type = "normal"; // "normal", "shield", "magnet"
    
    this.core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.MeshBasicMaterial({ color: 0xff2fd0, toneMapped: false })
    );
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: GLOW_TEX, color: 0xff2fd0, blending: THREE.AdditiveBlending,
      transparent: true, depthWrite: false, opacity: 0.7
    }));
    this.glow.scale.setScalar(4.5);
    this.group = new THREE.Group();
    this.group.add(this.core, this.glow);
  }

  spawn(headPos, forceType = null) {
    this.type = forceType || (Math.random() < 0.1 ? (Math.random() < 0.5 ? "shield" : "magnet") : "normal");
    
    let col = new THREE.Color(0xff2fd0);
    if (this.type === "shield") col.setHex(0x22e6ff);
    if (this.type === "magnet") col.setHex(0xffdc32);

    this.core.material.color.copy(col);
    this.glow.material.color.copy(col);

    const minDist = this.sphereRadius * 0.8;
    for (let i = 0; i < 40; i++) {
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const p = new THREE.Vector3(s*Math.cos(t), u, s*Math.sin(t)).multiplyScalar(this.sphereRadius);
      if (p.distanceTo(headPos) > minDist) {
        this.pos.copy(p);
        this.age = 0;
        return;
      }
    }
  }

  update(dt) {
    this.age += dt;
    this.core.position.copy(this.pos);
    this.glow.position.copy(this.pos);
    this.core.rotation.x += dt * 2;
    this.core.rotation.y += dt * 2.5;
    this.core.scale.setScalar(1 + 0.15 * Math.sin(this.age * 4.5));
    this.glow.scale.setScalar(4.5 * (1 + 0.1 * Math.sin(this.age * 3.1)));
  }

  checkEaten(headPos) { return headPos.distanceTo(this.pos) < 1.1; }
}

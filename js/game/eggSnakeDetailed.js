/// eggSnakeDetailed.js
/// Procedural semi-detailed snake with egg hatching animation
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

export function spawnDetailedEggSnake(position = new THREE.Vector3(0,0,0), onHatch) {
  const group = new THREE.Group();
  group.position.copy(position);

  // ---------- Egg ----------
  const eggGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const eggMat = new THREE.MeshStandardMaterial({ color: 0xffff66 });
  const egg = new THREE.Mesh(eggGeo, eggMat);
  egg.name = "Egg";
  group.add(egg);

  // ---------- Snake head ----------
  const headGeo = new THREE.CapsuleGeometry(0.3, 0.5, 4, 8);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x33aa33 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.name = "Head";
  head.scale.set(0.01,0.01,0.01);
  group.add(head);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.1, 0.15, 0.15);
  const rightEye = leftEye.clone();
  rightEye.position.set(0.1, 0.15, 0.15);
  head.add(leftEye, rightEye);

  // Mouth
  const mouthGeo = new THREE.BoxGeometry(0.2, 0.05, 0.1);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0xff3333 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, -0.1, 0.25);
  head.add(mouth);

  // Tongue
  const tongueGeo = new THREE.ConeGeometry(0.02, 0.2, 3);
  const tongueMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const tongue = new THREE.Mesh(tongueGeo, tongueMat);
  tongue.rotation.x = Math.PI;
  tongue.position.set(0, -0.05, 0.3);
  head.add(tongue);

  // ---------- First body segment ----------
  const segmentGeo = new THREE.CylinderGeometry(0.25,0.25,1,8);
  const segmentMat = new THREE.MeshStandardMaterial({ color: 0x33aa33 });
  const segment = new THREE.Mesh(segmentGeo, segmentMat);
  segment.rotation.x = Math.PI / 2;
  segment.name = "SegmentMesh";
  segment.scale.set(0.01,0.01,0.01);
  group.add(segment);

  // ---------- Tail ----------
  const tailGeo = new THREE.ConeGeometry(0.15, 0.5, 8);
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x33aa33 });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(0,0,-1);
  tail.rotation.x = Math.PI/2;
  tail.scale.set(0.01,0.01,0.01);
  group.add(tail);

  world.add(group);

  // ---------- Egg hatch warp ----------
  let elapsed = 0;
  const duration = 2.0;
  function animateWarp(delta) {
    elapsed += delta;
    const t = Math.min(elapsed / duration, 1);

    egg.scale.setScalar(1-t);
    head.scale.setScalar(t);
    segment.scale.setScalar(t);
    tail.scale.setScalar(t);

    if (t < 1) requestAnimationFrame(()=>animateWarp(0.016));
    else {
      group.remove(egg);
      if(onHatch) onHatch({ head, segment, tail, mouth, tongue });
    }
  }
  animateWarp(0.016);
}
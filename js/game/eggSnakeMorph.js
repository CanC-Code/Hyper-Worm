/// eggSnakeMorph.js
/// Procedural morphing egg → snake
/// Made by CCVO - CanC-Code

import * as THREE from "../../three/three.module.js";
import { world } from "../render/scene.js";

/**
 * Spawn an egg that morphs into a semi-detailed snake using vertex interpolation.
 * @param {THREE.Vector3} position
 * @param {function} onHatch - callback after morphing with {head, segments, tail}
 */
export function spawnMorphingEggSnake(position = new THREE.Vector3(0,0,0), onHatch) {
  const group = new THREE.Group();
  group.position.copy(position);
  world.add(group);

  const duration = 2.0; // morph time in seconds
  let elapsed = 0;

  // ---------- Egg geometry ----------
  const eggGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const eggMat = new THREE.MeshStandardMaterial({ color: 0xffff66, flatShading: true });
  const egg = new THREE.Mesh(eggGeo, eggMat);
  egg.name = "Egg";
  group.add(egg);

  // ---------- Snake head geometry ----------
  const headGeo = new THREE.CapsuleGeometry(0.3, 0.5, 4, 8);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x33aa33, flatShading: true });
  const head = new THREE.Mesh(headGeo, headMat);
  head.name = "Head";
  head.scale.set(0.01,0.01,0.01); // start tiny
  group.add(head);

  // ---------- Body segment ----------
  const segmentGeo = new THREE.CylinderGeometry(0.25,0.25,1,8);
  const segmentMat = new THREE.MeshStandardMaterial({ color: 0x33aa33, flatShading: true });
  const segment = new THREE.Mesh(segmentGeo, segmentMat);
  segment.rotation.x = Math.PI / 2;
  segment.name = "SegmentMesh";
  segment.scale.set(0.01,0.01,0.01);
  group.add(segment);

  // ---------- Tail ----------
  const tailGeo = new THREE.ConeGeometry(0.15, 0.5, 8);
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x33aa33, flatShading: true });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.rotation.x = Math.PI / 2;
  tail.position.set(0,0,-1);
  tail.scale.set(0.01,0.01,0.01);
  group.add(tail);

  // ---------- Vertex morph data ----------
  const eggPos = egg.geometry.attributes.position.array.slice();
  const headPos = head.geometry.attributes.position.array.slice();
  const segmentPos = segment.geometry.attributes.position.array.slice();
  const tailPos = tail.geometry.attributes.position.array.slice();

  function interpolatePositions(from, to, t) {
    const result = new Float32Array(from.length);
    for(let i=0; i<from.length; i++){
      result[i] = from[i]*(1-t) + to[i%to.length]*t; // loop if lengths differ
    }
    return result;
  }

  // ---------- Morph animation ----------
  function animateMorph(delta) {
    elapsed += delta;
    const t = Math.min(elapsed/duration,1);

    // Morph egg to head
    const newPos = interpolatePositions(eggPos, headPos, t);
    head.geometry.attributes.position.array.set(newPos);
    head.geometry.attributes.position.needsUpdate = true;

    // Scale smoothly
    head.scale.setScalar(t);
    segment.scale.setScalar(t);
    tail.scale.setScalar(t);
    egg.scale.setScalar(1-t);

    if(t<1) requestAnimationFrame(()=>animateMorph(0.016));
    else {
      group.remove(egg);
      if(onHatch) onHatch({ head, segment, tail });
    }
  }

  animateMorph(0.016);
}
// js/render/scene.js

export function updateCamera(delta) {
  if (!snakeState.mesh) return;

  const head = snakeState.mesh;
  const forward = snakeState.direction.clone().normalize();

  // Wide-angle snake POV
  camera.fov = 85;
  camera.updateProjectionMatrix();

  // Camera offset RELATIVE to snake direction
  const cameraDistance = 3.5;
  const cameraHeight = 1.2;

  const cameraPos = head.position.clone()
    .add(forward.clone().multiplyScalar(-cameraDistance))
    .add(new THREE.Vector3(0, cameraHeight, 0));

  camera.position.lerp(cameraPos, 0.15);

  // Look slightly ahead of the snake
  const lookTarget = head.position.clone()
    .add(forward.clone().multiplyScalar(5));

  camera.lookAt(lookTarget);
}
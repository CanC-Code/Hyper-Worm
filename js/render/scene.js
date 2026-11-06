import * as THREE from "../../three/three.module.js";

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07011a, 0.015); // Thicker fog for depth

export const world = new THREE.Group();
scene.add(world);

export const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

export const renderer = new THREE.WebGLRenderer({
  antialias: true, alpha: true, powerPreference: "high-performance"
});
renderer.setClearAlpha(0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = "scene";
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
dirLight.position.set(20, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
scene.add(dirLight);

function makeGlowTexture() {
  const S = 128, c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(.22, "rgba(255,255,255,.55)");
  g.addColorStop(.55, "rgba(255,255,255,.14)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export const GLOW_TEX = makeGlowTexture();

export const ARENA_SIZE = 100;

// Add 3D Obstacles to create depth and speed
for (let i = 0; i < 80; i++) {
  const w = 2 + Math.random() * 4;
  const h = 10 + Math.random() * 30;
  const d = 2 + Math.random() * 4;
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ 
    color: 0x050510, 
    metalness: 0.9, 
    roughness: 0.1,
    emissive: 0x22e6ff,
    emissiveIntensity: 0.1
  });
  const mesh = new THREE.Mesh(geo, mat);
  let x, z;
  do {
    x = (Math.random() - 0.5) * 150;
    z = (Math.random() - 0.5) * 150;
  } while (Math.abs(x) < 20 && Math.abs(z) < 20); // Keep spawn clear
  
  mesh.position.set(x, h/2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  world.add(mesh);
}
 // 100x100 arena

// Floor
const floorGeo = new THREE.PlaneGeometry(ARENA_SIZE, ARENA_SIZE);
const floorMat = new THREE.MeshStandardMaterial({ 
  color: 0x050510, metalness: 0.8, roughness: 0.4 
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
world.add(floor);

// Neon Grid
const gridHelper = new THREE.GridHelper(ARENA_SIZE, 50, 0x22e6ff, 0x8a5cff);
gridHelper.position.y = 0.01;
world.add(gridHelper);

// Deadly Boundary Walls
const wallMat = new THREE.MeshBasicMaterial({ 
  color: 0xff2fd0, transparent: true, opacity: 0.3, side: THREE.DoubleSide, blending: THREE.AdditiveBlending
});
const wallGeo = new THREE.PlaneGeometry(ARENA_SIZE, 5);
const wallN = new THREE.Mesh(wallGeo, wallMat); wallN.position.set(0, 2.5, -ARENA_SIZE/2); world.add(wallN);
const wallS = new THREE.Mesh(wallGeo, wallMat); wallS.position.set(0, 2.5, ARENA_SIZE/2); world.add(wallS);
const wallE = new THREE.Mesh(wallGeo, wallMat); wallE.rotation.y = Math.PI/2; wallE.position.set(ARENA_SIZE/2, 2.5, 0); world.add(wallE);
const wallW = new THREE.Mesh(wallGeo, wallMat); wallW.rotation.y = Math.PI/2; wallW.position.set(-ARENA_SIZE/2, 2.5, 0); world.add(wallW);

(function stars() {
  const N = 1400;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3] = (Math.random() - 0.5) * 400;
    pos[i*3+1] = Math.random() * 100 + 10;
    pos[i*3+2] = (Math.random() - 0.5) * 400;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  world.add(new THREE.Points(g, new THREE.PointsMaterial({
    size: 1.5, map: GLOW_TEX, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  })));
})();

export const envRefs = { wire: gridHelper, rings: [], hexMat: null };

export function fitCamera() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 1 ? Math.min(82, 58 + (1 - (w/h)) * 34) : 58;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", fitCamera);
window.addEventListener("orientationchange", () => setTimeout(fitCamera, 120));
fitCamera();

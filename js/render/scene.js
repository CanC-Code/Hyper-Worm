import * as THREE from "../../three/three.module.js";

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07011a, 0.03); // Thicker fog for endless horizon

export const world = new THREE.Group();
scene.add(world);

export const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

export const renderer = new THREE.WebGLRenderer({
  antialias: true, alpha: true, powerPreference: "high-performance"
});
renderer.setClearAlpha(0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.domElement.id = "scene";
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(20, 50, 20);
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

// Massive Floor
const floorGeo = new THREE.PlaneGeometry(2000, 2000);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x050510, metalness: 0.8, roughness: 0.5 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
world.add(floor);

// Infinite Grid
const gridHelper = new THREE.GridHelper(2000, 200, 0x22e6ff, 0x8a5cff);
gridHelper.position.y = 0.01;
world.add(gridHelper);

// Endless Environment (Wireframe Data Towers)
export const pillars = [];
for (let i = 0; i < 60; i++) {
  const w = 2 + Math.random() * 4;
  const h = 15 + Math.random() * 40;
  const d = 2 + Math.random() * 4;
  const geo = new THREE.BoxGeometry(w, h, d);
  // Wireframe material lets you see through them (no more blocking camera)
  const mat = new THREE.MeshBasicMaterial({ 
    color: 0x22e6ff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.15 
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((Math.random() - 0.5) * 300, h/2, (Math.random() - 0.5) * 300);
  world.add(mesh);
  pillars.push({ mesh, h, w, d });
}

(function stars() {
  const N = 1400;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3] = (Math.random() - 0.5) * 600;
    pos[i*3+1] = Math.random() * 150 + 10;
    pos[i*3+2] = (Math.random() - 0.5) * 600;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  world.add(new THREE.Points(g, new THREE.PointsMaterial({
    size: 1.5, map: GLOW_TEX, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  })));
})();

export const envRefs = { wire: gridHelper, rings: [] };

export function fitCamera() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 1 ? 75 : 60;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", fitCamera);
window.addEventListener("orientationchange", () => setTimeout(fitCamera, 120));
fitCamera();

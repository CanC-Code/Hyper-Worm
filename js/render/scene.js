import * as THREE from "../../three/three.module.js";

export const scene = new THREE.Scene();
// Deep fog to create an infinite horizon
scene.fog = new THREE.FogExp2(0x050010, 0.025);

export const world = new THREE.Group();
scene.add(world);

export const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);

export const renderer = new THREE.WebGLRenderer({
  antialias: true, alpha: true, powerPreference: "high-performance"
});
renderer.setClearAlpha(0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.domElement.id = "scene";
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dirLight = new THREE.DirectionalLight(0x22e6ff, 2.0);
dirLight.position.set(10, 30, 10);
scene.add(dirLight);
const dirLight2 = new THREE.DirectionalLight(0xff2fd0, 1.5);
dirLight2.position.set(-10, 20, -10);
scene.add(dirLight2);

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

// Infinite Floor
const floorGeo = new THREE.PlaneGeometry(3000, 3000);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x020005, metalness: 1.0, roughness: 0.2 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.1;
world.add(floor);

// Dense Neon Track Grid
const gridHelper = new THREE.GridHelper(3000, 300, 0x22e6ff, 0x8a5cff);
gridHelper.position.y = 0;
world.add(gridHelper);

// Massive Neon Data-Pillars (Create a corridor feel)
export const pillars = [];
for (let i = 0; i < 100; i++) {
  const h = 20 + Math.random() * 60;
  const w = 2 + Math.random() * 4;
  const geo = new THREE.BoxGeometry(w, h, w);
  
  const isCyan = Math.random() > 0.5;
  const mat = new THREE.MeshStandardMaterial({ 
    color: 0x000000, 
    emissive: isCyan ? 0x22e6ff : 0xff2fd0,
    emissiveIntensity: 2.0,
    metalness: 0.9,
    roughness: 0.1
  });
  
  const mesh = new THREE.Mesh(geo, mat);
  // Push them out of the center to leave a driving lane
  const side = Math.random() > 0.5 ? 1 : -1;
  mesh.position.set(
    side * (15 + Math.random() * 80), 
    h/2, 
    (Math.random() - 0.5) * 600
  );
  world.add(mesh);
  pillars.push({ mesh, h, w });
}

export const envRefs = { wire: gridHelper };

export function fitCamera() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 1 ? 80 : 70;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", fitCamera);
window.addEventListener("orientationchange", () => setTimeout(fitCamera, 120));
fitCamera();

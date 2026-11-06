import * as THREE from "../../three/three.module.js";

export const scene = new THREE.Scene();
// Bright neon horizon fog
scene.fog = new THREE.FogExp2(0x0a001a, 0.02); 

export const world = new THREE.Group();
scene.add(world);

export const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);

export const renderer = new THREE.WebGLRenderer({
  antialias: true, alpha: true, powerPreference: "high-performance"
});
renderer.setClearAlpha(0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.domElement.id = "scene";
document.body.appendChild(renderer.domElement);

// Strong ambient and directional lights
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const dirLight = new THREE.DirectionalLight(0x22e6ff, 2.5);
dirLight.position.set(10, 40, 10);
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

// Massive Floor
const floorGeo = new THREE.PlaneGeometry(2000, 2000);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a001a, metalness: 0.9, roughness: 0.3 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.1;
world.add(floor);

// Dense Neon Grid
const gridHelper = new THREE.GridHelper(2000, 400, 0x22e6ff, 0xff2fd0);
gridHelper.position.y = 0;
world.add(gridHelper);

// Solid Glowing Neon Pillars
export const pillars = [];
for (let i = 0; i < 80; i++) {
  const w = 1.5 + Math.random() * 3;
  const h = 10 + Math.random() * 50;
  const d = 1.5 + Math.random() * 3;
  const geo = new THREE.BoxGeometry(w, h, d);
  
  const mat = new THREE.MeshStandardMaterial({ 
    color: 0x000000, 
    emissive: Math.random() > 0.5 ? 0x22e6ff : 0xff2fd0,
    emissiveIntensity: 1.5,
    metalness: 0.8,
    roughness: 0.2
  });
  
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((Math.random() - 0.5) * 400, h/2, (Math.random() - 0.5) * 400);
  world.add(mesh);
  pillars.push({ mesh, h, w, d });
}

export const envRefs = { wire: gridHelper, rings: [] };

export function fitCamera() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 1 ? 75 : 65;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", fitCamera);
window.addEventListener("orientationchange", () => setTimeout(fitCamera, 120));
fitCamera();

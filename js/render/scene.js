import * as THREE from "../../three/three.module.js";

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07011a, 0.0085);

export const world = new THREE.Group();
scene.add(world);

export const camera = new THREE.PerspectiveCamera(58, 1, 0.5, 600);

export const renderer = new THREE.WebGLRenderer({
  antialias: true, alpha: true, powerPreference: "high-performance"
});
renderer.setClearAlpha(0);
if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.id = "scene";
document.body.appendChild(renderer.domElement);

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

export const SPHERE_RADIUS = 12;

// ── NEW HEX GRID MATERIAL (Defined here before it is used) ──


world.add(new THREE.Mesh(
  new THREE.SphereGeometry(SPHERE_RADIUS * 0.995, 64, 64), // Higher poly count for smooth grid
  new THREE.MeshBasicMaterial({ color: 0x07031a })
));

const wire = new THREE.LineSegments(
  new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(SPHERE_RADIUS * 1.004, 3)),
  new THREE.LineBasicMaterial({ color: 0x22e6ff, transparent: true, opacity: 0.13,
    blending: THREE.AdditiveBlending, depthWrite: false })
);
world.add(wire);

for (let lat = -60; lat <= 60; lat += 30) {
  const rad = THREE.MathUtils.degToRad(lat);
  const r = Math.cos(rad) * SPHERE_RADIUS * 1.006;
  const y = Math.sin(rad) * SPHERE_RADIUS * 1.006;
  const pts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  const isEq = lat === 0;
  world.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({
      color: isEq ? 0xff2fd0 : 0x8a5cff, transparent: true,
      opacity: isEq ? 0.45 : 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
  ));
}

const atmo = new THREE.Mesh(
  new THREE.SphereGeometry(SPHERE_RADIUS * 1.28, 40, 28),
  new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0x22e6ff) },
      uPower: { value: 3.2 },
      uStrength: { value: 0.85 }
    },
    vertexShader: `varying vec3 vN;varying vec3 vP;
      void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vP=mv.xyz;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform vec3 uColor;uniform float uPower;uniform float uStrength;
      varying vec3 vN;varying vec3 vP;
      void main(){vec3 v=normalize(-vP);float f=pow(1.0-abs(dot(normalize(vN),v)),uPower);gl_FragColor=vec4(uColor,f*uStrength);}`,
    transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.FrontSide
  })
);
world.add(atmo);

export const envRefs = { wire, atmo, rings: [] };

// Glowing Energy Core
world.add(new THREE.Mesh(
  new THREE.SphereGeometry(SPHERE_RADIUS * 0.2, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending })
));

// Neon Orbital Rings
for (let i = 1; i <= 3; i++) {
  const ringGeo = new THREE.TorusGeometry(SPHERE_RADIUS * (0.8 + i * 0.15), 0.05, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x22e6ff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2 + (i * 0.4);
  ring.rotation.y = i * 0.6;
  world.add(ring);
  envRefs.rings.push(ring);
}

(function stars() {
  const N = 1400;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const d = 60 + Math.random() * 150;
    pos[i*3] = s*Math.cos(t)*d; pos[i*3+1] = u*d; pos[i*3+2] = s*Math.sin(t)*d;
    c.setHSL(0.5 + Math.random()*0.25, 1, 0.55 + Math.random()*0.4);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
  world.add(new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.9, map: GLOW_TEX, vertexColors: true,
    transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, sizeAttenuation: true
  })));
})();

export function fitCamera() {
  const w = window.innerWidth, h = window.innerHeight;
  const aspect = w / h;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = aspect;
  camera.fov = aspect < 1 ? Math.min(82, 58 + (1 - aspect) * 34) : 58;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", fitCamera);
window.addEventListener("orientationchange", () => setTimeout(fitCamera, 120));
fitCamera();

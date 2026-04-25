import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import GUI from "lil-gui";

// --- 1. CONFIGURACIÓN DE DATOS ---
const pivotes = {
  Espalda: { x: 1550, y: 510 },
  Pecho: { x: 1024, y: 700 },
  "Manga Izq": { x: 1700, y: 1000 },
  "Manga Der": { x: 340, y: 1000 },
};

const texturasDisponibles = [
  "./tshit_UVs1.png",
  "./tshit_UVs2.png",
  "./tshit_UVs3.png",
  "./tshit_UVs4.png",
  "./tshit_UVs5.png",
];

const fuentesDisponibles = ["Impact", "Arial", "Verdana", "Courier New"];

// --- 2. ESTADO GLOBAL (SETTINGS) ---
const settings = {
  nombre: "JUGADOR",
  numero: "10",
  fuente: "Impact",
  negrita: false,
  tamanioNombre: 175,
  tamanioNumero: 355,
  posicionPredefinida: "Espalda",
  posX: 1550,
  posY: 510,
  espaciado: 260,
  escalaX: 1,
  escalaY: 1,
  colorTexto: "#ffffff",
  texturaBase: texturasDisponibles[1],
  colorBloqueA: "#d80000",
  colorBloqueB: "#000000",
  mostrarBloques: true,
  intensidadLuzAmbiente: 3.65,
  intensidadLuzPrincipal: 10,
  colorLuzAmbiente: "#ffffff",
  colorLuzPrincipal: "#fff4dd",
  posicionLuzX: -0.08,
  posicionLuzY: 0.42,
  posicionLuzZ: -0.82,
  distanciaLuz: 1.8,
  anguloLuz: 1.48,
  penumbraLuz: 1.0,
  decayLuz: 1.0,
  colorFondo: "#101010",
  colorFondo2: "#2e4366",
  usarHDRI: true,
  hdriComoFondo: false,
  intensidadHDRI: 0.35,
  exposure: 0.15,
  roughness: 0.8,
  metalness: 0.425,
  emissiveIntensity: 0,
  colorEmissive: "#000000",
  mostrarPiso: true,
  opacidadSombra: 0.3,
  grabarVideo: () => prepararGrabacion(),
  descargarImagen: () => descargarCaptura(),
};

// --- 3. CANVAS Y TEXTURA (2048x2048) ---
const textCanvas = document.createElement("canvas");
const ctx = textCanvas.getContext("2d");
textCanvas.width = 2048;
textCanvas.height = 2048;

const textTexture = new THREE.CanvasTexture(textCanvas);
textTexture.colorSpace = THREE.SRGBColorSpace;
textTexture.flipY = false;
// MEJORA DE CALIDAD: Anisotropía para que el texto no se vea borroso de lado
textTexture.anisotropy = 16;

const texturaBaseImg = new Image();
function cargarNuevaTexturaBase(path) {
  texturaBaseImg.src = path;
}

function actualizarTextura() {
  ctx.clearRect(0, 0, 2048, 2048);
  if (settings.mostrarBloques) {
    ctx.fillStyle = settings.colorBloqueB;
    ctx.fillRect(0, 0, 2048, 260);
    ctx.fillStyle = settings.colorBloqueA;
    ctx.fillRect(0, 260, 2048, 1365);
    ctx.fillStyle = settings.colorBloqueB;
    ctx.fillRect(0, 1625, 2048, 423);
  }
  if (texturaBaseImg.complete) {
    ctx.drawImage(texturaBaseImg, 0, 0, 2048, 2048);
  }
  const peso = settings.negrita ? "700" : "500";
  ctx.save();
  ctx.translate(settings.posX, settings.posY);
  ctx.scale(settings.escalaX, settings.escalaY);
  ctx.fillStyle = settings.colorTexto;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = `${peso} ${settings.tamanioNombre}px "${settings.fuente}"`;
  const measure = ctx.measureText(settings.nombre.toUpperCase()).width;
  if (measure > 1600) {
    const scaleFit = 1600 / measure;
    ctx.scale(scaleFit, 1);
  }
  ctx.fillText(settings.nombre.toUpperCase(), 0, 0);

  ctx.font = `${peso} ${settings.tamanioNumero}px "${settings.fuente}"`;
  ctx.fillText(settings.numero, 0, settings.espaciado);

  ctx.restore();
  textTexture.needsUpdate = true;
}

texturaBaseImg.onload = actualizarTextura;
cargarNuevaTexturaBase(settings.texturaBase);

// --- 4. ESCENA THREE.JS (CALIDAD MEJORADA) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 0, -0.75);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
  powerPreference: "high-performance", // Sugiere el uso de GPU potente
});

// Forzamos un pixel ratio de 2 para nitidez máxima en pantallas modernas
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = settings.exposure;

// MEJORA: Sombras suaves de alta calidad
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.getElementById("app").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Iluminación
const ambientLight = new THREE.AmbientLight(
  settings.colorLuzAmbiente,
  settings.intensidadLuzAmbiente,
);
scene.add(ambientLight);

const lightTarget = new THREE.Object3D();
scene.add(lightTarget);

const dirLight = new THREE.SpotLight(
  settings.colorLuzPrincipal,
  settings.intensidadLuzPrincipal,
);
dirLight.castShadow = true;
// MEJORA: Resolución de sombra más alta para evitar bordes dentados
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.target = lightTarget;
scene.add(dirLight);

function actualizarLuces() {
  ambientLight.color.set(settings.colorLuzAmbiente);
  ambientLight.intensity = settings.intensidadLuzAmbiente;
  dirLight.color.set(settings.colorLuzPrincipal);
  dirLight.intensity = settings.intensidadLuzPrincipal;
  dirLight.position.set(
    settings.posicionLuzX,
    settings.posicionLuzY,
    settings.posicionLuzZ,
  );
  dirLight.distance = settings.distanciaLuz;
  dirLight.angle = settings.anguloLuz;
  dirLight.penumbra = settings.penumbraLuz;
  dirLight.decay = settings.decayLuz;
}

let piso;
function crearPiso() {
  const geometry = new THREE.PlaneGeometry(10, 10);
  const material = new THREE.ShadowMaterial({
    color: 0x000000,
    opacity: settings.opacidadSombra,
  });
  piso = new THREE.Mesh(geometry, material);
  piso.rotation.x = -Math.PI / 2;
  piso.position.y = -0.9;
  piso.receiveShadow = true;
  piso.visible = settings.mostrarPiso;
  scene.add(piso);
}

const gradCanvas = document.createElement("canvas");
gradCanvas.width = 1024;
gradCanvas.height = 1024;
const gradCtx = gradCanvas.getContext("2d");
const gradTexture = new THREE.CanvasTexture(gradCanvas);

let hdriEnvMap = null;
function actualizarFondo() {
  const grd = gradCtx.createLinearGradient(0, 0, 0, 1024);
  grd.addColorStop(0, settings.colorFondo2);
  grd.addColorStop(1, settings.colorFondo);
  gradCtx.fillStyle = grd;
  gradCtx.fillRect(0, 0, 1024, 1024);
  gradTexture.needsUpdate = true;
  scene.background =
    settings.hdriComoFondo && hdriEnvMap ? hdriEnvMap : gradTexture;
}

let modelo3D;
function actualizarMateriales() {
  if (!modelo3D) return;
  modelo3D.traverse((child) => {
    if (child.isMesh) {
      child.material.roughness = settings.roughness;
      child.material.metalness = settings.metalness;
      child.material.envMapIntensity = settings.usarHDRI
        ? settings.intensidadHDRI
        : 0;
      child.material.emissive.set(settings.colorEmissive);
      child.material.emissiveIntensity = settings.emissiveIntensity;
    }
  });
}

const pmremGenerator = new THREE.PMREMGenerator(renderer);
new RGBELoader().load("./hdri.hdr", (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  hdriEnvMap = pmremGenerator.fromEquirectangular(hdr).texture;
  scene.environment = settings.usarHDRI ? hdriEnvMap : null;
  actualizarFondo();
});

new GLTFLoader().load("./TshirtPajaro.glb", (gltf) => {
  modelo3D = gltf.scene;
  modelo3D.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = child.receiveShadow = true;
      child.material = new THREE.MeshStandardMaterial({ map: textTexture });
    }
  });
  scene.add(modelo3D);
  modelo3D.position.set(0, -0.3, 0);
  actualizarMateriales();
});

// --- 5. EXPORTACIÓN Y VIDEO (RESOLUCIÓN 1080x1920) ---
async function prepararGrabacion() {
  // CAMBIO: Resolución Full HD Story para Instagram
  const width = 1080;
  const height = 1920;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  const chunks = [];
  // Grabamos a 60fps para fluidez total
  const stream = renderer.domElement.captureStream(60);
  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm; codecs=vp9",
    videoBitsPerSecond: 8000000, // 8Mbps para evitar artefactos de compresión
  });

  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `story-${settings.nombre}.webm`;
    a.click();
  };

  recorder.start();
  await new Promise((r) => setTimeout(r, 1000));
  const startRot = modelo3D.rotation.y;
  const startT = performance.now();
  await new Promise((res) => {
    function rot() {
      const p = Math.min((performance.now() - startT) / 3000, 1);
      modelo3D.rotation.y = startRot + Math.PI * 2 * p;
      renderer.render(scene, camera);
      if (p < 1) requestAnimationFrame(rot);
      else res();
    }
    rot();
  });
  await new Promise((r) => setTimeout(r, 500));
  recorder.stop();

  // Restaurar tamaño original de la pantalla
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function descargarCaptura() {
  renderer.render(scene, camera);
  const a = document.createElement("a");
  a.download = `jersey-${settings.nombre}.png`;
  a.href = renderer.domElement.toDataURL("image/png", 1.0); // Calidad máxima
  a.click();
}

// --- 6. INTERFAZ GUI ---
const gui = new GUI();

const fPrenda = gui.addFolder("Diseño de Prenda");
fPrenda
  .add(settings, "texturaBase", texturasDisponibles)
  .onChange(cargarNuevaTexturaBase);
fPrenda.add(settings, "mostrarBloques").onChange(actualizarTextura);
fPrenda.addColor(settings, "colorBloqueA").onChange(actualizarTextura);
fPrenda.addColor(settings, "colorBloqueB").onChange(actualizarTextura);

const fTexto = gui.addFolder("Contenido y Fuentes");
fTexto.add(settings, "nombre").onChange(actualizarTextura);
fTexto.add(settings, "tamanioNombre", 10, 500).onChange(actualizarTextura);
fTexto.add(settings, "numero").onChange(actualizarTextura);
fTexto.add(settings, "tamanioNumero", 10, 800).onChange(actualizarTextura);
fTexto.add(settings, "fuente", fuentesDisponibles).onChange(actualizarTextura);
fTexto.add(settings, "negrita").onChange(actualizarTextura);
fTexto.addColor(settings, "colorTexto").onChange(actualizarTextura);

const fPos = gui.addFolder("Ubicación y Pivotes");
fPos
  .add(settings, "posicionPredefinida", Object.keys(pivotes))
  .onChange((v) => {
    settings.posX = pivotes[v].x;
    settings.posY = pivotes[v].y;
    actualizarTextura();
    gui.controllers.forEach((c) => c.updateDisplay());
  });
fPos.add(settings, "posX", 0, 2048).onChange(actualizarTextura);
fPos.add(settings, "posY", 0, 2048).onChange(actualizarTextura);
fPos.add(settings, "espaciado", 0, 800).onChange(actualizarTextura);
fPos.add(settings, "escalaX", 0.1, 3).onChange(actualizarTextura);
fPos.add(settings, "escalaY", 0.1, 3).onChange(actualizarTextura);

const fMaterial = gui.addFolder("Material y HDRI");
fMaterial.add(settings, "roughness", 0, 1).onChange(actualizarMateriales);
fMaterial.add(settings, "metalness", 0, 1).onChange(actualizarMateriales);
fMaterial.add(settings, "usarHDRI").onChange((v) => {
  scene.environment = v ? hdriEnvMap : null;
  actualizarMateriales();
});
fMaterial.add(settings, "intensidadHDRI", 0, 2).onChange(actualizarMateriales);
fMaterial.add(settings, "hdriComoFondo").onChange(actualizarFondo);
fMaterial.addColor(settings, "colorEmissive").onChange(actualizarMateriales);
fMaterial
  .add(settings, "emissiveIntensity", 0, 5)
  .onChange(actualizarMateriales);

const fEscena = gui.addFolder("Iluminación y Cámara");
fEscena
  .add(settings, "exposure", 0, 2)
  .onChange((v) => (renderer.toneMappingExposure = v));
fEscena.addColor(settings, "colorFondo").onChange(actualizarFondo);
fEscena.addColor(settings, "colorFondo2").onChange(actualizarFondo);
fEscena.addColor(settings, "colorLuzPrincipal").onChange(actualizarLuces);
fEscena
  .add(settings, "intensidadLuzPrincipal", 0, 20)
  .onChange(actualizarLuces);
fEscena.add(settings, "posicionLuzX", -10, 10).onChange(actualizarLuces);
fEscena.add(settings, "posicionLuzY", -10, 10).onChange(actualizarLuces);
fEscena.add(settings, "posicionLuzZ", -10, 10).onChange(actualizarLuces);
fEscena.add(settings, "distanciaLuz", 0.1, 20).onChange(actualizarLuces);
fEscena.add(settings, "anguloLuz", 0, Math.PI / 2).onChange(actualizarLuces);
fEscena.add(settings, "penumbraLuz", 0, 1).onChange(actualizarLuces);
fEscena.add(settings, "decayLuz", 0, 2).onChange(actualizarLuces);

const fPiso = gui.addFolder("Ajustes de Piso");
fPiso.add(settings, "mostrarPiso").onChange((v) => (piso.visible = v));
fPiso
  .add(settings, "opacidadSombra", 0, 1)
  .onChange((v) => (piso.material.opacity = v));

gui.add(settings, "descargarImagen").name("📸 Foto PNG");
gui.add(settings, "grabarVideo").name("🎬 Video Historia (1080p)");

// --- 7. LOOP ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
crearPiso();
actualizarLuces();
actualizarFondo();
animate();

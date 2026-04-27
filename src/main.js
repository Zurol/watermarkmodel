import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader";
import GUI from "lil-gui";

// --- 1. CONFIGURACIÓN Y DATOS ---
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

// --- 2. ESTADO GLOBAL (SETTINGS COMPLETOS) ---
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
  texturaBase: texturasDisponibles[0],
  colorBloqueA: "#d80000",
  colorBloqueB: "#000000",
  mostrarBloques: true,
  mostrarLogos: true,
  // Logos con tope de escala 10
  logo1_x: 700,
  logo1_y: 630,
  logo1_esc: 0.8,
  logo2_x: 1548,
  logo2_y: 450,
  logo2_esc: 0.15,
  logo3_x: 1024,
  logo3_y: 1100,
  logo3_esc: 0.2,
  logo4_x: 1700,
  logo4_y: 900,
  logo4_esc: 0.12,
  logo5_x: 340,
  logo5_y: 900,
  logo5_esc: 0.12,
  // Iluminación
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
  // Fondo y Escena
  usarImagenFondo: false,
  imagenFondoPath: "./FONDOPLAYERA.png",
  colorFondo: "#101010",
  colorFondo2: "#2e4366",
  // HDRI y Material
  usarHDRI: true,
  intensidadHDRI: 0.35,
  exposure: 0.15,
  roughness: 0.8,
  metalness: 0.425,
  outlineActivo: true,
  outlineColor: "#111111",
  outlineGrosor: 0.03,
  outlineIrregularidad: 0.012,
  outlineEscalaRuido: 7.5,
  emissiveIntensity: 0,
  colorEmissive: "#000000",
  mostrarPiso: true,
  opacidadSombra: 0.3,
  // Acciones
  grabarVideo: () => prepararGrabacion(),
  descargarImagen: () => descargarCaptura(),
};

// --- 3. CANVAS DE TEXTURA Y PREVISUALIZACIÓN ---
const textCanvas = document.createElement("canvas");
const ctx = textCanvas.getContext("2d");
textCanvas.width = 2048;
textCanvas.height = 2048;

// Previsualización Inferior Izquierda
textCanvas.style.cssText = `
  position: absolute; bottom: 20px; left: 20px; 
  width: 256px; height: 256px; 
  border: 2px solid white; z-index: 1000; background: #000;
`;
document.body.appendChild(textCanvas);

const textTexture = new THREE.CanvasTexture(textCanvas);
textTexture.colorSpace = THREE.SRGBColorSpace;
textTexture.flipY = false;

const imgCache = {};
function cargarImagen(path) {
  if (!imgCache[path]) {
    const img = new Image();
    img.src = path;
    img.onload = () => actualizarTextura();
    imgCache[path] = img;
  }
  return imgCache[path];
}

function actualizarTextura() {
  ctx.clearRect(0, 0, 2048, 2048);

  // 1. Color Base
  ctx.fillStyle = settings.colorBloqueA;
  ctx.fillRect(0, 0, 2048, 2048);

  // 2. Bloques/Franjas
  if (settings.mostrarBloques) {
    ctx.fillStyle = settings.colorBloqueB;
    ctx.fillRect(0, 0, 2048, 260);
    ctx.fillRect(0, 1625, 2048, 423);
  }

  // 3. PNG de la Playera (Capa superior de detalle)
  const imgBase = cargarImagen(settings.texturaBase);
  if (imgBase.complete) {
    ctx.drawImage(imgBase, 0, 0, 2048, 2048);
  }

  // 4. Logos
  if (settings.mostrarLogos) {
    for (let i = 1; i <= 5; i++) {
      const imgL = cargarImagen(`./Logo${i}.png`);
      if (imgL.complete) {
        const esc = settings[`logo${i}_esc`];
        const w = imgL.width * esc;
        const h = imgL.height * esc;
        ctx.drawImage(
          imgL,
          settings[`logo${i}_x`] - w / 2,
          settings[`logo${i}_y`] - h / 2,
          w,
          h,
        );
      }
    }
  }

  // 5. Texto
  const peso = settings.negrita ? "700" : "500";
  ctx.save();
  ctx.translate(settings.posX, settings.posY);
  ctx.scale(settings.escalaX, settings.escalaY);
  ctx.fillStyle = settings.colorTexto;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${peso} ${settings.tamanioNombre}px "${settings.fuente}"`;
  ctx.fillText(settings.nombre.toUpperCase(), 0, 0);
  ctx.font = `${peso} ${settings.tamanioNumero}px "${settings.fuente}"`;
  ctx.fillText(settings.numero, 0, settings.espaciado);
  ctx.restore();

  textTexture.needsUpdate = true;
}

// --- 4. ESCENA 3D Y RENDERER ---
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
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = settings.exposure;
renderer.shadowMap.enabled = true;
document.getElementById("app").appendChild(renderer.domElement);

// Fondo para Imagen
const bgScene = new THREE.Scene();
const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const bgMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.MeshBasicMaterial({ depthTest: false }),
);
bgScene.add(bgMesh);

function actualizarFondo() {
  if (settings.usarImagenFondo) {
    new THREE.TextureLoader().load(settings.imagenFondoPath, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      bgMesh.material.map = tex;
      scene.background = null;
    });
  } else {
    const gCanvas = document.createElement("canvas");
    gCanvas.width = 2;
    gCanvas.height = 512;
    const gCtx = gCanvas.getContext("2d");
    const grd = gCtx.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, settings.colorFondo2);
    grd.addColorStop(1, settings.colorFondo);
    gCtx.fillStyle = grd;
    gCtx.fillRect(0, 0, 2, 512);
    scene.background = new THREE.CanvasTexture(gCanvas);
    bgMesh.material.map = null;
  }
}

// --- 5. LUCES, MODELO Y MATERIALES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight(
  settings.colorLuzAmbiente,
  settings.intensidadLuzAmbiente,
);
scene.add(ambientLight);
const dirLight = new THREE.SpotLight(
  settings.colorLuzPrincipal,
  settings.intensidadLuzPrincipal,
);
dirLight.castShadow = true;
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
}

let modelo3D, hdriEnvMap;
const outlineMaterials = [];

function crearMaterialOutline() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      outlineColor: { value: new THREE.Color(settings.outlineColor) },
      outlineWidth: { value: settings.outlineGrosor },
      noiseAmplitude: { value: settings.outlineIrregularidad },
      noiseScale: { value: settings.outlineEscalaRuido },
    },
    vertexShader: `
      uniform float outlineWidth;
      uniform float noiseAmplitude;
      uniform float noiseScale;
      varying float vNoise;

      float hash(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
      }

      float noise3d(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float n000 = hash(i + vec3(0.0, 0.0, 0.0));
        float n100 = hash(i + vec3(1.0, 0.0, 0.0));
        float n010 = hash(i + vec3(0.0, 1.0, 0.0));
        float n110 = hash(i + vec3(1.0, 1.0, 0.0));
        float n001 = hash(i + vec3(0.0, 0.0, 1.0));
        float n101 = hash(i + vec3(1.0, 0.0, 1.0));
        float n011 = hash(i + vec3(0.0, 1.0, 1.0));
        float n111 = hash(i + vec3(1.0, 1.0, 1.0));

        float nx00 = mix(n000, n100, f.x);
        float nx10 = mix(n010, n110, f.x);
        float nx01 = mix(n001, n101, f.x);
        float nx11 = mix(n011, n111, f.x);
        float nxy0 = mix(nx00, nx10, f.y);
        float nxy1 = mix(nx01, nx11, f.y);
        return mix(nxy0, nxy1, f.z);
      }

      void main() {
        vec3 objectNormal = normalize(normal);
        float irregular = noise3d(position * noiseScale);
        float width = outlineWidth + ((irregular * 2.0) - 1.0) * noiseAmplitude;
        width = max(width, 0.0005);
        vec3 displaced = position + objectNormal * width;
        vNoise = irregular;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 outlineColor;
      varying float vNoise;

      void main() {
        float shade = mix(0.9, 1.05, vNoise);
        gl_FragColor = vec4(outlineColor * shade, 1.0);
      }
    `,
    side: THREE.BackSide,
    transparent: false,
    depthWrite: true,
  });

  outlineMaterials.push(material);
  return material;
}

function crearOutlineMesh(mesh) {
  const outlineMesh = new THREE.Mesh(mesh.geometry, crearMaterialOutline());
  outlineMesh.name = `${mesh.name || "mesh"}_outline`;
  outlineMesh.renderOrder = -1;
  outlineMesh.visible = settings.outlineActivo;
  outlineMesh.frustumCulled = false;
  outlineMesh.castShadow = false;
  outlineMesh.receiveShadow = false;
  outlineMesh.userData.isOutlineMesh = true;
  return outlineMesh;
}

function actualizarOutline() {
  for (const material of outlineMaterials) {
    material.uniforms.outlineColor.value.set(settings.outlineColor);
    material.uniforms.outlineWidth.value = settings.outlineGrosor;
    material.uniforms.noiseAmplitude.value = settings.outlineIrregularidad;
    material.uniforms.noiseScale.value = settings.outlineEscalaRuido;
  }

  if (!modelo3D) return;
  modelo3D.traverse((c) => {
    if (!c.isMesh) return;
    const outlineMesh = c.children.find((child) => child.userData?.isOutlineMesh);
    if (outlineMesh) outlineMesh.visible = settings.outlineActivo;
  });
}

function actualizarMateriales() {
  if (!modelo3D) return;
  modelo3D.traverse((c) => {
    if (c.isMesh && !c.userData?.isOutlineMesh) {
      c.material.roughness = settings.roughness;
      c.material.metalness = settings.metalness;
      c.material.envMapIntensity = settings.usarHDRI
        ? settings.intensidadHDRI
        : 0;
    }
  });
}

const pmremGenerator = new THREE.PMREMGenerator(renderer);
new HDRLoader().load("./hdri.hdr", (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  hdriEnvMap = pmremGenerator.fromEquirectangular(hdr).texture;
  hdr.dispose();
  scene.environment = settings.usarHDRI ? hdriEnvMap : null;
  actualizarMateriales();
});

new GLTFLoader().load("./TshirtPajaro.glb", (gltf) => {
  modelo3D = gltf.scene;
  const modelMeshes = [];

  modelo3D.traverse((c) => {
    if (c.isMesh && !c.userData?.isOutlineMesh) {
      c.castShadow = c.receiveShadow = true;
      c.material = new THREE.MeshStandardMaterial({ map: textTexture });
      modelMeshes.push(c);
    }
  });

  for (const mesh of modelMeshes) {
    mesh.add(crearOutlineMesh(mesh));
  }

  scene.add(modelo3D);
  modelo3D.position.set(0, -0.3, 0);
  actualizarMateriales();
  actualizarOutline();
});

// --- 6. GUI (TODOS LOS MENÚS RESTAURADOS) ---
const gui = new GUI();

// Carpeta 1: Colores y Prenda
const fPrenda = gui.addFolder("Configuración de Prenda");
fPrenda
  .add(settings, "texturaBase", texturasDisponibles)
  .name("Textura Base")
  .onChange(actualizarTextura);
fPrenda
  .addColor(settings, "colorBloqueA")
  .name("Color Principal")
  .onChange(actualizarTextura);
fPrenda
  .addColor(settings, "colorBloqueB")
  .name("Color Bloques")
  .onChange(actualizarTextura);
fPrenda
  .add(settings, "mostrarBloques")
  .name("Activar Bloques")
  .onChange(actualizarTextura);

// Carpeta 2: Logos (Tope Escala 10)
const fLogos = gui.addFolder("Control de Logos (5)");
fLogos
  .add(settings, "mostrarLogos")
  .name("Ver todos")
  .onChange(actualizarTextura);
for (let i = 1; i <= 5; i++) {
  const s = fLogos.addFolder(`Logo ${i}`);
  s.add(settings, `logo${i}_x`, 0, 2048).name("X").onChange(actualizarTextura);
  s.add(settings, `logo${i}_y`, 0, 2048).name("Y").onChange(actualizarTextura);
  s.add(settings, `logo${i}_esc`, 0.01, 10)
    .name("Escala")
    .onChange(actualizarTextura);
  s.close();
}

// Carpeta 3: Texto y Pivotes
const fTexto = gui.addFolder("Personalización Texto");
fTexto.add(settings, "nombre").onChange(actualizarTextura);
fTexto.add(settings, "numero").onChange(actualizarTextura);
fTexto
  .add(settings, "posicionPredefinida", Object.keys(pivotes))
  .name("Pivote")
  .onChange((v) => {
    settings.posX = pivotes[v].x;
    settings.posY = pivotes[v].y;
    actualizarTextura();
    gui.controllers.forEach((c) => c.updateDisplay());
  });
fTexto.add(settings, "posX", 0, 2048).onChange(actualizarTextura);
fTexto.add(settings, "posY", 0, 2048).onChange(actualizarTextura);

// Carpeta 4: Material y HDRI
const fMat = gui.addFolder("Física del Material / HDRI");
fMat
  .add(settings, "roughness", 0, 1)
  .name("Rugosidad")
  .onChange(actualizarMateriales);
fMat
  .add(settings, "metalness", 0, 1)
  .name("Metalicidad")
  .onChange(actualizarMateriales);
fMat
  .add(settings, "usarHDRI")
  .name("Activar HDRI")
  .onChange((v) => {
    scene.environment = v ? hdriEnvMap : null;
    actualizarMateriales();
  });
fMat
  .add(settings, "intensidadHDRI", 0, 2)
  .name("Brillo HDRI")
  .onChange(actualizarMateriales);

// Carpeta 5: Escena e Iluminación
const fOutline = gui.addFolder("Contorno Toon");
fOutline
  .add(settings, "outlineActivo")
  .name("Activar Contorno")
  .onChange(actualizarOutline);
fOutline
  .addColor(settings, "outlineColor")
  .name("Color Contorno")
  .onChange(actualizarOutline);
fOutline
  .add(settings, "outlineGrosor", 0.001, 0.08)
  .name("Grosor")
  .onChange(actualizarOutline);
fOutline
  .add(settings, "outlineIrregularidad", 0, 0.04)
  .name("Irregularidad")
  .onChange(actualizarOutline);
fOutline
  .add(settings, "outlineEscalaRuido", 0.5, 20)
  .name("Escala Patrón")
  .onChange(actualizarOutline);

const fEscena = gui.addFolder("Iluminación y Fondo");
fEscena
  .add(settings, "exposure", 0, 2)
  .name("Exposición")
  .onChange((v) => (renderer.toneMappingExposure = v));
fEscena
  .add(settings, "usarImagenFondo")
  .name("Imagen FONDOPLAYERA")
  .onChange(actualizarFondo);
fEscena
  .addColor(settings, "colorFondo")
  .name("Color de Fondo")
  .onChange(actualizarFondo);
fEscena
  .add(settings, "intensidadLuzPrincipal", 0, 20)
  .name("Luz Focal")
  .onChange(actualizarLuces);

// Botones de Acción
gui.add(settings, "descargarImagen").name("📸 Capturar PNG");
gui.add(settings, "grabarVideo").name("🎬 Grabar Story");

// --- 7. LOOP ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (settings.usarImagenFondo) {
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(bgScene, bgCamera);
    renderer.render(scene, camera);
    renderer.autoClear = true;
  } else {
    renderer.render(scene, camera);
  }
}

actualizarLuces();
actualizarFondo();
animate();

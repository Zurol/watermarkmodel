import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader";
import GUI from "lil-gui";
import lottie from "lottie-web/build/player/lottie_light";

let textureVersion = 0;

// --- 1. CONFIGURACIÓN Y DATOS ---
const pivotes = {
  Espalda: { x: 1550, y: 510 },
  Pecho: { x: 1024, y: 700 },
  "Manga Izq": { x: 1700, y: 1000 },
  "Manga Der": { x: 340, y: 1000 },
};

const texturasDisponibles = [
  "./pattern1.svg",
  "./pattern2.svg",
  "./pattern3.svg",
  "./pattern4.svg",
  "./pattern5.svg",
];

const modelosTorsoDisponibles = {
  "Torso A": "./ModeloFem.glb",
  "Torso B": "./ModeloMasc.glb",
};

const obtenerLogoActivo = () =>
  texturasDisponibles.indexOf(settings.texturaBase) + 1;

const paletasDisponibles = [
  {
    id: "sunset-pop",
    nombre: "Sunset Pop",
    principal: "#f32a4f",
    secundario: "#f49846",
    terciario: "#feca3c",
  },
  {
    id: "mint-fresh",
    nombre: "Mint Fresh",
    principal: "#4fb270",
    secundario: "#bdd24c",
    terciario: "#ffffff",
  },
  {
    id: "pink-breeze",
    nombre: "Pink Breeze",
    principal: "#e8528b",
    secundario: "#92d3e9",
    terciario: "#ffffff",
  },
  {
    id: "sky-breeze",
    nombre: "Sky Breeze",
    principal: "#92d3e9",
    secundario: "#e8528b",
    terciario: "#ffffff",
  },
  {
    id: "berry-flare",
    nombre: "Berry Flare",
    principal: "#d12e4f",
    secundario: "#ffdd57",
    terciario: "#ffdd57",
  },
  {
    id: "green-harvest",
    nombre: "Green Harvest",
    principal: "#33ab58",
    secundario: "#4fb270",
    terciario: "#ffcb24",
  },
  {
    id: "sunburst-gold",
    nombre: "Sunburst Gold",
    principal: "#f49846",
    secundario: "#feca3c",
    terciario: "#f9dc62",
  },
  {
    id: "violet-pulse",
    nombre: "Violet Pulse",
    principal: "#b26fb1",
    secundario: "#6f3893",
    terciario: "#ffffff",
  },
  {
    id: "deep-ocean",
    nombre: "Deep Ocean",
    principal: "#006bb7",
    secundario: "#343390",
    terciario: "#f9dc62",
  },
  {
    id: "lime-light",
    nombre: "Lime Light",
    principal: "#bdd24c",
    secundario: "#ffffff",
    terciario: "#ffffff",
  },
  {
    id: "crimson-night",
    nombre: "Crimson Night",
    principal: "#f32a4f",
    secundario: "#343390",
    terciario: "#f9dc62",
  },
  {
    id: "gold-accent",
    nombre: "Gold Accent",
    principal: "#ffdd57",
    secundario: "#d12e4f",
    terciario: "#ffffff",
  },
  {
    id: "ocean-light",
    nombre: "Ocean Light",
    principal: "#006bb7",
    secundario: "#92d3e9",
    terciario: "#ffffff",
  },
  {
    id: "violet-storm",
    nombre: "Violet Storm",
    principal: "#6f3893",
    secundario: "#b26fb1",
    terciario: "#ffffff",
  },
  {
    id: "sunfire-kit",
    nombre: "Sunfire Kit",
    principal: "#f49846",
    secundario: "#f32a4f",
    terciario: "#ffffff",
  },
  {
    id: "skyline-united",
    nombre: "Skyline United",
    principal: "#92d3e9",
    secundario: "#006bb7",
    terciario: "#ffffff",
  },
  {
    id: "lime-strike",
    nombre: "Lime Strike",
    principal: "#bdd24c",
    secundario: "#33ab58",
    terciario: "#ffffff",
  },
  {
    id: "night-playmaker",
    nombre: "Night Playmaker",
    principal: "#343390",
    secundario: "#f32a4f",
    terciario: "#ffffff",
  },
  {
    id: "rose-legend",
    nombre: "Rose Legend",
    principal: "#e8528b",
    secundario: "#ffffff",
    terciario: "#343390",
  },
  {
    id: "black-toon",
    nombre: "Rose Legend",
    principal: "#0d0d0d",
    secundario: "#454545",
    terciario: "#ffffff",
  },
];

const fuentesDisponibles = ["Impact", "Arial", "Verdana", "Courier New"];
const anchoMaximoNombreEspalda = 650;
const maxCaracteresNumero = 2;
const limitarNumero = (numero) => String(numero).slice(0, maxCaracteresNumero);
const inclinacionPlayeraCuello = THREE.MathUtils.degToRad(5);

// --- 2. ESTADO GLOBAL (SETTINGS COMPLETOS) ---
const settings = {
  nombre: "JUGADOR",
  numero: "10",
  modeloTorso: modelosTorsoDisponibles["Torso A"],
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
  pechoX: 750,
  pechoY: 1450,
  pechoEscala: 0.5,
  mangaIzqX: pivotes["Manga Izq"].x,
  mangaIzqY: pivotes["Manga Izq"].y,
  mangaIzqEscala: 1,
  mangaDerX: 490,
  mangaDerY: 1930,
  mangaDerEscala: 0.4,
  colorTexto: paletasDisponibles[0].terciario,
  texturaBase: texturasDisponibles[0],
  paletaColor: paletasDisponibles[0].id,
  colorBloqueA: paletasDisponibles[0].principal,
  colorBloqueB: paletasDisponibles[0].secundario,
  colorBloqueC: paletasDisponibles[0].terciario,
  modoPivotes: "espalda",
  mostrarBloques: true,
  mostrarLogos: true,
  // Logos con tope de escala 10
  logo1_x: 555,
  logo1_y: 686,
  logo1_esc: 1.72,
  logo1_rot: 0,
  logo2_x: 555,
  logo2_y: 686,
  logo2_esc: 1.72,
  logo2_rot: 0,
  logo3_x: 555,
  logo3_y: 686,
  logo3_esc: 1.72,
  logo3_rot: 0,
  logo4_x: 700,
  logo4_y: 630,
  logo4_esc: 0.8,
  logo4_rot: 0,
  logo5_x: 700,
  logo5_y: 630,
  logo5_esc: 0.8,
  logo5_rot: 0,
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
  usarImagenFondo: true,
  imagenFondoPath: "./FONDOPLAYERA.png",
  colorFondo: "#101010",
  colorFondo2: "#2e4366",
  logoPasaHorizontalX: -0.65,
  logoPasaHorizontalY: 0.6,
  logoPasaHorizontalEscala: 0.5,
  logoPasaVerticalX: 0,
  logoPasaVerticalY: 0.8,
  logoPasaVerticalEscala: 0.7,
  // HDRI y Material
  usarHDRI: true,
  intensidadHDRI: 0.35,
  exposure: 0.25,
  roughness: 0.8,
  metalness: 0.4,
  outlineActivo: false,
  outlineColor: "#ffffff",
  outlineGrosor: 0.005,
  outlineIrregularidad: 9,
  outlineEscalaRuido: 0.5,
  outlineUmbralSilueta: 0,
  outlineSuavidadSilueta: 0.01,
  outlineReducirAbajo: 1,
  outlineSuavidadAbajo: 0.01,
  siluetaExteriorActiva: true,
  siluetaExteriorColor: "#ffffff",
  siluetaExteriorGrosor: 8,
  siluetaExteriorOpacidad: 0.8,
  siluetaExteriorIrregularidad: 0,
  emissiveIntensity: 0,
  colorEmissive: "#000000",
  mostrarPiso: true,
  opacidadSombra: 0.3,
  // CoreografÃ­a de video
  videoDuracionMs: 5000,
  videoModeloProporcionPantalla: 0,
  videoGiroInicioMs: 200,
  videoGiroDuracionMs: 2200,
  videoGiroGrados: 360,
  videoGiroEje: "y",
  videoOverlayInicioMs: 1200,
  videoOverlayFadeMs: 500,
  videoLogoX: 0,
  videoLogoY: 0.65,
  videoLogoEscalaInicio: 0.25,
  videoLogoEscalaFinal: 0.6,
  videoHashtag: " #PASAELBALÓN ",
  videoHashtagX: 0,
  videoHashtagY: -0.7,
  videoHashtagEscala: 0.5,
  videoDesactivarHDRI: false,
  videoReflectoresActivos: false,
  videoReflectoresInicioMs: 200,
  videoReflectoresFadeMs: 700,
  videoReflectorIntensidad: 9,
  videoReflectorColor: "#fff4dd",
  cameraVideoPos: { x: 0, y: 1.2, z: 3.5 }, // Coordenadas fijas para el video
  cameraVideoLookAt: { x: 0, y: 1.0, z: 0 }, // Hacia dónde mira la cámara
  // Acciones
  grabarVideo: () => prepararGrabacion("horizontal"),
  previsualizarCoreografia: () => previsualizarCoreografiaVideo(),
  descargarImagen: () => descargarCaptura(),
  descargarSoloTextura: () => descargarTexturaGenerada(),
};

// --- 3. CANVAS DE TEXTURA Y PREVISUALIZACIÓN ---
const textCanvas = document.createElement("canvas");
const ctx = textCanvas.getContext("2d");
textCanvas.width = 2048;
textCanvas.height = 2048;

// Previsualización Inferior Izquierda
textCanvas.style.cssText = `
    position: absolute; bottom: 20px; left: 20px;
    width: 256px; height: 256px; display:none;
    border: 2px solid white; z-index: 1000; background: #000;
  `;
document.body.appendChild(textCanvas);

const textTexture = new THREE.CanvasTexture(textCanvas);
textTexture.colorSpace = THREE.SRGBColorSpace;
textTexture.flipY = false;

const imgCache = {};

async function cargarSVGColoreado(path, fillColor) {
  const cacheKey = `${path}_${fillColor}`;

  if (imgCache[cacheKey]) {
    return imgCache[cacheKey];
  }

  const response = await fetch(path);
  const svgText = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");

  const elements = doc.querySelectorAll("*");

  elements.forEach((el) => {
    // Solo afectar shapes reales (evita romper defs, gradients, etc.)
    const tag = el.tagName.toLowerCase();

    const drawableTags = [
      "path",
      "rect",
      "circle",
      "ellipse",
      "polygon",
      "polyline",
    ];

    if (!drawableTags.includes(tag)) return;

    el.setAttribute("fill", fillColor);
    el.setAttribute("stroke", fillColor);
    el.removeAttribute("style");
  });

  const serializer = new XMLSerializer();
  const newSVG = serializer.serializeToString(doc);

  const blob = new Blob([newSVG], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.src = url;

  await new Promise((resolve) => (img.onload = resolve));

  URL.revokeObjectURL(url);

  imgCache[cacheKey] = img;
  return img;
}

const imageCache = {};

function cargarImagen(path) {
  if (imageCache[path]) return imageCache[path];

  const img = new Image();
  img.onload = () => actualizarTextura();
  img.src = path;

  imageCache[path] = img;
  return img;
}

function cargarImagenAsync(path) {
  return new Promise((resolve, reject) => {
    if (imageCache[path] && imageCache[path].complete) {
      resolve(imageCache[path]);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous"; // Evita problemas de permisos al descargar
    img.onload = () => {
      imageCache[path] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = path;
  });
}

function aplicarPaleta(idPaleta) {
  const paleta =
    paletasDisponibles.find((item) => item.id === idPaleta) ||
    paletasDisponibles[0];
  settings.paletaColor = paleta.id;
  settings.colorBloqueA = paleta.principal;
  settings.colorBloqueB = paleta.secundario;
  settings.colorBloqueC = paleta.terciario;
  settings.colorTexto = paleta.terciario;
}
/*
// Busca tu función actualizarTextura y envuélvela en una promesa así:
function actualizarTextura() {
  return new Promise((resolve, reject) => {
    // <-- Añadimos esto
    textureVersion++;
    const currentVersion = textureVersion;

    ctx.clearRect(0, 0, 2048, 2048);

    // 1. Color Base
    ctx.fillStyle = settings.colorBloqueA;
    ctx.fillRect(0, 0, 2048, 2048);

    // 2. Bloques
    if (settings.mostrarBloques) {
      ctx.fillStyle = settings.colorBloqueB;
      ctx.fillRect(0, 0, 2048, 260);
      ctx.fillRect(0, 1625, 2048, 423);
    }

    cargarSVGColoreado(settings.texturaBase, settings.colorBloqueC)
      .then((imgBase) => {
        if (currentVersion !== textureVersion) return;

        ctx.drawImage(imgBase, 0, 0, 2048, 2048);

        // ... (Aquí va todo tu código actual de LOGOS y TEXTOS) ...
        // ... (Asegúrate de que todo el código de dibujo esté dentro de este .then) ...

        textTexture.needsUpdate = true;
        marcarRecursoInicialListo("textura");

        resolve(); // <-- IMPORTANTE: Esto le dice al sistema que ya terminó de dibujar todo
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}
*/
async function actualizarTextura() {
  textureVersion++;
  const currentVersion = textureVersion;

  // 1. LIMPIEZA Y FONDO BASE
  ctx.clearRect(0, 0, 2048, 2048);
  ctx.fillStyle = settings.colorBloqueA;
  ctx.fillRect(0, 0, 2048, 2048);

  // 2. DIBUJAR BLOQUES
  if (settings.mostrarBloques) {
    ctx.fillStyle = settings.colorBloqueB;
    ctx.fillRect(0, 0, 2048, 260);
    ctx.fillRect(0, 1625, 2048, 423);
  }

  try {
    // 3. CARGAR Y DIBUJAR SVG PATTERN
    const imgBase = await cargarSVGColoreado(
      settings.texturaBase,
      settings.colorBloqueC,
    );
    if (currentVersion !== textureVersion) return;
    ctx.drawImage(imgBase, 0, 0, 2048, 2048);

    // 4. CARGAR Y DIBUJAR LOGOS
    if (settings.mostrarLogos) {
      const logoActivo = obtenerLogoActivo();
      if (logoActivo >= 1) {
        const imgL = await cargarImagenAsync(`./Logo${logoActivo}.png`);
        const esc = settings[`logo${logoActivo}_esc`];
        const w = imgL.width * esc;
        const h = imgL.height * esc;
        const x = settings[`logo${logoActivo}_x`];
        const y = settings[`logo${logoActivo}_y`];
        const rot = (settings[`logo${logoActivo}_rot`] * Math.PI) / 180;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.drawImage(imgL, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
    }

    // 5. DIBUJAR TEXTOS (NOMBRE Y NÚMERO)
    const gruposPivote = {
      espalda: ["Espalda"],
      espalda_manga: ["Espalda", "Manga Der"],
      espalda_frente: ["Espalda", "Pecho"],
      espalda_frente_manga: ["Espalda", "Pecho", "Manga Der"],
    };

    const pivotesActivos = gruposPivote[settings.modoPivotes] || ["Espalda"];
    const peso = settings.negrita ? "700" : "500";

    // Definición interna de la función de dibujo de texto
    const ejecutarDibujoTexto = (x, y, escala, incluirNombre) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(escala, escala);
      ctx.fillStyle = settings.colorBloqueC;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (incluirNombre) {
        const nombre = settings.nombre.toUpperCase();
        const anchoMaximoNombre =
          anchoMaximoNombreEspalda / Math.max(escala, 0.001);
        ctx.font = `${peso} ${settings.tamanioNombre}px "${settings.fuente}"`;
        const anchoNombre = ctx.measureText(nombre).width;
        const escalaNombre =
          anchoNombre > anchoMaximoNombre ? anchoMaximoNombre / anchoNombre : 1;
        const tamanioFinal = settings.tamanioNombre * escalaNombre;

        ctx.font = `${peso} ${tamanioFinal}px "${settings.fuente}"`;
        ctx.fillText(nombre, 0, 0);
        ctx.font = `${peso} ${settings.tamanioNumero}px "${settings.fuente}"`;
        ctx.fillText(limitarNumero(settings.numero), 0, settings.espaciado);
      } else {
        ctx.font = `${peso} ${settings.tamanioNumero}px "${settings.fuente}"`;
        ctx.fillText(limitarNumero(settings.numero), 0, 0);
      }
      ctx.restore();
    };

    // Aplicar el dibujo en cada pivote activo
    for (const nombrePivote of pivotesActivos) {
      if (nombrePivote === "Espalda") {
        ejecutarDibujoTexto(
          settings.posX,
          settings.posY,
          settings.escalaX,
          true,
        );
      } else if (nombrePivote === "Pecho") {
        ejecutarDibujoTexto(
          settings.pechoX,
          settings.pechoY,
          settings.pechoEscala,
          false,
        );
      } else if (nombrePivote === "Manga Der") {
        ejecutarDibujoTexto(
          settings.mangaDerX,
          settings.mangaDerY,
          settings.mangaDerEscala,
          false,
        );
      }
    }

    // 6. ACTUALIZAR THREE.JS Y FINALIZAR
    textTexture.needsUpdate = true;
    marcarRecursoInicialListo("textura");
    return true;
  } catch (error) {
    console.error("Error en la textura:", error);
    marcarRecursoInicialListo("textura");
  }
}

// --- 4. ESCENA 3D Y RENDERER ---
const appContainer = document.getElementById("app");
const loaderElement = document.getElementById("canvas-loader");
const loaderLottieElement = document.getElementById("loader-lottie");
const recursosInicialesPendientes = new Set([
  "fondo",
  "logoPasaElBalon",
  "hdri",
  "modelo",
  "textura",
]);
const pausaLoaderInicialMs = 250;
let recursosInicialesListos = false;
let animacionLoaderCompleta = !loaderLottieElement;
let loaderOcultarTimer = null;

function ocultarLoaderInicialCuandoListo() {
  if (!recursosInicialesListos || !animacionLoaderCompleta) return;

  if (loaderOcultarTimer) clearTimeout(loaderOcultarTimer);

  loaderOcultarTimer = setTimeout(() => {
    loaderOcultarTimer = null;
    requestAnimationFrame(() => {
      renderFrame();
      loaderElement?.classList.add("is-hidden");
    });
  }, 0);
}

function marcarAnimacionLoaderCompleta() {
  animacionLoaderCompleta = true;
  ocultarLoaderInicialCuandoListo();
}

if (loaderLottieElement) {
  try {
    const loaderLottie = lottie.loadAnimation({
      container: loaderLottieElement,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: `${import.meta.env.BASE_URL}animacion-lottie.json`,
    });
    loaderLottie.stop();

    loaderLottie.addEventListener("DOMLoaded", () => {
      loaderLottieElement.classList.add("is-loaded");
      loaderElement?.classList.add("has-lottie");
      setTimeout(() => loaderLottie.play(), pausaLoaderInicialMs);
    });
    loaderLottie.addEventListener("complete", marcarAnimacionLoaderCompleta);
    loaderLottie.addEventListener("data_failed", marcarAnimacionLoaderCompleta);
  } catch (error) {
    console.error("No se pudo cargar la animación del loader", error);
    marcarAnimacionLoaderCompleta();
  }
}

function marcarRecursoInicialListo(nombre) {
  recursosInicialesPendientes.delete(nombre);
  if (recursosInicialesPendientes.size > 0) return;

  recursosInicialesListos = true;
  ocultarLoaderInicialCuandoListo();
}

function obtenerTamanoCanvas() {
  const rect = appContainer.getBoundingClientRect();
  return {
    width: Math.max(1, Math.floor(rect.width || window.innerWidth)),
    height: Math.max(1, Math.floor(rect.height || window.innerHeight)),
  };
}

let tamanoCanvas = obtenerTamanoCanvas();

function canvasEsVertical() {
  return tamanoCanvas.height > tamanoCanvas.width;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  tamanoCanvas.width / tamanoCanvas.height,
  0.1,
  1000,
);
camera.position.set(0, 0.4, 2.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(tamanoCanvas.width, tamanoCanvas.height, false);
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = settings.exposure;
renderer.shadowMap.enabled = true;
appContainer.appendChild(renderer.domElement);

const maskMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.FrontSide,
});
const silhouetteTarget = new THREE.WebGLRenderTarget(1, 1, {
  depthBuffer: true,
  stencilBuffer: false,
});
silhouetteTarget.texture.minFilter = THREE.LinearFilter;
silhouetteTarget.texture.magFilter = THREE.LinearFilter;
silhouetteTarget.texture.generateMipmaps = false;

const silhouetteScene = new THREE.Scene();
const silhouetteCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const silhouetteMaterial = new THREE.ShaderMaterial({
  uniforms: {
    maskTexture: { value: silhouetteTarget.texture },
    resolution: { value: new THREE.Vector2(1, 1) },
    outlineColor: { value: new THREE.Color(settings.siluetaExteriorColor) },
    outlineWidth: { value: settings.siluetaExteriorGrosor },
    opacity: { value: settings.siluetaExteriorOpacidad },
    noiseAmount: { value: settings.siluetaExteriorIrregularidad },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D maskTexture;
    uniform vec2 resolution;
    uniform vec3 outlineColor;
    uniform float outlineWidth;
    uniform float opacity;
    uniform float noiseAmount;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      float center = texture2D(maskTexture, vUv).r;
      vec2 px = 1.0 / resolution;
      float noise = (hash(floor(vUv * resolution * 0.35)) * 2.0 - 1.0) * noiseAmount;
      float radius = max(outlineWidth + noise, 0.0);

      float outer = 0.0;
      outer = max(outer, texture2D(maskTexture, vUv + vec2(px.x * radius, 0.0)).r);
      outer = max(outer, texture2D(maskTexture, vUv - vec2(px.x * radius, 0.0)).r);
      outer = max(outer, texture2D(maskTexture, vUv + vec2(0.0, px.y * radius)).r);
      outer = max(outer, texture2D(maskTexture, vUv - vec2(0.0, px.y * radius)).r);
      outer = max(outer, texture2D(maskTexture, vUv + px * radius).r);
      outer = max(outer, texture2D(maskTexture, vUv - px * radius).r);
      outer = max(outer, texture2D(maskTexture, vUv + vec2(px.x, -px.y) * radius).r);
      outer = max(outer, texture2D(maskTexture, vUv + vec2(-px.x, px.y) * radius).r);

      float edge = max(outer - center, 0.0);
      if (edge <= 0.001) discard;
      gl_FragColor = vec4(outlineColor, edge * opacity);
    }
  `,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
});
const silhouetteQuad = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  silhouetteMaterial,
);
silhouetteScene.add(silhouetteQuad);

function actualizarSiluetaExterior() {
  silhouetteMaterial.uniforms.outlineColor.value.set(
    settings.siluetaExteriorColor,
  );
  silhouetteMaterial.uniforms.outlineWidth.value =
    settings.siluetaExteriorGrosor;
  silhouetteMaterial.uniforms.opacity.value = settings.siluetaExteriorOpacidad;
  silhouetteMaterial.uniforms.noiseAmount.value =
    settings.siluetaExteriorIrregularidad;
}

function actualizarRenderTargets() {
  const pixelRatio = renderer.getPixelRatio();
  const width = Math.max(1, Math.floor(tamanoCanvas.width * pixelRatio));
  const height = Math.max(1, Math.floor(tamanoCanvas.height * pixelRatio));
  silhouetteTarget.setSize(width, height);
  silhouetteMaterial.uniforms.resolution.value.set(width, height);
}

actualizarRenderTargets();

// Fondo para Imagen
const bgScene = new THREE.Scene();
const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const bgMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.MeshBasicMaterial({
    depthTest: true,
    depthWrite: true,
    toneMapped: true,
  }),
);
bgScene.add(bgMesh);

const backgroundTextureLoader = new THREE.TextureLoader();
let fondoImagenTexture = null;

function actualizarFondo() {
  if (settings.usarImagenFondo) {
    if (fondoImagenTexture) {
      bgMesh.material.map = fondoImagenTexture;
      bgMesh.material.needsUpdate = true;
      scene.background = null;
      marcarRecursoInicialListo("fondo");
      return;
    }

    backgroundTextureLoader.load(
      settings.imagenFondoPath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        fondoImagenTexture = tex;
        bgMesh.material.map = fondoImagenTexture;
        bgMesh.material.needsUpdate = true;
        scene.background = null;
        marcarRecursoInicialListo("fondo");
      },
      undefined,
      (error) => {
        console.error("No se pudo cargar FONDOPLAYERA.png", error);
        marcarRecursoInicialListo("fondo");
      },
    );
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
    bgMesh.material.needsUpdate = true;
    marcarRecursoInicialListo("fondo");
  }
}

// --- LOGO SOBRE FONDO (overlay en bgScene) ---

const logoTextureLoader = new THREE.TextureLoader();

const logoMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
});

const logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), logoMaterial);

// Posición en pantalla (coordenadas ortográficas -1 a 1)
logoMesh.position.set(-0.65, 0.6, 0); // esquina inferior derecha

function actualizarLogoPasaElBalon() {
  const prefijo = canvasEsVertical()
    ? "logoPasaVertical"
    : "logoPasaHorizontal";
  const ancho = settings[`${prefijo}Escala`];
  const textura = logoMaterial.map;
  const aspectImagen =
    textura?.image?.width && textura?.image?.height
      ? textura.image.height / textura.image.width
      : 1;
  const aspectCanvas = tamanoCanvas.width / tamanoCanvas.height;

  logoMesh.position.set(settings[`${prefijo}X`], settings[`${prefijo}Y`], 0);
  logoMesh.scale.set(ancho, ancho * aspectImagen * aspectCanvas, 1);
}

actualizarLogoPasaElBalon();

bgScene.add(logoMesh);

function crearTexturaHashtag(texto) {
  const canvas = document.createElement("canvas");
  const tempCtx = canvas.getContext("2d");

  // 1. Definimos el estilo de fuente primero para medir
  const fontSize = 150;
  tempCtx.font = `900 ${fontSize}px "Sharp Grotesk", Impact, Arial, sans-serif`;

  // 2. Medimos cuánto mide el texto realmente
  const metrica = tempCtx.measureText(texto);
  const padding = 40; // Espacio extra para que no roce los bordes

  // 3. Ajustamos el tamaño del canvas al texto real
  canvas.width = metrica.width + padding;
  canvas.height = fontSize * 1.4; // Altura proporcional a la fuente

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Re-aplicamos la fuente porque al cambiar el width/height del canvas se resetea
  ctx.font = `900 ${fontSize}px "Sharp Grotesk", Impact, Arial, sans-serif`;

  // Dibujamos justo en el centro del nuevo tamaño
  ctx.fillText(texto, canvas.width / 2, canvas.height / 2);

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

const hashtagMaterial = new THREE.MeshBasicMaterial({
  map: crearTexturaHashtag(settings.videoHashtag),
  transparent: true,
  opacity: 0,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
});
const hashtagMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  hashtagMaterial,
);
hashtagMesh.visible = false;
bgScene.add(hashtagMesh);

function actualizarHashtagVideo() {
  const textura = hashtagMaterial.map;
  if (!textura || !textura.image) return;

  const aspectImagen = textura.image.width / textura.image.height;

  hashtagMesh.position.set(settings.videoHashtagX, settings.videoHashtagY, 0);

  // Dividimos entre 10 (o el factor que prefieras) para que
  // en el GUI puedas usar valores como 1, 2 o 3 en lugar de 0.1
  const factorAjuste = 0.1;

  hashtagMesh.scale.set(
    settings.videoHashtagEscala * aspectImagen * factorAjuste,
    settings.videoHashtagEscala * factorAjuste,
    1,
  );
}

actualizarHashtagVideo();

// Cargar textura
logoTextureLoader.load(
  "./LogoPasaElBalon.png",
  (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    logoMaterial.map = tex;
    logoMaterial.needsUpdate = true;
    actualizarLogoPasaElBalon();
    marcarRecursoInicialListo("logoPasaElBalon");
  },
  undefined,
  () => marcarRecursoInicialListo("logoPasaElBalon"),
);

// --- 5. LUCES, MODELO Y MATERIALES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 0.55;
controls.maxDistance = 1.15;
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(0, 0, 0);

controls.update();

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

function crearReflectorVideo(lado) {
  const grupo = new THREE.Group();
  const materialCuerpo = new THREE.MeshStandardMaterial({
    color: 0x20242c,
    roughness: 0.42,
    metalness: 0.65,
    transparent: true,
    opacity: 0,
  });
  const materialLente = new THREE.MeshBasicMaterial({
    color: 0xfff4dd,
    transparent: true,
    opacity: 0,
  });

  const cuerpo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.18, 32),
    materialCuerpo,
  );
  cuerpo.rotation.x = Math.PI / 2;
  cuerpo.castShadow = true;
  grupo.add(cuerpo);

  const lente = new THREE.Mesh(
    new THREE.CircleGeometry(0.078, 32),
    materialLente,
  );
  lente.position.z = -0.095;
  grupo.add(lente);

  const luz = new THREE.SpotLight(
    settings.videoReflectorColor,
    0,
    2.5,
    0.42,
    0.8,
    1,
  );
  luz.position.set(0, 0, -0.04);
  luz.target.position.set(-lado * 0.4, 0.4, 0.25);
  grupo.add(luz);
  scene.add(luz.target);

  grupo.position.set(lado * 0.46, -0.52, -0.42);
  grupo.rotation.set(
    THREE.MathUtils.degToRad(-18),
    lado * THREE.MathUtils.degToRad(28),
    0,
  );
  grupo.visible = false;

  scene.add(grupo);

  return {
    grupo,
    cuerpo,
    lente,
    luz,
    materiales: [materialCuerpo, materialLente],
  };
}

const reflectoresVideo = [crearReflectorVideo(-1), crearReflectorVideo(1)];

let modelo3D, hdriEnvMap;
let solicitudModeloActual = 0;
const outlineMaterials = [];

function crearMaterialOutline() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      outlineColor: { value: new THREE.Color(settings.outlineColor) },
      outlineWidth: { value: settings.outlineGrosor },
      noiseAmplitude: { value: settings.outlineIrregularidad },
      noiseScale: { value: settings.outlineEscalaRuido },
      silhouetteThreshold: { value: settings.outlineUmbralSilueta },
      silhouetteSoftness: { value: settings.outlineSuavidadSilueta },
      downwardSuppress: { value: settings.outlineReducirAbajo },
      downwardSoftness: { value: settings.outlineSuavidadAbajo },
    },
    vertexShader: `
        uniform float outlineWidth;
        uniform float noiseAmplitude;
        uniform float noiseScale;
        uniform float silhouetteThreshold;
        uniform float silhouetteSoftness;
        uniform float downwardSuppress;
        uniform float downwardSoftness;
        varying float vRim;
        varying float vDownwardMask;
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
          vec3 viewNormal = normalize(normalMatrix * normal);
          vec4 baseMvPosition = modelViewMatrix * vec4(position, 1.0);
          vec3 viewDir = normalize(-baseMvPosition.xyz);
          float rim = 1.0 - abs(dot(viewNormal, viewDir));
          float rimMask = smoothstep(
            silhouetteThreshold,
            silhouetteThreshold + max(silhouetteSoftness, 0.0001),
            rim
          );
          float downwardMask = 1.0 - smoothstep(
            downwardSuppress - max(downwardSoftness, 0.0001),
            downwardSuppress + max(downwardSoftness, 0.0001),
            -objectNormal.y
          );
          float width =
            outlineWidth + ((irregular * 2.0) - 1.0) * (noiseAmplitude * 0.0005);
          width *= rimMask * downwardMask;
          width = max(width, 0.0);
          vec3 displaced = position + objectNormal * width;
          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          vRim = rimMask;
          vDownwardMask = downwardMask;
          vNoise = irregular;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
    fragmentShader: `
        uniform vec3 outlineColor;
        varying float vRim;
        varying float vDownwardMask;
        varying float vNoise;

        void main() {
          float rimMask = vRim * vDownwardMask;
          if (rimMask <= 0.001) discard;
          float shade = mix(0.9, 1.05, vNoise);
          gl_FragColor = vec4(outlineColor * shade, rimMask);
        }
      `,
    side: THREE.BackSide,
    transparent: true,
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
    material.uniforms.silhouetteThreshold.value = settings.outlineUmbralSilueta;
    material.uniforms.silhouetteSoftness.value =
      settings.outlineSuavidadSilueta;
    material.uniforms.downwardSuppress.value = settings.outlineReducirAbajo;
    material.uniforms.downwardSoftness.value = settings.outlineSuavidadAbajo;
  }

  if (!modelo3D) return;
  modelo3D.traverse((c) => {
    if (!c.isMesh) return;
    const outlineMesh = c.children.find(
      (child) => child.userData?.isOutlineMesh,
    );
    if (outlineMesh) outlineMesh.visible = settings.outlineActivo;
  });
}

function liberarModelo(modelo) {
  const materiales = new Set();
  const geometrias = new Set();

  modelo.traverse((c) => {
    if (!c.isMesh) return;

    if (c.geometry) geometrias.add(c.geometry);

    const listaMateriales = Array.isArray(c.material)
      ? c.material
      : [c.material];
    for (const material of listaMateriales) {
      if (!material) continue;
      materiales.add(material);

      const index = outlineMaterials.indexOf(material);
      if (index !== -1) outlineMaterials.splice(index, 1);
    }
  });

  materiales.forEach((material) => material.dispose());
  geometrias.forEach((geometry) => geometry.dispose());
}

function prepararModelo(gltf) {
  const modelo = gltf.scene;
  const modelMeshes = [];

  modelo.traverse((c) => {
    if (c.isMesh && !c.userData?.isOutlineMesh) {
      c.castShadow = c.receiveShadow = true;
      c.material = new THREE.MeshStandardMaterial({ map: textTexture });
      modelMeshes.push(c);
    }
  });

  for (const mesh of modelMeshes) {
    mesh.add(crearOutlineMesh(mesh));
  }

  modelo.position.set(0, -0.3, 0);
  modelo.rotation.x = inclinacionPlayeraCuello;

  return modelo;
}

function cargarModeloTorso(rutaModelo, esCargaInicial = false) {
  const solicitud = ++solicitudModeloActual;

  gltfLoader.load(
    rutaModelo,
    (gltf) => {
      const nuevoModelo = prepararModelo(gltf);

      if (solicitud !== solicitudModeloActual) {
        liberarModelo(nuevoModelo);
        return;
      }

      if (modelo3D) {
        scene.remove(modelo3D);
        liberarModelo(modelo3D);
      }

      modelo3D = nuevoModelo;
      scene.add(modelo3D);
      actualizarMateriales();
      actualizarOutline();
      renderFrame();

      if (esCargaInicial) marcarRecursoInicialListo("modelo");
    },
    undefined,
    (error) => {
      console.error(`No se pudo cargar ${rutaModelo}`, error);
      if (esCargaInicial) marcarRecursoInicialListo("modelo");
    },
  );
}

function descargarCaptura() {
  renderFrame();
  renderer.domElement.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jersey-${settings.nombre || "preview"}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

function descargarTexturaGenerada() {
  // Asegurarnos de que el canvas esté actualizado antes de descargar
  actualizarTextura();

  // Convertir el canvas de la textura a un Blob
  textCanvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Nombre del archivo basado en el jugador
    link.download = `textura-jersey-${settings.nombre || "personalizada"}.png`;
    link.click();

    // Limpiar memoria
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

let mediaRecorder = null;
let recordedChunks = [];
let recordingTimeout = null;
let formatoGrabacionActual = "horizontal";
let videoGenerado = null;

const formatosGrabacion = {
  vertical: {
    width: 1080,
    height: 1920,
    nombre: "vertical",
  },
  horizontal: {
    width: 1920,
    height: 1080,
    nombre: "horizontal",
  },
};

function actualizarEstadoVideo(mensaje, activo) {
  const loaderText = loaderElement?.querySelector("span");
  if (loaderText && mensaje) loaderText.textContent = mensaje;
  loaderElement?.classList.toggle("is-hidden", !activo);
  loaderElement?.classList.toggle("is-video-loader", activo);
  loaderElement?.classList.remove("is-video-result");
  if (htmlControls.loaderActions) htmlControls.loaderActions.hidden = true;
  if (htmlControls.capturar) htmlControls.capturar.disabled = activo;
  if (htmlControls.story) htmlControls.story.disabled = activo;
}

function obtenerTipoVideoPreferido() {
  const tipos = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm",
  ];

  return tipos.find((tipo) => MediaRecorder.isTypeSupported(tipo)) || "";
}

function obtenerExtensionVideo(tipo) {
  return tipo.includes("mp4") ? "mp4" : "webm";
}

function obtenerTipoArchivoVideo(tipo) {
  return tipo.includes("mp4") ? "video/mp4" : "video/webm";
}

function crearNombreVideo() {
  const extension = obtenerExtensionVideo(videoGenerado?.type || "video/webm");
  return `story-${formatoGrabacionActual}-${settings.nombre || "preview"}.${extension}`;
}

function descargarBlobVideo() {
  if (!videoGenerado) return;
  const url = URL.createObjectURL(videoGenerado);
  const link = document.createElement("a");
  link.href = url;
  link.download = crearNombreVideo();
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function compartirVideoGenerado() {
  if (!videoGenerado) return;

  const file = new File([videoGenerado], crearNombreVideo(), {
    type: obtenerTipoArchivoVideo(videoGenerado.type || "video/webm"),
  });
  const shareData = {
    files: [file],
    title: "Historia Pasa El Balon",
  };

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share(shareData);
      loaderElement?.classList.add("is-hidden");
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("No se pudo compartir el video", error);
    }
  }

  descargarBlobVideo();
}

function mostrarVideoListo() {
  const loaderText = loaderElement?.querySelector("span");
  if (loaderText) loaderText.textContent = "Video listo";
  loaderElement?.classList.remove("is-hidden");
  loaderElement?.classList.remove("is-video-loader");
  loaderElement?.classList.add("is-video-result");
  if (htmlControls.loaderActions) htmlControls.loaderActions.hidden = false;
  if (htmlControls.capturar) htmlControls.capturar.disabled = false;
  if (htmlControls.story) htmlControls.story.disabled = false;
}

function aplicarFormatoGrabacion(orientacion) {
  const formato =
    formatosGrabacion[orientacion] || formatosGrabacion.horizontal;
  formatoGrabacionActual = formato.nombre;
  tamanoCanvas = { width: formato.width, height: formato.height };
  renderer.setPixelRatio(1);
  camera.aspect = formato.width / formato.height;
  camera.updateProjectionMatrix();
  renderer.setSize(formato.width, formato.height, false);
  actualizarRenderTargets();
  actualizarLogoPasaElBalon();
  actualizarHashtagVideo();
}

const clamp01 = (valor) => Math.min(1, Math.max(0, valor));
const easeOutCubic = (valor) => 1 - Math.pow(1 - clamp01(valor), 3);

let coreografiaGrabacion = null;
let previewCoreografiaTimer = null;

function ajustarModeloParaVideo() {
  if (!modelo3D) return;
  if (settings.videoModeloProporcionPantalla <= 0) return;

  const box = new THREE.Box3().setFromObject(modelo3D);
  const size = box.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0) return;

  const distanciaCamara = camera.position.distanceTo(controls.target);
  const altoVisible =
    2 * distanciaCamara * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const escalaObjetivo =
    (altoVisible * settings.videoModeloProporcionPantalla) / size.y;

  modelo3D.scale.multiplyScalar(escalaObjetivo);
}

function aplicarEscalaLogoVideo(escala) {
  logoMesh.scale.set(
    escala,
    escala *
      ((logoMaterial.map?.image?.height || 1) /
        (logoMaterial.map?.image?.width || 1)) *
      (tamanoCanvas.width / tamanoCanvas.height),
    1,
  );
}

function posicionarOverlaysVideo() {
  logoMesh.position.set(settings.videoLogoX, settings.videoLogoY, 0);
  aplicarEscalaLogoVideo(settings.videoLogoEscalaInicio);

  if (hashtagMaterial.map) hashtagMaterial.map.dispose();
  hashtagMaterial.map = crearTexturaHashtag(settings.videoHashtag);
  hashtagMaterial.needsUpdate = true;
  actualizarHashtagVideo();
}

function fijarCamaraParaVideo() {
  // 1. Deshabilitamos controles para que el usuario no interfiera
  controls.enabled = false;
  controls.update();

  // 2. Seteamos la posición exacta
  camera.position.set(
    settings.cameraVideoPos.x,
    settings.cameraVideoPos.y,
    settings.cameraVideoPos.z,
  );

  // 3. Apuntamos al centro del modelo (o al pecho)
  camera.lookAt(
    settings.cameraVideoLookAt.x,
    settings.cameraVideoLookAt.y,
    settings.cameraVideoLookAt.z,
  );

  // 4. Actualizamos la matriz y los controles
  camera.updateProjectionMatrix();
  controls.update();
}

function iniciarCoreografiaGrabacion() {
  posicionarOverlaysVideo();

  coreografiaGrabacion = {
    inicio: performance.now(),
    modeloRotacionInicial: modelo3D?.rotation.clone() || null,
    modeloEscalaInicial: modelo3D?.scale.clone() || null,
    logoVisibleInicial: logoMesh.visible,
    logoOpacidadInicial: logoMaterial.opacity,
    logoEscalaInicial: logoMesh.scale.clone(),
    hashtagVisibleInicial: hashtagMesh.visible,
    hashtagOpacidadInicial: hashtagMaterial.opacity,
    controlesActivosInicial: controls.enabled,
    usarHDRIInicial: settings.usarHDRI,
    environmentInicial: scene.environment,
  };

  ajustarModeloParaVideo();
  controls.enabled = false;
  if (settings.videoDesactivarHDRI) {
    settings.usarHDRI = false;
    scene.environment = null;
    actualizarMateriales();
  }
  logoMesh.visible = true;
  logoMaterial.opacity = 0;
  hashtagMesh.visible = true;
  hashtagMaterial.opacity = 0;

  for (const reflector of reflectoresVideo) {
    reflector.grupo.visible = settings.videoReflectoresActivos;
    reflector.luz.color.set(settings.videoReflectorColor);
    reflector.luz.intensity = 0;
    for (const material of reflector.materiales) material.opacity = 0;
  }
}

function actualizarCoreografiaGrabacion(ahora = performance.now()) {
  if (!coreografiaGrabacion) return;

  const tiempo = ahora - coreografiaGrabacion.inicio;
  const progresoGiro = easeOutCubic(
    (tiempo - settings.videoGiroInicioMs) / settings.videoGiroDuracionMs,
  );
  const giroRad = THREE.MathUtils.degToRad(
    settings.videoGiroGrados * progresoGiro,
  );

  if (modelo3D && coreografiaGrabacion.modeloRotacionInicial) {
    modelo3D.rotation.copy(coreografiaGrabacion.modeloRotacionInicial);
    modelo3D.rotation[settings.videoGiroEje] += giroRad;
  }

  const overlayAlpha = easeOutCubic(
    (tiempo - settings.videoOverlayInicioMs) / settings.videoOverlayFadeMs,
  );
  logoMaterial.opacity = overlayAlpha;
  hashtagMaterial.opacity = overlayAlpha;
  aplicarEscalaLogoVideo(
    THREE.MathUtils.lerp(
      settings.videoLogoEscalaInicio,
      settings.videoLogoEscalaFinal,
      overlayAlpha,
    ),
  );

  const reflectorAlpha = settings.videoReflectoresActivos
    ? easeOutCubic(
        (tiempo - settings.videoReflectoresInicioMs) /
          settings.videoReflectoresFadeMs,
      )
    : 0;

  for (const reflector of reflectoresVideo) {
    reflector.luz.intensity =
      settings.videoReflectorIntensidad * reflectorAlpha;
    for (const material of reflector.materiales)
      material.opacity = reflectorAlpha;
  }
}

function finalizarCoreografiaGrabacion() {
  if (!coreografiaGrabacion) return;

  if (modelo3D && coreografiaGrabacion.modeloRotacionInicial) {
    modelo3D.rotation.copy(coreografiaGrabacion.modeloRotacionInicial);
  }
  if (modelo3D && coreografiaGrabacion.modeloEscalaInicial) {
    modelo3D.scale.copy(coreografiaGrabacion.modeloEscalaInicial);
  }

  controls.enabled = coreografiaGrabacion.controlesActivosInicial;
  settings.usarHDRI = coreografiaGrabacion.usarHDRIInicial;
  scene.environment = coreografiaGrabacion.environmentInicial;
  actualizarMateriales();
  logoMesh.visible = coreografiaGrabacion.logoVisibleInicial;
  logoMaterial.opacity = coreografiaGrabacion.logoOpacidadInicial;
  logoMesh.scale.copy(coreografiaGrabacion.logoEscalaInicial);
  hashtagMesh.visible = coreografiaGrabacion.hashtagVisibleInicial;
  hashtagMaterial.opacity = coreografiaGrabacion.hashtagOpacidadInicial;

  for (const reflector of reflectoresVideo) {
    reflector.grupo.visible = false;
    reflector.luz.intensity = 0;
    for (const material of reflector.materiales) material.opacity = 0;
  }

  coreografiaGrabacion = null;
  actualizarLogoPasaElBalon();
  actualizarHashtagVideo();
  renderFrame();
}

function detenerPreviewCoreografiaVideo() {
  if (previewCoreografiaTimer) {
    clearTimeout(previewCoreografiaTimer);
    previewCoreografiaTimer = null;
  }
  finalizarCoreografiaGrabacion();
}

function previsualizarCoreografiaVideo() {
  if (mediaRecorder && mediaRecorder.state === "recording") return;

  detenerPreviewCoreografiaVideo();
  iniciarCoreografiaGrabacion();
  actualizarCoreografiaGrabacion(coreografiaGrabacion?.inicio);
  renderFrame();

  previewCoreografiaTimer = setTimeout(() => {
    previewCoreografiaTimer = null;
    finalizarCoreografiaGrabacion();
  }, settings.videoDuracionMs);
}

function prepararGrabacion(orientacion = "horizontal") {
  prepararCamaraParaVideo();

  if (!("MediaRecorder" in window) || !renderer.domElement.captureStream) {
    console.error("MediaRecorder no está disponible en este navegador.");
    return;
  }

  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    return;
  }

  detenerPreviewCoreografiaVideo();
  aplicarFormatoGrabacion(orientacion);
  iniciarCoreografiaGrabacion();
  actualizarCoreografiaGrabacion(coreografiaGrabacion?.inicio);
  renderFrame();
  actualizarEstadoVideo(`Grabando video ${orientacion}`, true);

  const stream = renderer.domElement.captureStream(30);
  recordedChunks = [];
  videoGenerado = null;
  const mimeType = obtenerTipoVideoPreferido();

  mediaRecorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType } : undefined,
  );

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) recordedChunks.push(event.data);
  };

  mediaRecorder.onerror = (event) => {
    console.error("No se pudo generar el video", event.error || event);
    if (recordingTimeout) {
      clearTimeout(recordingTimeout);
      recordingTimeout = null;
    }
    finalizarCoreografiaGrabacion();
    redimensionarRenderer();
    actualizarEstadoVideo("", false);
  };

  mediaRecorder.onstop = () => {
    actualizarEstadoVideo("Preparando descarga", true);

    if (recordingTimeout) {
      clearTimeout(recordingTimeout);
      recordingTimeout = null;
    }

    const blobType = mediaRecorder.mimeType || mimeType || "video/webm";
    videoGenerado = new Blob(recordedChunks, { type: blobType });
    finalizarCoreografiaGrabacion();
    redimensionarRenderer();
    mostrarVideoListo();
  };

  mediaRecorder.start();
  recordingTimeout = setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state === "recording")
      mediaRecorder.stop();
  }, settings.videoDuracionMs);
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

function renderSiluetaExterior() {
  if (!settings.siluetaExteriorActiva || !modelo3D) return;

  const previousRenderTarget = renderer.getRenderTarget();
  const previousOverrideMaterial = scene.overrideMaterial;
  const previousBackground = scene.background;
  const previousClearColor = renderer.getClearColor(new THREE.Color());
  const previousClearAlpha = renderer.getClearAlpha();
  const previousAutoClear = renderer.autoClear;
  const hiddenOutlineMeshes = [];

  modelo3D.traverse((c) => {
    if (!c.userData?.isOutlineMesh || !c.visible) return;
    hiddenOutlineMeshes.push(c);
    c.visible = false;
  });

  scene.overrideMaterial = maskMaterial;
  scene.background = null;
  renderer.setRenderTarget(silhouetteTarget);
  renderer.setClearColor(0x000000, 1);
  renderer.clear(true, true, true);
  renderer.render(scene, camera);

  scene.overrideMaterial = previousOverrideMaterial;
  scene.background = previousBackground;
  for (const mesh of hiddenOutlineMeshes) mesh.visible = true;

  renderer.setRenderTarget(previousRenderTarget);
  renderer.setClearColor(previousClearColor, previousClearAlpha);
  renderer.autoClear = false;
  renderer.clearDepth();
  renderer.render(silhouetteScene, silhouetteCamera);
  renderer.autoClear = previousAutoClear;
}

function renderFrame() {
  if (settings.usarImagenFondo && bgMesh.material.map) {
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(bgScene, bgCamera);
    renderer.clearDepth();
    renderer.render(scene, camera);
    renderSiluetaExterior();
    renderer.autoClear = true;
    return;
  }

  renderer.render(scene, camera);
  renderSiluetaExterior();
}

const pmremGenerator = new THREE.PMREMGenerator(renderer);
new HDRLoader().load(
  "./hdri.hdr",
  (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    hdriEnvMap = pmremGenerator.fromEquirectangular(hdr).texture;
    hdr.dispose();
    scene.environment = settings.usarHDRI ? hdriEnvMap : null;
    actualizarMateriales();
    marcarRecursoInicialListo("hdri");
  },
  undefined,
  (error) => {
    console.error("No se pudo cargar hdri.hdr", error);
    marcarRecursoInicialListo("hdri");
  },
);

const gltfLoader = new GLTFLoader();
cargarModeloTorso(settings.modeloTorso, true);

// --- 6. GUI (TODOS LOS MENÚS RESTAURADOS) ---

settings.descargarSoloTextura = async function () {
  try {
    // Forzamos el redibujado completo y esperamos a que termine (SVG + Logo + Texto)
    await actualizarTextura();

    // Creamos el enlace de descarga
    const link = document.createElement("a");
    link.download = `textura-${settings.nombre || "jersey"}.png`;

    // Usamos toDataURL para obtener la imagen del canvas de la textura
    link.href = textCanvas.toDataURL("image/png");

    link.click();
  } catch (error) {
    console.error("Error al descargar la textura:", error);
  }
};

const gui = new GUI();
gui.hide();

// Carpeta 1: Colores y Prenda
const fPrenda = gui.addFolder("Configuración de Prenda");
const modeloTorsoGui = fPrenda
  .add(settings, "modeloTorso", modelosTorsoDisponibles)
  .name("Modelo")
  .onChange(cargarModeloTorso);
fPrenda
  .add(settings, "texturaBase", texturasDisponibles)
  .name("Textura Base")
  .onChange(actualizarTextura);
fPrenda
  .add(
    settings,
    "paletaColor",
    paletasDisponibles.reduce((acc, paleta) => {
      acc[paleta.nombre] = paleta.id;
      return acc;
    }, {}),
  )
  .name("Paleta")
  .onChange((value) => {
    aplicarPaleta(value);
    syncHtmlPaleta();
    actualizarTextura();
  });
fPrenda
  .addColor(settings, "colorBloqueA")
  .name("Color Principal")
  .onChange(actualizarTextura);
fPrenda
  .addColor(settings, "colorBloqueB")
  .name("Color Bloques")
  .onChange(actualizarTextura);
fPrenda
  .addColor(settings, "colorBloqueC")
  .name("Color 3")
  .onChange((value) => {
    settings.colorTexto = value;
    actualizarTextura();
  });
fPrenda
  .add(settings, "mostrarBloques")
  .name("Activar Bloques")
  .onChange(actualizarTextura);

// Carpeta 2: Logos (Tope Escala 10)
const fLogos = gui.addFolder("Control de Logos (5)");
fLogos
  .add(settings, "mostrarLogos")
  .name("Ver logo del pattern")
  .onChange(actualizarTextura);
for (let i = 1; i <= 5; i++) {
  const s = fLogos.addFolder(`Logo ${i}`);
  s.add(settings, `logo${i}_x`, 0, 2048).name("X").onChange(actualizarTextura);
  s.add(settings, `logo${i}_y`, 0, 2048).name("Y").onChange(actualizarTextura);
  s.add(settings, `logo${i}_esc`, 0.01, 10)
    .name("Escala")
    .onChange(actualizarTextura);
  s.add(settings, `logo${i}_rot`, 0, 360, 1)
    .name("Rotaci\u00f3n")
    .onChange(actualizarTextura);
  s.close();
}

// Carpeta 3: Texto y Pivotes
const fTexto = gui.addFolder("Personalización Texto");
fTexto.add(settings, "nombre").onChange(actualizarTextura);
const numeroGui = fTexto.add(settings, "numero").onChange((value) => {
  settings.numero = limitarNumero(value);
  numeroGui.updateDisplay();
  if (htmlControls.numero) htmlControls.numero.value = settings.numero;
  actualizarTextura();
});
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

const fFrente = gui.addFolder("Frente NÃºmero");
fFrente.add(settings, "pechoX", 0, 2048).name("X").onChange(actualizarTextura);
fFrente.add(settings, "pechoY", 0, 2048).name("Y").onChange(actualizarTextura);
fFrente
  .add(settings, "pechoEscala", 0.1, 5)
  .name("Escala")
  .onChange(actualizarTextura);

const fMangaDer = gui.addFolder("Manga Der NÃºmero");
fMangaDer
  .add(settings, "mangaDerX", 0, 2048)
  .name("X")
  .onChange(actualizarTextura);
fMangaDer
  .add(settings, "mangaDerY", 0, 2048)
  .name("Y")
  .onChange(actualizarTextura);
fMangaDer
  .add(settings, "mangaDerEscala", 0.1, 5)
  .name("Escala")
  .onChange(actualizarTextura);

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
  .add(settings, "outlineIrregularidad", 0, 20)
  .name("Irregularidad")
  .onChange(actualizarOutline);
fOutline
  .add(settings, "outlineEscalaRuido", 0.1, 20)
  .name("Escala Patrón")
  .onChange(actualizarOutline);
fOutline
  .add(settings, "outlineUmbralSilueta", 0, 0.8)
  .name("Limpieza Interna")
  .onChange(actualizarOutline);
fOutline
  .add(settings, "outlineSuavidadSilueta", 0.01, 0.5)
  .name("Suavidad Borde")
  .onChange(actualizarOutline);
fOutline
  .add(settings, "outlineReducirAbajo", 0, 1)
  .name("Limpieza Axila")
  .onChange(actualizarOutline);
fOutline
  .add(settings, "outlineSuavidadAbajo", 0.01, 0.5)
  .name("Suavidad Axila")
  .onChange(actualizarOutline);

const fSiluetaExterior = gui.addFolder("Silueta Exterior");
fSiluetaExterior
  .add(settings, "siluetaExteriorActiva")
  .name("Activar Silueta")
  .onChange(actualizarSiluetaExterior);
fSiluetaExterior
  .addColor(settings, "siluetaExteriorColor")
  .name("Color")
  .onChange(actualizarSiluetaExterior);
fSiluetaExterior
  .add(settings, "siluetaExteriorGrosor", 0.5, 12, 0.1)
  .name("Grosor px")
  .onChange(actualizarSiluetaExterior);
fSiluetaExterior
  .add(settings, "siluetaExteriorOpacidad", 0, 1, 0.01)
  .name("Opacidad")
  .onChange(actualizarSiluetaExterior);
fSiluetaExterior
  .add(settings, "siluetaExteriorIrregularidad", 0, 4, 0.01)
  .name("Irregularidad")
  .onChange(actualizarSiluetaExterior);

const fEscena = gui.addFolder("Iluminación y Fondo");
fEscena
  .add(settings, "exposure", 0, 2)
  .name("Exposición")
  .onChange((v) => (renderer.toneMappingExposure = v));
fEscena
  .add(settings, "usarImagenFondo")
  .name("Imagen FONDOPLAYERA")
  .onChange(actualizarFondo);
const fLogoPasa = fEscena.addFolder("Logo PasaElBalon");
fLogoPasa
  .add(settings, "logoPasaHorizontalX", -1, 1, 0.01)
  .name("Horizontal X")
  .onChange(actualizarLogoPasaElBalon);
fLogoPasa
  .add(settings, "logoPasaHorizontalY", -1, 1, 0.01)
  .name("Horizontal Y")
  .onChange(actualizarLogoPasaElBalon);
fLogoPasa
  .add(settings, "logoPasaHorizontalEscala", 0.05, 1.4, 0.01)
  .name("Horizontal Escala")
  .onChange(actualizarLogoPasaElBalon);
fLogoPasa
  .add(settings, "logoPasaVerticalX", -1, 1, 0.01)
  .name("Vertical X")
  .onChange(actualizarLogoPasaElBalon);
fLogoPasa
  .add(settings, "logoPasaVerticalY", -1, 1, 0.01)
  .name("Vertical Y")
  .onChange(actualizarLogoPasaElBalon);
fLogoPasa
  .add(settings, "logoPasaVerticalEscala", 0.05, 1.4, 0.01)
  .name("Vertical Escala")
  .onChange(actualizarLogoPasaElBalon);
fLogoPasa.close();
fEscena
  .addColor(settings, "colorFondo")
  .name("Color de Fondo")
  .onChange(actualizarFondo);
fEscena
  .add(settings, "intensidadLuzPrincipal", 0, 20)
  .name("Luz Focal")
  .onChange(actualizarLuces);

const fCoreografiaVideo = gui.addFolder("Coreografía Video");
fCoreografiaVideo
  .add(settings, "videoDuracionMs", 1000, 10000, 100)
  .name("Duración ms");
fCoreografiaVideo
  .add(settings, "videoModeloProporcionPantalla", 0, 1.2, 0.01)
  .name("Modelo pantalla (0=original)");
fCoreografiaVideo
  .add(settings, "videoGiroInicioMs", 0, 3000, 50)
  .name("Inicio giro ms");
fCoreografiaVideo
  .add(settings, "videoGiroDuracionMs", 200, 5000, 50)
  .name("Duración giro ms");
fCoreografiaVideo
  .add(settings, "videoGiroGrados", -720, 720, 1)
  .name("Grados giro");
fCoreografiaVideo
  .add(settings, "videoGiroEje", ["x", "y", "z"])
  .name("Eje giro");
fCoreografiaVideo
  .add(settings, "videoOverlayInicioMs", 0, 5000, 50)
  .name("Inicio logo/texto");
fCoreografiaVideo
  .add(settings, "videoOverlayFadeMs", 0, 2000, 50)
  .name("Fade logo/texto");
fCoreografiaVideo.add(settings, "videoLogoX", -1, 1, 0.01).name("Logo X");
fCoreografiaVideo.add(settings, "videoLogoY", -1, 1, 0.01).name("Logo Y");
fCoreografiaVideo
  .add(settings, "videoLogoEscalaInicio", 0.05, 1.2, 0.01)
  .name("Logo escala inicio");
fCoreografiaVideo
  .add(settings, "videoLogoEscalaFinal", 0.05, 1.2, 0.01)
  .name("Logo escala final");
fCoreografiaVideo.add(settings, "videoHashtag").name("Hashtag");
fCoreografiaVideo.add(settings, "videoHashtagX", -1, 1, 0.01).name("Hashtag X");
fCoreografiaVideo.add(settings, "videoHashtagY", -1, 1, 0.01).name("Hashtag Y");
fCoreografiaVideo
  .add(settings, "videoHashtagEscala", 0.01, 1, 0.01)
  .name("Hashtag escala");
fCoreografiaVideo
  .add(settings, "videoDesactivarHDRI")
  .name("Apagar HDRI en video");
fCoreografiaVideo.add(settings, "videoReflectoresActivos").name("Reflectores");
fCoreografiaVideo
  .add(settings, "videoReflectoresInicioMs", 0, 5000, 50)
  .name("Inicio reflectores");
fCoreografiaVideo
  .add(settings, "videoReflectoresFadeMs", 0, 2000, 50)
  .name("Fade reflectores");
fCoreografiaVideo
  .add(settings, "videoReflectorIntensidad", 0, 12, 0.1)
  .name("Intensidad reflectores");
fCoreografiaVideo
  .addColor(settings, "videoReflectorColor")
  .name("Color reflectores");
fCoreografiaVideo
  .add(settings, "previsualizarCoreografia")
  .name("▶ Previsualizar");
fCoreografiaVideo.close();

// Botones de Acción
gui.add(settings, "descargarImagen").name("📸 Capturar PNG");
gui.add(settings, "grabarVideo").name("🎬 Grabar Story");
gui.add(settings, "descargarSoloTextura").name("📥 Descargar Textura (Plana)");

const htmlControls = {
  nombre: document.getElementById("control-nombre"),
  numero: document.getElementById("control-numero"),
  colorOutline: document.getElementById("control-color-outline"),
  capturar: document.getElementById("control-capturar"),
  story: document.getElementById("control-story"),
  paletas: document.getElementById("control-paletas"),
  panelToggle: document.getElementById("control-panel-toggle"),
  loaderActions: document.querySelector(".loader-actions"),
  compartirVideo: document.getElementById("video-share"),
  descargarVideo: document.getElementById("video-download"),
  cerrarVideo: document.getElementById("video-close"),
  modelosTorso: document.querySelectorAll('input[name="modelo-torso"]'),
  texturas: document.querySelectorAll('input[name="textura-base"]'),
  pivotes: document.querySelectorAll('input[name="modo-pivotes"]'),
};

function bindHtmlControls() {
  if (!htmlControls.nombre) return;

  htmlControls.nombre.value = settings.nombre;
  htmlControls.numero.value = settings.numero;
  htmlControls.colorOutline.value = settings.outlineColor;

  htmlControls.nombre.addEventListener("input", (event) => {
    settings.nombre = event.target.value;
    actualizarTextura();
  });

  htmlControls.numero.addEventListener("input", (event) => {
    settings.numero = limitarNumero(event.target.value);
    event.target.value = settings.numero;
    numeroGui.updateDisplay();
    actualizarTextura();
  });

  htmlControls.colorOutline.addEventListener("input", (event) => {
    settings.outlineColor = event.target.value;
    actualizarOutline();
  });

  htmlControls.modelosTorso.forEach((input) => {
    input.checked = input.value === settings.modeloTorso;
    input.addEventListener("change", (event) => {
      if (!event.target.checked) return;
      settings.modeloTorso = event.target.value;
      modeloTorsoGui.updateDisplay();
      cargarModeloTorso(settings.modeloTorso);
    });
  });

  if (htmlControls.paletas) {
    htmlControls.paletas.innerHTML = "";
    for (const paleta of paletasDisponibles) {
      const option = document.createElement("label");
      option.className = "palette-option";
      option.title = paleta.nombre;
      option.innerHTML = `
          <input type="radio" name="paleta-color" value="${paleta.id}" aria-label="${paleta.nombre}">
          <!--span class="palette-label">${paleta.nombre}</span-->
          <span class="palette-swatch">
            <span style="background:${paleta.principal}"></span>
            <span style="background:${paleta.secundario}"></span>
            <span style="background:${paleta.terciario}"></span>
          </span>
        `;

      const input = option.querySelector('input[name="paleta-color"]');
      input.checked = paleta.id === settings.paletaColor;
      input.addEventListener("change", (event) => {
        if (!event.target.checked) return;
        aplicarPaleta(event.target.value);
        actualizarTextura();
      });

      htmlControls.paletas.appendChild(option);
    }
  }

  htmlControls.texturas.forEach((input) => {
    input.checked = input.value === settings.texturaBase;
    input.addEventListener("change", (event) => {
      if (!event.target.checked) return;
      settings.texturaBase = event.target.value;
      actualizarTextura();
    });
  });

  htmlControls.pivotes.forEach((input) => {
    input.checked = input.value === settings.modoPivotes;
    input.addEventListener("change", (event) => {
      if (!event.target.checked) return;
      settings.modoPivotes = event.target.value;
      actualizarTextura();
    });
  });

  htmlControls.capturar?.addEventListener("click", () =>
    prepararGrabacion("vertical"),
  );
  htmlControls.story?.addEventListener("click", () =>
    prepararGrabacion("horizontal"),
  );
  htmlControls.compartirVideo?.addEventListener("click", () =>
    compartirVideoGenerado(),
  );
  htmlControls.descargarVideo?.addEventListener("click", () =>
    descargarBlobVideo(),
  );
  htmlControls.cerrarVideo?.addEventListener("click", () => {
    loaderElement?.classList.add("is-hidden");
    loaderElement?.classList.remove("is-video-loader", "is-video-result");
  });
  htmlControls.panelToggle?.addEventListener("click", () => {
    const abierto = document.body.classList.toggle("panel-open");
    htmlControls.panelToggle.setAttribute("aria-expanded", String(abierto));
    htmlControls.panelToggle.textContent = abierto ? "Cerrar" : "Ajustes";
    requestAnimationFrame(redimensionarRenderer);
  });
}

function syncHtmlPaleta() {
  const radios = document.querySelectorAll('input[name="paleta-color"]');
  radios.forEach((radio) => {
    radio.checked = radio.value === settings.paletaColor;
  });
}

// --- 7. LOOP ---
function animate() {
  requestAnimationFrame(animate);
  actualizarCoreografiaGrabacion();
  controls.update();
  renderFrame();
}

function redimensionarRenderer() {
  const rect = appContainer.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;

  // Esto garantiza que la "lupa" de la cámara no cambie
  camera.fov = 55;

  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);

  actualizarLogoPasaElBalon();
  actualizarHashtagVideo();
}

let resizeFrame = null;
let resizeTimer = null;

function prepararCamaraParaVideo() {
  // 1. Forzamos la posición maestra (ajusta el 2.5 según la distancia que te guste)
  camera.position.set(0, 0, 2.5);

  // 2. Forzamos el objetivo al centro del modelo
  controls.target.set(0, 0.1, 0);

  // 3. Forzamos el FOV fijo para que la escala sea siempre la misma
  camera.fov = 70;

  // 4. Actualizamos todo para que Three.js se entere del cambio
  camera.updateProjectionMatrix();
  controls.update();

  // 5. Opcional: Si quieres que el usuario no arruine la toma mientras graba
  // controls.enabled = false;
}

function programarRedimension() {
  if (resizeFrame) cancelAnimationFrame(resizeFrame);
  if (resizeTimer) clearTimeout(resizeTimer);

  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = null;
    redimensionarRenderer();
  });

  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    redimensionarRenderer();
  }, 250);
}

window.addEventListener("resize", programarRedimension);
window.addEventListener("orientationchange", programarRedimension);
window.visualViewport?.addEventListener("resize", programarRedimension);
window.visualViewport?.addEventListener("scroll", programarRedimension);

if ("ResizeObserver" in window) {
  const appResizeObserver = new ResizeObserver(programarRedimension);
  appResizeObserver.observe(appContainer);
}

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "#") {
    if (gui._hidden) {
      gui.show();
      textCanvas.style.display = "block"; // Muestra también el canvas si quieres
    } else {
      gui.hide();
      textCanvas.style.display = "none"; // Esconde ambos
    }
  }
});

bindHtmlControls();
syncHtmlPaleta();
actualizarTextura();
actualizarOutline();
actualizarLuces();
actualizarFondo();
animate();

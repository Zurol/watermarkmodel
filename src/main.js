import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

// --- 1. DEFINICIÓN DE PIVOTES (Coordenadas UV) ---
const pivotes = {
    'Espalda': { x: 1550, y: 500 },
    'Pecho': { x: 512, y: 350 },
    'Manga Izq': { x: 850, y: 500 },
    'Manga Der': { x: 170, y: 500 }
};

// --- 2. ESTADO GLOBAL (SETTINGS) ---
const settings = {
    nombre: "JUGADOR",
    numero: "10",
    fuente: 'Impact',
    negrita: true,
    tamanioNombre: 150,
    tamanioNumero: 355,
    posicionPredefinida: 'Espalda', // Pivote activo por defecto
    posX: 1550, // Inicializado con el valor de Espalda
    posY: 570, // Inicializado con el valor de Espalda
    espaciado: 260,
    escalaX: 1,
    escalaY: 1,
    colorTexto: '#ffffff',
    intensidadLuz: 1.2,
    colorLuz: '#ffffff',
    colorFondo: '#101010',
    autoplay: false,
    velocidadRotacion: 0.005,
    tiempoEspera: 3,
    mostrarDebug: true,
    descargarImagen: function() { descargarCaptura(); }
};

// Función para sincronizar posX/posY con el pivote seleccionado al arrancar
function aplicarPivoteInicial() {
    const p = pivotes[settings.posicionPredefinida];
    if (p) {
        settings.posX = p.x;
        settings.posY = p.y;
    }
}

let modelo3D = null;
let lastInteractionTime = Date.now();
let isAutoplayActive = false;
let generatedTextureSize = 2048;
const fuentesDisponibles = ['Arial', 'Sharp Grotesk', 'Verdana', 'Impact', 'Courier New'];

// --- 3. CONFIGURACIÓN DEL CANVAS (TEXTURA) ---
const textCanvas = document.createElement('canvas');
const ctx = textCanvas.getContext('2d');
textCanvas.width = generatedTextureSize;
textCanvas.height = generatedTextureSize;

textCanvas.id = 'debug-canvas';
textCanvas.style.cssText = 'position:absolute; bottom:10px; right:10px; width:200px; border:2px solid red; z-index:100; background:#000;';
document.body.appendChild(textCanvas);

const textTexture = new THREE.CanvasTexture(textCanvas);
textTexture.colorSpace = THREE.SRGBColorSpace;
textTexture.anisotropy = 16;
textTexture.flipY = false;

const texturaBaseImg = new Image();
texturaBaseImg.src = './tshit_UVs2.png';

function actualizarTextura() {
    ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

    if (texturaBaseImg.complete) {
        ctx.drawImage(texturaBaseImg, 0, 0, textCanvas.width, textCanvas.height);
    } else {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);
    }

    const pesoFuente = settings.negrita ? '700' : '500';

    ctx.save();
    ctx.translate(settings.posX, settings.posY);
    ctx.scale(settings.escalaX, settings.escalaY);

    ctx.fillStyle = settings.colorTexto;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `${pesoFuente} ${settings.tamanioNombre}px "${settings.fuente}"`;
    const anchoNombre = ctx.measureText(settings.nombre.toUpperCase()).width;

    if (anchoNombre > 800) {
        const factorReduccion = 800 / anchoNombre;
        ctx.scale(factorReduccion, 1);
    }

    ctx.fillText(settings.nombre.toUpperCase(), 0, 0);

    ctx.font = `${pesoFuente} ${settings.tamanioNumero}px "${settings.fuente}"`;
    ctx.fillText(settings.numero, 0, settings.espaciado);

    ctx.restore();
    textTexture.needsUpdate = true;
}
texturaBaseImg.onload = actualizarTextura;

// --- 4. ESCENA THREE.JS ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(settings.colorFondo);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, -0.75);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('app').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

controls.addEventListener('start', () => {
    lastInteractionTime = Date.now();
    isAutoplayActive = false;
});

const ambientLight = new THREE.AmbientLight(settings.colorLuz, settings.intensidadLuz);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, settings.intensidadLuz);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const loader = new GLTFLoader();
loader.load('./TshirtPajaro.glb', (gltf) => {
    modelo3D = gltf.scene;
    modelo3D.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                map: textTexture,
                roughness: 0.8,
                metalness: 0,
                emissive: new THREE.Color(0x000000),
            });
        }
    });
    scene.add(modelo3D);
    modelo3D.position.set(0, -0.3, 0);
}, undefined, (err) => console.error(err));

function descargarCaptura() {
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = `jersey-${settings.nombre}.png`;
    link.href = dataURL;
    link.click();
}

// --- 5. INTERFAZ DE USUARIO (GUI) ---
const gui = new GUI();

const fTexto = gui.addFolder('Contenido y Fuente');
fTexto.add(settings, 'nombre').name('Nombre').onChange(actualizarTextura);
fTexto.add(settings, 'numero').name('Número').onChange(actualizarTextura);
fTexto.add(settings, 'fuente', fuentesDisponibles).name('Tipografía').onChange(actualizarTextura);
fTexto.add(settings, 'negrita').name('Negrita (700/500)').onChange(actualizarTextura);
fTexto.addColor(settings, 'colorTexto').name('Color Letras').onChange(actualizarTextura);

const fPos = gui.addFolder('Ubicación y Pivotes');
fPos.add(settings, 'posicionPredefinida', Object.keys(pivotes)).name('Zona Predefinida').onChange((val) => {
    settings.posX = pivotes[val].x;
    settings.posY = pivotes[val].y;
    gui.controllers.forEach(c => {
        if (c._name === 'Ajuste X' || c._name === 'Ajuste Y') c.updateDisplay();
    });
    actualizarTextura();
});
fPos.add(settings, 'posX', 0, generatedTextureSize).name('Ajuste X').onChange(actualizarTextura);
fPos.add(settings, 'posY', 0, generatedTextureSize).name('Ajuste Y').onChange(actualizarTextura);
fPos.add(settings, 'espaciado', 0, 500).name('Distancia Número').onChange(actualizarTextura);

const fEscala = gui.addFolder('Escala y Tamaño');
fEscala.add(settings, 'tamanioNombre', 10, 300).name('Tamaño Nombre').onChange(actualizarTextura);
fEscala.add(settings, 'tamanioNumero', 10, 600).name('Tamaño Número').onChange(actualizarTextura);
fEscala.add(settings, 'escalaX', 0.1, 5).name('Ancho Extra').onChange(actualizarTextura);

const fEscena = gui.addFolder('Iluminación y Fondo');
fEscena.add(settings, 'intensidadLuz', 0, 10).name('Brillo').onChange(v => {
    ambientLight.intensity = v;
    dirLight.intensity = v;
});
fEscena.addColor(settings, 'colorFondo').name('Color Fondo').onChange(v => scene.background.set(v));

const fAuto = gui.addFolder('Animación (Autoplay)');
fAuto.add(settings, 'autoplay').name('Activar');
fAuto.add(settings, 'velocidadRotacion', 0.001, 0.05).name('Velocidad');
fAuto.add(settings, 'tiempoEspera', 1, 10).name('Espera (seg)');

gui.add(settings, 'descargarImagen').name('📸 Guardar Imagen');
gui.add(settings, 'mostrarDebug').name('Ver Debug').onChange(v => textCanvas.style.display = v ? 'block' : 'none');

// --- 6. RENDER LOOP ---
window.addEventListener('mousedown', () => {
    lastInteractionTime = Date.now();
    isAutoplayActive = false;
});
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Inicialización correcta
aplicarPivoteInicial();

document.fonts.ready.then(() => {
    aplicarPivoteInicial();
    actualizarTextura();
});

function animate() {
    requestAnimationFrame(animate);
    const secondsInactive = (Date.now() - lastInteractionTime) / 1000;
    if (settings.autoplay && secondsInactive > settings.tiempoEspera) isAutoplayActive = true;
    if (isAutoplayActive && modelo3D) modelo3D.rotation.y += settings.velocidadRotacion;
    controls.update();
    renderer.render(scene, camera);
}

actualizarTextura();
animate();
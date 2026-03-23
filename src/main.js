import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

// --- 1. ESTADO GLOBAL (SETTINGS) ---
const settings = {
    texto: "DISEÑO 3D",
    fuente: 'Arial',
    negrita: true,
    tamanioFuente: 100,
    posX: 512,
    posY: 750,
    escalaX: 1,
    escalaY: 1,
    colorTexto: '#ffffff',
    // Iluminación y Escena
    intensidadLuz: 2.0,
    colorLuz: '#ffffff',
    colorFondo: '#111111', // Nueva propiedad
    // Autoplay
    autoplay: true,
    velocidadRotacion: 0.005,
    tiempoEspera: 3,
    // Debug y Acciones
    mostrarDebug: true,
    descargarImagen: function() { descargarCaptura(); }
};

let modelo3D = null;
let lastInteractionTime = Date.now();
let isAutoplayActive = false;
const fuentesDisponibles = ['Arial', 'Verdana', 'Times New Roman', 'Impact', 'Courier New'];

// --- 2. CONFIGURACIÓN DEL CANVAS (TEXTURA) ---
const textCanvas = document.createElement('canvas');
const ctx = textCanvas.getContext('2d');
textCanvas.width = 1024;
textCanvas.height = 1024;

textCanvas.id = 'debug-canvas';
textCanvas.style.cssText = 'position:absolute; bottom:10px; right:10px; width:200px; border:2px solid red; z-index:100; background:#000;';
document.body.appendChild(textCanvas);

const textTexture = new THREE.CanvasTexture(textCanvas);
textTexture.anisotropy = 16;
textTexture.flipY = false;

const texturaBaseImg = new Image();
texturaBaseImg.src = '/textura_tela.png';

function actualizarTextura() {
    ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    if (texturaBaseImg.complete) {
        ctx.drawImage(texturaBaseImg, 0, 0, textCanvas.width, textCanvas.height);
    } else {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);
    }

    ctx.save();
    ctx.translate(settings.posX, settings.posY);
    ctx.scale(settings.escalaX, settings.escalaY);

    const pesoFuente = settings.negrita ? 'Bold' : 'normal';
    ctx.font = `${pesoFuente} ${settings.tamanioFuente}px ${settings.fuente}`;
    ctx.fillStyle = settings.colorTexto;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(settings.texto.toUpperCase(), 0, 0);
    ctx.restore();

    textTexture.needsUpdate = true;
}
texturaBaseImg.onload = actualizarTextura;

// --- 3. ESCENA THREE.JS ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(settings.colorFondo); // Color inicial

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.5, 6);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('app').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Resetear inactividad al usar controles
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
loader.load('/modelo.glb', (gltf) => {
    modelo3D = gltf.scene;
    modelo3D.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                map: textTexture,
                roughness: 0.7,
                metalness: 0.2
            });
        }
    });
    scene.add(modelo3D);
}, undefined, (error) => console.error("Error al cargar modelo:", error));

// --- 4. FUNCIÓN EXPORTAR ---
function descargarCaptura() {
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = `captura-diseno-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
}

// --- 5. INTERFAZ DE USUARIO (GUI COMPLETA) ---
const gui = new GUI();

const fTexto = gui.addFolder('Texto y Estilo');
fTexto.add(settings, 'texto').name('Contenido').onChange(actualizarTextura);
fTexto.add(settings, 'fuente', fuentesDisponibles).name('Fuente').onChange(actualizarTextura);
fTexto.add(settings, 'negrita').name('Negrita (Bold)').onChange(actualizarTextura);
fTexto.add(settings, 'tamanioFuente', 10, 300).name('Tamaño').onChange(actualizarTextura);
fTexto.addColor(settings, 'colorTexto').name('Color Texto').onChange(actualizarTextura);

const fTrans = gui.addFolder('Posición y Escala');
fTrans.add(settings, 'posX', 0, 1024).name('X (Horizontal)').onChange(actualizarTextura);
fTrans.add(settings, 'posY', 0, 1024).name('Y (Vertical)').onChange(actualizarTextura);
fTrans.add(settings, 'escalaX', 0.1, 5).name('Escala X').onChange(actualizarTextura);
fTrans.add(settings, 'escalaY', 0.1, 5).name('Escala Y').onChange(actualizarTextura);

const fEscena = gui.addFolder('Iluminación y Fondo');
fEscena.add(settings, 'intensidadLuz', 0, 10).name('Brillo').onChange((val) => {
    ambientLight.intensity = val;
    dirLight.intensity = val;
});
fEscena.addColor(settings, 'colorLuz').name('Color Luz').onChange((val) => {
    ambientLight.color.set(val);
});
fEscena.addColor(settings, 'colorFondo').name('Color Fondo').onChange((val) => {
    scene.background.set(val); // Cambio de color de la escena en tiempo real
});

const fAuto = gui.addFolder('Animación (Autoplay)');
fAuto.add(settings, 'autoplay').name('Activar');
fAuto.add(settings, 'velocidadRotacion', 0.001, 0.05).name('Velocidad');
fAuto.add(settings, 'tiempoEspera', 1, 10).name('Espera (seg)');

const fAcciones = gui.addFolder('Acciones');
fAcciones.add(settings, 'descargarImagen').name('📸 Guardar Imagen');

gui.add(settings, 'mostrarDebug').name('Ver Canvas Debug').onChange(val => {
    textCanvas.style.display = val ? 'block' : 'none';
});

// Eventos globales
window.addEventListener('mousedown', () => { lastInteractionTime = Date.now();
    isAutoplayActive = false; });
window.addEventListener('touchstart', () => { lastInteractionTime = Date.now();
    isAutoplayActive = false; });

const inputExterno = document.getElementById('nombreInput');
if (inputExterno) {
    inputExterno.addEventListener('input', (e) => {
        settings.texto = e.target.value;
        gui.controllers.forEach(c => { if (c._name === 'Contenido') c.updateDisplay(); });
        actualizarTextura();
    });
}

// --- 6. RENDER LOOP ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);

    // Lógica Autoplay
    const secondsInactive = (Date.now() - lastInteractionTime) / 1000;
    if (settings.autoplay && secondsInactive > settings.tiempoEspera) {
        isAutoplayActive = true;
    }

    if (isAutoplayActive && modelo3D) {
        modelo3D.rotation.y += settings.velocidadRotacion;
    }

    controls.update();
    renderer.render(scene, camera);
}

actualizarTextura();
animate();
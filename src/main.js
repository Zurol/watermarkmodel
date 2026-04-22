import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
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
    intensidadLuzAmbiente: 0.7,
    intensidadLuzPrincipal: 2.2,
    colorLuz: '#ffffff',
    colorLuzAmbiente: '#ffffff',
    colorLuzPrincipal: '#fff4dd',
    posicionLuzX: 1.8,
    posicionLuzY: 2.6,
    posicionLuzZ: -1.2,
    distanciaLuz: 8,
    anguloLuz: 0.65,
    penumbraLuz: 0.85,
    decayLuz: 1.4,
    colorFondo: '#101010',
    colorFondo2: '#2e4366',
    usarHDRI: true,
    hdriComoFondo: false,
    intensidadHDRI: 0.35,
    exposure: 1,
    roughness: 0.75,
    metalness: 0.425,
    emissiveIntensity: 0,
    colorEmissive: '#000000',
    mostrarPiso: true,
    opacidadSombra: 0.3,
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
let piso = null;
let hdriEnvMap = null;
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

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, -0.75);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = settings.exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const gradientCanvas = document.createElement('canvas');
gradientCanvas.width = 1024;
gradientCanvas.height = 1024;
const gradientCtx = gradientCanvas.getContext('2d');
const gradientTexture = new THREE.CanvasTexture(gradientCanvas);
gradientTexture.colorSpace = THREE.SRGBColorSpace;

function actualizarFondo() {
    const gradient = gradientCtx.createLinearGradient(0, 0, 0, gradientCanvas.height);
    gradient.addColorStop(0, settings.colorFondo2);
    gradient.addColorStop(1, settings.colorFondo);
    gradientCtx.fillStyle = gradient;
    gradientCtx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
    gradientTexture.needsUpdate = true;

    if (settings.hdriComoFondo && hdriEnvMap) {
        scene.background = hdriEnvMap;
        return;
    }

    scene.background = gradientTexture;
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

controls.addEventListener('start', () => {
    lastInteractionTime = Date.now();
    isAutoplayActive = false;
});

const ambientLight = new THREE.AmbientLight(settings.colorLuzAmbiente, settings.intensidadLuzAmbiente);
scene.add(ambientLight);

const lightTarget = new THREE.Object3D();
lightTarget.position.set(0, 0, 0);
scene.add(lightTarget);

const dirLight = new THREE.SpotLight(
    settings.colorLuzPrincipal,
    settings.intensidadLuzPrincipal,
    settings.distanciaLuz,
    settings.anguloLuz,
    settings.penumbraLuz,
    settings.decayLuz
);
dirLight.position.set(settings.posicionLuzX, settings.posicionLuzY, settings.posicionLuzZ);
dirLight.castShadow = true;
dirLight.target = lightTarget;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.bias = -0.00015;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 20;
scene.add(dirLight);

function actualizarLuces() {
    ambientLight.color.set(settings.colorLuzAmbiente);
    ambientLight.intensity = settings.intensidadLuzAmbiente;

    dirLight.color.set(settings.colorLuzPrincipal);
    dirLight.intensity = settings.intensidadLuzPrincipal;
    dirLight.distance = settings.distanciaLuz;
    dirLight.angle = settings.anguloLuz;
    dirLight.penumbra = settings.penumbraLuz;
    dirLight.decay = settings.decayLuz;
    dirLight.position.set(settings.posicionLuzX, settings.posicionLuzY, settings.posicionLuzZ);
}

function crearPiso() {
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.ShadowMaterial({
        color: 0x000000,
        opacity: settings.opacidadSombra,
    });

    piso = new THREE.Mesh(geometry, material);
    piso.rotation.x = -Math.PI / 2;
    piso.position.y = -1;
    piso.receiveShadow = true;
    piso.visible = settings.mostrarPiso;
    scene.add(piso);
}

function actualizarPisoSegunModelo() {
    if (!modelo3D || !piso) return;

    const box = new THREE.Box3().setFromObject(modelo3D);
    const size = new THREE.Vector3();
    box.getSize(size);

    piso.position.y = box.min.y - 0.015;
    piso.scale.setScalar(Math.max(size.x, size.z, 1.5));
}

function actualizarMaterialesModelo() {
    if (!modelo3D) return;

    modelo3D.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        child.material.roughness = settings.roughness;
        child.material.metalness = settings.metalness;
        child.material.envMapIntensity = settings.usarHDRI ? settings.intensidadHDRI : 0;
        child.material.emissive.set(settings.colorEmissive);
        child.material.emissiveIntensity = settings.emissiveIntensity;
        child.material.needsUpdate = true;
    });
}

function actualizarEntorno() {
    scene.environment = settings.usarHDRI ? hdriEnvMap : null;
    actualizarMaterialesModelo();
    actualizarFondo();
}

function actualizarRender() {
    renderer.toneMappingExposure = settings.exposure;
}

crearPiso();
actualizarLuces();
actualizarFondo();
actualizarRender();

new RGBELoader().load('./hdri.hdr', (hdrTexture) => {
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    hdriEnvMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
    hdrTexture.dispose();
    actualizarEntorno();
}, undefined, () => {
    console.warn('No se pudo cargar ./hdri.hdr. El fondo degradado seguirá activo.');
    actualizarEntorno();
});

const loader = new GLTFLoader();
loader.load('./TshirtPajaro.glb', (gltf) => {
    modelo3D = gltf.scene;
    modelo3D.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = new THREE.MeshStandardMaterial({
                map: textTexture,
                roughness: settings.roughness,
                metalness: settings.metalness,
                emissive: new THREE.Color(settings.colorEmissive),
                emissiveIntensity: settings.emissiveIntensity,
                envMapIntensity: settings.usarHDRI ? settings.intensidadHDRI : 0,
            });
        }
    });
    scene.add(modelo3D);
    modelo3D.position.set(0, -0.3, 0);
    actualizarPisoSegunModelo();
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
fEscena.addColor(settings, 'colorFondo2').name('Gradiente Arriba').onChange(actualizarFondo);
fEscena.addColor(settings, 'colorFondo').name('Gradiente Abajo').onChange(actualizarFondo);
fEscena.add(settings, 'usarHDRI').name('Usar HDRI').onChange(actualizarEntorno);
fEscena.add(settings, 'hdriComoFondo').name('HDRI de Fondo').onChange(actualizarFondo);
fEscena.add(settings, 'intensidadHDRI', 0, 2).name('Intensidad HDRI').onChange(actualizarMaterialesModelo);
fEscena.add(settings, 'exposure', 0.1, 2.5).name('Exposure').onChange(actualizarRender);
fEscena.add(settings, 'mostrarPiso').name('Mostrar Piso').onChange(v => {
    if (piso) piso.visible = v;
});
fEscena.add(settings, 'opacidadSombra', 0, 1).name('Opacidad Sombra').onChange(v => {
    if (piso?.material) piso.material.opacity = v;
});

const fMaterial = gui.addFolder('Material');
fMaterial.add(settings, 'roughness', 0, 1).name('Roughness').onChange(actualizarMaterialesModelo);
fMaterial.add(settings, 'metalness', 0, 1).name('Metalness').onChange(actualizarMaterialesModelo);
fMaterial.add(settings, 'emissiveIntensity', 0, 2).name('Emissive Intensity').onChange(actualizarMaterialesModelo);
fMaterial.addColor(settings, 'colorEmissive').name('Color Emissive').onChange(actualizarMaterialesModelo);

const fLuces = gui.addFolder('Luces');
fLuces.addColor(settings, 'colorLuzAmbiente').name('Color Ambiente').onChange(actualizarLuces);
fLuces.add(settings, 'intensidadLuzAmbiente', 0, 5).name('Intensidad Ambiente').onChange(actualizarLuces);
fLuces.addColor(settings, 'colorLuzPrincipal').name('Color Principal').onChange(actualizarLuces);
fLuces.add(settings, 'intensidadLuzPrincipal', 0, 10).name('Intensidad Principal').onChange(actualizarLuces);
fLuces.add(settings, 'posicionLuzX', -10, 10).name('Luz X').onChange(actualizarLuces);
fLuces.add(settings, 'posicionLuzY', -10, 10).name('Luz Y').onChange(actualizarLuces);
fLuces.add(settings, 'posicionLuzZ', -10, 10).name('Luz Z').onChange(actualizarLuces);
fLuces.add(settings, 'distanciaLuz', 0, 20).name('Distancia').onChange(actualizarLuces);
fLuces.add(settings, 'anguloLuz', 0.1, 1.5).name('Ángulo').onChange(actualizarLuces);
fLuces.add(settings, 'penumbraLuz', 0, 1).name('Penumbra').onChange(actualizarLuces);
fLuces.add(settings, 'decayLuz', 0, 2).name('Decay').onChange(actualizarLuces);

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

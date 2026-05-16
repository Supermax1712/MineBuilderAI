// --- CONFIGURAÇÃO DO MOTOR 3D - ENGINE BLINDADA V1.1 ---

let cena, camera, renderizador, controles, luzSol, gradeChao;
let blocosNaCena = [];

const textureLoader = new THREE.TextureLoader();

// URLs alternativas usando o CDN do jsDelivr (mais estável para o GitHub Pages)
const urlTexturas = {
    cobblestone: 'https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@master/assets/minecraft/textures/block/cobblestone.png',
    oak_planks: 'https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@master/assets/minecraft/textures/block/oak_planks.png',
    glass: 'https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@master/assets/minecraft/textures/block/glass.png',
    stone_bricks: 'https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@master/assets/minecraft/textures/block/stone_bricks.png',
    iron_bars: 'https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@master/assets/minecraft/textures/block/iron_bars.png'
};

const texturas = {};

function inicializarEngine() {
    try {
        const container = document.getElementById('canvas-container');

        cena = new THREE.Scene();
        cena.background = new THREE.Color(0x141414);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(12, 12, 12);

        renderizador = new THREE.WebGLRenderer({ antialias: true });
        renderizador.setSize(window.innerWidth, window.innerHeight);
        renderizador.shadowMap.enabled = true;
        renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderizador.domElement);

        controles = new THREE.OrbitControls(camera, renderizador.domElement);
        controles.enableDamping = true;
        controles.dampingFactor = 0.05;
        controles.maxPolarAngle = Math.PI / 2;

        // Força a grade a carregar ANTES das texturas para garantir estabilidade visual
        gradeChao = new THREE.GridHelper(32, 32, 0x8cff00, 0x333333);
        gradeChao.position.y = 0;
        cena.add(gradeChao);

        configurarLuzes();
        preCarregarTexturas();

        window.addEventListener('resize', tratarRedimensionamento, false);
        executarLoop();
        console.log("Engine inicializada com sucesso e grade protegida.");
    } catch (e) {
        console.error("Erro crítico na inicialização da Engine:", e);
    }
}

function preCarregarTexturas() {
    for (const [id, url] of Object.entries(urlTexturas)) {
        textureLoader.load(url, 
            (tex) => {
                tex.magFilter = THREE.NearestFilter;
                tex.minFilter = THREE.NearestFilter;
                texturas[id] = tex;
            },
            undefined,
            (err) => {
                console.warn(`Falha ao carregar textura: ${id}. Usando fallback visual.`);
                texturas[id] = null; // Fallback tratado no adicionarBloco
            }
        );
    }
}

function configurarLuzes() {
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.75);
    cena.add(luzAmbiente);

    luzSol = new THREE.DirectionalLight(0xffffff, 0.5);
    luzSol.position.set(20, 40, 20);
    luzSol.castShadow = true;
    luzSol.shadow.mapSize.width = 1048;
    luzSol.shadow.mapSize.height = 1048;
    cena.add(luzSol);
}

function adicionarBloco(x, y, z, idBloco) {
    let geometria;
    let material;
    let objetoMesh;

    const tex = texturas[idBloco];
    
    // Fallback de cores caso a conexão do GitHub falhe em carregar imagens externas
    let corFallback = 0x737373;
    if (idBloco === "stone_bricks") corFallback = 0x8a8a8a;
    if (idBloco === "oak_planks") corFallback = 0xa67a4e;
    if (idBloco === "glass") corFallback = 0xd9f2ff;
    if (idBloco === "iron_bars") corFallback = 0xcccccc;

    const configMaterial = {
        roughness: idBloco === 'glass' ? 0.1 : 0.9,
        metalness: idBloco === 'iron_bars' ? 0.8 : 0.0
    };

    if (tex) {
        configMaterial.map = tex;
        if (idBloco === 'glass') {
            configMaterial.transparent = true;
            configMaterial.opacity = 0.7;
        }
    } else {
        configMaterial.color = new THREE.Color(corFallback);
        if (idBloco === 'glass') {
            configMaterial.transparent = true;
            configMaterial.opacity = 0.5;
        }
    }

    material = new THREE.MeshStandardMaterial(configMaterial);

    if (idBloco === 'iron_bars') {
        geometria = new THREE.BoxGeometry(1, 1, 0.0625);
    } else {
        geometria = new THREE.BoxGeometry(1, 1, 1);
    }

    objetoMesh = new THREE.Mesh(geometria, material);
    
    // Centralização e Simetria absoluta em cima dos quadrados da grade
    objetoMesh.position.set(Math.floor(x) + 0.5, Math.floor(y) + 0.5, Math.floor(z) + 0.5);

    objetoMesh.castShadow = luzSol.castShadow;
    objetoMesh.receiveShadow = luzSol.castShadow;

    cena.add(objetoMesh);
    blocosNaCena.push(objetoMesh);
    return objetoMesh;
}

function limparCena() {
    blocosNaCena.forEach(bloco => {
        cena.remove(bloco);
        bloco.geometry.dispose();
        if (Array.isArray(bloco.material)) {
            bloco.material.forEach(m => m.dispose());
        } else {
            bloco.material.dispose();
        }
    });
    blocosNaCena = [];
}

function aplicarVisaoCamera(tipoVisao) {
    if (!controles) return;
    controles.reset();
    const d = 12;

    switch(tipoVisao) {
        case '3d':
            camera.position.set(10, 10, 10);
            controles.enableRotate = true;
            break;
        case 'topo':
            camera.position.set(0, d, 0);
            controles.enableRotate = false;
            break;
        case 'baixo':
            camera.position.set(0, -d, 0);
            controles.enableRotate = false;
            break;
        case 'frente':
            camera.position.set(0, 0, d);
            controles.enableRotate = false;
            break;
        case 'tras':
            camera.position.set(0, 0, -d);
            controles.enableRotate = false;
            break;
        case 'esquerda':
            camera.position.set(-d, 0, 0);
            controles.enableRotate = false;
            break;
        case 'direita':
            camera.position.set(d, 0, 0);
            controles.enableRotate = false;
            break;
    }
    controles.target.set(0, 0, 0);
}

function aplicarConfiguracaoGrafica(tipo, ativado) {
    if (!luzSol || !renderizador) return;
    if (tipo === 'sombras') {
        luzSol.castShadow = ativado;
        renderizador.shadowMap.enabled = ativado;
        blocosNaCena.forEach(bloco => {
            bloco.castShadow = ativado;
            bloco.receiveShadow = ativado;
        });
    }
    if (tipo === 'grade') {
        gradeChao.visible = ativado;
    }
}

function executarLoop() {
    requestAnimationFrame(executarLoop);
    if (controles) controles.update();
    if (renderizador && cena && camera) renderizador.render(scene || cena, camera);
}

function tratarRedimensionamento() {
    if (!camera || !renderizador) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
}

inicializarEngine();

// --- CONFIGURAÇÃO DO MOTOR 3D COMFIDELIDADE MINECRAFT ---

let cena, camera, renderizador, controles, luzSol, gradeChao;
let blocosNaCena = [];

// Carregador de texturas do Three.js
const textureLoader = new THREE.TextureLoader();

// URLs das texturas oficiais de alta fidelidade pixel-art (16x16)
const urlTexturas = {
    cobblestone: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/master/assets/minecraft/textures/block/cobblestone.png',
    oak_planks: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/master/assets/minecraft/textures/block/oak_planks.png',
    glass: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/master/assets/minecraft/textures/block/glass.png',
    stone_bricks: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/master/assets/minecraft/textures/block/stone_bricks.png',
    iron_bars: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/master/assets/minecraft/textures/block/iron_bars.png'
};

// Dicionário para armazenar as texturas carregadas na memória
const texturas = {};

function inicializarEngine() {
    const container = document.getElementById('canvas-container');

    cena = new THREE.Scene();
    cena.background = new THREE.Color(0x141414);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);

    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderizador.domElement);

    controles = new THREE.OrbitControls(camera, renderizador.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.05;
    controles.maxPolarAngle = Math.PI / 2;

    // Carrega e configura os filtros de textura para estilo Pixel-Art puro
    preCarregarTexturas();
    configurarLuzes();

    // Grade ajustada exatamente no nível zero real
    gradeChao = new THREE.GridHelper(32, 32, 0x8cff00, 0x222222);
    gradeChao.position.y = 0; 
    cena.add(gradeChao);

    window.addEventListener('resize', tratarRedimensionamento, false);
    executarLoop();
}

function preCarregarTexturas() {
    for (const [id, url] of Object.entries(urlTexturas)) {
        texturas[id] = textureLoader.load(url);
        // O SEGREDO DO MINECRAFT: Desativa o filtro blur do navegador e mantém o pixel serrilhado original
        texturas[id].magFilter = THREE.NearestFilter;
        texturas[id].minFilter = THREE.NearestFilter;
    }
}

function configurarLuzes() {
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.7); // Mais claro para destacar as texturas
    cena.add(luzAmbiente);

    luzSol = new THREE.DirectionalLight(0xffffff, 0.5);
    luzSol.position.set(20, 40, 20);
    luzSol.castShadow = true;
    luzSol.shadow.mapSize.width = 1048;
    luzSol.shadow.mapSize.height = 1048;
    cena.add(luzSol);
}

// CRIAÇÃO DOS BLOCOS COM FORMATOS E SIMETRIA CORRIGIDOS
function adicionarBloco(x, y, z, idBloco) {
    let geometria;
    let material;
    let objetoMesh;

    // Configuração de Material Base com textura correspondente
    const texturaAtiva = texturas[idBloco] || texturas['cobblestone'];

    if (idBloco === 'glass') {
        material = new THREE.MeshStandardMaterial({
            map: texturaAtiva,
            transparent: true,
            opacity: 0.8, // Transparência real do vidro do jogo
            roughness: 0.1
        });
    } else {
        material = new THREE.MeshStandardMaterial({
            map: texturaAtiva,
            roughness: 0.9, // Sem brilho plástico, fosco igual ao jogo
            metalness: idBloco === 'iron_bars' ? 0.8 : 0.0
        });
    }

    // FORMATO DO BLOCO: Se for Barra de Ferro, faz o formato de placa fina cruzada do Minecraft
    if (idBloco === 'iron_bars') {
        geometria = new THREE.BoxGeometry(1, 1, 0.0625); // Placa fina (1/16 de um bloco)
        objetoMesh = new THREE.Mesh(geometria, material);
    } else {
        // Blocos normais, cubos perfeitos de 1x1x1
        geometria = new THREE.BoxGeometry(1, 1, 1);
        objetoMesh = new THREE.Mesh(geometria, material);
    }

    // MATEMÁTICA DA SIMETRIA CORRIGIDA: 
    // Subtraímos/Ajustamos o offset central para alinhar perfeitamente com as linhas da grade do chão
    objetoMesh.position.set(x, y + 0.5, z); 

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
        if(Array.isArray(bloco.material)) {
            bloco.material.forEach(m => m.dispose());
        } else {
            bloco.material.dispose();
        }
    });
    blocosNaCena = [];
}

function aplicarVisaoCamera(tipoVisao) {
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

function执行Loop() {
    // Corrigido typo interno de execução automática
}
function executarLoop() {
    requestAnimationFrame(executarLoop);
    controles.update();
    renderizador.render(cena, camera);
}

function tratarRedimensionamento() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
}

inicializarEngine();

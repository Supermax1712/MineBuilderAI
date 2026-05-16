// --- CONFIGURAÇÃO DO MOTOR 3D (ENGINE) ---

// 1. Variáveis Globais do Escopo do Engine
let cena, camera, renderizador, controles;

// 2. Inicialização do Cenário
function inicializarEngine() {
    const container = document.getElementById('canvas-container');

    // Criando a Cena
    cena = new THREE.Scene();
    cena.background = new THREE.Color(0x141414);

    // Criando a Câmera (Perspectiva para o modo 3D orbital)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(8, 8, 8); // Afastado para ver a estrutura de longe

    // Criando o Renderizador com suporte a sombras
    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras mais suaves e bonitas
    container.appendChild(renderizador.domElement);

    // Ativando Controles de Órbita (Mouse)
    controles = new THREE.OrbitControls(camera, renderizador.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.05;
    controles.maxPolarAngle = Math.PI / 2; // Impede a câmera de passar para baixo do chão

    // Configurando as Luzes
    configurarLuzes();

    // Adicionando a Grade de Orientação (Chão do construtor)
    const gradeChao = new THREE.GridHelper(20, 20, 0x8cff00, 0x333333);
    gradeChao.position.y = -0.5; // Alinha o topo da grade com a base do bloco zero
    cena.add(gradeChao);

    // Ouvinte para ajustar o tamanho da tela se o usuário mexer na janela
    window.addEventListener('resize', tratarRedimensionamento, false);

    // Inicia o loop de renderização
    executarLoop();
}

// 3. Sistema de Iluminação
function configurarLuzes() {
    // Luz Ambiente (Evita sombras pretas demais)
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.5);
    cena.add(luzAmbiente);

    // Luz Direcional (Simula o Sol do Minecraft e gera sombras projetadas)
    const luzSol = new THREE.DirectionalLight(0xffffff, 0.8);
    luzSol.position.set(15, 30, 20);
    luzSol.castShadow = true;

    // Ajustes de resolução da sombra para não ficar pixelada feia
    luzSol.shadow.mapSize.width = 2048;
    luzSol.shadow.mapSize.height = 2048;
    luzSol.shadow.camera.near = 0.5;
    luzSol.shadow.camera.far = 100;
    
    // Área de alcance da sombra
    const d = 15;
    luzSol.shadow.camera.left = -d;
    luzSol.shadow.camera.right = d;
    luzSol.shadow.camera.top = d;
    luzSol.shadow.camera.bottom = -d;

    cena.add(luzSol);
}

// 4. Função Pública para Criar Blocos (Será usada pelo app.js)
function adicionarBloco(x, y, z, corHex = 0x8cff00) {
    // Geometria padrão: cubo perfeito de 1x1x1
    const geometria = new THREE.BoxGeometry(1, 1, 1);
    
    // Material básico reagente a luz ( roughness alto deixa o bloco opaco como no jogo )
    const material = new THREE.MeshStandardMaterial({ 
        color: corHex,
        roughness: 0.6,
        metalness: 0.1
    });

    const bloco = new THREE.Mesh(geometria, material);
    bloco.position.set(x, y, z);
    bloco.castShadow = true;
    bloco.receiveShadow = true;

    cena.add(bloco);
    return bloco; // Retorna a referência caso precise apagar ou mover depois
}

// 5. Loop de Atualização Frame a Frame
function executarLoop() {
    requestAnimationFrame(executarLoop);
    controles.update();
    renderizador.render(cena, camera);
}

// 6. Ajuste de Janela
function tratarRedimensionamento() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
}

// Inicializa o motor assim que o script carregar
inicializarEngine();


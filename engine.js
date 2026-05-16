// --- CONFIGURAÇÃO DO MOTOR 3D (ENGINE) ---

let cena, camera, renderizador, controles, luzSol, gradeChao;
let blocosNaCena = []; // Array para guardar os blocos e podermos limpar a cena depois

function inicializarEngine() {
    const container = document.getElementById('canvas-container');

    cena = new THREE.Scene();
    cena.background = new THREE.Color(0x141414);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(8, 8, 8);

    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderizador.domElement);

    controles = new THREE.OrbitControls(camera, renderizador.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.05;
    controles.maxPolarAngle = Math.PI / 2; // Não deixa a câmera ir para baixo do chão

    configurarLuzes();

    // Guardamos a referência da grade para poder ligar/desligar nas configurações
    gradeChao = new THREE.GridHelper(20, 20, 0x8cff00, 0x333333);
    gradeChao.position.y = -0.5;
    cena.add(gradeChao);

    window.addEventListener('resize', tratarRedimensionamento, false);
    executarLoop();
}

function configurarLuzes() {
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.5);
    cena.add(luzAmbiente);

    luzSol = new THREE.DirectionalLight(0xffffff, 0.8);
    luzSol.position.set(15, 30, 20);
    luzSol.castShadow = true;
    luzSol.shadow.mapSize.width = 1048; // Reduzido de 2048 para 1048 para ficar mais leve por padrão
    luzSol.shadow.mapSize.height = 1048;
    
    cena.add(luzSol);
}

// Cria e adiciona um bloco na cena
function adicionarBloco(x, y, z, corHex = 0x8cff00) {
    const geometria = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
        color: corHex,
        roughness: 0.7,
        metalness: 0.0
    });

    const bloco = new THREE.Mesh(geometria, material);
    bloco.position.set(x, y, z);
    bloco.castShadow = luzSol.castShadow; // Segue a configuração de gráfico atual
    bloco.receiveShadow = luzSol.castShadow;

    cena.add(bloco);
    blocosNaCena.push(bloco); // Guarda na nossa lista de controle
    return bloco;
}

// Função essencial para apagar a estrutura antiga quando a IA gerar uma nova
function limparCena() {
    blocosNaCena.forEach(bloco => {
        cena.remove(bloco);
        bloco.geometry.dispose();
        bloco.material.dispose();
    });
    blocosNaCena = [];
}

// --- FUNÇÃO DE ALTERNAR AS 6 VISÕES DA INTERFACE ---
function aplicarVisaoCamera(tipoVisao) {
    controles.reset(); // Reseta rotações manuais antigas
    
    // Distância padrão para enquadrar a estrutura de longe
    const d = 10; 

    switch(tipoVisao) {
        case '3d':
            camera.position.set(8, 8, 8);
            controles.enableRotate = true; // Reativa rotação livre
            break;
        case 'topo':
            camera.position.set(0, d, 0); // Olha estritamente de cima
            controles.enableRotate = false; // Bloqueia rotação para não estragar a vista técnica
            break;
        case 'baixo':
            camera.position.set(0, -d, 0); // Olha de baixo
            controles.enableRotate = false;
            break;
        case 'frente':
            camera.position.set(0, 0, d); // Olha de frente (Eixo Z)
            controles.enableRotate = false;
            break;
        case 'tras':
            camera.position.set(0, 0, -d); // Olha de trás
            controles.enableRotate = false;
            break;
        case 'esquerda':
            camera.position.set(-d, 0, 0); // Olha do lado esquerdo (Eixo X)
            controles.enableRotate = false;
            break;
        case 'direita':
            camera.position.set(d, 0, 0); // Olha do lado direito
            controles.enableRotate = false;
            break;
    }
    
    // Força a câmera a olhar exatamente para o centro do mapa (0,0,0)
    controles.target.set(0, 0, 0);
}

// --- CONTROLE DE CONFIGURAÇÕES DE PERFORMANCE (GRÁFICOS LEVES) ---
function aplicarConfiguracaoGrafica(tipo, ativado) {
    if (tipo === 'sombras') {
        luzSol.castShadow = ativado;
        renderizador.shadowMap.enabled = ativado;
        
        // Atualiza os blocos existentes na tela na hora
        blocosNaCena.forEach(bloco => {
            bloco.castShadow = ativado;
            bloco.receiveShadow = ativado;
        });
        console.log(`[Engine] Sombras ${ativado ? 'Ativadas' : 'Desativadas para Performance'}`);
    }
    
    if (tipo === 'grade') {
        gradeChao.visible = ativado;
        console.log(`[Engine] Grade do chão ${ativado ? 'Visível' : 'Ocultada'}`);
    }
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

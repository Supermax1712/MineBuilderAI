// --- LÓGICA DO APLICATIVO (APP) ---

// Simulando o formato de dados que a IA vai gerar para o nosso App.
// Cada objeto representa um bloco no espaço tridimensional (X, Y, Z) com sua cor.
const dadosEstruturaExemplo = [
    // Base Quadrada (Chão)
    { x: 0, y: 0, z: 0, cor: 0x555555 },
    { x: 1, y: 0, z: 0, cor: 0x555555 },
    { x: 2, y: 0, z: 0, cor: 0x555555 },
    { x: 0, y: 0, z: 1, cor: 0x555555 },
    { x: 2, y: 0, z: 1, cor: 0x555555 },
    { x: 0, y: 0, z: 2, cor: 0x555555 },
    { x: 1, y: 0, z: 2, cor: 0x555555 },
    { x: 2, y: 0, z: 2, cor: 0x555555 },

    // Pilares subindo (Pilar 1 na quina frontal esquerda)
    { x: 0, y: 1, z: 0, cor: 0x8b5a2b },
    { x: 0, y: 2, z: 0, cor: 0x8b5a2b },
    { x: 0, y: 3, z: 0, cor: 0x8b5a2b },

    // Pilar 2 (Quina direita frontal)
    { x: 2, y: 1, z: 0, cor: 0x8b5a2b },
    { x: 2, y: 2, z: 0, cor: 0x8b5a2b },
    { x: 2, y: 3, z: 0, cor: 0x8b5a2b },

    // Topo conectando os pilares (Viga)
    { x: 0, y: 4, z: 0, cor: 0xd2b48c },
    { x: 1, y: 4, z: 0, cor: 0xd2b48c },
    { x: 2, y: 4, z: 0, cor: 0xd2b48c },
];

// Função que varre a lista e manda o motor desenhar um por um
function renderizarEstrutura(listaDeBlocos) {
    console.log(`Iniciando renderização de ${listaDeBlocos.length} blocos...`);
    
    listaDeBlocos.forEach(bloco => {
        // Usa a função exposta globalmente pelo engine.js
        adicionarBloco(bloco.x, bloco.y, bloco.z, bloco.cor);
    });
}

// Executa a renderização da nossa estrutura assim que a lógica do app rodar
renderizarEstrutura(dadosEstruturaExemplo);


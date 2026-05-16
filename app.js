// --- LÓGICA DO APLICATIVO E INTEGRAÇÃO COM IA ---

// 1. CONFIGURAÇÃO DA API DA INTELIGÊNCIA ARTIFICIAL
// IMPORTANTE: Em um ambiente real de produção, escondemos essa chave. 
// Para a sua V1 local, você colará sua chave da Google AI Studio aqui.
const GEMINI_API_KEY = "AIzaSyBf_QQbvHOPdDNbHfS-i06GzCm8YuR6sFE"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Instrução oculta que força a IA a agir estritamente como um gerador de matriz voxel
const SYSTEM_INSTRUCTION = `
Você é um arquiteto especialista em Minecraft e um gerador de matrizes 3D em formato JSON.
Sua única tarefa é receber um pedido de estrutura e retornar um array JSON contendo as coordenadas de cada bloco para construir o que foi pedido.

Use apenas estes blocos válidos do Minecraft:
- "cobblestone" (Pedregulho)
- "oak_planks" (Madeira de Carvalho)
- "glass" (Vidro)
- "iron_bars" (Barra de Ferro)
- "stone_bricks" (Tijolo de Pedra)

Regras cruciais:
1. O chão/base começa em Y = 0.
2. Não adicione textos, explicações, markdown ou blocos de código (\`\`\`json). Retorne APENAS o texto do JSON estruturado.
3. Mantenha as estruturas compactas (máximo 15x15x15 de tamanho na V1 para ser leve).

Formato esperado do output:
[
  {"x": 0, "y": 0, "z": 0, "id": "cobblestone"},
  {"x": 1, "y": 0, "z": 0, "id": "oak_planks"}
]
`;

// 2. FUNÇÃO QUE CHAMA A IA VIA PROMPT DO USUÁRIO
async function enviarComandoIA() {
    const inputPrompt = document.getElementById('ai-prompt');
    const botaoGerar = document.getElementById('btn-gerar');
    const promptTexto = inputPrompt.value.trim();

    if (!promptTexto) {
        alert("Por favor, digite o que você quer construir!");
        return;
    }

    // Feedback visual de carregamento na interface
    botaoGerar.innerText = "Construindo...";
    botaoGerar.disabled = true;
    inputPrompt.disabled = true;

    try {
        // Montando a requisição para a API do Gemini
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptTexto + "\n\nSiga as instruções do sistema rigidamente e retorne apenas o JSON." }]
                }],
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                generationConfig: {
                    temperature: 0.2 // Baixa temperatura para a IA ser mais exata e menos aleatória
                }
            })
        });

        const data = await response.json();
        
        // Pega o texto bruto retornado pela IA
        let jsonTexto = data.candidates[0].content.parts[0].text.trim();
        
        // Limpeza de segurança caso a IA quebre a regra e envie formatação markdown
        jsonTexto = jsonTexto.replace(/```json/g, "").replace(/```/g, "").trim();

        // Converte o texto da IA em uma lista Javascript real
        const matrizBlocos = JSON.parse(jsonTexto);

        // Processa os dados gerados
        limparCena(); // Apaga a estrutura anterior do 3D antes de desenhar a nova
        renderizarEstrutura(matrizBlocos);
        atualizarPainelMateriais(matrizBlocos);

    } catch (erro) {
        console.error("Erro na comunicação com a IA:", erro);
        alert("Houve um erro ao processar o comando da IA. Verifique o console ou sua API Key.");
    } finally {
        // Restaura os botões da interface
        botaoGerar.innerText = "Gerar Planta";
        botaoGerar.disabled = false;
        inputPrompt.disabled = false;
    }
}

// 3. RENDERIZAÇÃO DOS BLOCOS NO MOTOR 3D
function renderizarEstrutura(listaDeBlocos) {
    listaDeBlocos.forEach(bloco => {
        // Mapeamento de cores provisórias para a V1 com base no ID retornado pela IA
        let cor = 0x8cff00; // Padrão verde limão
        if (bloco.id === "cobblestone") cor = 0x737373;
        if (bloco.id === "stone_bricks") cor = 0x8a8a8a;
        if (bloco.id === "oak_planks") cor = 0xa67a4e;
        if (bloco.id === "glass") cor = 0xd9f2ff;
        if (bloco.id === "iron_bars") cor = 0xcccccc;

        // Chama a função global criada lá no engine.js
        adicionarBloco(bloco.x, bloco.y, bloco.z, cor);
    });
}

// 4. CALCULAR E ATUALIZAR A LISTA DE MATERIAIS (SHOPPING LIST)
function atualizarPainelMateriais(listaDeBlocos) {
    const painelMateriais = document.getElementById('materials-list');
    painelMateriais.innerHTML = ""; // Limpa a lista antiga da tela

    // Objeto para contar a quantidade de cada tipo de bloco
    const contagem = {};
    listaDeBlocos.forEach(b => {
        contagem[b.id] = (contagem[b.id] || 0) + 1;
    });

    // Tradução limpa dos IDs para nomes legíveis na tela
    const nomesAmigaveis = {
        "cobblestone": "Pedregulho",
        "oak_planks": "Tábua de Carvalho",
        "glass": "Vidro",
        "iron_bars": "Barras de Ferro",
        "stone_bricks": "Tijolos de Pedra"
    };

    // Gera o HTML de cada material calculado
    for (const [id, total] of Object.entries(contagem)) {
        const packs = Math.floor(total / 64);
        const restos = total % 64;
        let textoPacks = packs > 0 ? `${packs} Pack(s) + ${restos}` : `${restos} blocos`;

        const itemHTML = `
            <div class="material-item">
                <div class="mat-info">
                    <span class="mat-name">${nomesAmigaveis[id] || id}</span>
                    <span class="mat-count">Total: <b>${total}</b></span>
                </div>
                <span class="mat-packs">${textoPacks}</span>
            </div>
        `;
        painelMateriais.innerHTML += itemHTML;
    }
}

// 5. FUNÇÕES DE SUPORTE DA INTERFACE (Ainda sem comportamento do 3D)
function toggleMenuConfig() {
    const menu = document.getElementById('config-menu');
    menu.classList.toggle('hidden');
}

function configAlterada(tipo, valor) {
    console.log(`Configuração [${tipo}] alterada para: ${valor}`);
    // Vincularemos com as funções do engine.js na próxima etapa
}

function mudarVisao(tipoVisao) {
    // Remove classe ativa de todos os botões e adiciona no clicado
    document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    console.log(`Mudando câmera para visão: ${tipoVisao}`);
    // Vincularemos com as posições de câmera do engine.js na próxima etapa
}

function atualizarFiltroCamada(valor) {
    console.log(`Filtrando para mostrar apenas blocos abaixo da altura Y = ${valor}`);
}

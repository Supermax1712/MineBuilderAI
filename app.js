// --- LÓGICA DO APP E ENGENHARIA DE PROMPT MINECRAFT ---

const GEMINI_API_KEY = "AIzaSyBf_QQbvHOPdDNbHfS-i06GzCm8YuR6sFE"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `
Você é um Arquiteto de Engenharia Voxel estrutural para Minecraft.
Sua tarefa é converter pedidos textuais em layouts vazados tridimensionais legítimos.

REGRAS RÍGIDAS DE CONSTRUÇÃO DE MINECRAFT:
1. NUNCA faça caixas ou cubos maciços preenchidos. Casarões e cabanas DEVEM ter cômodos internos vazios (ocos).
2. Paredes devem ser erguidas apenas nos perímetros externos. O espaço de dentro deve ser ar/vazio.
3. Janelas de "glass" ou "iron_bars" devem ser inseridas substituindo blocos vazados das paredes na altura Y=1 ou Y=2, nunca no chão ou teto.
4. Telhados não podem ser planos! Faça telhados em formato triangular ou de pirâmide (subindo em escada de "oak_planks" ou "stone_bricks"), onde cada camada acima é menor que a anterior.

IDs de Blocos permitidos:
- "cobblestone"
- "oak_planks"
- "glass"
- "iron_bars"
- "stone_bricks"

Output estrito: Apenas a string JSON crua do array, sem markdown, sem explicações.
Exemplo: [{"x":0,"y":0,"z":0,"id":"cobblestone"}]
`;

async function enviarComandoIA() {
    const inputPrompt = document.getElementById('ai-prompt');
    const botaoGerar = document.getElementById('btn-gerar');
    const promptTexto = inputPrompt.value.trim();

    if (!promptTexto) {
        alert("Por favor, digite o que você quer construir!");
        return;
    }

    botaoGerar.innerText = "Construindo...";
    botaoGerar.disabled = true;
    inputPrompt.disabled = true;

    try {
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Gere a planta exata para: ${promptTexto}. Certifique-se de fazer paredes ocas, portas livres e telhado em pirâmide clássico do Minecraft.` }]
                }],
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                generationConfig: {
                    temperature: 0.1, // Reduzido ao mínimo para impedir a IA de inventar formatos caóticos
                    responseMimeType: "application/json" // Força o Gemini a responder JSON estruturado nativamente
                }
            })
        });

        if (!response.ok) throw new Error(`HTTP erro status: ${response.status}`);

        const data = await response.json();
        let jsonTexto = data.candidates[0].content.parts[0].text.trim();
        
        // Sanatização completa
        jsonTexto = jsonTexto.replace(/```json/g, "").replace(/```/g, "").trim();

        const matrizBlocos = JSON.parse(jsonTexto);

        if (typeof limparCena === "function") {
            limparCena(); 
            renderizarEstrutura(matrizBlocos);
            atualizarPainelMateriais(matrizBlocos);
        } else {
            console.error("Função limparCena não encontrada.");
        }

    } catch (erro) {
        console.error("Erro completo processado:", erro);
        alert("Erro na conexão ou limite de uso da API Key. Verifique os logs.");
    } finally {
        botaoGerar.innerText = "Gerar Planta";
        botaoGerar.disabled = false;
        inputPrompt.disabled = false;
    }
}

function renderizarEstrutura(listaDeBlocos) {
    if (typeof adicionarBloco !== "function") return;
    listaDeBlocos.forEach(bloco => {
        adicionarBloco(bloco.x, bloco.y, bloco.z, bloco.id);
    });
}

function atualizarPainelMaterials(listaDeBlocos) {
    // Mantido por retrocompatibilidade se invocado por engano
    atualizarPainelMateriais(listaDeBlocos);
}

function atualizarPainelMateriais(listaDeBlocos) {
    const painelMateriais = document.getElementById('materials-list');
    if (!painelMateriais) return;
    painelMateriais.innerHTML = ""; 

    const contagem = {};
    listaDeBlocos.forEach(b => {
        contagem[b.id] = (contagem[b.id] || 0) + 1;
    });

    const nomesAmigaveis = {
        "cobblestone": "Pedregulho",
        "oak_planks": "Tábua de Carvalho",
        "glass": "Vidro",
        "iron_bars": "Barras de Ferro",
        "stone_bricks": "Tijolos de Pedra"
    };

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

function toggleMenuConfig() {
    const menu = document.getElementById('config-menu');
    if (menu) menu.classList.toggle('hidden');
}

function configAlterada(tipo, valor) {
    if (typeof aplicarConfiguracaoGrafica === "function") {
        aplicarConfiguracaoGrafica(tipo, valor);
    }
}

function mudarVisao(tipoVisao) {
    document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }
    if (typeof aplicarVisaoCamera === "function") {
        aplicarVisaoCamera(tipoVisao);
    }
}

function atualizarFiltroCamada(valor) {
    console.log(`Filtragem Y ativa: ${valor}`);
}

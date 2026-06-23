    // 1. Inicializa a URL do banco de dados com segurança
    let URL_API = localStorage.getItem('url_banco_anotacoes') || "";

    // 2. CORREÇÃO CRÍTICA: Garante que o array 'notas' sempre comece como um array válido
    let notas = [];
    const input = document.getElementById('notaInput');

    // Inicializa o sistema assim que a página carrega
    verificarEIniciar();

    function verificarEIniciar() {
        if (!URL_API || URL_API.trim() === "" || URL_API === "null") {
            // Se não tiver URL, limpa e pede uma nova
            URL_API = "";
            localStorage.removeItem('url_banco_anotacoes');
            setTimeout(configurarNovaURL, 500); // Dá um pequeno tempo para a página carregar antes do prompt
        } else {
            carregarNotasDaPlanilha();
        }
    }

    function configurarNovaURL() {
        const urlDigitada = prompt("Insira a URL do seu Google Apps Script (Web App):", URL_API);
        
        if (urlDigitada && urlDigitada.includes("script.google.com")) {
            URL_API = urlDigitada.trim();
            localStorage.setItem('url_banco_anotacoes', URL_API);
            carregarNotasDaPlanilha();
        } else {
            const container = document.getElementById('containernotas');
            container.innerHTML = "<p style='text-align:center; color:red; font-weight:bold;'>Uma URL válida do Apps Script é necessária. Clique no botão 'Trocar Banco de Dados' abaixo para tentar novamente.</p>";
        }
    }

    function carregarNotasDaPlanilha() {
        const container = document.getElementById('containernotas');
        container.innerHTML = "<p style='text-align:center; color:#666;'>Carregando notas da nuvem...</p>";
        
        if (!URL_API) return;

        fetch(URL_API, {
            method: "GET",
            mode: "cors",
            redirect: "follow"
        })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(resultado => {
            if (resultado.status === "sucesso") {
                notas = resultado.notas ? resultado.notas.reverse() : []; 
                renderizarnotas();
            }
        })
        .catch(err => {
            console.error("Erro ao carregar:", err);
            // Se der erro na nuvem, pelo menos mostra que está conectado localmente
            container.innerHTML = "<p style='text-align:center; color:#999;'>Não foi possível carregar o histórico da nuvem, mas você pode digitar novas notas.</p>";
        });
    }

    function adicionarNota() {
        const texto = input.value.trim();
        if (!texto) return;

        // Formata a data atual
        const dataAtual = new Date().toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const novaNota = { texto: texto, data: dataAtual };
        
        // -------------------------------------------------------------
        // FORÇA A ATUALIZAÇÃO DA TELA (Isso DEVE funcionar na hora)
        // -------------------------------------------------------------
        if (!Array.isArray(notas)) notas = []; // Proteção caso 'notas' tenha virado outra coisa
        notas.unshift(novaNota);
        renderizarnotas();
        input.value = "";
        // -------------------------------------------------------------

        // Se você não configurou a URL, ele avisa mas mantém a nota na tela
        if (!URL_API) {
            alert("Nota guardada na tela, mas NÃO enviada para a planilha porque a URL do Apps Script não foi configurada!");
            return;
        }

        // Envia para a planilha em segundo plano
        fetch(URL_API, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(novaNota)
        })
        .then(() => console.log("Comando de envio enviado para o Apps Script."))
        .catch(err => console.error("Erro na requisição POST:", err));
    }

    function renderizarnotas() {
        const container = document.getElementById('containernotas');
        if (!container) return;
        
        if (notas.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#999;'>Nenhuma anotação encontrada.</p>";
            return;
        }
        container.innerHTML = notas.map(nota => `
            <div class="nota-item">
                <div class="nota-conteudo">
                    <span class="nota-texto">${nota.texto}</span>
                    <small class="nota-data">${nota.data}</small>
                </div>
            </div>
        `).join('');
    }

    // Atalho do teclado Enter
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            adicionarNota();
        }
    });

    function filtrarnotas() {
        const termo = document.getElementById('searchInput').value.toLowerCase();
        const notasFiltradas = notas.filter(nota => 
            nota.texto.toLowerCase().includes(termo)
        );
        renderizarFiltradas(notasFiltradas);
    }

    function renderizarFiltradas(listaParaExibir) {
        const container = document.getElementById('containernotas');
        container.innerHTML = listaParaExibir.map(nota => `
            <div class="nota-item">
                <div class="nota-conteudo">
                    <span class="nota-texto">${nota.texto}</span>
                    <small class="nota-data">${nota.data}</small>
                </div>
            </div>
        `).join('');
    }

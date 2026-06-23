// Cole sua URL do Apps Script aqui
    const URL_API = "Coloque aqui a URL do seu Apps Script";

    let notas = [];
    const input = document.getElementById('notaInput');

    // Carrega o histórico da planilha ao abrir o app
    carregarNotasDaPlanilha();

    function carregarNotasDaPlanilha() {
        const container = document.getElementById('containernotas');
        container.innerHTML = "<p style='text-align:center; color:#666;'>Carregando notas da nuvem...</p>";
        
       fetch(`${URL_API}?origin=${window.location.origin}`, {
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
            console.error(err);
            container.innerHTML = "<p style='text-align:center; color:red;'>Erro ao carregar notas.</p>";
        });
    }

    function adicionarNota() {
        
        const texto = input.value.trim();
        if (!texto) return;

        const dataAtual = new Date().toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const novaNota = { 
    texto: texto, 
    data: dataAtual,
    token: "S@nd3105" // Deve ser igual ao do Apps Script
};        
        
        // Adiciona no topo do array local para feedback visual instantâneo
        notas.unshift(novaNota);
        renderizarnotas();
        input.value = "";

        // Envia para salvar na planilha em background
        fetch(`${URL_API}?origin=${window.location.origin}`, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(novaNota)
})
        .then(res => res.json())
        .then(res => console.log("Salvo no Sheets:", res))
        .catch(err => console.error("Erro ao salvar na nuvem:", err));
    }

    function renderizarnotas() {
        const container = document.getElementById('containernotas');
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

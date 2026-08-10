document.addEventListener('DOMContentLoaded', () => {
    const tabelaCorpo = document.querySelector('#tabelaLembrete tbody');
    const chkSelecionarTodos = document.getElementById("selecionarTodos");
    const btnRelatorio = document.getElementById("btnGerarRelatorio");
    
    // Elementos do painel de filtros
    const filterTipo = document.getElementById("filtroTipo");
    const filterData = document.getElementById("filtroData");
    const filterTarefa = document.getElementById("filtroTarefa");
    const btnLimpar = document.getElementById("btnLimparFiltros");

    const modal = document.getElementById("modalAnotacoes");
    const modalTexto = document.getElementById("modalTextoAnotacao");
    const modalClose = document.querySelector(".modal-anotacoes-close");

    function carregarTabelaPonto() {
        if (!tabelaCorpo) return;

        let pontosSalvos = JSON.parse(localStorage.getItem('meus_pontos')) || [];
        pontosSalvos = pontosSalvos.filter(ponto => ponto && ponto.entrada);

        tabelaCorpo.innerHTML = "";

        if (pontosSalvos.length === 0) {
            tabelaCorpo.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #999; padding: 20px;">
                        Nenhum ponto registrado no momento.
                    </td>
                </tr>
            `;
            return;
        }

        const pontosComIndex = pontosSalvos.map((ponto, index) => ({ ...ponto, idOriginal: index }));

        [...pontosComIndex].reverse().forEach(ponto => {
            let totalHoras = "--:--h";
            if (ponto.saida && ponto.saida !== "--:--") {
                totalHoras = calcularDiferencaHoras(ponto.entrada, ponto.saida);
            }

            const dataRegistro = ponto.data || new Date().toLocaleDateString('pt-BR');
            const statusTexto = (ponto.status === "Confirmado" || ponto.status === "🟢 Confirmado") ? "🟢 Confirmado" : "🟡 Pendente";

            const tr = document.createElement('tr');
            
            tr.setAttribute('data-tipo', (ponto.tipo || 'Aula Normal').toLowerCase());
            tr.setAttribute('data-data', dataRegistro);
            tr.setAttribute('data-tarefa', (ponto.tarefa || '').toLowerCase());

            // Adicionado checkbox individual linkado com o índice original na primeira coluna
            tr.innerHTML = `
                <td style="text-align: center;"><input type="checkbox" class="chk-ponto-item" data-id="${ponto.idOriginal}" /></td>
                <td>${ponto.tipo || 'Aula Normal'}</td>
                <td>${dataRegistro}</td>
                <td>${ponto.entrada} / ${ponto.saida}</td>
                <td>${ponto.tarefa}</td>
                <td>${statusTexto}</td>
                <td><button class="btn-tabela-ver-mais" data-id="${ponto.idOriginal}">Ver mais</button></td>
            `;
            tabelaCorpo.appendChild(tr);
        });

        adicionarEventosModal(pontosSalvos);
        aplicarFiltroAutomaticoDoPerfil();
        configurarSelecaoEmMassa();
    }

    function calcularDiferencaHoras(entrada, saida) {
        const [hEntrada, mEntrada] = entrada.split(':').map(Number);
        const [hSaida, mSaida] = saida.split(':').map(Number);
        let minutosTotais = (hSaida * 60 + mSaida) - (hEntrada * 60 + mEntrada);
        if (minutosTotais < 0) minutosTotais += 24 * 60; 
        const horas = Math.floor(minutosTotais / 60);
        const minutos = minutosTotais % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}h`;
    }

    // CONTROLE DOS CHECKBOXES MESTRE E INDIVIDUAL
    function configurarSelecaoEmMassa() {
        if (!chkSelecionarTodos) return;

        chkSelecionarTodos.addEventListener('change', function() {
            // Seleciona apenas as linhas que estão visíveis (ignora as ocultadas por filtros)
            const checkboxesVisiveis = Array.from(tabelaCorpo.querySelectorAll('.chk-ponto-item')).filter(chk => {
                return chk.closest('tr').style.display !== "none";
            });

            checkboxesVisiveis.forEach(chk => {
                chk.checked = this.checked;
            });
        });
    }

    // EXTRAÇÃO E COMPILAÇÃO DOS SELECIONADOS PARA O RELATÓRIO
    if (btnRelatorio) {
        btnRelatorio.addEventListener('click', () => {
            const itensMarcados = tabelaCorpo.querySelectorAll('.chk-ponto-item:checked');

            if (itensMarcados.length === 0) {
                alert('⚠️ Por favor, marque ao menos um registro de ponto usando as caixas de seleção da tabela.');
                return;
            }

            let pontosSalvos = JSON.parse(localStorage.getItem('meus_pontos')) || [];
            let dadosRelatorio = [];

            itensMarcados.forEach(chk => {
                const id = chk.getAttribute('data-id');
                if (pontosSalvos[id]) {
                    dadosRelatorio.push(pontosSalvos[id]);
                }
            });

            alert(`📌 Relatório em lote processado com sucesso!\nForam compilados ${dadosRelatorio.length} registros para a geração do espelho de ponto.`);
            console.log("Dados estruturados enviados ao gerador:", dadosRelatorio);
            
            // Ponto de integração futuro com endpoint Java:
            // fetch('/api/ponto/exportar', { method: 'POST', body: JSON.stringify(dadosRelatorio) });
        });
    }

    // LÓGICA DE FILTRAGEM MULTICRITÉRIO COMBINADA
    function filtrarTabela() {
        if (!tabelaCorpo) return;

        const valorTipo = filterTipo ? filterTipo.value.toLowerCase() : "";
        const valorTarefa = filterTarefa ? filterTarefa.value.toLowerCase().trim() : "";
        let valorData = filterData ? filterData.value : "";

        if (valorData) {
            const [ano, mes, dia] = valorData.split('-');
            valorData = `${dia}/${mes}/${ano}`;
        }

        Array.from(tabelaCorpo.rows).forEach(row => {
            if (row.cells.length === 1) return;

            const tipoLinha = row.getAttribute('data-tipo') || "";
            const dataLinha = row.getAttribute('data-data') || "";
            const tarefaLinha = row.getAttribute('data-tarefa') || "";

            const bateTipo = valorTipo === "" || tipoLinha === valorTipo;
            const bateData = valorData === "" || dataLinha === valorData;
            const bateTarefa = valorTarefa === "" || tarefaLinha.includes(valorTarefa);

            if (bateTipo && bateData && bateTarefa) {
                row.style.display = "";
            } else {
                row.style.display = "none";
                // Desmarca automaticamente linhas ocultadas por filtros para evitar relatórios errados
                const chk = row.querySelector('.chk-ponto-item');
                if (chk) chk.checked = false;
            }
        });
        
        if (chkSelecionarTodos) chkSelecionarTodos.checked = false;
    }

    if (filterTipo) filterTipo.addEventListener("change", filtrarTabela);
    if (filterData) filterData.addEventListener("input", filtrarTabela);
    if (filterTarefa) filterTarefa.addEventListener("input", filtrarTabela);

    if (btnLimpar) {
        btnLimpar.addEventListener("click", () => {
            if (filterTipo) filterTipo.value = "";
            if (filterData) filterData.value = "";
            if (filterTarefa) filterTarefa.value = "";
            if (chkSelecionarTodos) chkSelecionarTodos.checked = false;
            filtrarTabela();
        });
    }

    function aplicarFiltroAutomaticoDoPerfil() {
        const tarefaAuto = localStorage.getItem('tarefaAutomatica');
        const tipoAuto = localStorage.getItem('tipoRegistroAutomatica');

        if (tarefaAuto || tipoAuto) {
            if (tipoAuto && filterTipo) filterTipo.value = tipoAuto;
            if (tarefaAuto && filterTarefa) filterTarefa.value = tarefaAuto;
            filtrarTabela();
            localStorage.removeItem('tarefaAutomatica');
            localStorage.removeItem('tipoRegistroAutomatica');
        }
    }

    function adicionarEventosModal(pontosSalvos) {
        document.querySelectorAll('.btn-tabela-ver-mais').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const pontoSelecionado = pontosSalvos[id];

                if (pontoSelecionado && modal && modalTexto) {
                    modalTexto.textContent = pontoSelecionado.anotacoes || "Nenhuma observação foi registrada para este ponto.";
                    modal.style.display = "flex";
                }
            });
        });
    }

    if (modalClose && modal) {
        modalClose.addEventListener('click', () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener('click', (e) => {
        if (modal && e.target === modal) {
            modal.style.display = "none";
        }
    });

    carregarTabelaPonto();
});

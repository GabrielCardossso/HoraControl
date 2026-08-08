document.addEventListener('DOMContentLoaded', () => {
    const tabelaCorpo = document.querySelector('#tabelaLembrete tbody');
    const filtroInput = document.getElementById("filtro");
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
                    <td colspan="6" style="text-align: center; color: #999; padding: 20px;">
                        Nenhum ponto registrado no momento.
                    </td>
                </tr>
            `;
            return;
        }

        // Mapeia os pontos originais com seus respectivos índices antes de inverter
        const pontosComIndex = pontosSalvos.map((ponto, index) => ({ ...ponto, idOriginal: index }));

        // Exibe do mais recente para o mais antigo sem alterar a ordem real na memória
        [...pontosComIndex].reverse().forEach(ponto => {
            let totalHoras = "--:--h";
            if (ponto.saida && ponto.saida !== "--:--") {
                totalHoras = calcularDiferencaHoras(ponto.entrada, ponto.saida);
            }

            const dataRegistro = ponto.data || new Date().toLocaleDateString('pt-BR');
            const statusTexto = (ponto.status === "Confirmado" || ponto.status === "🟢 Confirmado") ? "🟢 Confirmado" : "🟡 Pendente";

            const tr = document.createElement('tr');
            tr.innerHTML = `
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

    if (filtroInput && tabelaCorpo) {
        filtroInput.addEventListener("input", function () {
            const filtro = this.value.toLowerCase();
            Array.from(tabelaCorpo.rows).forEach(row => {
                const textoCompleto = row.textContent.toLowerCase();
                row.style.display = textoCompleto.includes(filtro) ? "" : "none";
            });
        });
    }

    carregarTabelaPonto();
});

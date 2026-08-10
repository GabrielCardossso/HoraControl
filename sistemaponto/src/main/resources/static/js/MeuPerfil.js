document.addEventListener('DOMContentLoaded', () => {
    atualizarData();

    const selecaoTarefa = document.getElementById('selecaoTarefa');
    const containerSubTarefa = document.getElementById('containerSubTarefa');
    const containerTituloExtra = document.getElementById('containerTituloExtra');
    const selecaoSubTarefa = document.getElementById('selecaoSubTarefa');
    const txtTituloExtra = document.getElementById('txtTituloExtra');
    const tituloBloco = document.getElementById('tituloBloco');
    const txtAnotacoes = document.getElementById('txtAnotacoes');
    
    const btnCadastrar = document.getElementById('btnCadastrar');
    const listaPendencias = document.querySelector('.lista-pendencias-perfil');

    // Controla dinamicamente o estado visual do botão (Texto e Cor)
    function atualizarBotaoPonto() {
        if (!btnCadastrar) return;

        let nomeTarefa = "";
        const tipoRegistro = selecaoTarefa ? selecaoTarefa.value : 'Aula Normal';

        if (tipoRegistro === 'Aula Normal') {
            nomeTarefa = selecaoSubTarefa ? selecaoSubTarefa.value : 'Sem tarefa';
        } else {
            nomeTarefa = txtTituloExtra ? txtTituloExtra.value.trim() : 'Atividade Extra';
            if (!nomeTarefa) {
                nomeTarefa = 'Atividade Extra';
            }
        }

        let pontosAtuais = JSON.parse(localStorage.getItem('meus_pontos')) || [];

        const pontoAberto = pontosAtuais.find(p =>
            p &&
            p.entrada &&
            p.tarefa === nomeTarefa &&
            (p.status === "Pendente" || p.status === "🟡 Pendente")
        );

        if (pontoAberto) {
            btnCadastrar.textContent = "Fechar Ponto";
            btnCadastrar.style.backgroundColor = "#ef4444"; // Vermelho para indicar fechamento
        } else {
            btnCadastrar.textContent = "Registrar Ponto";
            btnCadastrar.style.backgroundColor = "#2196f3"; // Azul padrão do sistema
        }
    }

    // Carrega anotações salvas com segurança se o elemento existir
    if (txtAnotacoes && localStorage.getItem('anotacoesProfessor')) {
        txtAnotacoes.value = localStorage.getItem('anotacoesProfessor');
    }

    restaurarEstadoSeletores();
    carregarPontosNaTela();
    atualizarBotaoPonto(); // Checagem inicial ao carregar a página

    function alternarModoVisao() {
        if (!selecaoTarefa) return;
        
        if (selecaoTarefa.value === 'Aula Normal') {
            if (containerSubTarefa) containerSubTarefa.style.display = 'block';
            if (containerTituloExtra) containerTituloExtra.style.display = 'none';
            if (tituloBloco) tituloBloco.textContent = 'Minha Grade de Hoje';
        } else if (selecaoTarefa.value === 'Atividade Extra') {
            if (containerSubTarefa) containerSubTarefa.style.display = 'none';
            if (containerTituloExtra) containerTituloExtra.style.display = 'block';
            if (tituloBloco) tituloBloco.textContent = 'Detalhes da Atividade Extra';
        }
        salvarEstadoSeletores();
        atualizarBotaoPonto(); // Atualiza o botão ao trocar o tipo de atividade
    }

    if (selecaoTarefa) selecaoTarefa.addEventListener('change', alternarModoVisao);
    
    if (selecaoSubTarefa) {
        selecaoSubTarefa.addEventListener('change', () => {
            salvarEstadoSeletores();
            atualizarBotaoPonto(); // Atualiza se mudar a matéria/turma
        });
    }
    
    if (txtTituloExtra) {
        txtTituloExtra.addEventListener('input', () => {
            salvarEstadoSeletores();
            atualizarBotaoPonto(); // Atualiza se digitar um título extra
        });
    }

    function salvarEstadoSeletores() {
        if (!selecaoTarefa || !selecaoSubTarefa || !txtTituloExtra) return;
        localStorage.setItem('perfil_selecaoTarefa', selecaoTarefa.value);
        localStorage.setItem('perfil_selecaoSubTarefa', selecaoSubTarefa.value);
        localStorage.setItem('perfil_txtTituloExtra', txtTituloExtra.value);
    }

    function restaurarEstadoSeletores() {
        if (!selecaoTarefa || !selecaoSubTarefa || !txtTituloExtra) return;
        if (localStorage.getItem('perfil_selecaoTarefa')) selecaoTarefa.value = localStorage.getItem('perfil_selecaoTarefa');
        if (localStorage.getItem('perfil_selecaoSubTarefa')) selecaoSubTarefa.value = localStorage.getItem('perfil_selecaoSubTarefa');
        if (localStorage.getItem('perfil_txtTituloExtra')) txtTituloExtra.value = localStorage.getItem('perfil_txtTituloExtra');
        alternarModoVisao();
    }

    // Motor de cliques para Entrada e Saída de Ponto
    if (btnCadastrar) {
        btnCadastrar.addEventListener('click', () => {
            let nomeTarefa = "";
            let tipoRegistro = selecaoTarefa ? selecaoTarefa.value : 'Aula Normal';
            
            if (tipoRegistro === 'Aula Normal') {
                nomeTarefa = selecaoSubTarefa ? selecaoSubTarefa.value : 'Sem tarefa';
            } else {
                nomeTarefa = txtTituloExtra ? txtTituloExtra.value.trim() : 'Atividade Extra';
                if (!nomeTarefa) nomeTarefa = 'Atividade Extra';
            }

            const agora = new Date();
            const horarioRegistro = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
            const dataHoje = agora.toLocaleDateString('pt-BR');
            const anotacaoTexto = txtAnotacoes ? txtAnotacoes.value.trim() : "Nenhuma observação informada.";

            let pontosAtuais = JSON.parse(localStorage.getItem('meus_pontos')) || [];
            pontosAtuais = pontosAtuais.filter(p => p && p.entrada);

            let pontoAberto = pontosAtuais.find(p => p.tarefa === nomeTarefa && (p.status === "Pendente" || p.status === "🟡 Pendente"));

            if (pontoAberto) {
                pontoAberto.saida = horarioRegistro;
                pontoAberto.status = "Confirmado";
                alert(`Saída registrada às ${horarioRegistro} para: ${nomeTarefa}`);
                
                // FIX DO BUG: Limpa a caixa visual de texto e remove o cache ao fechar o ponto
                if (txtAnotacoes) {
                    txtAnotacoes.value = ""; 
                    localStorage.removeItem('anotacoesProfessor'); 
                }

                if (tipoRegistro === 'Atividade Extra' && txtTituloExtra) {
                    txtTituloExtra.value = "";
                    salvarEstadoSeletores();
                }
            } else {
                const novoPonto = {
                    tipo: tipoRegistro,
                    data: dataHoje,
                    entrada: horarioRegistro,
                    saida: "--:--",
                    tarefa: nomeTarefa,
                    status: "Pendente",
                    anotacoes: anotacaoTexto
                };
                pontosAtuais.push(novoPonto);
                alert(`Entrada registrada às ${horarioRegistro} para: ${nomeTarefa}`);
            }

            localStorage.setItem('meus_pontos', JSON.stringify(pontosAtuais));
            carregarPontosNaTela();
            atualizarBotaoPonto(); // Atualiza o estado visual do botão na hora
        });
    }

    // Carrega o histórico dinâmico dos últimos 2 registros na tela
    function carregarPontosNaTela() {
        if (!listaPendencias) return;

        let pontosSalvos = JSON.parse(localStorage.getItem('meus_pontos')) || [];
        pontosSalvos = pontosSalvos.filter(ponto => ponto && ponto.entrada);

        listaPendencias.innerHTML = "";

        if (pontosSalvos.length === 0) {
            listaPendencias.innerHTML = '<span style="font-size:13px; color:#999; text-align:center; display:block; padding: 10px 0;">Nenhum ponto registrado.</span>';
            return;
        }

        // [...pontosSalvos] faz um clone para inverter a ordem apenas visualmente
        [...pontosSalvos].reverse().slice(0, 2).forEach(ponto => {
            if (!ponto) return;
            
            const statusClasse = (ponto.status === "Confirmado" || ponto.status === "🟢 Confirmado") ? "status-confirmado" : "status-pendente";
            const statusTexto = (ponto.status === "Confirmado" || ponto.status === "🟢 Confirmado") ? "🟢 Confirmado" : "🟡 Pendente";
            const dataPonto = ponto.data || new Date().toLocaleDateString('pt-BR');

            const htmlItem = `
                <div class="item-pendencia">
                    <div class="pendencia-linha">
                        <span class="pendencia-label">Data / Dia:</span>
                        <span class="pendencia-valor">${dataPonto}</span>
                    </div>
                    <div class="pendencia-linha">
                        <span class="pendencia-label">Entrada / Saída:</span>
                        <span class="pendencia-valor">${ponto.entrada || '--:--'} / ${ponto.saida || '--:--'}</span>
                    </div>
                    <div class="pendencia-linha">
                        <span class="pendencia-label">Tarefa:</span>
                        <span class="pendencia-valor">${ponto.tarefa || 'Sem tarefa'}</span>
                    </div>
                    <div class="pendencia-linha">
                        <span class="pendencia-label">Status:</span>
                        <span class="pendencia-valor ${statusClasse}">${statusTexto}</span>
                    </div>
                </div>
            `;
            listaPendencias.insertAdjacentHTML('beforeend', htmlItem);
        });
    }

    // Ação manual do botão "Salvar Anotações"
    const btnSalvar = document.getElementById('btnSalvarAnotacoes');
    if (btnSalvar && txtAnotacoes) {
        btnSalvar.addEventListener('click', () => {
            localStorage.setItem('anotacoesProfessor', txtAnotacoes.value);
            alert('Anotações salvas com sucesso!');
        });
    }


        // Botão inferior para redirecionar à tela de histórico unificado (/ponto)
    const btnAtalho = document.getElementById('btnIrParaPonto');
    if (btnAtalho) {
        btnAtalho.addEventListener('click', () => {
            const tStr = selecaoTarefa && selecaoTarefa.value === 'Aula Normal' ? (selecaoSubTarefa ? selecaoSubTarefa.value : '') : (txtTituloExtra ? txtTituloExtra.value.trim() : '');
            localStorage.setItem('tarefaAutomatica', tStr || 'Atividade Extra');
            // CORRIGIDO: Alterado de tipoRegistrationAutomatica para tipoRegistroAutomatica
            localStorage.setItem('tipoRegistroAutomatica', selecaoTarefa ? selecaoTarefa.value : 'Aula Normal');
            window.location.href = '/ponto';
        });
    }
}); // CORRIGIDO: Agora fecha corretamente apenas o DOMContentLoaded do início do arquivo

function atualizarData() {
    const elementoRelogio = document.getElementById("dataRelogio");
    if (elementoRelogio) {
        const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        elementoRelogio.textContent = new Date().toLocaleDateString('pt-BR', opcoes);
    }
}

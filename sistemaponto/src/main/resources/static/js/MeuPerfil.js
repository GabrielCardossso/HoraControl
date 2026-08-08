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

    // Carrega anotações salvas com segurança se o elemento existir
    if (txtAnotacoes && localStorage.getItem('anotacoesProfessor')) {
        txtAnotacoes.value = localStorage.getItem('anotacoesProfessor');
    }

    restaurarEstadoSeletores();
    carregarPontosNaTela();

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
    }

    if (selecaoTarefa) selecaoTarefa.addEventListener('change', alternarModoVisao);
    if (selecaoSubTarefa) selecaoSubTarefa.addEventListener('change', salvarEstadoSeletores);
    if (txtTituloExtra) txtTituloExtra.addEventListener('input', salvarEstadoSeletores);

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
                    anotacoes: anotacaoTexto || "Nenhuma observação informada."
                };
                pontosAtuais.push(novoPonto);
                alert(`Entrada registrada às ${horarioRegistro} para: ${nomeTarefa}`);
            }

            localStorage.setItem('meus_pontos', JSON.stringify(pontosAtuais));
            carregarPontosNaTela();
        });
    }

    function carregarPontosNaTela() {
        if (!listaPendencias) return;

        let pontosSalvos = JSON.parse(localStorage.getItem('meus_pontos')) || [];
        pontosSalvos = pontosSalvos.filter(ponto => ponto && ponto.entrada);

        listaPendencias.innerHTML = "";

        if (pontosSalvos.length === 0) {
            listaPendencias.innerHTML = '<span style="font-size:13px; color:#999; text-align:center; display:block; padding: 10px 0;">Nenhum ponto registrado.</span>';
            return;
        }

        // [...pontosSalvos] cria uma cópia para inverter apenas a exibição na tela
        [...pontosSalvos].reverse().slice(0, 2).forEach(ponto => {
            if (!ponto) return;
            
            const statusClasse = (ponto.status === "Confirmado" || ponto.status === "🟢 Confirmado") ? "status-confirmado" : "status-pendente";
            const statusTexto = (ponto.status === "Confirmado" || ponto.status === "🟢 Confirmado") ? "🟢 Confirmado" : "🟡 Pendente";
            
            // Caso encontre dados antigos guardados sem o atributo data, ele injeta o dia atual de forma segura
            const dataPonto = ponto.data || new Date().toLocaleDateString('pt-BR');

            const htmlItem = `
                <div class="item-pendencia">
                    <!-- LINHA ADICIONADA CONFORME O PEDIDO -->
                    <div class="pendencia-linha">
                        <span class="pendencia-label">Data:</span>
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

    const btnSalvar = document.getElementById('btnSalvarAnotacoes');
    if (btnSalvar && txtAnotacoes) {
        btnSalvar.addEventListener('click', () => {
            localStorage.setItem('anotacoesProfessor', txtAnotacoes.value);
            alert('Anotações salvas com sucesso!');
        });
    }

    const btnAtalho = document.getElementById('btnIrParaPonto');
    if (btnAtalho) {
        btnAtalho.addEventListener('click', () => {
            const tStr = selecaoTarefa && selecaoTarefa.value === 'Aula Normal' ? (selecaoSubTarefa ? selecaoSubTarefa.value : '') : (txtTituloExtra ? txtTituloExtra.value.trim() : '');
            localStorage.setItem('tarefaAutomatica', tStr || 'Atividade Extra');
            localStorage.setItem('tipoRegistroAutomatica', selecaoTarefa ? selecaoTarefa.value : 'Aula Normal');
            window.location.href = '/ponto';
        });
    }
});

function atualizarData() {
    const elementoRelogio = document.getElementById("dataRelogio");
    if (elementoRelogio) {
        const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        elementoRelogio.textContent = new Date().toLocaleDateString('pt-BR', opcoes);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formFiltros'); const periodo = document.getElementById('periodoRapido');
  const inicio = document.getElementById('inicio'); const fim = document.getElementById('fim');
  const professor = document.getElementById('professorId'); const turma = document.getElementById('turmaFiltro');
  const status = document.getElementById('statusFiltro'); const busca = document.getElementById('busca');
  const tbody = document.getElementById('corpoRegistros');
  let registrosAtuais = []; let podeAjustar = false;
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  function iso(d) { return d.toISOString().slice(0, 10); }
  function aplicarPeriodo() {
    const hoje = new Date(); let ini = new Date(hoje); let final = hoje;
    if (periodo.value === 'mes') ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    else if (periodo.value === 'semana') { const dia = (hoje.getDay() + 6) % 7; ini.setDate(hoje.getDate() - dia); }
    else if (periodo.value === '30dias') ini.setDate(hoje.getDate() - 29);
    else if (periodo.value === 'todos') { inicio.value = fim.value = ''; return; }
    else if (periodo.value === 'custom') return;
    inicio.value = iso(ini); fim.value = iso(final);
  }
  periodo.addEventListener('change', () => { aplicarPeriodo(); carregar(); });
  inicio.addEventListener('change', () => periodo.value = 'custom'); fim.addEventListener('change', () => periodo.value = 'custom');

  async function opcoes() {
    try {
      const [tRes, pRes] = await Promise.all([hcFetch('/api/turmas'), hcFetch('/api/registros/professores/visiveis')]);
      const [turmas, professores] = await Promise.all([tRes.json(), pRes.json()]);
      turma.innerHTML = '<option value="">Todas</option>' + turmas.map(t => `<option value="${t.id}">${esc(t.codigo)} - ${esc(t.nome)}</option>`).join('');
      professor.innerHTML = '<option value="">Todos permitidos</option>' + professores.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('');
      if (professores.length <= 1) professor.closest('.hc-field').hidden = true;
    } catch (e) { hcToast(e.message, 'error'); }
  }
  function query() {
    const q = new URLSearchParams();
    if (inicio.value) q.set('inicio', inicio.value); if (fim.value) q.set('fim', fim.value);
    if (professor.value) q.set('professorId', professor.value); if (turma.value) q.set('turmaId', turma.value);
    if (status.value) q.set('status', status.value); if (busca.value.trim()) q.set('busca', busca.value.trim());
    return q.toString();
  }
  async function carregar() {
    tbody.innerHTML = '<tr><td colspan="9" class="hc-empty">Carregando registros...</td></tr>';
    try { const res = await hcFetch(`/api/registros?${query()}`); render(await res.json()); }
    catch (e) { tbody.innerHTML = `<tr><td colspan="9" class="hc-empty">${esc(e.message)}</td></tr>`; }
  }
  function render(registros) {
    registrosAtuais = registros;
    document.getElementById('totalRegistros').textContent = registros.length;
    const horas = registros.reduce((s, r) => s + Number(r.horasTrabalhadas || 0), 0); const valor = registros.reduce((s, r) => s + Number(r.valorCalculado || 0), 0);
    document.getElementById('totalHoras').textContent = `${horas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} h`; document.getElementById('totalValor').textContent = moeda.format(valor);
    if (!registros.length) { tbody.innerHTML = '<tr><td colspan="9" class="hc-empty">Nenhum registro para os filtros selecionados.</td></tr>'; return; }
    tbody.innerHTML = registros.map(r => `<tr><td>${esc(r.professor.nome)}</td><td><strong>${esc(r.turma ? r.turma.codigo : 'Extra')}</strong><br><span class="hc-muted">${esc(r.turma ? r.turma.nome : r.descricao || 'Atividade extra')}</span></td><td>${dataHora.format(new Date(r.entrada))}</td><td>${r.saida ? dataHora.format(new Date(r.saida)) : '—'}</td><td>${Number(r.horasTrabalhadas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td>${moeda.format(Number(r.valorCalculado || 0))}</td><td><span class="hc-status ${r.status === 'ABERTO' ? 'open' : 'closed'}">${r.status === 'ABERTO' ? 'Aberto' : 'Fechado'}${r.ajustado ? ' · ajustado' : ''}</span></td><td title="${esc(r.observacao || '')}">${esc(r.observacao || '—')}</td><td>${podeAjustar && r.status === 'FECHADO' ? `<button class="hc-btn secondary" data-ajustar="${r.id}">Ajustar</button>` : '—'}</td></tr>`).join('');
  }
  form.addEventListener('submit', e => { e.preventDefault(); carregar(); });
  document.getElementById('limparFiltros').addEventListener('click', () => { form.reset(); periodo.value = 'mes'; aplicarPeriodo(); carregar(); });
  document.addEventListener('hc:user-ready', e => { podeAjustar = e.detail.perfil !== 'PROFESSOR'; render(registrosAtuais); });
  const modal = document.getElementById('modalAjuste');
  document.addEventListener('click', e => { const id = e.target.closest('[data-ajustar]')?.dataset.ajustar; if (!id) return; const r = registrosAtuais.find(x => x.id === Number(id)); document.getElementById('ajusteId').value = id; document.getElementById('ajusteEntrada').value = r.entrada.slice(0,16); document.getElementById('ajusteSaida').value = r.saida.slice(0,16); document.getElementById('ajusteObservacao').value = r.observacao || ''; document.getElementById('ajusteJustificativa').value = ''; modal.classList.add('open'); });
  document.querySelector('[data-fechar-ajuste]').addEventListener('click', () => modal.classList.remove('open'));
  document.getElementById('formAjuste').addEventListener('submit', async e => { e.preventDefault(); const id = document.getElementById('ajusteId').value; try { await hcFetch(`/api/registros/${id}/ajustar`, { method:'PUT', body:JSON.stringify({ entrada:document.getElementById('ajusteEntrada').value, saida:document.getElementById('ajusteSaida').value, observacao:document.getElementById('ajusteObservacao').value, justificativa:document.getElementById('ajusteJustificativa').value }) }); hcToast('Registro ajustado e auditado.'); modal.classList.remove('open'); await carregar(); } catch(err) { hcToast(err.message,'error'); } });
  function esc(v) { const d = document.createElement('div'); d.textContent = v ?? ''; return d.innerHTML; }
  aplicarPeriodo(); opcoes().then(carregar);
});

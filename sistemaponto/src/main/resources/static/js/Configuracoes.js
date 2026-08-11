document.addEventListener('hc:user-ready', e => {
  const u = e.detail; document.getElementById('nomeConta').value = u.nome || ''; document.getElementById('emailConta').value = u.email || '';
  document.getElementById('matriculaConta').value = u.matricula || 'Não informada'; document.getElementById('perfilConta').value = (u.perfil || '').replaceAll('_', ' ');
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('formSenha').addEventListener('submit', async e => {
    e.preventDefault(); const btn = e.currentTarget.querySelector('button'); btn.disabled = true;
    try { const res = await hcFetch('/api/conta/senha', { method: 'POST', body: JSON.stringify({ senhaAtual: document.getElementById('senhaAtual').value, novaSenha: document.getElementById('novaSenha').value }) }); const body = await res.json(); hcToast(body.mensagem); e.currentTarget.reset(); }
    catch (error) { hcToast(error.message, 'error'); } finally { btn.disabled = false; }
  });
});

(() => {
  const root = document.documentElement;
  const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
  const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

  window.hcFetch = async (url, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (csrfToken && csrfHeader && !['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase())) headers.set(csrfHeader, csrfToken);
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let message = `Erro ${response.status}`;
      try { const body = await response.json(); message = body.mensagem || body.message || message; } catch (_) {}
      throw new Error(message);
    }
    return response;
  };

  window.hcToast = (message, type = 'success') => {
    let toast = document.querySelector('.hc-toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'hc-toast'; document.body.appendChild(toast); }
    toast.textContent = message; toast.className = `hc-toast ${type === 'error' ? 'error' : ''} show`;
    clearTimeout(window.__hcToastTimer);
    window.__hcToastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
  };

  const themeOrder = ['system', 'light', 'dark'];
  const labels = { system: 'Tema: sistema', light: 'Tema: claro', dark: 'Tema: escuro' };
  function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem('hc-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☾' : theme === 'light' ? '☀' : '◐';
      btn.setAttribute('aria-label', labels[theme]); btn.title = labels[theme];
    });
    document.querySelectorAll('[data-theme-select]').forEach(select => select.value = theme);
  }
  applyTheme(localStorage.getItem('hc-theme') || 'system');
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const current = root.dataset.theme || 'system';
    applyTheme(themeOrder[(themeOrder.indexOf(current) + 1) % themeOrder.length]);
  });
  document.addEventListener('change', e => { if (e.target.matches('[data-theme-select]')) applyTheme(e.target.value); });

  const seletorPreenchimento = 'button, a.hc-btn';
  function botaoDoEfeito(alvo) { return alvo instanceof Element ? alvo.closest(seletorPreenchimento) : null; }
  function posicionarPreenchimento(botao, evento) {
    const area = botao.getBoundingClientRect();
    const x = Math.max(0, Math.min(area.width, evento.clientX - area.left));
    const y = Math.max(0, Math.min(area.height, evento.clientY - area.top));
    botao.style.setProperty('--hc-fill-x', `${x}px`);
    botao.style.setProperty('--hc-fill-y', `${y}px`);
    return Math.ceil(Math.hypot(area.width, area.height) * 1.15);
  }
  document.addEventListener('pointerover', evento => {
    const botao = botaoDoEfeito(evento.target);
    if (!botao || botao.disabled || evento.pointerType === 'touch' || botao.contains(evento.relatedTarget)) return;
    botao.classList.add('hc-fill-button');
    const raio = posicionarPreenchimento(botao, evento);
    botao.style.setProperty('--hc-fill-radius', '0px');
    requestAnimationFrame(() => requestAnimationFrame(() => botao.style.setProperty('--hc-fill-radius', `${raio}px`)));
  });
  document.addEventListener('pointerout', evento => {
    const botao = botaoDoEfeito(evento.target);
    if (!botao || evento.pointerType === 'touch' || botao.contains(evento.relatedTarget)) return;
    posicionarPreenchimento(botao, evento);
    botao.style.setProperty('--hc-fill-radius', '0px');
  });

  document.addEventListener('DOMContentLoaded', async () => {
    if (location.pathname === '/login' || location.pathname === '/') return;
    try {
      const response = await window.hcFetch('/api/conta');
      const user = await response.json();
      window.hcUser = user;
      document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.nome);
      document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);
      document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = (user.perfil || 'PROFESSOR').replaceAll('_', ' '));
      document.querySelectorAll('[data-role="ADMIN"]').forEach(el => el.hidden = user.perfil !== 'ADMIN');
      document.querySelectorAll('[data-role-global]').forEach(el => el.hidden = !['ADMIN', 'COORDENADOR_EIXO', 'COORDENADOR_NUCLEO'].includes(user.perfil));
      document.dispatchEvent(new CustomEvent('hc:user-ready', { detail: user }));
    } catch (error) {
      if (!location.pathname.includes('/login') && location.pathname !== '/') console.error(error);
    }
  });
})();

document.addEventListener('DOMContentLoaded', () => {
    const seletorBotao = 'button, .btn-tabela-ver-mais';

    function encontrarBotao(alvo) {
        return alvo instanceof Element ? alvo.closest(seletorBotao) : null;
    }

    function posicionarEfeito(botao, evento) {
        const area = botao.getBoundingClientRect();
        const x = Math.max(0, Math.min(area.width, evento.clientX - area.left));
        const y = Math.max(0, Math.min(area.height, evento.clientY - area.top));
        botao.style.setProperty('--hc-fill-x', `${x}px`);
        botao.style.setProperty('--hc-fill-y', `${y}px`);
        return Math.ceil(Math.hypot(area.width, area.height) * 1.15);
    }

    document.addEventListener('pointerover', evento => {
        const botao = encontrarBotao(evento.target);
        if (!botao || botao.disabled || evento.pointerType === 'touch' || botao.contains(evento.relatedTarget)) return;

        botao.classList.add('hc-fill-button');
        const raio = posicionarEfeito(botao, evento);
        botao.style.setProperty('--hc-fill-radius', '0px');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => botao.style.setProperty('--hc-fill-radius', `${raio}px`));
        });
    });

    document.addEventListener('pointerout', evento => {
        const botao = encontrarBotao(evento.target);
        if (!botao || evento.pointerType === 'touch' || botao.contains(evento.relatedTarget)) return;

        posicionarEfeito(botao, evento);
        botao.style.setProperty('--hc-fill-radius', '0px');
    });
});

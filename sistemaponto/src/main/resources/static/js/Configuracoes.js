document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formConfiguracoes");

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault(); 
            const novaSenha = document.getElementById("novaSenha").value;

            if (novaSenha && novaSenha.length < 6) {
                alert("A nova senha deve conter pelo menos 6 caracteres.");
                return;
            }

            alert("Configurações atualizadas com sucesso! 🚀");
            document.getElementById("senhaAtual").value = "";
            document.getElementById("novaSenha").value = "";
        });
    }

    document.querySelectorAll('.item-menu-config-page').forEach(item => {
        item.addEventListener('click', () => {
            const label = item.querySelector('span').textContent.trim();
            if (label === 'Meu Perfil') window.location.href = 'MeuPerfil.html';
            else if (label === 'Meu Ponto') window.location.href = 'MeuPonto.html';
            else if (label === 'Configurações') window.location.href = 'Configuracoes.html';
        });
    });
});

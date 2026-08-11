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
});

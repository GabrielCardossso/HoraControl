package com.example.sistemaponto.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

  // Como o formulário de login está dentro da sua homepage,
  // acessar /login vai renderizar o arquivo homepage.html
  @GetMapping("/login")
  public String login() {
    return "homepage"; // 👈 Nome exato do arquivo: homepage.html
  }

  // Rota raiz também carrega a página inicial
  @GetMapping("/")
  public String index() {
    return "homepage"; // 👈 Ajustado para minúsculas
  }

  // Rota para a tela de Perfil
  @GetMapping("/perfil")
  public String meuPerfil() {
    return "MeuPerfil"; // 👈 Nome exato do seu arquivo: MeuPerfil.html
  }

  // Rota para a tela de Bater Ponto
  @GetMapping("/ponto")
  public String meuPonto() {
    return "MeuPonto"; // 👈 Nome exato do seu arquivo: MeuPonto.html
  }

  // Rota para as Configurações
  @GetMapping("/configuracoes")
  public String configuracoes() {
    return "Configuracoes"; // 👈 Nome exato do seu arquivo: Configuracoes.html
  }

  @GetMapping("/usuarios")
  public String usuarios() { return "Usuarios"; }

  @GetMapping("/gestao-turmas")
  public String turmas() { return "Turmas"; }

  @GetMapping("/relatorios")
  public String relatorios() { return "Relatorios"; }
}

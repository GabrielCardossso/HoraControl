package com.example.sistemaponto;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAccessTests {
  @Autowired MockMvc mvc;

  @Test void redirecionaAnonimoParaLogin() throws Exception {
    mvc.perform(get("/perfil")).andExpect(status().is3xxRedirection());
  }

  @Test @WithMockUser(roles = "PROFESSOR")
  void professorNaoAcessaGestaoDeUsuarios() throws Exception {
    mvc.perform(get("/usuarios")).andExpect(status().isForbidden());
  }

  @Test @WithMockUser(roles = "ADMIN")
  void adminAcessaGestaoDeUsuarios() throws Exception {
    mvc.perform(get("/usuarios")).andExpect(status().isOk()).andExpect(view().name("Usuarios"));
  }

  @Test @WithMockUser(roles = "ADMIN")
  void adminAcessaGestaoDeTurmas() throws Exception {
    mvc.perform(get("/gestao-turmas")).andExpect(status().isOk()).andExpect(view().name("Turmas"));
  }

  @Test @WithMockUser(roles = "PROFESSOR")
  void professorNaoAcessaRelatoriosAdministrativos() throws Exception {
    mvc.perform(get("/relatorios")).andExpect(status().isForbidden());
  }

  @Test @WithMockUser(roles = "ADMIN")
  void adminAcessaRelatoriosAdministrativos() throws Exception {
    mvc.perform(get("/relatorios")).andExpect(status().isOk()).andExpect(view().name("Relatorios"));
  }

  @Test @WithMockUser(roles = "ADMIN")
  void exportacaoExcelNaoExisteMais() throws Exception {
    mvc.perform(get("/api/relatorios/excel")).andExpect(status().isNotFound());
  }
}

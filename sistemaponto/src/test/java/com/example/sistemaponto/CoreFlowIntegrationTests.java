package com.example.sistemaponto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.entity.Curso;
import com.example.sistemaponto.entity.Turma;
import com.example.sistemaponto.enums.Perfil;
import com.example.sistemaponto.repository.CursoRepository;
import com.example.sistemaponto.repository.ProfessorRepository;
import com.example.sistemaponto.repository.TurmaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CoreFlowIntegrationTests {
  @Autowired MockMvc mvc;
  @Autowired ProfessorRepository professores;
  @Autowired TurmaRepository turmas;
  @Autowired CursoRepository cursos;
  @Autowired PasswordEncoder encoder;
  @Autowired ObjectMapper mapper;

  @Test void fluxoCompletoAbreEFechaPontoNoBanco() throws Exception {
    Professor professor = new Professor(); professor.setNome("Professor Integração"); professor.setEmail("integracao@teste.local"); professor.setSenha(encoder.encode("123456")); professor.setPerfil(Perfil.PROFESSOR); professor.setAtivo(true); professor = professores.save(professor);
    Turma turma = new Turma(); turma.setCodigo("INT-01"); turma.setNome("Turma Integração"); turma.setAtivo(true); turma = turmas.save(turma);
    professor.getTurmas().add(turma); professor = professores.save(professor);

    mvc.perform(get("/api/registros/turmas-permitidas").with(user(professor.getEmail()).roles("PROFESSOR")))
        .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].id").value(turma.getId()));

    String resposta = mvc.perform(post("/api/registros/abrir").with(user(professor.getEmail()).roles("PROFESSOR")).with(csrf())
        .contentType("application/json").content("{\"tipo\":\"AULA_NORMAL\",\"turmaId\":" + turma.getId() + ",\"observacao\":\"Teste\"}"))
        .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ABERTO")).andReturn().getResponse().getContentAsString();
    JsonNode json = mapper.readTree(resposta);
    mvc.perform(post("/api/registros/" + json.get("id").asLong() + "/fechar").with(user(professor.getEmail()).roles("PROFESSOR")).with(csrf()))
        .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("FECHADO"))
        .andExpect(jsonPath("$.saida").isNotEmpty())
        .andExpect(jsonPath("$.valorCalculado").doesNotExist());
  }

  @Test void adminCriaContaComSenhaProtegida() throws Exception {
    mvc.perform(post("/api/admin/usuarios").with(user("admin@teste.local").roles("ADMIN")).with(csrf())
        .contentType("application/json").content("{\"nome\":\"Nova Professora\",\"email\":\"nova@teste.local\",\"perfil\":\"PROFESSOR\",\"senha\":\"segura123\",\"ativo\":true}"))
        .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("nova@teste.local")).andExpect(jsonPath("$.senha").doesNotExist());
    Professor salvo = professores.findByEmailIgnoreCase("nova@teste.local").orElseThrow();
    assertThat(encoder.matches("segura123", salvo.getSenha())).isTrue();
  }

  @Test void editarCursoAtualizaDadosExibidosPelaTurmaVinculada() throws Exception {
    Curso curso = new Curso(); curso.setCodigo("TDS"); curso.setNome("Nome antigo"); curso.setAtivo(true); curso = cursos.save(curso);
    Turma turma = new Turma(); turma.setCodigo("TDS-02"); turma.setNome("Turma vinculada"); turma.setCurso(curso); turma.setAtivo(true); turma = turmas.save(turma);

    mvc.perform(put("/api/cursos/" + curso.getId()).with(user("admin@teste.local").roles("ADMIN")).with(csrf())
        .contentType("application/json").content("{\"codigo\":\"TDS-NOVO\",\"nome\":\"Nome corrigido\",\"ativo\":true}"))
        .andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Nome corrigido"));

    mvc.perform(get("/api/turmas/" + turma.getId()).with(user("admin@teste.local").roles("ADMIN")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.valorHora").doesNotExist())
        .andExpect(jsonPath("$.curso.codigo").value("TDS-NOVO"))
        .andExpect(jsonPath("$.curso.nome").value("Nome corrigido"));
  }
}

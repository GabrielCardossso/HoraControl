document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalUsuario");
  const form = document.getElementById("formUsuario");
  const tbody = document.getElementById("corpoUsuarios");
  const formFiltros = document.getElementById("formFiltrosUsuarios");
  let usuarios = [];
  let cursos = [];
  let turmas = [];
  const esc = (v) => {
    const d = document.createElement("div");
    d.textContent = v ?? "";
    return d.innerHTML;
  };
  async function carregar() {
    try {
      const [u, c, t] = await Promise.all([
        hcFetch("/api/admin/usuarios"),
        hcFetch("/api/cursos/todos"),
        hcFetch("/api/turmas/todas"),
      ]);
      [usuarios, cursos, turmas] = await Promise.all([
        u.json(),
        c.json(),
        t.json(),
      ]);
      popularOpcoes();
      render();
    } catch (e) {
      hcToast(e.message, "error");
    }
  }
  function render() {
    const busca = val("filtroUsuarioBusca").toLocaleLowerCase("pt-BR");
    const perfil = val("filtroUsuarioPerfil");
    const cursoId = Number(val("filtroUsuarioCurso")) || null;
    const turmaId = Number(val("filtroUsuarioTurma")) || null;
    const status = val("filtroUsuarioStatus");
    const ordem = val("filtroUsuarioOrdem") || "az";
    const lista = usuarios
      .filter((u) => {
        const texto = `${u.nome || ""} ${u.matricula || ""} ${u.email || ""}`.toLocaleLowerCase("pt-BR");
        const cursosDoUsuario = new Set([
          u.cursoResponsavel?.id,
          ...(u.turmas || []).map((t) => t.curso?.id),
        ]);
        return (
          (!busca || texto.includes(busca)) &&
          (!perfil || u.perfil === perfil) &&
          (!cursoId || cursosDoUsuario.has(cursoId)) &&
          (!turmaId || (u.turmas || []).some((t) => t.id === turmaId)) &&
          (!status || String(u.ativo) === status)
        );
      })
      .sort((a, b) => {
        if (ordem === "recentes")
          return new Date(b.dataCriacao || 0) - new Date(a.dataCriacao || 0);
        const comparacao = (a.nome || "").localeCompare(b.nome || "", "pt-BR");
        return ordem === "za" ? -comparacao : comparacao;
      });
    if (!lista.length) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="hc-empty">Nenhum usuário encontrado.</td></tr>';
      return;
    }
    tbody.innerHTML = lista
      .map(
        (u) =>
          `<tr><td data-label="Nome"><strong>${esc(u.nome)}</strong></td><td data-label="Matrícula">${esc(u.matricula || "—")}</td><td data-label="E-mail">${esc(u.email)}</td><td data-label="Perfil">${esc((u.perfil || "").replaceAll("_", " "))}</td><td data-label="Curso/escopo">${esc(u.cursoResponsavel?.nome || (["ADMIN", "COORDENADOR_EIXO", "COORDENADOR_NUCLEO"].includes(u.perfil) ? "Geral" : "Próprio"))}</td><td data-label="Status"><span class="hc-status ${u.ativo ? "closed" : "open"}">${u.ativo ? "Ativo" : "Inativo"}</span></td><td data-label="Ações"><button class="hc-btn secondary" data-editar="${u.id}"><i class="fi fi-rr-edit" aria-hidden="true"></i>Editar</button></td></tr>`,
      )
      .join("");
  }
  function popularOpcoes() {
    const filtroCursoAtual = document.getElementById("filtroUsuarioCurso").value;
    const filtroTurmaAtual = document.getElementById("filtroUsuarioTurma").value;
    document.getElementById("cursoResponsavelId").innerHTML =
      '<option value="">Nenhum/escopo geral</option>' +
      cursos
        .map(
          (c) =>
            `<option value="${c.id}">${esc(c.codigo)} - ${esc(c.nome)}</option>`,
        )
        .join("");
    document.getElementById("turmaIds").innerHTML = turmas
      .map(
        (t) =>
          `<option value="${t.id}">${esc(t.codigo)} - ${esc(t.nome)}</option>`,
      )
      .join("");
    document.getElementById("filtroUsuarioCurso").innerHTML =
      '<option value="">Todos</option>' +
      cursos.map((c) => `<option value="${c.id}">${esc(c.codigo)} - ${esc(c.nome)}</option>`).join("");
    document.getElementById("filtroUsuarioTurma").innerHTML =
      '<option value="">Todas</option>' +
      turmas.map((t) => `<option value="${t.id}">${esc(t.codigo)} - ${esc(t.nome)}</option>`).join("");
    document.getElementById("filtroUsuarioCurso").value = filtroCursoAtual;
    document.getElementById("filtroUsuarioTurma").value = filtroTurmaAtual;
  }
  function abrir(u = null) {
    form.reset();
    document.getElementById("usuarioId").value = u?.id || "";
    document.getElementById("tituloModal").textContent = u
      ? "Editar usuário"
      : "Novo usuário";
    document.getElementById("senha").required = !u;
    document.getElementById("senhaAjuda").textContent = u
      ? "(deixe vazio para manter)"
      : "";
    if (u) {
      ["nome", "matricula", "cpf", "telefone", "email", "perfil"].forEach(
        (k) => (document.getElementById(k).value = u[k] || ""),
      );
      document.getElementById("ativo").value = String(u.ativo);
      document.getElementById("cursoResponsavelId").value =
        u.cursoResponsavel?.id || "";
      const ids = new Set((u.turmas || []).map((t) => t.id));
      [...document.getElementById("turmaIds").options].forEach(
        (o) => (o.selected = ids.has(Number(o.value))),
      );
    }
    modal.classList.add("open");
    document.getElementById("nome").focus();
  }
  document
    .getElementById("novoUsuario")
    .addEventListener("click", () => abrir());
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-fechar]")) modal.classList.remove("open");
    const id = e.target.closest("[data-editar]")?.dataset.editar;
    if (id) abrir(usuarios.find((u) => u.id === Number(id)));
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("usuarioId").value;
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    const body = {
      nome: val("nome"),
      matricula: val("matricula"),
      cpf: val("cpf"),
      telefone: val("telefone"),
      email: val("email"),
      perfil: val("perfil"),
      senha: val("senha") || null,
      ativo: val("ativo") === "true",
      cursoResponsavelId: Number(val("cursoResponsavelId")) || null,
      turmaIds: [...document.getElementById("turmaIds").selectedOptions].map(
        (o) => Number(o.value),
      ),
    };
    try {
      await hcFetch(id ? `/api/admin/usuarios/${id}` : "/api/admin/usuarios", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      hcToast("Usuário salvo com sucesso.");
      modal.classList.remove("open");
      await carregar();
    } catch (err) {
      hcToast(err.message, "error");
    } finally {
      btn.disabled = false;
    }
  });
  formFiltros.addEventListener("submit", (e) => {
    e.preventDefault();
    hcSetFiltersActive("filtrosUsuarios", temFiltros());
    hcCloseFilters("filtrosUsuarios");
    render();
  });
  document.querySelectorAll("[data-limpar-usuarios]").forEach((button) =>
    button.addEventListener("click", () => {
      formFiltros.reset();
      hcSetFiltersActive("filtrosUsuarios", false);
      hcCloseFilters("filtrosUsuarios");
      render();
    }),
  );
  function temFiltros() {
    return Boolean(
      val("filtroUsuarioBusca") ||
        val("filtroUsuarioPerfil") ||
        val("filtroUsuarioCurso") ||
        val("filtroUsuarioTurma") ||
        val("filtroUsuarioStatus") ||
        val("filtroUsuarioOrdem") === "za" ||
        val("filtroUsuarioOrdem") === "recentes",
    );
  }
  function val(id) {
    return document.getElementById(id).value.trim();
  }
  carregar();
});

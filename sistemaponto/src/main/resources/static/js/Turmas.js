document.addEventListener("DOMContentLoaded", () => {
  const modalCurso = document.getElementById("modalCurso");
  const modalTurma = document.getElementById("modalTurma");
  const formCurso = document.getElementById("formCurso");
  const formTurma = document.getElementById("formTurma");
  const formFiltrosCursos = document.getElementById("formFiltrosCursos");
  const formFiltrosTurmas = document.getElementById("formFiltrosTurmas");
  let cursos = [];
  let turmas = [];

  const esc = (valor) => {
    const div = document.createElement("div");
    div.textContent = valor ?? "";
    return div.innerHTML;
  };

  async function carregar() {
    try {
      const [respostaCursos, respostaTurmas] = await Promise.all([
        hcFetch("/api/cursos/todos"),
        hcFetch("/api/turmas/todas"),
      ]);
      [cursos, turmas] = await Promise.all([
        respostaCursos.json(),
        respostaTurmas.json(),
      ]);
      renderizar();
    } catch (erro) {
      hcToast(erro.message, "error");
    }
  }

  function renderizar() {
    const filtroTurmaCursoAtual = val("filtroTurmaCurso");
    document.getElementById("cursoTurma").innerHTML =
      '<option value="">Sem curso</option>' +
      cursos
        .map(
          (curso) =>
            `<option value="${curso.id}"${curso.ativo ? "" : " disabled"}>${esc(curso.codigo)} - ${esc(curso.nome)}${curso.ativo ? "" : " (inativo)"}</option>`,
        )
        .join("");
    document.getElementById("filtroTurmaCurso").innerHTML =
      '<option value="">Todos</option>' +
      cursos
        .map(
          (curso) =>
            `<option value="${curso.id}">${esc(curso.codigo)} - ${esc(curso.nome)}</option>`,
        )
        .join("");
    set("filtroTurmaCurso", filtroTurmaCursoAtual);

    const cursosExibidos = filtrarCursos();
    document.getElementById("listaCursos").innerHTML = cursosExibidos.length
      ? cursosExibidos
          .map((curso) => {
            const vinculadas = turmas.filter(
              (turma) => turma.curso?.id === curso.id,
            ).length;
            return `<div class="hc-management-item">
              <div>
                <div class="hc-management-title"><strong>${esc(curso.codigo)}</strong><span class="hc-status ${curso.ativo ? "closed" : "open"}">${curso.ativo ? "Ativo" : "Inativo"}</span></div>
                <p>${esc(curso.nome)}</p>
                <small class="hc-muted">${vinculadas} ${vinculadas === 1 ? "turma vinculada" : "turmas vinculadas"}</small>
              </div>
              <button class="hc-btn secondary" type="button" data-editar-curso="${curso.id}"><i class="fi fi-rr-edit" aria-hidden="true"></i>Editar</button>
            </div>`;
          })
          .join("")
      : '<p class="hc-muted">Nenhum curso encontrado.</p>';

    const turmasExibidas = filtrarTurmas();
    document.getElementById("corpoTurmas").innerHTML = turmasExibidas.length
      ? turmasExibidas
          .map(
            (turma) =>
              `<tr><td data-label="Código"><strong>${esc(turma.codigo)}</strong></td><td data-label="Turma">${esc(turma.nome)}</td><td data-label="Curso">${esc(turma.curso?.nome || "—")}</td><td data-label="Período/turno">${esc(turma.periodo || "—")} / ${esc(turma.turno || "—")}</td><td data-label="Carga prevista">${turma.cargaHorariaPrevista == null ? "—" : hcFormatHours(turma.cargaHorariaPrevista)}</td><td data-label="Status"><span class="hc-status ${turma.ativo ? "closed" : "open"}">${turma.ativo ? "Ativa" : "Inativa"}</span></td><td data-label="Ação"><button class="hc-btn secondary" type="button" data-editar-turma="${turma.id}"><i class="fi fi-rr-edit" aria-hidden="true"></i>Editar</button></td></tr>`,
          )
          .join("")
      : '<tr><td colspan="7" class="hc-empty">Nenhuma turma encontrada.</td></tr>';
  }

  function filtrarCursos() {
    const busca = val("filtroCursoBusca").toLocaleLowerCase("pt-BR");
    const status = val("filtroCursoStatus");
    const ordem = val("filtroCursoOrdem") || "az";
    return [...cursos]
      .filter((curso) => {
        const texto = `${curso.codigo || ""} ${curso.nome || ""}`.toLocaleLowerCase("pt-BR");
        return (!busca || texto.includes(busca)) && (!status || String(curso.ativo) === status);
      })
      .sort((a, b) => {
        const campo = ordem === "codigo" ? "codigo" : "nome";
        const comparacao = (a[campo] || "").localeCompare(b[campo] || "", "pt-BR");
        return ordem === "za" ? -comparacao : comparacao;
      });
  }

  function filtrarTurmas() {
    const busca = val("filtroTurmaBusca").toLocaleLowerCase("pt-BR");
    const cursoId = Number(val("filtroTurmaCurso")) || null;
    const turno = val("filtroTurmaTurno");
    const status = val("filtroTurmaStatus");
    const cargaMinima = val("filtroCargaMinima") === "" ? null : Number(val("filtroCargaMinima"));
    const cargaMaxima = val("filtroCargaMaxima") === "" ? null : Number(val("filtroCargaMaxima"));
    const ordem = val("filtroTurmaOrdem") || "az";
    return [...turmas]
      .filter((turma) => {
        const texto = `${turma.codigo || ""} ${turma.nome || ""}`.toLocaleLowerCase("pt-BR");
        const carga = turma.cargaHorariaPrevista == null ? null : Number(turma.cargaHorariaPrevista);
        return (
          (!busca || texto.includes(busca)) &&
          (!cursoId || turma.curso?.id === cursoId) &&
          (!turno || turma.turno === turno) &&
          (!status || String(turma.ativo) === status) &&
          (cargaMinima == null || (carga != null && carga >= cargaMinima)) &&
          (cargaMaxima == null || (carga != null && carga <= cargaMaxima))
        );
      })
      .sort((a, b) => {
        if (ordem === "cargaAsc" || ordem === "cargaDesc") {
          const comparacao = Number(a.cargaHorariaPrevista ?? 0) - Number(b.cargaHorariaPrevista ?? 0);
          return ordem === "cargaDesc" ? -comparacao : comparacao;
        }
        const comparacao = (a.nome || "").localeCompare(b.nome || "", "pt-BR");
        return ordem === "za" ? -comparacao : comparacao;
      });
  }

  function abrirCurso(curso = null) {
    formCurso.reset();
    set("cursoId", curso?.id || "");
    set("codigoCurso", curso?.codigo || "");
    set("nomeCurso", curso?.nome || "");
    set("ativoCurso", String(curso?.ativo ?? true));
    document.getElementById("tituloModalCurso").textContent = curso
      ? "Editar curso"
      : "Novo curso";

    const aviso = document.getElementById("avisoCursoVinculado");
    const vinculadas = curso
      ? turmas.filter((turma) => turma.curso?.id === curso.id).length
      : 0;
    aviso.hidden = vinculadas === 0;
    aviso.textContent = vinculadas
      ? `Este curso está vinculado a ${vinculadas} ${vinculadas === 1 ? "turma" : "turmas"}. Ao salvar, todas passarão a exibir automaticamente o código e o nome corrigidos.`
      : "";

    abrirModal(modalCurso, "codigoCurso");
  }

  function abrirTurma(turma = null) {
    formTurma.reset();
    set("turmaId", turma?.id || "");
    set("codigoTurma", turma?.codigo || "");
    set("nomeTurma", turma?.nome || "");
    set("cursoTurma", turma?.curso?.id || "");
    set("turnoTurma", turma?.turno || "Manhã");
    set("periodoTurma", turma?.periodo || "");
    set("cargaHoraria", turma?.cargaHorariaPrevista || "");
    set("ativoTurma", String(turma?.ativo ?? true));
    set("dataInicio", turma?.dataInicio || "");
    set("dataFim", turma?.dataFim || "");
    document.getElementById("tituloModalTurma").textContent = turma
      ? "Editar turma"
      : "Nova turma";
    abrirModal(modalTurma, "codigoTurma");
  }

  function abrirModal(modal, campoFoco) {
    modal.classList.add("open");
    requestAnimationFrame(() => document.getElementById(campoFoco).focus());
  }

  function fecharModal(modal) {
    modal.classList.remove("open");
  }

  document.getElementById("novoCurso").addEventListener("click", () =>
    abrirCurso(),
  );
  document.getElementById("novaTurma").addEventListener("click", () =>
    abrirTurma(),
  );

  document.addEventListener("click", (evento) => {
    if (evento.target.matches("[data-fechar-modal]")) {
      fecharModal(evento.target.closest(".hc-modal"));
      return;
    }
    const cursoId = evento.target.closest("[data-editar-curso]")?.dataset
      .editarCurso;
    if (cursoId) {
      abrirCurso(cursos.find((curso) => curso.id === Number(cursoId)));
      return;
    }
    const turmaId = evento.target.closest("[data-editar-turma]")?.dataset
      .editarTurma;
    if (turmaId)
      abrirTurma(turmas.find((turma) => turma.id === Number(turmaId)));
  });

  [modalCurso, modalTurma].forEach((modal) =>
    modal.addEventListener("click", (evento) => {
      if (evento.target === modal) fecharModal(modal);
    }),
  );
  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    [modalCurso, modalTurma].forEach(fecharModal);
  });

  formCurso.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const id = val("cursoId");
    const vinculadas = id
      ? turmas.filter((turma) => turma.curso?.id === Number(id)).length
      : 0;
    if (
      vinculadas &&
      !window.confirm(
        `Este curso possui ${vinculadas} ${vinculadas === 1 ? "turma vinculada" : "turmas vinculadas"}. Deseja salvar e atualizar a identificação do curso nessas turmas?`,
      )
    )
      return;

    const botao = formulario.querySelector('button[type="submit"]');
    botao.disabled = true;
    try {
      await hcFetch(id ? `/api/cursos/${id}` : "/api/cursos", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({
          codigo: val("codigoCurso"),
          nome: val("nomeCurso"),
          ativo: val("ativoCurso") === "true",
        }),
      });
      formulario.reset();
      fecharModal(modalCurso);
      await carregar();
      hcToast(id ? "Curso atualizado com sucesso." : "Curso cadastrado com sucesso.");
    } catch (erro) {
      hcToast(erro.message, "error");
    } finally {
      botao.disabled = false;
    }
  });

  formTurma.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const id = val("turmaId");
    const botao = formulario.querySelector('button[type="submit"]');
    botao.disabled = true;
    try {
      await hcFetch(id ? `/api/turmas/${id}` : "/api/turmas", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({
          codigo: val("codigoTurma"),
          nome: val("nomeTurma"),
          curso: val("cursoTurma")
            ? { id: Number(val("cursoTurma")) }
            : null,
          turno: val("turnoTurma"),
          periodo: val("periodoTurma"),
          cargaHorariaPrevista: val("cargaHoraria")
            ? Number(val("cargaHoraria"))
            : null,
          ativo: val("ativoTurma") === "true",
          dataInicio: val("dataInicio") || null,
          dataFim: val("dataFim") || null,
        }),
      });
      formulario.reset();
      fecharModal(modalTurma);
      await carregar();
      hcToast(id ? "Turma atualizada com sucesso." : "Turma cadastrada com sucesso.");
    } catch (erro) {
      hcToast(erro.message, "error");
    } finally {
      botao.disabled = false;
    }
  });

  formFiltrosCursos.addEventListener("submit", (evento) => {
    evento.preventDefault();
    hcSetFiltersActive("filtrosCursos", temFiltrosCursos());
    hcCloseFilters("filtrosCursos");
    renderizar();
  });
  document.querySelectorAll("[data-limpar-cursos]").forEach((button) =>
    button.addEventListener("click", () => {
      formFiltrosCursos.reset();
      hcSetFiltersActive("filtrosCursos", false);
      hcCloseFilters("filtrosCursos");
      renderizar();
    }),
  );
  formFiltrosTurmas.addEventListener("submit", (evento) => {
    evento.preventDefault();
    hcSetFiltersActive("filtrosTurmas", temFiltrosTurmas());
    hcCloseFilters("filtrosTurmas");
    renderizar();
  });
  document.querySelectorAll("[data-limpar-turmas]").forEach((button) =>
    button.addEventListener("click", () => {
      formFiltrosTurmas.reset();
      hcSetFiltersActive("filtrosTurmas", false);
      hcCloseFilters("filtrosTurmas");
      renderizar();
    }),
  );

  function temFiltrosCursos() {
    return Boolean(
      val("filtroCursoBusca") ||
        val("filtroCursoStatus") ||
        val("filtroCursoOrdem") === "za" ||
        val("filtroCursoOrdem") === "codigo",
    );
  }

  function temFiltrosTurmas() {
    return Boolean(
      val("filtroTurmaBusca") ||
        val("filtroTurmaCurso") ||
        val("filtroTurmaTurno") ||
        val("filtroTurmaStatus") ||
        val("filtroCargaMinima") ||
        val("filtroCargaMaxima") ||
        val("filtroTurmaOrdem") !== "az",
    );
  }

  function val(id) {
    return document.getElementById(id).value.trim();
  }

  function set(id, valor) {
    document.getElementById(id).value = valor ?? "";
  }

  carregar();
});

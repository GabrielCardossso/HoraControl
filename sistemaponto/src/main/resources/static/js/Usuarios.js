document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalUsuario");
  const form = document.getElementById("formUsuario");
  const tbody = document.getElementById("corpoUsuarios");
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
      render();
      popularOpcoes();
    } catch (e) {
      hcToast(e.message, "error");
    }
  }
  function render() {
    if (!usuarios.length) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="hc-empty">Nenhum usuário cadastrado.</td></tr>';
      return;
    }
    tbody.innerHTML = usuarios
      .map(
        (u) =>
          `<tr><td><strong>${esc(u.nome)}</strong></td><td>${esc(u.matricula || "—")}</td><td>${esc(u.email)}</td><td>${esc((u.perfil || "").replaceAll("_", " "))}</td><td>${esc(u.cursoResponsavel?.nome || (["ADMIN", "COORDENADOR_EIXO", "COORDENADOR_NUCLEO"].includes(u.perfil) ? "Geral" : "Próprio"))}</td><td><span class="hc-status ${u.ativo ? "closed" : "open"}">${u.ativo ? "Ativo" : "Inativo"}</span></td><td><button class="hc-btn secondary" data-editar="${u.id}">Editar</button></td></tr>`,
      )
      .join("");
  }
  function popularOpcoes() {
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
  function val(id) {
    return document.getElementById(id).value.trim();
  }
  carregar();
});

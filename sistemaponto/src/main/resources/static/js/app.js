(() => {
  const root = document.documentElement;
  const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
  const csrfHeader = document.querySelector(
    'meta[name="_csrf_header"]',
  )?.content;

  window.hcFetch = async (url, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    )
      headers.set("Content-Type", "application/json");
    if (
      csrfToken &&
      csrfHeader &&
      !["GET", "HEAD"].includes((options.method || "GET").toUpperCase())
    )
      headers.set(csrfHeader, csrfToken);
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let message = `Erro ${response.status}`;
      try {
        const body = await response.json();
        message = body.mensagem || body.message || message;
      } catch (_) {}
      throw new Error(message);
    }
    return response;
  };

  window.hcFormatMinutes = (value) => {
    const totalMinutes = Math.max(0, Math.round(Number(value) || 0));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}h${String(minutes).padStart(2, "0")}m`;
  };

  window.hcMinutesFromRecord = (record) =>
    record?.minutosTrabalhados != null &&
    Number.isFinite(Number(record.minutosTrabalhados))
      ? Number(record.minutosTrabalhados)
      : Math.round(Number(record?.horasTrabalhadas || 0) * 60);

  window.hcFormatHours = (value) =>
    window.hcFormatMinutes(Math.round(Number(value || 0) * 60));

  window.hcToast = (message, type = "success") => {
    let toast = document.querySelector(".hc-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "hc-toast";
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      document.body.appendChild(toast);
    }
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;
    toast.className = `hc-toast ${type === "error" ? "error" : ""} show`;
    clearTimeout(window.__hcToastTimer);
    window.__hcToastTimer = setTimeout(
      () => toast.classList.remove("show"),
      3600,
    );
  };

  window.hcSetFiltersActive = (root, active) => {
    const container =
      typeof root === "string" ? document.getElementById(root) : root;
    if (!container) return;
    container.dataset.filtersActive = String(Boolean(active));
    container
      .querySelectorAll("[data-filter-clear-active]")
      .forEach((button) => (button.hidden = !active));
    const badge = container.querySelector("[data-filter-active-badge]");
    if (badge) badge.hidden = !active;
  };

  window.hcOpenFilters = (root) => {
    const container =
      typeof root === "string" ? document.getElementById(root) : root;
    const panel = container?.querySelector("[data-filter-panel]");
    const toggle = container?.querySelector("[data-filter-toggle]");
    if (!panel || !toggle) return;
    container.__hcFilterTrigger = toggle;
    panel.hidden = false;
    panel.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("hc-modal-open");
    requestAnimationFrame(() => {
      const focusable =
        panel.querySelector(
          "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
        ) || panel.querySelector("button:not([disabled])");
      focusable?.focus();
    });
  };

  window.hcCloseFilters = (root, restoreFocus = true) => {
    const container =
      typeof root === "string" ? document.getElementById(root) : root;
    const panel = container?.querySelector("[data-filter-panel]");
    const toggle = container?.querySelector("[data-filter-toggle]");
    if (!panel || !toggle) return;
    panel.classList.remove("open");
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (!document.querySelector("[data-filter-panel].open"))
      document.body.classList.remove("hc-modal-open");
    if (restoreFocus) (container.__hcFilterTrigger || toggle).focus();
  };

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-filter-toggle]");
    if (toggle) {
      hcOpenFilters(toggle.closest("[data-filter-root]"));
      return;
    }
    const close = event.target.closest("[data-filter-close]");
    if (close) {
      hcCloseFilters(close.closest("[data-filter-root]"));
      return;
    }
    const panel = event.target.closest("[data-filter-panel]");
    if (panel && event.target === panel)
      hcCloseFilters(panel.closest("[data-filter-root]"));
  });

  document.addEventListener("keydown", (event) => {
    const openPanel = document.querySelector("[data-filter-panel].open");
    if (!openPanel) return;
    if (event.key === "Escape") {
      hcCloseFilters(openPanel.closest("[data-filter-root]"));
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [
      ...openPanel.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      ),
    ].filter((element) => !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const themeOrder = ["system", "light", "dark"];
  const labels = {
    system: "Tema: sistema",
    light: "Tema: claro",
    dark: "Tema: escuro",
  };
  function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem("hc-theme", theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      const icon =
        theme === "dark"
          ? "fi-rr-moon-stars"
          : theme === "light"
            ? "fi-rr-sun"
            : "fi-rr-computer";
      btn.innerHTML = `<i class="fi ${icon}" aria-hidden="true"></i>${btn.dataset.themeLabel ? "<span>Tema</span>" : ""}`;
      btn.setAttribute("aria-label", labels[theme]);
      btn.title = labels[theme];
    });
    document
      .querySelectorAll("[data-theme-select]")
      .forEach((select) => (select.value = theme));
  }
  applyTheme(localStorage.getItem("hc-theme") || "system");
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    const current = root.dataset.theme || "system";
    applyTheme(
      themeOrder[(themeOrder.indexOf(current) + 1) % themeOrder.length],
    );
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-theme-select]")) applyTheme(e.target.value);
  });

  function setupMobileNavigation() {
    const sidebar = document.querySelector(".hc-sidebar");
    const nav = sidebar?.querySelector(".hc-nav");
    if (!sidebar || !nav) return;

    window.__hcMobileNavCleanup?.();
    nav.querySelector(".hc-mobile-more-toggle")?.remove();
    nav
      .querySelectorAll(":scope > a")
      .forEach((link) => link.classList.remove("hc-mobile-extra"));
    document.getElementById("hcMobileMore")?.remove();
    if (!document.querySelector(".hc-modal.open"))
      document.body.classList.remove("hc-modal-open");

    const links = [...nav.querySelectorAll(":scope > a")].filter(
      (link) => !link.hidden,
    );
    const extraLinks = links.slice(4);
    extraLinks.forEach((link) => link.classList.add("hc-mobile-extra"));

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "hc-mobile-more-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "hcMobileMore");
    toggle.innerHTML =
      '<i class="fi fi-rr-menu-dots" aria-hidden="true"></i><span>Mais</span>';
    if (extraLinks.some((link) => link.getAttribute("aria-current") === "page"))
      toggle.setAttribute("aria-current", "page");
    nav.appendChild(toggle);

    const overlay = document.createElement("div");
    overlay.className = "hc-mobile-more";
    overlay.id = "hcMobileMore";
    overlay.hidden = true;
    overlay.innerHTML = `<div class="hc-mobile-more-panel" role="dialog" aria-modal="true" aria-labelledby="hcMobileMoreTitle">
      <div class="hc-mobile-more-head">
        <div><h2 id="hcMobileMoreTitle">Mais opções</h2><p>Acessos, aparência e sessão.</p></div>
        <button class="hc-btn secondary" type="button" data-mobile-more-close aria-label="Fechar menu"><i class="fi fi-rr-cross-small" aria-hidden="true"></i></button>
      </div>
      <nav class="hc-mobile-more-links" aria-label="Mais áreas do sistema"></nav>
      <div class="hc-mobile-more-actions"></div>
    </div>`;

    const linksContainer = overlay.querySelector(".hc-mobile-more-links");
    extraLinks.forEach((link) => {
      const clone = link.cloneNode(true);
      clone.hidden = false;
      clone.classList.remove("hc-mobile-extra");
      clone.removeAttribute("data-role");
      linksContainer.appendChild(clone);
    });
    if (!extraLinks.length) linksContainer.hidden = true;

    const actions = overlay.querySelector(".hc-mobile-more-actions");
    const themeButton = sidebar.querySelector("[data-theme-toggle]")?.cloneNode(true);
    if (themeButton) {
      themeButton.className = "hc-btn secondary hc-mobile-more-action";
      themeButton.dataset.themeLabel = "true";
      actions.appendChild(themeButton);
    }
    const logoutForm = sidebar.querySelector(".hc-sidebar-footer form")?.cloneNode(true);
    if (logoutForm) {
      logoutForm.className = "hc-mobile-logout-form";
      actions.appendChild(logoutForm);
    }
    document.body.appendChild(overlay);
    applyTheme(root.dataset.theme || "system");

    const close = (restoreFocus = true) => {
      overlay.classList.remove("open");
      overlay.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      if (!document.querySelector(".hc-modal.open"))
        document.body.classList.remove("hc-modal-open");
      if (restoreFocus) toggle.focus();
    };
    const open = () => {
      overlay.hidden = false;
      overlay.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("hc-modal-open");
      requestAnimationFrame(() =>
        overlay
          .querySelector(
            ".hc-mobile-more-links a, [data-theme-toggle], .hc-logout",
          )
          ?.focus(),
      );
    };
    const onToggle = () =>
      overlay.classList.contains("open") ? close() : open();
    const onOverlayClick = (event) => {
      if (event.target === overlay || event.target.closest("[data-mobile-more-close]"))
        close();
    };
    const onKeydown = (event) => {
      if (!overlay.classList.contains("open")) return;
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...overlay.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])',
        ),
      ].filter((element) => !element.hidden);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 980 && overlay.classList.contains("open"))
        close(false);
    };
    toggle.addEventListener("click", onToggle);
    overlay.addEventListener("click", onOverlayClick);
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", onResize);
    window.__hcMobileNavCleanup = () => {
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", onResize);
    };
  }

  const seletorPreenchimento = "button, a.hc-btn";
  function botaoDoEfeito(alvo) {
    return alvo instanceof Element ? alvo.closest(seletorPreenchimento) : null;
  }
  function posicionarPreenchimento(botao, evento) {
    const area = botao.getBoundingClientRect();
    const x = Math.max(0, Math.min(area.width, evento.clientX - area.left));
    const y = Math.max(0, Math.min(area.height, evento.clientY - area.top));
    botao.style.setProperty("--hc-fill-x", `${x}px`);
    botao.style.setProperty("--hc-fill-y", `${y}px`);
    return Math.ceil(Math.hypot(area.width, area.height) * 1.15);
  }
  document.addEventListener("pointerover", (evento) => {
    const botao = botaoDoEfeito(evento.target);
    if (
      !botao ||
      botao.disabled ||
      evento.pointerType === "touch" ||
      botao.contains(evento.relatedTarget)
    )
      return;
    botao.classList.add("hc-fill-button");
    const raio = posicionarPreenchimento(botao, evento);
    botao.style.setProperty("--hc-fill-radius", "0px");
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        botao.style.setProperty("--hc-fill-radius", `${raio}px`),
      ),
    );
  });
  document.addEventListener("pointerout", (evento) => {
    const botao = botaoDoEfeito(evento.target);
    if (
      !botao ||
      evento.pointerType === "touch" ||
      botao.contains(evento.relatedTarget)
    )
      return;
    posicionarPreenchimento(botao, evento);
    botao.style.setProperty("--hc-fill-radius", "0px");
  });

  document.addEventListener("DOMContentLoaded", async () => {
    const iconRules = [
      ["[data-filter-toggle]", "fi-rr-filter"],
      [
        "[data-filter-close], [data-fechar], [data-fechar-modal], [data-fechar-curso], [data-fechar-turma], [data-fechar-ajuste], [data-fechar-detalhes]",
        "fi-rr-cross-small",
      ],
      ["#novoUsuario, #novoCurso, #novaTurma", "fi-rr-plus"],
      ["#baixarPdf", "fi-rr-download"],
    ];
    iconRules.forEach(([selector, icon]) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (element.querySelector(":scope > .fi")) return;
        element.insertAdjacentHTML(
          "afterbegin",
          `<i class="fi ${icon}" aria-hidden="true"></i>`,
        );
      });
    });
    const main = document.querySelector("main");
    if (main) {
      main.id ||= "conteudo-principal";
      if (!document.querySelector(".hc-skip-link")) {
        const skipLink = document.createElement("a");
        skipLink.className = "hc-skip-link";
        skipLink.href = `#${main.id}`;
        skipLink.textContent = "Pular para o conteúdo";
        document.body.prepend(skipLink);
      }
    }
    setupMobileNavigation();
    if (location.pathname === "/login" || location.pathname === "/") return;
    try {
      const response = await window.hcFetch("/api/conta");
      const user = await response.json();
      window.hcUser = user;
      document
        .querySelectorAll("[data-user-name]")
        .forEach((el) => (el.textContent = user.nome));
      document
        .querySelectorAll("[data-user-email]")
        .forEach((el) => (el.textContent = user.email));
      document
        .querySelectorAll("[data-user-role]")
        .forEach(
          (el) =>
            (el.textContent = (user.perfil || "PROFESSOR").replaceAll(
              "_",
              " ",
            )),
        );
      document
        .querySelectorAll('[data-role="ADMIN"]')
        .forEach((el) => (el.hidden = user.perfil !== "ADMIN"));
      document
        .querySelectorAll('[data-hide-role="ADMIN"]')
        .forEach((el) => (el.hidden = user.perfil === "ADMIN"));
      document
        .querySelectorAll("[data-role-global]")
        .forEach(
          (el) =>
            (el.hidden = ![
              "ADMIN",
              "COORDENADOR_EIXO",
              "COORDENADOR_NUCLEO",
            ].includes(user.perfil)),
        );
      setupMobileNavigation();
      document.dispatchEvent(
        new CustomEvent("hc:user-ready", { detail: user }),
      );
    } catch (error) {
      if (!location.pathname.includes("/login") && location.pathname !== "/")
        console.error(error);
    }
  });
})();

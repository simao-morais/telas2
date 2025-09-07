/*
 * global.js (Versão Modularizada)
 * Este script gerencia o carregamento de componentes de layout,
 * navegação, e interações globais da UI.
 */

// ===================================================================================
// FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO DO LAYOUT
// ===================================================================================

function getBasePath() {
  const path = window.location.pathname;
  const repoName = path.split('/')[1];
  return '/' + repoName;
}

/**
 * Inicializa o layout da página, carregando os componentes corretos (sidebar, header, etc.)
 * e configurando os listeners de eventos necessários.
 * @param {object} pageConfig - Objeto de configuração da página.
 * @param {string} pageConfig.title - O título a ser exibido no cabeçalho.
 * @param {string} pageConfig.icon - A classe do ícone Font Awesome para o cabeçalho.
 * @param {string} pageConfig.navActive - O ID do item de navegação a ser marcado como ativo.
 */
async function initLayout(pageConfig) {
  const path = window.location.pathname;
  const basePath = getBasePath();

  if (path.includes("/admin/")) {
    await loadComponent(
      `${basePath}/components/admin_sidebar.html`,
      "sidebar-placeholder"
    );
    await loadComponent(`${basePath}/components/admin_header.html`, "header-placeholder");
  } else if (path.includes("/app/")) {
    await loadComponent(`${basePath}/components/app_sidebar.html`, "sidebar-placeholder");
    await loadComponent(`${basePath}/components/app_header.html`, "header-placeholder");
  } else if (path.includes("/portal/")) {
    await loadComponent(`${basePath}/components/portal_navbar.html`, "navbar-placeholder");
    await loadComponent(`${basePath}/components/portal_footer.html`, "footer-placeholder");
  }

  setupDynamicContent(pageConfig);
  autoFixFormSectionLayout();
  setupEventListeners();
}

// ===================================================================================
// FUNÇÕES AUXILIARES DE CARREGAMENTO E CONFIGURAÇÃO
// ===================================================================================

/**
 * Carrega um componente HTML de um arquivo e o injeta em um elemento alvo.
 * @param {string} componentPath - Caminho para o arquivo HTML do componente.
 * @param {string} targetElementId - ID do elemento onde o componente será inserido.
 */
async function loadComponent(componentPath, targetElementId) {
  const targetElement = document.getElementById(targetElementId);
  if (!targetElement) return;

  try {
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`Componente não encontrado: ${componentPath}`);
    }
    targetElement.innerHTML = await response.text();
  } catch (error) {
    console.error("Erro ao carregar componente:", error);
    targetElement.innerHTML = `<p style="color:red;">Erro ao carregar componente: ${componentPath}</p>`;
  }
}

/**
 * Configura o conteúdo dinâmico da página, como título do cabeçalho e item de navegação ativo.
 * @param {object} pageConfig - Objeto de configuração da página.
 */
function setupDynamicContent(pageConfig) {
  if (!pageConfig) return;

  const headerTitle = document.getElementById("header-title");
  const headerIcon = document.getElementById("header-icon");
  if (headerTitle && pageConfig.title) {
    headerTitle.textContent = pageConfig.title;
  }
  if (headerIcon && pageConfig.icon) {
    headerIcon.className = `fa-solid ${pageConfig.icon}`;
  }

  if (pageConfig.navActive) {
    const activeNavItem = document.getElementById(pageConfig.navActive);
    if (activeNavItem) {
      activeNavItem.classList.add("active");
    }
  }
}

/**
 * Configura todos os event listeners globais após o carregamento dos componentes.
 * Isso garante que os botões e links dentro dos componentes funcionem corretamente.
 */
function setupEventListeners() {
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      profileDropdown.classList.toggle("active");
      profileBtn.classList.toggle("active");
    });
  }

  window.addEventListener("click", () => {
    if (profileDropdown && profileDropdown.classList.contains("active")) {
      profileDropdown.classList.remove("active");
      profileBtn.classList.remove("active");
    }
  });

  const navLinks = document.querySelectorAll("a[data-page]");
  navLinks.forEach((link) => {
    link.replaceWith(link.cloneNode(true));
  });

  document.querySelectorAll("a[data-page]").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const pageName = this.getAttribute("data-page");
      navigateToPage(pageName);
    });
  });

  initializeFadeInObserver();
}

// ===================================================================================
// LÓGICA DE NAVEGAÇÃO (ADAPTADA DO SEU ARQUIVO ORIGINAL)
// ===================================================================================

function isAdminContext() {
  return window.location.pathname.includes("/admin/");
}

function navigateToPage(pageName) {
  const mainContent = document.getElementById("mainContent");
  const targetUrl = getPageUrl(pageName);

  if (!targetUrl) {
    console.warn(`URL não encontrada para a página: ${pageName}`);
    return;
  }

  if (mainContent) {
    mainContent.classList.add("transitioning");
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 200);
  } else {
    window.location.href = targetUrl;
  }
}

function getPageUrl(pageName) {
  const basePath = getBasePath();
  const pageMap = {
    dashboard_admin: `${basePath}/admin/dashboard_admin.html`,
    "nova-camara": `${basePath}/admin/nova_camara.html`,
    "novo-partido": `${basePath}/admin/novo_partido.html`,
    partidos: `${basePath}/admin/partidos.html`,
    configuracoes: `${basePath}/admin/configuracoes.html`,
    relatorios: `${basePath}/admin/relatorios.html`,
    dashboard: `${basePath}/app/dashboard.html`,
    cadastro: `${basePath}/app/cadastro_de_pautas.html`,
    nova_pauta: `${basePath}/app/nova_pauta.html`,
    editar_pauta: `${basePath}/app/editar_pauta.html`,
    vereadores: `${basePath}/app/vereadores.html`,
    editar_vereador: `${basePath}/app/editar_vereador.html`,
    ordem_do_dia: `${basePath}/app/ordem_do_dia.html`,
    relatorio: `${basePath}/app/relatorio.html`,
    perfil: `${basePath}/app/perfil_camara.html`,
    sessoes: `${basePath}/app/sessoes.html`,
  };

  const key = isAdminContext() && pageName === "dashboard" ? "dashboard_admin" : pageName;

  return pageMap[key];
}

// ===================================================================================
// ANIMAÇÕES (ADAPTADO DO SEU ARQUIVO ORIGINAL)
// ===================================================================================

function initializeFadeInObserver() {
  const elementsToFadeIn = document.querySelectorAll(".fade-in");
  if (elementsToFadeIn.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elementsToFadeIn.forEach((el) => observer.observe(el));
}

function initUnifiedAnimations() {
  const immediateElements = document.querySelectorAll(".animate-on-load");
  immediateElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("visible");
    }, (index + 1) * 200);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  const scrollElements = document.querySelectorAll(
    ".fade-in, .fade-in-section"
  );
  scrollElements.forEach((el) => observer.observe(el));
}

function initFadeInAnimations() {
  initUnifiedAnimations();
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("showLoginSuccessToast") === "true") {
    showToast("Login bem-sucedido!", "success");
    localStorage.removeItem("showLoginSuccessToast");
  }
});

// ===================================================================================
// INICIALIZADOR DE COMPONENTES DE UI (ex: Dropdowns de Tabela)
// ===================================================================================

function initStatusDropdowns() {
  const statusDropdowns = document.querySelectorAll(".status-dropdown");
  if (statusDropdowns.length === 0) return;

  const closeAllDropdowns = (exceptThisOne = null) => {
    document.querySelectorAll(".status-dropdown.open").forEach((dropdown) => {
      if (dropdown !== exceptThisOne) {
        dropdown.classList.remove("open");
      }
    });
  };

  statusDropdowns.forEach((dropdown) => {
    const badgeWrapper = dropdown.querySelector(".status-badge-wrapper");
    const dropdownMenu = dropdown.querySelector(".dropdown-menu");

    if (!badgeWrapper || !dropdownMenu) return;

    badgeWrapper.addEventListener("click", (event) => {
      event.stopPropagation();
      const wasOpen = dropdown.classList.contains("open");
      closeAllDropdowns();
      if (!wasOpen) {
        dropdown.classList.add("open");
      }
    });

    dropdownMenu.querySelectorAll(".dropdown-item").forEach((item) => {
      item.addEventListener("click", () => {
        const newValue = item.getAttribute("data-value");
        const newText = item.textContent;
        const mainBadge = dropdown.querySelector(
          ".status-badge-wrapper .status-badge"
        );
        if (mainBadge) {
          mainBadge.className = "status-badge";
          mainBadge.classList.add(newValue);
          mainBadge.textContent = newText.toUpperCase();
        }
        console.log(`Status alterado para: ${newValue}`);
      });
    });
  });

  window.addEventListener("click", () => {
    closeAllDropdowns();
  });
}

/**
 * Verifica se um token de autenticação existe no localStorage.
 * Se não existir, redireciona o usuário para a página de login.
 * Esta função deve ser chamada no início de todas as páginas protegidas.
 */
function protectPage() {
  console.log("[AUTH_GUARD] Iniciando verificação de autenticação...");
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.warn(
      "[AUTH_GUARD] ❌ Token de autenticação não encontrado no localStorage."
    );
    console.log(
      "[AUTH_GUARD] Redirecionando para a página de login: /app/login.html"
    );
    localStorage.clear();
    window.location.href = `${getBasePath()}/app/login.html`;
    throw new Error("Não autenticado, redirecionando para login.");
  } else {
    console.log(
      "[AUTH_GUARD] ✅ Token de autenticação encontrado. Acesso permitido."
    );
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        window.currentUser = JSON.parse(userData);
        console.log(
          `[AUTH_GUARD] Usuário logado: ${window.currentUser.email} (Role: ${window.currentUser.role})`
        );
      }
    } catch (e) {
      console.error(
        "[AUTH_GUARD] Erro ao parsear userData do localStorage:",
        e
      );
      localStorage.clear();
      window.location.href = `${getBasePath()}/app/login.html`;
      throw new Error(
        "Dados de usuário corrompidos, redirecionando para login."
      );
    }
  }
}

/**
 * Realiza o logout do usuário, invalidando o token no backend e limpando o frontend.
 */
async function logout() {
  console.log("[DEBUG-FRONTEND] A função logout() foi chamada.");
  const authToken = localStorage.getItem("authToken");

  if (authToken) {
    console.log(
      "[DEBUG-FRONTEND] Token encontrado. Enviando requisição para /api/auth/logout..."
    );
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        console.warn(
          "A invalidação do token no servidor falhou, mas o logout no cliente prosseguirá."
        );
      } else {
        console.log("[AUTH] Token invalidado no servidor com sucesso.");
      }
    } catch (error) {
      console.error("Erro ao contatar o servidor para logout:", error);
    }
  }

  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  window.location.href = `${getBasePath()}/app/login.html`;
}

function autoFixFormSectionLayout() {
  const mainContent = document.querySelector(".main-content");
  if (!mainContent) return;
  if (mainContent.querySelector(".page-content-wrapper")) return;

  const containerSelectors = [
    ".form-section",
    ".pautas-section",
    ".dashboard-section",
    ".content-section",
  ];

  const containersToWrap = [];
  containerSelectors.forEach((selector) => {
    const elements = mainContent.querySelectorAll(`:scope > ${selector}`);
    elements.forEach((el) => containersToWrap.push(el));
  });

  if (containersToWrap.length === 0) return;

  console.log(
    "🔧 Auto-corrigindo layout: envolvendo containers com wrappers necessários",
    containersToWrap.map((el) => el.className)
  );

  const pageContentWrapper = document.createElement("div");
  pageContentWrapper.className = "page-content-wrapper";

  const contentArea = document.createElement("div");
  contentArea.className = "content-area";

  containersToWrap.forEach((container) => {
    contentArea.appendChild(container);
  });

  pageContentWrapper.appendChild(contentArea);
  mainContent.appendChild(pageContentWrapper);
}
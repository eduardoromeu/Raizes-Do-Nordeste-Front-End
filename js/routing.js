// rotas das páginas
const routes = {
  "/": {
    page: "./pages/inicio.html",
    title: "Raízes do Nordeste",
    showNavbar: false,
    requerLogin: false,
    requerUnidade: false
  },
  "/inicio": {
    page: "./pages/inicio.html",
    title: "Raízes do Nordeste",
    showNavbar: false,
    requerLogin: false,
    requerUnidade: false
  },
  "/unidades": {
    page: "./pages/unidades.html",
    title: "Raízes do Nordeste - Unidades",
    showNavbar: true,
    requerLogin: true,
    requerUnidade: false
  },
  "/notfound": {
    page: "./pages/notfound.html",
    title: "404 - Página não encontrada",
    showNavbar: true,
    requerLogin: false,
    requerUnidade: false
  },
  "/login": {
    page: "./pages/login.html",
    title: "Login",
    showNavbar: false,
    requerLogin: false,
    requerUnidade: false
  },
  "/cadastro": {
    page: "cadastro",
    title: "Cadastro",
    showNavbar: false,
    requerLogin: false,
    requerUnidade: false
  },
  "/perfil": {
    page: "./pages/perfil.html",
    title: "Meu Perfil",
    showNavbar: true,
    requerLogin: true,
    requerUnidade: false
  },
  "/editarperfil": {
    page: "./pages/editarperfil.html",
    title: "Editar Perfil",
    showNavbar: false,
    requerLogin: true,
    requerUnidade: false
  },
  "/privacidade": {
    page: "privacidade",
    title: "Configurações de privacidade",
    showNavbar: true,
    requerLogin: true,
    requerUnidade: false
  },
  "/cardapio": {
    page: "cardapio",
    title: "Cardápio",
    showNavbar: true,
    requerLogin: true,
    requerUnidade: true,
    onLoad: () => loadCardapio()
  },
  "/carrinho": {
    page: "carrinho",
    title: "Carrinho",
    showNavbar: true,
    requerLogin: true,
    requerUnidade: true
  },
  "/pedido": {
    page: "pedido",
    title: "Pedido",
    showNavbar: true,
    requerLogin: true,
    requerUnidade: true
  },
  "/historicopedidos": {
    page: "historicopedidos",
    title: "Histórico de Pedidos",
    showNavbar: true,
    requerLogin: true,
    requerUnidade: true
  },
  "/recuperarsenha": {
    page: "recuperarsenha",
    title: "Recuperação de senha",
    showNavbar: false,
    requerLogin: false,
    requerUnidade: false
  },
  "/fidelidade": {
    page: "fidelidade",
    title: "Programa de Fidelidade",
    showNavbar: true,
    requerLogin: true,
    requerUnidade: false
  }
};

// página atual
let currentPage = routes[0];

// navega para uma rota
async function navigate(path) {
  location.hash = path;
}

// renderiza a página da rota
async function renderRoute() {

  const path = location.hash.replace("#", "") || "/";
  let route = routes[path] || routes["/notfound"];

  console.log(`1 rendering route ${route} from path ${path}`);

  if (route.requerLogin && !userLogado) {
    // route = routes["/"];
    navigate("/");
    return;
  }

  console.log(`2 rendering route ${route} from path ${path}`);

  if (route.requerUnidade && unidadeAtual == null) {
    // route = routes["/unidades"];
    navigate("/unidades");
    return;
  }

  currentPage = route;

  console.log(`3 rendering route ${route} from path ${path}`);

  await loadPage(
    "pageContainer",
    route.page,
    route.title
  );

  if (route.onLoad && typeof route.onLoad == 'function') {
    route.onLoad();
  }

  updateNavbar();
}

// renderiza a rota atual ao carregar a página
window.addEventListener(
  "DOMContentLoaded",
  renderRoute
);

// chama a renderização da página ao mudar o hash do endereço
window.addEventListener(
  "hashchange",
  renderRoute
);

// captura o evento de clique para simplificar a declaração da nevegação entre as páginas
document.addEventListener(
  "click",
  (e) => {
    const link =
      e.target.closest("[data-route]");

    if (!link) return;

    e.preventDefault();

    navigate(
      link.dataset.route
    );
  }
);
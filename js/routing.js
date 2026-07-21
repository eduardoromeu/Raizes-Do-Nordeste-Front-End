// rotas das páginas
const routes = {
  "/": {
    page: "./pages/login.html",
    title: "Raízes do Nordeste",
    showNavbar: false
  },
  "/notfound": {
    page: "./pages/notfound.html",
    title: "404 - Página não encontrada",
    showNavbar: true
  },
  "/login": {
    page: "./pages/login.html",
    title: "Login",
    showNavbar: false
  },
  "/cadastro": {
    page: "cadastro",
    title: "Cadastro",
    showNavbar: false
  },
  "/perfil": {
    page: "./pages/perfil.html",
    title: "Meu Perfil",
    showNavbar: true
  },
  "/cardapio": {
    page: "cardapio",
    title: "Cardápio",
    showNavbar: true
  },
  "/carrinho": {
    page: "carrinho",
    title: "Carrinho",
    showNavbar: true
  },
  "/pedido": {
    page: "pedido",
    title: "Pedido",
    showNavbar: true
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
  const route = routes[path] || routes["/notfound"];

  currentPage = route;

  console.log(`rendering route ${route} from path ${path}`);

  await loadPage(
    "pageContainer",
    route.page,
    route.title
  );

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
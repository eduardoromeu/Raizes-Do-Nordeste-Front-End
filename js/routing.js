// rotas das páginas
const routes = {
  "/": {
    page: "login",
    title: "Raízes do Nordeste"
  },
  "/notfound": {
    page: "notfound",
    title: "404 - Página não encontrada"
  },
  "/login": {
    page: "login",
    title: "Login"
  },
  "/cadastro": {
    page: "cadastro",
    title: "Cadastro"
  },
  "/perfil": {
    page: "perfil",
    title: "Meu Perfil"
  },
  "/cardapio": {
    page: "cardapio",
    title: "Cardápio"
  },
  "/carrinho": {
    page: "carrinho",
    title: "Carrinho"
  },
  "/pedido": {
    page: "pedido",
    title: "Pedido"
  }
};

// navega para uma rota
async function navigate(path) {
  const route = routes[path];

  if (!route) {
    return navigate("/notfound");
  }

  await loadPage(
    "pageContainer",
    route.page,
    route.title
  );

  history.pushState(
    {},
    route.title,
    path
  );
}

// carrega a página anterior ao voltar pelo navegador
window.addEventListener(
  "popstate",
  () => {
    renderRoute(
      window.location.pathname
    );
  }
);

// renderiza a página da rota
async function renderRoute(path) {
  const route = routes[path];
  console.log(`rendering route ${route} from path ${path}`);
  if (!route) {
    await loadPage(
      "pageContainer",
      "404",
      "Página não encontrada"
    );

    return;
  }

  await loadPage(
    "pageContainer",
    route.page,
    route.title
  );
}

// renderiza a rota atual ao carregar a página
window.addEventListener(
  "DOMContentLoaded",
  () => {
    renderRoute(
      window.location.pathname
    );
  }
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
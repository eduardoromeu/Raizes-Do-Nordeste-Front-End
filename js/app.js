replaceComponent("navbar", "./components/navbar.html");

// atualiza visual dos links de navegação conforme a página
function updateNavbar() {
  const currentRoute = location.hash.replace("#", "") || "/";
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const route = link.dataset.route;
    const hg = link.dataset.highlightAt;

    if (route === currentRoute || hg === currentRoute) {
      link.classList.remove("text-secondary");
      link.classList.add("text-primary");
    } else {
      link.classList.remove("text-primary");
      link.classList.add("text-secondary");
    }
  });
  const navBar = document.querySelector("#navbar");
  const pageContainer = document.querySelector("#pageContainer")
  if (currentPage && navBar) {
    if (currentPage.showNavbar) {
      navBar.classList.remove("d-none");
      if (pageContainer)
        pageContainer.classList.add("navPadding");
    }
    else {
      navBar.classList.add("d-none");
      if (pageContainer)
        pageContainer.classList.remove("navPadding");
    }
  }
}

// Autenticação
let userLogado = false;

function logIn() {
  console.log("loging in...");
  userLogado = true;
  navigate("/unidades")
}

function logOut() {
  console.log("loging out...");
  userLogado = false;
  unidadeAtual = null;
  navigate("/");
}

function saveProfileEdit() {
  console.log("saving profile edit...");
  navigate("/perfil");
}

// Unidades
let unidadeAtual = null;

function selecionarUnidade(unidade) {
  unidadeAtual = unidade;
  navigate("/cardapio");
}
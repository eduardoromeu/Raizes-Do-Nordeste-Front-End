replaceComponent("navbar", "./components/navbar.html");

// atualiza visual dos links de navegação conforme a página
function updateNavbar() {
  const currentRoute = location.hash.replace("#", "") || "/";
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const route = link.dataset.route;

    if (route === currentRoute) {
      link.classList.remove("text-secondary");
      link.classList.add("text-primary");
    } else {
      link.classList.remove("text-primary");
      link.classList.add("text-secondary");
    }
  });
  const navBar = document.querySelector("#navbar");
  if (currentPage && navBar) {
    if (currentPage.showNavbar) navBar.classList.remove("d-none");
    else navBar.classList.add("d-none");
  }
}

function logOut() {
  console.log("loging out...");
  navigate("/");
}

function saveProfileEdit() {
  console.log("saving profile edit...");
  navigate("/perfil");
}
const STORAGE_USER_KEY = "raizes_nordeste_usuario";
const STORAGE_UNIDADE_KEY = "raizes_nordeste_unidade";

replaceComponent("navbar", "./components/navbar.html");

let userLogado = false;
let currentUser = null;
let unidadeAtual = null;

function loadAppState() {
  const storedUser = localStorage.getItem(STORAGE_USER_KEY);
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      userLogado = Boolean(currentUser && currentUser.nome);
    } catch (error) {
      console.error("Falha ao carregar usuário do localStorage", error);
    }
  }

  const storedUnidade = localStorage.getItem(STORAGE_UNIDADE_KEY);
  if (storedUnidade) {
    unidadeAtual = storedUnidade;
  }
}

function saveUserToStorage(user) {
  currentUser = user;
  userLogado = Boolean(user && user.nome);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

function clearUserStorage() {
  currentUser = null;
  userLogado = false;
  localStorage.removeItem(STORAGE_USER_KEY);
}

function saveUnidadeToStorage(unidade) {
  unidadeAtual = unidade;
  localStorage.setItem(STORAGE_UNIDADE_KEY, unidade);
}

function clearUnidadeStorage() {
  unidadeAtual = null;
  localStorage.removeItem(STORAGE_UNIDADE_KEY);
}

function updateNavbar() {
  const currentRoute = location.hash.replace("#", "") || "/";
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const route = link.dataset.route;
    const highlightAt = link.dataset.highlightAt;

    if (route === currentRoute || highlightAt === currentRoute) {
      link.classList.remove("text-secondary");
      link.classList.add("text-primary");
    } else {
      link.classList.remove("text-primary");
      link.classList.add("text-secondary");
    }
  });

  const navBar = document.querySelector("#navbar");
  const pageContainer = document.querySelector("#pageContainer");
  if (currentPage && navBar) {
    if (currentPage.showNavbar) {
      navBar.classList.remove("d-none");
      pageContainer?.classList.add("navPadding");
    } else {
      navBar.classList.add("d-none");
      pageContainer?.classList.remove("navPadding");
    }
  }
}

function showLoginError(message) {
  const errorElement = document.getElementById("login-error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("visually-hidden");
  } else {
    alert(message);
  }
}

function clearLoginError() {
  const errorElement = document.getElementById("login-error");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.add("visually-hidden");
  }
}

async function logIn(event) {
  if (event) {
    event.preventDefault();
  }

  clearLoginError();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (!usernameInput || !passwordInput) {
    showLoginError("Ocorreu um erro no formulário de login.");
    return false;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showLoginError("Preencha usuário e senha para continuar.");
    return false;
  }

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      showLoginError("Usuário ou senha inválidos.");
      return false;
    }

    saveUserToStorage(user);

    if (unidadeAtual) {
      navigate("/cardapio");
    } else {
      navigate("/unidades");
    }

    return false;
  } catch (error) {
    console.error("Erro ao autenticar usuário", error);
    showLoginError("Erro ao processar o login. Tente novamente mais tarde.");
    return false;
  }
}

function logOut() {
  clearUserStorage();
  clearUnidadeStorage();
  navigate("/");
}

function saveProfileEdit() {
  navigate("/perfil");
}

function selecionarUnidade(unidade) {
  saveUnidadeToStorage(unidade);
  navigate("/cardapio");
}

function updateUserInterface() {
  const usernameText = document.getElementById("username-text");
  if (usernameText && currentUser) {
    usernameText.textContent = currentUser.nome;
  }
}

loadAppState();
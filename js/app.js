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

function showRegisterMessage(message, type = "error") {
  const messageElement = document.getElementById("register-message");
  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.classList.remove("text-success", "text-danger", "visually-hidden");
  messageElement.classList.add(type === "success" ? "text-success" : "text-danger");
}

function clearRegisterMessage() {
  const messageElement = document.getElementById("register-message");
  if (!messageElement) return;

  messageElement.textContent = "";
  messageElement.classList.add("visually-hidden");
}

async function registerUser(event) {
  if (event) {
    event.preventDefault();
  }

  clearRegisterMessage();

  const usernameInput = document.getElementById("register-name");
  const telephoneInput = document.getElementById("register-telephone");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const confirmPasswordInput = document.getElementById("register-confirm-password");

  if (!usernameInput || !telephoneInput || !emailInput || !passwordInput || !confirmPasswordInput) {
    showRegisterMessage("Ocorreu um erro no formulário de cadastro.");
    return false;
  }

  const nameValue = usernameInput.value.trim();
  const telephoneValue = telephoneInput.value.trim();
  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();
  const confirmPasswordValue = confirmPasswordInput.value.trim();

  if (!nameValue) {
    showRegisterMessage("Informe seu nome.");
    return false;
  }

  if (!emailValue || !isValidEmail(emailValue)) {
    showRegisterMessage("Informe um e-mail válido.");
    return false;
  }

  if (!telephoneValue || telephoneValue && !isValidPhone(telephoneValue)) {
    showRegisterMessage("Informe um telefone válido.");
    return false;
  }

  if (!passwordValue || passwordValue.length < 6) {
    showRegisterMessage("A senha deve ter pelo menos 6 caracteres.");
    return false;
  }

  if (passwordValue !== confirmPasswordValue) {
    showRegisterMessage("A senha e a confirmação não coincidem.");
    return false;
  }

  try {
    const createdUser = await createMockUser({
      nome: nameValue,
      email: emailValue,
      telefone: telephoneValue,
      senha: passwordValue,
      nivel_acesso: "cliente"
    });

    if (!createdUser) {
      showRegisterMessage("Já existe um usuário com esse nome ou e-mail.");
      return false;
    }

    showRegisterMessage("Cadastro efetuado com sucesso. Redirecionando para login...", "success");
    setTimeout(() => {
      navigate("/login");
    }, 1000);

    return false;
  } catch (error) {
    console.error("Erro ao cadastrar usuário", error);
    showRegisterMessage("Erro ao cadastrar usuário. Tente novamente mais tarde.");
    return false;
  }
}

function showEditProfileMessage(message, type = "error") {
  const messageElement = document.getElementById("edit-profile-message");
  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.classList.remove("text-success", "text-danger", "visually-hidden");
  messageElement.classList.add(type === "success" ? "text-success" : "text-danger");
}

function clearEditProfileMessage() {
  const messageElement = document.getElementById("edit-profile-message");
  if (!messageElement) return;

  messageElement.textContent = "";
  messageElement.classList.add("visually-hidden");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^[0-9+()\s-]{8,20}$/.test(value);
}

function populateEditProfileForm() {
  clearEditProfileMessage();
  if (!currentUser) {
    return;
  }

  const usernameInput = document.getElementById("username");
  const telephoneInput = document.getElementById("telephone");
  const emailInput = document.getElementById("email");
  const currentPasswordInput = document.getElementById("curr-password");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  if (usernameInput) {
    usernameInput.value = currentUser.nome || "";
  }
  if (telephoneInput) {
    telephoneInput.value = currentUser.telefone || "";
  }
  if (emailInput) {
    emailInput.value = currentUser.email || "";
  }
  if (currentPasswordInput) {
    currentPasswordInput.value = "";
  }
  if (newPasswordInput) {
    newPasswordInput.value = "";
  }
  if (confirmPasswordInput) {
    confirmPasswordInput.value = "";
  }
}

async function saveProfileEdit(event) {
  if (event) {
    event.preventDefault();
  }

  clearEditProfileMessage();

  const usernameInput = document.getElementById("username");
  const telephoneInput = document.getElementById("telephone");
  const emailInput = document.getElementById("email");
  const currentPasswordInput = document.getElementById("curr-password");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  if (!usernameInput || !telephoneInput || !emailInput || !currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
    showEditProfileMessage("Ocorreu um erro no formulário de edição.");
    return false;
  }

  if (!currentUser) {
    showEditProfileMessage("Nenhum usuário autenticado.");
    return false;
  }

  const originalEmail = currentUser.email;
  const nameValue = usernameInput.value.trim();
  const telephoneValue = telephoneInput.value.trim();
  const emailValue = emailInput.value.trim();
  const currentPasswordValue = currentPasswordInput.value.trim();
  const newPasswordValue = newPasswordInput.value.trim();
  const confirmPasswordValue = confirmPasswordInput.value.trim();

  if (!nameValue) {
    showEditProfileMessage("O nome não pode ficar em branco.");
    return false;
  }

  if (!emailValue || !isValidEmail(emailValue)) {
    showEditProfileMessage("Informe um e-mail válido.");
    return false;
  }

  if (!telephoneValue || telephoneValue && !isValidPhone(telephoneValue)) {
    showEditProfileMessage("Informe um telefone válido.");
    return false;
  }

  const updatedUser = {
    ...currentUser,
    nome: nameValue,
    email: emailValue,
    telefone: telephoneValue
  };

  if (newPasswordValue || confirmPasswordValue || currentPasswordValue) {
    if (!currentPasswordValue) {
      showEditProfileMessage("Informe sua senha atual para alterar a senha.");
      return false;
    }

    if (newPasswordValue.length < 6) {
      showEditProfileMessage("A nova senha deve ter no mínimo 6 caracteres.");
      return false;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      showEditProfileMessage("A nova senha e a confirmação não coincidem.");
      return false;
    }

    try {
      const validated = await authenticateUser(originalEmail, currentPasswordValue);
      if (!validated) {
        showEditProfileMessage("Senha atual incorreta.");
        return false;
      }
      updatedUser.senha = newPasswordValue;
    } catch (error) {
      console.error("Erro ao validar senha atual", error);
      showEditProfileMessage("Erro ao validar a senha atual.");
      return false;
    }
  }

  const savedUser = await updateMockUser(originalEmail, updatedUser);
  if (!savedUser) {
    showEditProfileMessage("Não foi possível atualizar o cadastro. Verifique se o e-mail ou nome já estão em uso.");
    return false;
  }

  saveUserToStorage(savedUser);
  showEditProfileMessage("Dados atualizados com sucesso.", "success");
  updateUserInterface();

  setTimeout(() => {
    navigate("/perfil");
  }, 800);

  return false;
}

async function logIn(event) {
  if (event) {
    event.preventDefault();
  }

  clearLoginError();

  const accessInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (!accessInput || !passwordInput) {
    showLoginError("Ocorreu um erro no formulário de login.");
    return false;
  }

  const username = accessInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showLoginError("Preencha todos os campos para continuar.");
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

function checkUserStartPage() {
  if (userLogado && currentUser) {
    navigate('/cardapio');
  }
}

loadAppState();
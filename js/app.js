const STORAGE_USER_KEY = "raizes_nordeste_usuario";
const STORAGE_UNIDADE_KEY = "raizes_nordeste_unidade";
const STORAGE_DEVICE_KEY = "raizes_nordeste_dispositivo";

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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^[0-9+()\s-]{8,20}$/.test(value);
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

async function carregarUnidades() {
  console.log("carregando unidades...");
  const container = document.getElementById("container-unidades");
  if (!container) return; // página não está presente no DOM

  try {
    const [unidades, template] = await Promise.all([
      getMockUnidades(),
      loadTemplate("./components/card-unidade.html")
    ]);

    if (!template) throw new Error("Template do componente card-unidade não encontrado");

    // procura a coluna dentro do template para clonar por unidade
    const fragment = template.cloneNode(true);
    const colTemplate = fragment.querySelector('.col-12.col-md-4') || fragment.querySelector('.col-12');
    if (!colTemplate) throw new Error('Estrutura esperada (coluna) não encontrada no template de card-unidade');

    const row = document.createElement('div');
    row.className = 'row g-4 h-100';

    unidades.forEach((u) => {
      const col = colTemplate.cloneNode(true);

      // ajustar link
      const link = col.querySelector('#link-unidade') || col.querySelector('a');
      if (link) {
        // remover id duplicado
        link.removeAttribute('id');
        // usar id numérico como selecionado
        link.setAttribute('onclick', `selecionarUnidade(${u.id})`);
        link.setAttribute('href', 'cardapio.html');
        link.dataset.route = '/cardapio';
      }

      // imagem
      const img = col.querySelector('#imagem-unidade');
      if (img) {
        img.removeAttribute('id');
        // se existir imagem no objeto, usa; senão mantém a padrão do template
        if (u.imagem) img.src = u.imagem;
        img.alt = `Unidade ${u.nome}`;
      }

      // nome
      const nomeEl = col.querySelector('#nome-unidade');
      if (nomeEl) {
        nomeEl.removeAttribute('id');
        nomeEl.textContent = u.nome || '';
      }

      // endereco
      const endEl = col.querySelector('#endereco-unidade');
      if (endEl) {
        endEl.removeAttribute('id');
        endEl.textContent = u.endereco || '';
      }

      // salvar id como atributo data-id (útil para debugging)
      col.dataset.unidadeId = u.id;

      row.appendChild(col);
    });

    container.innerHTML = '';
    container.appendChild(row);

  } catch (error) {
    console.error('Erro ao carregar unidades:', error);
  }
}

function updateUserInterface() {
  const usernameText = document.getElementById("username-text");
  if (usernameText && currentUser) {
    usernameText.textContent = currentUser.nome;
  }

  const unidadeText = document.getElementById("nome-unidade-atual");
  if (unidadeText && unidadeAtual) {
    unidadeText.textContent = unidadeAtual;
  }
}

function checkUserStartPage() {
  if (userLogado && currentUser) {
    navigate('/inicio');
  }
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

// retorna se é totem ou app/web
function getTipoDispositivo() {
  const storedDevice = localStorage.getItem(STORAGE_DEVICE_KEY);
  if (storedDevice && storedDevice == 'totem' || storedDevice == 'webapp') {
    return storedDevice;
  }
  return 'webapp';
}

// define tipo de dispositivo do app
function setTipoDispositivo(device) {
  if (device && device == 'totem' || device == 'webapp') {
    localStorage.setItem(STORAGE_DEVICE_KEY, device);
    return;
  }
  console.error("Tipo de dispositivo inválido");
}

loadAppState();

replaceComponent("navbar", "./components/navbar.html");

const MOCK_DATA_URL = "./assets/mockdata.json";
const MOCK_REGISTERED_USERS_KEY = "raizes_nordeste_registered_users";
let mockDataCache = null;

async function loadMockData() {
  if (mockDataCache) {
    return mockDataCache;
  }

  const response = await fetch(MOCK_DATA_URL);
  if (!response.ok) {
    throw new Error(`Falha ao carregar dados mock: ${response.status}`);
  }

  const data = await response.json();
  mockDataCache = data;
  return data;
}

function saveUnidadeToStorage(unidade) {
  unidadeAtual = unidade;
  localStorage.setItem(STORAGE_UNIDADE_KEY, unidade);
}

function clearUnidadeStorage() {
  unidadeAtual = null;
  localStorage.removeItem(STORAGE_UNIDADE_KEY);
}

async function getMockUnidades() {
  const data = await loadMockData();
  return data.unidades || [];
}

async function getMockProdutos() {
  const data = await loadMockData();
  return data.produtos || [];
}

async function getMockUnidadeById(unidadeId) {
  const unidades = await getMockUnidades();
  return unidades.find((unidade) => unidade.id === Number(unidadeId)) || null;
}

async function getMockProdutoById(produtoId) {
  const produtos = await getMockProdutos();
  return produtos.find((produto) => produto.id === Number(produtoId)) || null;
}

function loadRegisteredUsers() {
  const savedUsers = localStorage.getItem(MOCK_REGISTERED_USERS_KEY);
  if (!savedUsers) {
    return [];
  }

  try {
    return JSON.parse(savedUsers);
  } catch (error) {
    console.error("Falha ao ler usuários registrados do localStorage", error);
    return [];
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(MOCK_REGISTERED_USERS_KEY, JSON.stringify(users));
}

function normalizeLogin(value) {
  return value?.toString().trim().toLowerCase() || "";
}

function userMatchesLogin(user, loginValue) {
  const normalizedLogin = normalizeLogin(loginValue);
  return [user.email, user.nome, user.telefone]
    .map(normalizeLogin)
    .some((item) => item === normalizedLogin);
}

async function findUserByLogin(userAccess) {
  const loginValue = normalizeLogin(userAccess);
  if (!loginValue) {
    return null;
  }

  const registeredUsers = loadRegisteredUsers();
  const storedUser = registeredUsers.find((user) => userMatchesLogin(user, loginValue));
  if (storedUser) {
    return storedUser;
  }

  const data = await loadMockData();
  return data.usuarios.find((user) => userMatchesLogin(user, loginValue)) || null;
}

async function authenticateUser(userAccess, password) {
  const user = await findUserByLogin(userAccess);
  if (!user || user.senha !== password) {
    return null;
  }

  return {
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    data_nascimento: user.data_nascimento || null,
    nivel_acesso: user.nivel_acesso,
    senha: user.senha,
    consentDados: user.consentDados
  };
}

async function createMockUser(userData) {
  const newUser = {
    nome: userData.nome?.trim(),
    email: userData.email?.trim(),
    telefone: userData.telefone?.trim(),
    data_nascimento: userData.data_nascimento || null,
    consentDados: userData.consentDados || false,
    senha: userData.senha,
    nivel_acesso: userData.nivel_acesso || "cliente"
  };

  if (!newUser.nome || !newUser.email || !newUser.senha) {
    return null;
  }

  const duplicateByEmail = await findUserByLogin(newUser.email);
  if (duplicateByEmail) {
    return null;
  }

  const registeredUsers = loadRegisteredUsers();
  registeredUsers.push(newUser);
  saveRegisteredUsers(registeredUsers);

  return newUser;
}

async function updateMockUser(originalEmail, userData) {
  const registeredUsers = loadRegisteredUsers();
  const normalizedOriginalEmail = normalizeLogin(originalEmail);
  const updatedUser = {
    nome: userData.nome?.trim(),
    email: userData.email?.trim(),
    telefone: userData.telefone?.trim(),
    data_nascimento: userData.data_nascimento || null,
    consentDados: userData.consentDados,
    senha: userData.senha,
    nivel_acesso: userData.nivel_acesso || "cliente"
  };

  if (!updatedUser.nome || !updatedUser.email || !updatedUser.senha) {
    return null;
  }

  const duplicateByEmail = await findUserByLogin(updatedUser.email);
  if (duplicateByEmail && normalizeLogin(duplicateByEmail.email) !== normalizedOriginalEmail) {
    return null;
  }

  const duplicateByName = await findUserByLogin(updatedUser.nome);
  if (duplicateByName && normalizeLogin(duplicateByName.email) !== normalizedOriginalEmail) {
    return null;
  }

  const existingIndex = registeredUsers.findIndex(
    (user) => normalizeLogin(user.email) === normalizedOriginalEmail || normalizeLogin(user.nome) === normalizedOriginalEmail
  );

  if (existingIndex >= 0) {
    registeredUsers[existingIndex] = updatedUser;
  } else {
    registeredUsers.push(updatedUser);
  }

  saveRegisteredUsers(registeredUsers);
  return updatedUser;
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

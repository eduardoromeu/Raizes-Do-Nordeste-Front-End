const MOCK_DATA_URL = "./assets/mockdata.json";
const MOCK_STORAGE_USER_KEY = "raizes_nordeste_usuario";

async function loadMockData() {
  const response = await fetch(MOCK_DATA_URL);
  if (!response.ok) {
    throw new Error(`Falha ao carregar dados mock: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

function loadStoredUser() {
  const storedUser = localStorage.getItem(MOCK_STORAGE_USER_KEY);
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Falha ao ler usuário armazenado no mock", error);
    return null;
  }
}

async function authenticateUser(userAccess, password) {
  console.log(`autenticando usuário ${userAccess} senha ${password}`);
  const loginValue = userAccess.toLowerCase();
  const storedUser = loadStoredUser();
  if (storedUser) {
    const storedLogin = storedUser.email?.toLowerCase() || storedUser.nome?.toLowerCase() || storedUser.telefone?.toLowerCase();
    if (storedLogin === loginValue && storedUser.senha === password) {
      return storedUser;
    }
  }

  const data = await loadMockData();
  const user = data.usuarios.find((item) => {
    if (!item) return false;
    return (
      item.email?.toLowerCase() === loginValue ||
      item.telefone?.toLowerCase() === loginValue ||
      item.nome?.toLowerCase() === loginValue
    );
  });

  if (!user || user.senha !== password) {
    return null;
  }

  return {
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    nivel_acesso: user.nivel_acesso,
    senha: user.senha
  };
}

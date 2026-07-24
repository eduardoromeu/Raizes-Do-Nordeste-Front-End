const MOCK_DATA_URL = "./assets/mockdata.json";

async function loadMockData() {
  const response = await fetch(MOCK_DATA_URL);
  if (!response.ok) {
    throw new Error(`Falha ao carregar dados mock: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

async function authenticateUser(username, password) {
  const data = await loadMockData();
  const loginValue = username.toLowerCase();

  const user = data.usuarios.find((item) => {
    if (!item) return false;
    return (
      item.email?.toLowerCase() === loginValue ||
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
    nivel_acesso: user.nivel_acesso
  };
}

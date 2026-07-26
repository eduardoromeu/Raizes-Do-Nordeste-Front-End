async function loadCardapio() {
  // Carrega o nome da unidade atual a partir do id salvo em localStorage
  try {
    const stored = localStorage.getItem('raizes_nordeste_unidade');
    if (!stored) return;

    const id = Number(stored);
    if (Number.isNaN(id)) return;

    const resp = await fetch('./assets/mockdata.json');
    if (!resp.ok) {
      console.error('Falha ao carregar mockdata.json', resp.status);
      return;
    }

    const data = await resp.json();
    const unidade = (data.unidades || []).find(u => u.id === id);
    if (!unidade) return;

    const elTop = document.getElementById('nome-unidade-atual');
    if (elTop) elTop.textContent = unidade.nome;

    const elSublabel = document.getElementById('nome-unidade-sublabel');
    if (elSublabel) elSublabel.textContent = unidade.nome;

  } catch (error) {
    console.error('Erro ao carregar cardápio:', error);
  }
}

// Executa ao carregar a página (se o script for incluído na página)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCardapio);
} else {
  loadCardapio();
}
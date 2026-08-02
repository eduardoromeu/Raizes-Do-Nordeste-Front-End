async function loadCardapio() {
  console.log("carregando cardápio...");
  // Carrega o nome da unidade atual a partir do id salvo em localStorage
  try {
    const stored = localStorage.getItem('raizes_nordeste_unidade');
    if (!stored) return;

    const id = Number(stored);
    if (Number.isNaN(id)) return;

    const unidade = await getMockUnidadeById(id);
    if (!unidade) return;

    const textoUnidade = document.getElementById('nome-unidade-atual');
    if (textoUnidade) textoUnidade.textContent = unidade.nome;

    // Renderiza os produtos da unidade dentro de #container-cardapio usando o template card-produto.html
    const container = document.getElementById('container-cardapio');
    if (!container) return;

    // carrega template de produto
    const template = await loadTemplate('./components/card-produto.html');
    if (!template) {
      console.error('Template card-produto não encontrado');
      return;
    }

    // carrega modal do produto
    replaceComponent("modal-produto", "./components/modal-produto.html")

    const produtoIds = unidade.cardapio || [];
    const allProdutos = await getMockProdutos();
    const produtos = produtoIds
      .map((pid) => allProdutos.find((p) => p.id === pid))
      .filter(Boolean);

    const inputPesquisa = document.getElementById('pesquisa-cardapio-input');
    const mensagemNenhumProduto = document.getElementById('cardapio-message');
    const renderProdutos = (query = '') => {
      container.innerHTML = '';
      if (mensagemNenhumProduto) {
        mensagemNenhumProduto.hidden = true;
        mensagemNenhumProduto.classList.add('d-none');
      }

      const filtro = query.trim().toLowerCase();
      const produtosFiltrados = filtro
        ? produtos.filter((produto) => produto.titulo?.toLowerCase().includes(filtro))
        : produtos;

      if (produtosFiltrados.length === 0) {
        if (mensagemNenhumProduto) {
          mensagemNenhumProduto.hidden = false;
          mensagemNenhumProduto.classList.remove('d-none');
        }
        return;
      }

      const row = document.createElement('div');
      row.className = 'row g-3 mt-2';

      produtosFiltrados.forEach((produto) => {
        const fragment = template.cloneNode(true);
        const card = fragment.querySelector('.card') || fragment.firstElementChild;
        if (!card) return;

        const img = card.querySelector('.img-produto');
        if (img && produto.imagem) {
          img.src = produto.imagem;
          img.alt = produto.titulo;
        }

        const titulo = card.querySelector('.card-title');
        if (titulo) titulo.textContent = produto.titulo || '';

        const precoEl = card.querySelector('.card-text');
        if (precoEl) precoEl.textContent = `R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}`;

        const btn = card.querySelector('button[data-id-produto]');
        if (btn) {
          btn.setAttribute('data-id-produto', produto.id);
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const pidAttr = e.currentTarget.getAttribute('data-id-produto');
            if (typeof window.addToCart === 'function') {
              window.addToCart(Number(pidAttr));
            } else {
              console.log('Adicionar ao carrinho:', pidAttr);
            }
          });
        }

        card.addEventListener('click', () => abrirModalProduto(produto));
        card.style.cursor = 'pointer';

        const wrapper = document.createElement('div');
        wrapper.className = 'col-12 col-md-6 col-lg-4';
        wrapper.appendChild(card);
        row.appendChild(wrapper);
      });

      container.appendChild(row);
    };


  if (inputPesquisa) {
    inputPesquisa.value = '';
    inputPesquisa.addEventListener('input', (event) => renderProdutos(event.target.value));
  }

  renderProdutos('');

} catch (error) {
  console.error('Erro ao carregar cardápio:', error);
}
}

function limparPesquisaCardapio() {
  const inputPesquisa = document.getElementById('pesquisa-cardapio-input');
  if (inputPesquisa)
    inputPesquisa.value = '';
  loadCardapio();
}

function abrirModalProduto(produto) {
  const modalEl = document.getElementById('modal-produto');
  if (!modalEl) return;

  const tituloEl = modalEl.querySelector('#modal-produto-label');
  const precoEl = modalEl.querySelector('.modal-produto-preco');
  const descricaoText = modalEl.querySelector('.modal-produto-descricao');
  const imgEl = modalEl.querySelector('.modal-produto-imagem');
  const categoriasModal = modalEl.querySelector('.modal-produto-categorias');
  const btnCarrinho = modalEl.querySelector('.modal-produto-add-carrinho');

  if (tituloEl) tituloEl.textContent = produto.titulo || '';
  if (precoEl) precoEl.textContent = `R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}`;
  if (descricaoText) descricaoText.textContent = produto.descricao || '';
  if (imgEl) {
    imgEl.src = produto.imagem || '';
    imgEl.alt = produto.titulo || '';
  }
  if (categoriasModal) {
    categoriasModal.innerHTML = '';
    (produto.categorias || []).forEach((categoria) => {
      const item = document.createElement('li');
      item.className = 'badge bg-light text-dark';
      item.textContent = categoria;
      categoriasModal.appendChild(item);
    });
  }

  if (btnCarrinho) {
    btnCarrinho.onclick = () => {
      if (typeof window.addToCart === 'function') {
        window.addToCart(Number(produto.id));
      } else {
        console.log('Adicionar ao carrinho:', produto.id);
      }

      const modal = window.bootstrap?.Modal?.getOrCreateInstance(modalEl);
      modal?.hide();
    };
  }

  const modal = window.bootstrap?.Modal?.getOrCreateInstance(modalEl);
  modal?.show();
}
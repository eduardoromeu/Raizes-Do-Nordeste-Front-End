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

    // carrega modal do produto uma vez
    if (!document.getElementById('modal-produto')) {
      const modalTemplate = await loadTemplate('./components/modal-produto.html');
      if (modalTemplate) {
        document.body.appendChild(modalTemplate.cloneNode(true));
      }
    }

    container.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'row g-3 mt-2';

    const produtoIds = unidade.cardapio || [];
    const allProdutos = await getMockProdutos();

    produtoIds.forEach((pid) => {
      const produto = allProdutos.find(p => p.id === pid);
      if (!produto) return; // ignora ids não existentes

      const fragment = template.cloneNode(true);
      // o template raiz pode ser a própria card; procura elementos dentro do fragment
      const card = fragment.querySelector('.card') || fragment.firstElementChild;
      if (!card) return;

      // imagem
      const img = card.querySelector('.img-produto');
      if (img && produto.imagem) {
        img.src = produto.imagem;
        img.alt = produto.titulo;
      }

      // título
      const titulo = card.querySelector('.card-title');
      if (titulo) titulo.textContent = produto.titulo || '';

      // preço
      const precoEl = card.querySelector('.card-text');
      if (precoEl) precoEl.textContent = `R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}`;

      // botão adicionar ao carrinho
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

      // clicar no card para abrir o modal do produto
      card.addEventListener('click', () => abrirModalProduto(produto));
      card.style.cursor = 'pointer';

      // anexa o card em uma coluna do grid responsivo
      const wrapper = document.createElement('div');
      wrapper.className = 'col-12 col-md-6 col-lg-4';
      wrapper.appendChild(card);
      row.appendChild(wrapper);
    });

    container.appendChild(row);

  } catch (error) {
    console.error('Erro ao carregar cardápio:', error);
  }
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
const STORAGE_CART_KEY = 'raizes_nordeste_carrinho';

function loadCartFromStorage() {
  const raw = localStorage.getItem(STORAGE_CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Falha ao ler carrinho do localStorage', e);
    return [];
  }
}

function saveCartToStorage(cart) {
  try {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Falha ao salvar carrinho no localStorage', e);
  }
}

function findCartItem(cart, produtoId) {
  return cart.find((i) => Number(i.produtoId) === Number(produtoId));
}

function addToCart(produtoId, quantidade = 1) {
  const cart = loadCartFromStorage();
  const existing = findCartItem(cart, produtoId);
  if (existing) {
    existing.quantidade = (existing.quantidade || 0) + Number(quantidade);
  } else {
    cart.push({ produtoId: Number(produtoId), quantidade: Number(quantidade) });
  }
  saveCartToStorage(cart);
  renderCart();
}

function removeFromCart(produtoId) {
  let cart = loadCartFromStorage();
  cart = cart.filter((i) => Number(i.produtoId) !== Number(produtoId));
  saveCartToStorage(cart);
  renderCart();
}

function updateCartQuantity(produtoId, quantidade) {
  console.log(`atualizando quantidade do produto ${produtoId} para ${quantidade}`);
  const cart = loadCartFromStorage();
  const item = findCartItem(cart, produtoId);
  if (!item) return;
  item.quantidade = Number(quantidade);
  if (item.quantidade <= 0) {
    removeFromCart(produtoId);
    return;
  }
  saveCartToStorage(cart);
  renderCart();
}

// Expor função globalmente
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;

async function renderCart() {
  const container = document.getElementById('container-carrinho');
  if (!container) return;

  const cart = loadCartFromStorage();
  const emptyEl = document.getElementById('empty-cart-text');

  // limpa container
  container.innerHTML = '';

  if (!cart || cart.length === 0) {
    if (emptyEl) {
      emptyEl.classList.remove('d-none');
    }
    return;
  } else {
    if (emptyEl) emptyEl.classList.add('d-none');
  }

  const template = await loadTemplate('./components/produto-carrinho.html');
  if (!template) {
    container.textContent = 'Erro ao carregar template do carrinho.';
    return;
  }

  // Monta o componente para cada item do carrinho
  const produtos = await getMockProdutos();

  let total = 0;
  cart.forEach((item) => {
    const produto = produtos.find((p) => Number(p.id) === Number(item.produtoId));
    if (!produto) return; // pula itens inválidos

    const fragment = template.cloneNode(true);
    const node = fragment.querySelector('.produto-carrinho') || fragment.firstElementChild;
    if (!node) return;

    node.setAttribute('data-id-produto', produto.id);

    const img = node.querySelector('.produto-carrinho-img');
    if (img && produto.imagem) img.src = produto.imagem;

    const titulo = node.querySelector('.produto-carrinho-titulo');
    if (titulo) titulo.textContent = produto.titulo || '';

    const desc = node.querySelector('.produto-carrinho-descricao');
    if (desc) desc.textContent = produto.descricao || '';

    const precoEl = node.querySelector('.produto-carrinho-preco');
    if (precoEl) precoEl.textContent = `R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}`;

    const qtyEl = node.querySelector('.produto-quantity');
    const btnInc = node.querySelector('.btn-add');
    const btnDec = node.querySelector('.btn-dec');
    const decIcon = node.querySelector('.dec-icon');

    if (qtyEl) qtyEl.textContent = String(item.quantidade || 0);

    if (btnInc) {
      btnInc.addEventListener('click', (e) => {
        e.preventDefault();
        updateCartQuantity(produto.id, (item.quantidade || 0) + 1);
      });
    }

    if (btnDec) {
      btnDec.addEventListener('click', (e) => {
        e.preventDefault();
        updateCartQuantity(produto.id, (item.quantidade || 0) - 1);
      });
    }

    if (decIcon) {
      if (item.quantidade <= 1) {
        decIcon.classList.remove("bi-dash");
        decIcon.classList.add("bi-trash");
      } else {
        decIcon.classList.remove("bi-trash");
        decIcon.classList.add("bi-dash");
      }
    }

    // acumula total
    total += Number(produto.preco || 0) * Number(item.quantidade || 0);

    container.appendChild(node);
  });

  // atualiza rodape com total e botão
  const footer = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-total-amount');
  const proceedBtn = document.getElementById('cart-proceed-btn');

  if (total > 0) {
    if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (footer) footer.classList.remove('d-none');
    if (proceedBtn) {
      proceedBtn.disabled = false;
    }
  } else {
    if (footer) footer.classList.add('d-none');
    if (proceedBtn) proceedBtn.disabled = true;
  }
}

// Função para inicializar o carrinho quando a página for carregada
function carregarCarrinho() {
  // renderiza o carrinho atual
  renderCart();
}

// Expõe carregarCarrinho globalmente (rota poderá chamar)
window.carregarCarrinho = carregarCarrinho;
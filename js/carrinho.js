const STORAGE_CART_KEY = 'raizes_nordeste_carrinho';
const STORAGE_ORDERS_KEY = 'raizes_nordeste_pedidos';

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

function limparCarrinho() {
  const clearCart = [];
  saveCartToStorage(clearCart);
}

async function getValorCarrinho(cart) {
  if (!cart) return 0;

  const produtos = await getMockProdutos();

  let total = 0;
  cart.forEach((item) => {
    const produto = produtos.find((p) => Number(p.id) === Number(item.produtoId));
    if (!produto) return; // pula itens inválidos

    total += Number(produto.preco || 0) * Number(item.quantidade || 0);
  });

  return total;
}

function saveCartToStorage(cart) {
  try {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Falha ao salvar carrinho no localStorage', e);
  }
}

function loadOrdersFromStorage() {
  // console.log("carregando ordens salvas");
  const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
  // console.log(raw);
  if (!raw || raw == {}) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Falha ao ler ordens do localStorage', e);
    return [];
  }
}

function saveCartAsOrder(status = "Recebido") {
  const cart = loadCartFromStorage();
  const stored_orders = loadOrdersFromStorage();
  // console.log(stored_orders);
  const new_order = {};
  new_order.id = stored_orders.length;
  new_order.cart = cart;
  new_order.status = "Aguardando Pagamento";
  new_order.timestamp = Date.now();

  stored_orders.push(new_order);
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(stored_orders));
  console.log(`criado ordem ${new_order}`);
  return new_order.id; // retorna id da ordem para o pagamento
}

function saveOrderToStorage(orderToSave) {
  const stored_orders = loadOrdersFromStorage();
  const orderIndex = stored_orders.findIndex((order) => Number(order.id) === Number(orderToSave.id));
  if (orderIndex === -1) return;
  stored_orders[orderIndex] = orderToSave;
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(stored_orders));
  } catch (e) {
    console.error('Falha ao salvar ordens no localStorage', e);
  }
}

function getOrderFromId(order_id) {
  const stored_orders = loadOrdersFromStorage();
  return stored_orders.find((order) => Number(order.id) === Number(order_id));
}

function setOrderStatus(order_id, status) {
  console.log(`atualizando status da ordem ${order_id} para ${status}`)
  const order = getOrderFromId(order_id);
  order.status = status;
  // console.log(order);
  saveOrderToStorage(order);
}

function limparOrdens() {
  const empty_orders = {};
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(empty_orders));
}

function formatPrice(value) {
  return `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
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
    // renderCart();
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
  const footer = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-total-amount');
  const proceedBtn = document.getElementById('cart-proceed-btn');

  // limpa container
  container.innerHTML = '';

  if (!cart || cart.length === 0) {
    if (emptyEl) {
      emptyEl.classList.remove('d-none');
    }
    // Desativa footer quando carrinho está vazio
    if (footer) footer.classList.add('d-none');
    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.onclick = null;
    }
    if (totalEl) totalEl.textContent = formatPrice(0);
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
  if (total > 0) {
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (footer) footer.classList.remove('d-none');
    if (proceedBtn) {
      proceedBtn.disabled = false;
      proceedBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        abrirModalPedido();
      };
    }
  } else {
    if (totalEl) totalEl.textContent = formatPrice(0);
    if (footer) footer.classList.add('d-none');
    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.onclick = null;
    }
  }
}

async function abrirModalPedido() {
  const modalEl = document.getElementById('modal-pedido');
  if (!modalEl) {
    console.error('Modal de pedido não encontrado.');
    return;
  }

  const itensContainer = modalEl.querySelector('#modal-pedido-items');
  const totalEl = modalEl.querySelector('#modal-pedido-total');
  const confirmBtn = modalEl.querySelector('#modal-pedido-confirm-btn');

  if (!itensContainer || !totalEl || !confirmBtn) {
    console.error('Elementos do modal de pedido não encontrados.');
    return;
  }

  const cart = loadCartFromStorage();
  const produtos = await getMockProdutos();
  itensContainer.innerHTML = '';

  let total = 0;

  if (!cart || cart.length === 0) {
    itensContainer.innerHTML = '<div class="text-muted">Seu carrinho está vazio.</div>';
    return;
  } else {
    cart.forEach((item) => {
      const produto = produtos.find((p) => Number(p.id) === Number(item.produtoId));
      if (!produto) return;

      const quantidade = Number(item.quantidade || 0);
      const itemTotal = Number(produto.preco || 0) * quantidade;
      total += itemTotal;

      const itemEl = document.createElement('div');
      itemEl.className = 'list-group-item border-0 px-0 py-3';
      itemEl.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold">${produto.titulo || 'Produto'}</div>
            <div class="text-muted small">Quantidade: ${quantidade}</div>
          </div>
          <div class="text-end">
            <div class="fw-semibold">${formatPrice(itemTotal)}</div>
            <div class="text-muted small">${formatPrice(produto.preco)} cada</div>
          </div>
        </div>
      `;

      itensContainer.appendChild(itemEl);
    });
  }

  totalEl.textContent = formatPrice(total);

  confirmBtn.onclick = () => {
    const modal = window.bootstrap?.Modal?.getOrCreateInstance(modalEl);
    modal?.hide();
    enviarPedido();
  }

  const modal = window.bootstrap?.Modal?.getOrCreateInstance(modalEl);
  modal?.show();
}

function enviarPedido() {

  const id_pedido = saveCartAsOrder();
  limparCarrinho(); // limpar carrinho e faz pagamento pela ordem
  navigate('/pagamento', { "id_pedido": id_pedido });
}

async function carregarCarrinho() {
  await replaceComponent('modal-pedido', './components/modal-pedido.html');
  renderCart();
}

// Expõe carregarCarrinho globalmente (rota poderá chamar)
window.carregarCarrinho = carregarCarrinho;
window.abrirModalPedido = abrirModalPedido;
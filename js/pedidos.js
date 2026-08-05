let _pedidoRefreshInterval = null;

async function carregarPaginaPedido() {

  if (_pedidoRefreshInterval) {
    clearInterval(_pedidoRefreshInterval);
    _pedidoRefreshInterval = null;
  }

  const id_pedido = getRouteParams().get("id_pedido");

  if (!id_pedido) {
    if (currentPage && currentPage.page == "statuspedido")
      navigate("/notfound");
    return;
  }

  const pedido = getOrderFromId(id_pedido);
  if (!pedido) {
    if (currentPage && currentPage.page == "statuspedido")
      navigate("/notfound");
    return;
  }

  const txtIdPedido = document.querySelector("#pedido-id");
  const txtStatusPedido = document.querySelector("#pedido-status");
  const sliderProgresso = document.querySelector("#pedido-progress");
  const dataPedidoRealizado = document.querySelector("#data-pedido-realizado");
  const btnCancelarPedido = document.querySelector("#btn-cancelar-pedido");

  if (txtIdPedido)
    txtIdPedido.textContent = "#" + id_pedido.toString().padStart(4, '0');

  await atualizarStatusPedido(pedido);

  let bgColor = "text-bg-warning";
  let widthProgresso = 5;

  switch (pedido.status) {
    case "Aguardando Pagamento":
      bgColor = "text-bg-warning";
      widthProgresso = 2;
      const alertPagamento = document.querySelector("#alert-pagamento");
      const btnPagamento = document.querySelector("#alert-pagamento > a");
      if (alertPagamento && btnPagamento) {
        alertPagamento.classList.remove("d-none");
        btnPagamento.dataset.route = `/pagamento?id_pedido=${id_pedido}`;
      }
      break;
    case "Recebido":
      bgColor = "text-bg-warning";
      widthProgresso = 15;
      break;
    case "Em Preparo":
      bgColor = "text-bg-primary";
      widthProgresso = 45;
      break;
    case "Aguardando Retirada":
      bgColor = "text-bg-warning";
      widthProgresso = 75;
      break;
    case "A Caminho":
      bgColor = "text-bg-success";
      widthProgresso = 85;
      break;
    case "Finalizado":
      bgColor = "text-bg-secondary";
      widthProgresso = 100;
      break;
    case "Cancelado":
      bgColor = "text-bg-danger";
      widthProgresso = 0;
      break;
  }

  if (dataPedidoRealizado)
    dataPedidoRealizado.textContent = formatOrderDate(pedido.timestamp);

  if (sliderProgresso) {
    sliderProgresso.style.width = `${widthProgresso}%`
    sliderProgresso.classList.toggle("bg-danger", pedido.status === "Cancelado");
    if (pedido.status == "Finalizado" || pedido.status == "Cancelado")
      sliderProgresso.classList.remove("progress-bar-animated")
  }

  if (txtStatusPedido) {
    txtStatusPedido.textContent = pedido.status;
    txtStatusPedido.classList.remove("text-bg-primary");
    txtStatusPedido.classList.remove("text-bg-warning");
    txtStatusPedido.classList.remove("text-bg-success");
    txtStatusPedido.classList.remove("text-bg-info");
    txtStatusPedido.classList.remove("text-bg-secondary");
    txtStatusPedido.classList.add(bgColor);
  }

  if (btnCancelarPedido) {
    btnCancelarPedido.disabled = pedido.status === "Finalizado" || pedido.status === "Cancelado";
  }

  const contItensPedido = document.querySelector("#pedido-itens");
  const txtValorPedido = document.querySelector("#pedido-total");

  if (txtValorPedido) {
    const valorPedido = await getValorCarrinho(pedido.cart);
    txtValorPedido.textContent = formatPrice(valorPedido);
  }

  // console.log(pedido.cart);

  // itens do pedido
  if (contItensPedido) {
    contItensPedido.innerHTML = '';
    pedido.cart.forEach(async (item) => {

      const produto = await getMockProdutoById(item.produtoId);
      console.log(produto);

      const itemEl = document.createElement("li");
      itemEl.classList = "list-group-item d-flex justify-content-between";
      const htmlItem = `
        <span>
          ${produto.titulo} (x${item.quantidade})
        </span>

        <span>
          ${formatPrice(produto.preco)}
        </span>
      `;
      itemEl.innerHTML = htmlItem;

      contItensPedido.appendChild(itemEl);
    });
  }

  if (pedido.status !== "Finalizado") {
    _pedidoRefreshInterval = setInterval(carregarPaginaPedido, 60000);
  }

}

async function atualizarStatusPedido(pedido) {
  if (!pedido || !pedido.timestamp) return;
  if (pedido.status === "Aguardando Pagamento" || pedido.status === "Finalizado" || pedido.status === "Cancelado") return;

  const minutosDecorridos = Math.floor((Date.now() - Number(pedido.timestamp)) / 60000);
  let novoStatus = pedido.status;

  if (minutosDecorridos >= 11) {
    novoStatus = "Finalizado";
  } else if (minutosDecorridos >= 4) {
    if (pedido.status === "Aguardando Retirada" || pedido.status === "A Caminho") {
      novoStatus = pedido.status;
    } else {
      novoStatus = Math.random() < 0.5 ? "Aguardando Retirada" : "A Caminho";
    }
  } else if (minutosDecorridos >= 1) {
    novoStatus = "Em Preparo";
  }

  if (novoStatus !== pedido.status) {
    setOrderStatus(pedido.id, novoStatus);
    pedido.status = novoStatus;
  }
}

function getStatusBadge(status) {
  switch (status) {
    case "Recebido":
      return "text-bg-warning";
    case "Em Preparo":
      return "text-bg-info";
    case "Aguardando Retirada":
      return "text-bg-warning";
    case "A Caminho":
      return "text-bg-success";
    case "Finalizado":
      return "text-bg-secondary";
    case "Cancelado":
      return "text-bg-danger";
    default:
      return "text-bg-warning";
  }
}

function formatOrderDate(timestamp) {
  const data = new Date(timestamp);
  const hoje = new Date();
  const ehHoje = data.toDateString() === hoje.toDateString();

  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (ehHoje) return `Hoje às ${hora}`;

  const dataFormatada = data.toLocaleDateString("pt-BR");
  return `${dataFormatada} às ${hora}`;
}

async function carregarHistoricoPedidos() {
  const listaPedidos = document.querySelector("#order-history-list");
  const historicoVazio = document.querySelector("#empty-history");
  const buscaPedido = document.querySelector("#order-search");

  const pedidos = loadOrdersFromStorage().slice().sort((a, b) => b.timestamp - a.timestamp);

  if (!listaPedidos) return;

  async function renderPedidos(filtro = "") {
    listaPedidos.innerHTML = "";

    const termoBusca = filtro.trim().toLowerCase();
    const produtos = await getMockProdutos();

    const pedidosFiltrados = pedidos.filter((pedido) => {
      if (!termoBusca) return true;

      const idPedido = pedido.id.toString().padStart(4, '0');
      if (idPedido.includes(termoBusca)) return true;

      const itensTitulo = pedido.cart
        .map((item) => produtos.find((p) => Number(p.id) === Number(item.produtoId))?.titulo || "")
        .join(" ")
        .toLowerCase();

      return itensTitulo.includes(termoBusca);
    });

    if (historicoVazio) {
      historicoVazio.classList.toggle("d-none", pedidosFiltrados.length > 0);
    }

    for (const pedido of pedidosFiltrados) {
      const idPedidoFormatado = pedido.id.toString().padStart(4, '0');
      const valorPedido = await getValorCarrinho(pedido.cart);

      atualizarStatusPedido(pedido);

      const itensTitulo = pedido.cart
        .map((item) => produtos.find((p) => Number(p.id) === Number(item.produtoId))?.titulo || "")
        .join(", ");

      const emAndamento = pedido.status !== "Finalizado" && pedido.status !== "Cancelado";
      const badgeClass = getStatusBadge(pedido.status);

      const pedidoEl = document.createElement("div");
      pedidoEl.classList = `card shadow-sm ${emAndamento ? "border-primary" : ""}`;
      pedidoEl.innerHTML = `
        <div class="card-body">

          <div class="d-flex justify-content-between align-items-start mb-2">

            <div>
              <h5 class="card-title mb-1">
                Pedido #${idPedidoFormatado}
              </h5>

              <small class="text-muted">
                ${formatOrderDate(pedido.timestamp)}
              </small>
            </div>

            <span class="badge ${badgeClass}">
              ${pedido.status}
            </span>

          </div>

          <p class="card-text text-muted mb-3">
            ${itensTitulo}
          </p>

          <div class="d-flex justify-content-between align-items-center">

            <strong class="text-primary">
              ${formatPrice(valorPedido)}
            </strong>

            <button class="btn ${emAndamento ? "btn-primary" : "btn-outline-primary"} btn-sm" data-route="/statuspedido?id_pedido=${pedido.id}">
              ${emAndamento ? "Acompanhar Pedido" : "Ver Detalhes"}
            </button>

          </div>

        </div>
      `;

      listaPedidos.appendChild(pedidoEl);
    }
  }

  await renderPedidos();

  if (buscaPedido) {
    buscaPedido.addEventListener("input", () => renderPedidos(buscaPedido.value));
  }
}

function CancelarPedido() {
  const id_pedido = getRouteParams().get("id_pedido");
  if (!id_pedido) return;

  const pedido = getOrderFromId(id_pedido);
  if (!pedido) return;

  setOrderStatus(id_pedido, "Cancelado");
  carregarPaginaPedido();
}
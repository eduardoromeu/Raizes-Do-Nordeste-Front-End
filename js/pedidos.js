
async function carregarPaginaPedido() {
  const id_pedido = getRouteParams().get("id_pedido");
  if (!id_pedido) navigate("/notfound");

  const pedido = getOrderFromId(id_pedido);
  if (!pedido) navigate("/notfound");

  const txtIdPedido = document.querySelector("#pedido-id");
  const txtStatusPedido = document.querySelector("#pedido-status");
  const sliderProgresso = document.querySelector("#pedido-progress");

  if (txtIdPedido)
    txtIdPedido.textContent = "#" + id_pedido.toString().padStart(4, '0');

  let bgColor = "text-bg-warning";
  let widthProgresso = 5;
  switch (pedido.status) {
    case "Recebido":
      bgColor = "text-bg-warning";
      widthProgresso = 15;
      break;
    case "Em Preparo":
      bgColor = "text-bg-info";
      widthProgresso = 55;
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
  }

  if (sliderProgresso)
    sliderProgresso.style.width = `${widthProgresso}%`

  if (txtStatusPedido) {
    txtStatusPedido.textContent = pedido.status;
    txtStatusPedido.classList.remove("text-bg-primary");
    txtStatusPedido.classList.add(bgColor);
  }

  const contItensPedido = document.querySelector("#pedido-itens");
  const txtValorPedido = document.querySelector("#pedido-total");

  if (txtValorPedido) {
    const valorPedido = await getValorCarrinho(pedido.cart);
    txtValorPedido.textContent = formatPrice(valorPedido);
  }
  console.log(pedido.cart);
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

      const itensTitulo = pedido.cart
        .map((item) => produtos.find((p) => Number(p.id) === Number(item.produtoId))?.titulo || "")
        .join(", ");

      const emAndamento = pedido.status !== "Finalizado";
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
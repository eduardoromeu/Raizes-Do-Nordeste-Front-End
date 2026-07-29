
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

async function carregarHistoricoPedidos() {

}
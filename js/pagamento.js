
function carregarPagamento() {
  const divSpinner = document.querySelector("#spinner-carregamento");
  const containerPagamento = document.querySelector("#container-pagamento");
  const divFormaPagamento = document.querySelector("#forma-pagamento");
  const cardPix = document.querySelector("#card-pix");
  const cardCartao = document.querySelector("#card-cartao");

  if (divSpinner) {
    divSpinner.classList.remove("d-none");
    divSpinner.classList.add("d-flex");
  }

  if (containerPagamento) {
    containerPagamento.classList.add("d-none");
  }

  setTimeout(() => {
    formaPagamento();
  }, 500);

  function formaPagamento() {
    if (divSpinner) {
      divSpinner.classList.remove("d-flex");
      divSpinner.classList.add("d-none");
    }

    if (containerPagamento) {
      containerPagamento.classList.remove("d-none");
    }

    if (cardPix) cardPix.classList.add("d-none");
    if (cardCartao) cardCartao.classList.add("d-none");
  }
}

function setPagamentoPix() {
  const divSpinner = document.querySelector("#spinner-carregamento");
  const containerPagamento = document.querySelector("#container-pagamento");
  const divFormaPagamento = document.querySelector("#forma-pagamento");
  const cardPix = document.querySelector("#card-pix");
  const cardCartao = document.querySelector("#card-cartao");


  if (divSpinner) {
    divSpinner.classList.remove("d-none");
    divSpinner.classList.add("d-flex");
  }

  if (containerPagamento) {
    containerPagamento.classList.add("d-none");
  }

  if (divFormaPagamento) divFormaPagamento.classList.add("d-none");

  setTimeout(() => {
    mostrarCard();
  }, 500);

  async function mostrarCard() {
    if (divSpinner) {
      divSpinner.classList.remove("d-flex");
      divSpinner.classList.add("d-none");
    }

    if (containerPagamento) {
      containerPagamento.classList.remove("d-none");
    }

    if (cardCartao) cardCartao.classList.add("d-none");
    if (cardPix) cardPix.classList.remove("d-none");

    const textValorPag = document.querySelector("#card-pix .valor-pagamento");
    if (textValorPag) {
      const valorPagamento = await getValorPagamento();
      textValorPag.textContent = formatPrice(valorPagamento);
    }
  }

}

function setPagamentoCartao() {

  const divSpinner = document.querySelector("#spinner-carregamento");
  const containerPagamento = document.querySelector("#container-pagamento");
  const divFormaPagamento = document.querySelector("#forma-pagamento");
  const cardPix = document.querySelector("#card-pix");
  const cardCartao = document.querySelector("#card-cartao");

  if (divSpinner) {
    divSpinner.classList.remove("d-none");
    divSpinner.classList.add("d-flex");
  }

  if (containerPagamento) {
    containerPagamento.classList.add("d-none");
  }

  if (divFormaPagamento) divFormaPagamento.classList.add("d-none");

  setTimeout(() => {
    mostrarCard();
  }, 500);

  async function mostrarCard() {
    if (divSpinner) {
      divSpinner.classList.remove("d-flex");
      divSpinner.classList.add("d-none");
    }

    if (containerPagamento) {
      containerPagamento.classList.remove("d-none");
    }

    if (cardPix) cardPix.classList.add("d-none");
    if (cardCartao) cardCartao.classList.remove("d-none");

    const infoTotem = document.querySelector("#info-card-totem");
    const dropWebapp = document.querySelector("#drop-cartao-webapp");


    if (getTipoDispositivo() == 'totem') {
      if (infoTotem) infoTotem.classList.remove("d-none");
      if (dropWebapp) dropWebapp.classList.add("d-none");
    } else {
      if (infoTotem) infoTotem.classList.add("d-none");
      if (dropWebapp) dropWebapp.classList.remove("d-none");
    }

    const textValorPag = document.querySelector("#card-cartao .valor-pagamento");
    if (textValorPag) {
      const valorPagamento = await getValorPagamento();
      textValorPag.textContent = formatPrice(valorPagamento);
    }
  }
}

async function getValorPagamento() {
  const cart = loadCartFromStorage();
  if (!cart) return 0;

  const produtos = await getMockProdutos();

  let total = 0;
  cart.forEach((item) => {
    const produto = produtos.find((p) => Number(p.id) === Number(item.produtoId));
    if (!produto) return; // pula itens inválidos

    total += Number(produto.preco || 0) * Number(item.quantidade || 0);
  });
  console.log(`valor total pagamento: ${total}`);
  return total;
}

function pagamentoRealizado() {
  const divSpinner = document.querySelector("#spinner-carregamento");
  const containerPagamento = document.querySelector("#container-pagamento");

  if (divSpinner) {
    divSpinner.classList.remove("d-none");
    divSpinner.classList.add("d-flex");
  }

  if (containerPagamento) {
    containerPagamento.classList.add("d-none");
  }

  setTimeout(() => {
    tentarPagamento();
  }, 800);

  function tentarPagamento() {

    if (divSpinner) {
      divSpinner.classList.remove("d-flex");
      divSpinner.classList.add("d-none");
    }

    const pagamentoBemSucedido = Math.random() >= 0.2;

    if (pagamentoBemSucedido) {
      navigate('/statuspedido');
      limparCarrinho();
      return;
    }

    pagamentoRecusado();
  }

}

function pagamentoRecusado() {
  const divRecusado = document.querySelector("#pagamento-recusado");

  if (divRecusado) divRecusado.classList.remove("d-none");
}
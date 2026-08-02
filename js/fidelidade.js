
const STORAGE_FIDELIDADE_RESGATES_KEY = "raizes_nordeste_fidelidade_resgates";
const BONUS_CADASTRO_PONTOS = 50;
const BONUS_MULTIPLICADOR = 0.5;

const RECOMPENSAS_FIDELIDADE = [
  {
    id: "cupom-10",
    titulo: "Cupom de R$ 10",
    descricao: "Desconto de R$ 10 no próximo pedido acima de R$ 40.",
    pontos: 150,
    codigo: "FIDELIDADE10"
  },
  {
    id: "cupom-20",
    titulo: "Cupom de R$ 20",
    descricao: "Desconto de R$ 20 no próximo pedido acima de R$ 80.",
    pontos: 300,
    codigo: "FIDELIDADE20"
  },
  {
    id: "frete-gratis",
    titulo: "Cupom de Frete Grátis",
    descricao: "Frete grátis no próximo pedido com retirada por entrega.",
    pontos: 220,
    codigo: "FRETEGRATIS"
  }
];

function getFidelidadeUserKey() {
  if (!currentUser) return "visitante";

  if (typeof normalizeLogin === "function") {
    return normalizeLogin(currentUser.email || currentUser.nome || "visitante");
  }

  return (currentUser.email || currentUser.nome || "visitante").toString().trim().toLowerCase();
}

function loadResgatesMap() {
  const raw = localStorage.getItem(STORAGE_FIDELIDADE_RESGATES_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Falha ao ler resgates de fidelidade do localStorage", error);
    return {};
  }
}

function saveResgatesMap(resgatesMap) {
  localStorage.setItem(STORAGE_FIDELIDADE_RESGATES_KEY, JSON.stringify(resgatesMap));
}

function getResgatesUsuario() {
  const userKey = getFidelidadeUserKey();
  const resgatesMap = loadResgatesMap();
  const lista = resgatesMap[userKey];
  return Array.isArray(lista) ? lista : [];
}

function adicionarResgateUsuario(resgate) {
  const userKey = getFidelidadeUserKey();
  const resgatesMap = loadResgatesMap();
  const resgatesUsuario = Array.isArray(resgatesMap[userKey]) ? resgatesMap[userKey] : [];
  resgatesUsuario.push(resgate);
  resgatesMap[userKey] = resgatesUsuario;
  saveResgatesMap(resgatesMap);
}

function getAniversarioUsuario() {
  if (!currentUser) return null;
  return currentUser.data_nascimento || currentUser.dataNascimento || currentUser.nascimento || currentUser.aniversario || null;
}

function isOrderInBirthday(orderDate) {
  const aniversario = getAniversarioUsuario();
  if (!aniversario) return false;

  const dataAniversario = new Date(aniversario);
  if (Number.isNaN(dataAniversario.getTime())) return false;

  return orderDate.getDate() === dataAniversario.getDate()
    && orderDate.getMonth() === dataAniversario.getMonth();
}

function isCommemorativeDate(orderDate) {
  const dia = orderDate.getDate();
  const mes = orderDate.getMonth() + 1;
  const datasComemorativas = [
    "1-1",
    "12-6",
    "24-6",
    "12-10",
    "25-12"
  ];
  return datasComemorativas.includes(`${dia}-${mes}`);
}

function formatTimestamp(timestamp) {
  const data = new Date(timestamp);
  const dataFormatada = data.toLocaleDateString("pt-BR");
  const horaFormatada = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return `${dataFormatada} às ${horaFormatada}`;
}

function getProximaMeta(pontosAtuais) {
  const metas = RECOMPENSAS_FIDELIDADE.map((item) => item.pontos).sort((a, b) => a - b);
  const metaRecompensa = metas.find((meta) => meta > pontosAtuais);
  if (metaRecompensa) return metaRecompensa;
  return Math.ceil((pontosAtuais + 1) / 100) * 100;
}

async function calcularResumoFidelidade() {
  const orders = loadOrdersFromStorage().slice().sort((a, b) => a.timestamp - b.timestamp);
  const historico = [];

  let pontosGanhos = BONUS_CADASTRO_PONTOS;
  let pontosUsados = 0;

  const primeiroPedidoTimestamp = orders.length > 0 ? Number(orders[0].timestamp || Date.now()) : Date.now();
  historico.push({
    tipo: "ganho",
    pontos: BONUS_CADASTRO_PONTOS,
    descricao: "Bônus de cadastro concluído",
    timestamp: primeiroPedidoTimestamp - 60000
  });

  for (const pedido of orders) {
    const valorPedido = await getValorCarrinho(pedido.cart);
    const pontosBase = Math.floor(Number(valorPedido || 0));
    const pedidoTimestamp = Number(pedido.timestamp || Date.now());
    const idPedido = String(pedido.id !== undefined && pedido.id !== null ? pedido.id : "").padStart(4, "0");

    if (pontosBase > 0) {
      pontosGanhos += pontosBase;
      historico.push({
        tipo: "ganho",
        pontos: pontosBase,
        descricao: `Pontos do pedido #${idPedido}`,
        timestamp: pedidoTimestamp
      });
    }

    const dataPedido = new Date(pedidoTimestamp);
    if (isCommemorativeDate(dataPedido) || isOrderInBirthday(dataPedido)) {
      const pontosBonus = Math.floor(pontosBase * BONUS_MULTIPLICADOR);
      if (pontosBonus > 0) {
        pontosGanhos += pontosBonus;
        historico.push({
          tipo: "ganho",
          pontos: pontosBonus,
          descricao: `Bônus de 50% do pedido #${idPedido}`,
          timestamp: pedidoTimestamp + 1
        });
      }
    }
  }

  const resgates = getResgatesUsuario();
  resgates.forEach((resgate) => {
    const pontos = Number(resgate.pontos || 0);
    pontosUsados += pontos;
    historico.push({
      tipo: "uso",
      pontos,
      descricao: `Resgate: ${resgate.titulo} (${resgate.codigo})`,
      timestamp: Number(resgate.timestamp || Date.now())
    });
  });

  const pontosAtuais = Math.max(0, pontosGanhos - pontosUsados);
  const proximaMeta = getProximaMeta(pontosAtuais);
  const porcentagemMeta = proximaMeta > 0
    ? Math.min(100, Math.round((pontosAtuais / proximaMeta) * 100))
    : 0;

  return {
    pontosAtuais,
    proximaMeta,
    porcentagemMeta,
    pontosGanhos,
    pontosUsados,
    historico: historico.sort((a, b) => b.timestamp - a.timestamp)
  };
}

function exibirFeedbackFidelidade(mensagem, tipo = "success") {
  const feedback = document.querySelector("#fidelidade-feedback");
  if (!feedback) return;

  feedback.textContent = mensagem;
  feedback.classList.remove("d-none", "alert-success", "alert-warning", "alert-danger", "alert-info");
  feedback.classList.add(`alert-${tipo}`);
}

function renderResumoFidelidade(resumo) {
  const pontosAtual = document.querySelector("#fidelidade-pontos-atual");
  const proximaMeta = document.querySelector("#fidelidade-proxima-meta");
  const textoProgresso = document.querySelector("#fidelidade-progresso-texto");
  const detalheProgresso = document.querySelector("#fidelidade-progresso-detalhe");
  const barraProgresso = document.querySelector("#fidelidade-progresso-barra");

  if (pontosAtual) {
    pontosAtual.textContent = `${resumo.pontosAtuais} pontos`;
  }

  if (proximaMeta) {
    proximaMeta.textContent = `Próxima meta: ${resumo.proximaMeta} pts`;
  }

  if (textoProgresso) {
    textoProgresso.textContent = `${resumo.porcentagemMeta}%`;
  }

  if (detalheProgresso) {
    const faltam = Math.max(0, resumo.proximaMeta - resumo.pontosAtuais);
    detalheProgresso.textContent = faltam > 0
      ? `Faltam ${faltam} pontos para alcançar a próxima recompensa.`
      : "Você já atingiu a próxima meta de recompensa.";
  }

  if (barraProgresso) {
    barraProgresso.style.width = `${resumo.porcentagemMeta}%`;
    barraProgresso.setAttribute("aria-valuenow", String(resumo.porcentagemMeta));
  }
}

function renderRecompensas(resumo) {
  const container = document.querySelector("#fidelidade-recompensas");
  if (!container) return;

  container.innerHTML = "";

  RECOMPENSAS_FIDELIDADE.forEach((recompensa) => {
    const podeResgatar = resumo.pontosAtuais >= recompensa.pontos;
    const faltam = recompensa.pontos - resumo.pontosAtuais;

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card shadow-sm h-100 ${podeResgatar ? "border-warning" : ""}">
        <div class="card-body d-flex flex-column">
          <h3 class="h5 card-title">${recompensa.titulo}</h3>
          <p class="card-text text-muted small flex-grow-1">${recompensa.descricao}</p>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge text-bg-dark">${recompensa.pontos} pts</span>
            <small class="text-muted">${recompensa.codigo}</small>
          </div>
          <button
            class="btn ${podeResgatar ? "btn-warning" : "btn-outline-secondary"} btn-sm"
            data-resgate-id="${recompensa.id}"
            ${podeResgatar ? "" : "disabled"}
          >
            ${podeResgatar ? "Resgatar" : `Faltam ${faltam} pts`}
          </button>
        </div>
      </div>
    `;

    container.appendChild(col);
  });

  const botoesResgate = container.querySelectorAll("[data-resgate-id]");
  botoesResgate.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const recompensaId = botao.getAttribute("data-resgate-id");
      await resgatarRecompensa(recompensaId);
    });
  });
}

function renderHistoricoFidelidade(resumo) {
  const historicoContainer = document.querySelector("#fidelidade-historico");
  const historicoVazio = document.querySelector("#fidelidade-historico-vazio");

  if (!historicoContainer || !historicoVazio) return;

  historicoContainer.innerHTML = "";

  if (resumo.historico.length === 0) {
    historicoVazio.classList.remove("d-none");
    return;
  }

  historicoVazio.classList.add("d-none");

  resumo.historico.forEach((item) => {
    const ganho = item.tipo === "ganho";
    const row = document.createElement("div");
    row.className = "list-group-item";
    row.innerHTML = `
      <div class="d-flex justify-content-between align-items-center gap-2">
        <div>
          <div class="fw-semibold">${item.descricao}</div>
          <small class="text-muted">${formatTimestamp(item.timestamp)}</small>
        </div>
        <span class="badge ${ganho ? "text-bg-success" : "text-bg-danger"} fs-6">
          ${ganho ? "+" : "-"}${item.pontos} pts
        </span>
      </div>
    `;
    historicoContainer.appendChild(row);
  });
}

async function renderPaginaFidelidade() {
  const resumo = await calcularResumoFidelidade();
  renderResumoFidelidade(resumo);
  renderRecompensas(resumo);
  renderHistoricoFidelidade(resumo);
}

async function resgatarRecompensa(recompensaId) {
  const recompensa = RECOMPENSAS_FIDELIDADE.find((item) => item.id === recompensaId);
  if (!recompensa) return;

  const resumo = await calcularResumoFidelidade();
  if (resumo.pontosAtuais < recompensa.pontos) {
    exibirFeedbackFidelidade("Você não possui pontos suficientes para este resgate.", "warning");
    return;
  }

  adicionarResgateUsuario({
    id: `${recompensa.id}-${Date.now()}`,
    titulo: recompensa.titulo,
    codigo: recompensa.codigo,
    pontos: recompensa.pontos,
    timestamp: Date.now()
  });

  exibirFeedbackFidelidade(`Resgate realizado com sucesso! Cupom gerado: ${recompensa.codigo}`, "success");
  await renderPaginaFidelidade();
}

async function carregarPaginaFidelidade() {
  await renderPaginaFidelidade();
}
describe("Fluxo de pedido", () => {
  const email = "joaosilvada@netmail.com";
  const senha = "cliente123";

  function limparEstado(win) {
    [
      "raizes_nordeste_usuario",
      "raizes_nordeste_unidade",
      "raizes_nordeste_carrinho",
      "raizes_nordeste_pedidos",
      "raizes_nordeste_registered_users"
    ].forEach((key) => win.localStorage.removeItem(key));
  }

  function confirmarPagamentoPixComRetry() {
    cy.contains("#forma-pagamento button", "Pix").click();
    cy.get("#card-pix", { timeout: 4000 }).should("be.visible");
    cy.get("#card-pix #payment-confirm-btn").click();

    cy.get("body", { timeout: 5000 })
      .should(($body) => {
        const estadosVisiveis = $body.find(
          "#pagamento-recusado:not(.d-none), #pagamento-aceito:not(.d-none)"
        );

        expect(estadosVisiveis.length).to.be.greaterThan(0);
      })
      .then(($body) => {
      const houveFalha = $body.find("#pagamento-recusado:not(.d-none)").length > 0;

      if (houveFalha) {
        cy.contains("#pagamento-recusado button", "Tentar Novamente").click();
        confirmarPagamentoPixComRetry();
        return;
      }

      cy.get("#pagamento-aceito", { timeout: 5000 })
        .should("be.visible")
        .and("contain", "Pagamento Confirmado");
      });
  }

  it("realiza um pedido na unidade Matriz e conclui o pagamento via Pix", () => {
    cy.visit("/#/login", {
      onBeforeLoad(win) {
        limparEstado(win);
      }
    });

    cy.get("#username").type(email);
    cy.get("#password").type(senha);
    cy.contains("button", "Logar").click();

    cy.location("hash", { timeout: 6000 }).should("eq", "#/unidades");

    cy.contains("#container-unidades a", "Matriz").click();

    cy.location("hash", { timeout: 6000 }).should("eq", "#/cardapio");
    cy.get("#nome-unidade-atual").should("contain", "Matriz");

    cy.get("#container-cardapio button[data-id-produto]", { timeout: 6000 })
      .should(($botoes) => {
        expect($botoes.length).to.be.at.least(5);
      });

    cy.get("#container-cardapio button[data-id-produto]").each(($botao, index) => {
      if (index < 5) {
        cy.wrap($botao).click();
      }
    });

    cy.get("#cart-quantity").should("contain", "5");

    cy.contains('a[data-route="/carrinho"]', "Carrinho").click();

    cy.location("hash", { timeout: 6000 }).should("eq", "#/carrinho");
    cy.get(".produto-carrinho").should("have.length", 5);
    cy.get("#cart-total-amount").should("not.contain", "0,00");

    cy.get("#cart-proceed-btn").click();

    cy.get("#modal-pedido").should("be.visible");
    cy.get("#modal-pedido-items .list-group-item").should("have.length", 5);
    cy.get("#modal-pedido-confirm-btn").click();

    cy.location("hash", { timeout: 6000 }).should("include", "#/pagamento?id_pedido=");
    cy.document().then((doc) => {
      doc.querySelectorAll(".modal-backdrop").forEach((element) => element.remove());
      doc.body.classList.remove("modal-open");
      doc.body.style.removeProperty("padding-right");
    });
    cy.get("#forma-pagamento").should("be.visible");

    cy.window().then((win) => {
      let chamadas = 0;

      cy.stub(win.Math, "random").callsFake(() => {
        chamadas += 1;
        return chamadas === 1 ? 0.1 : 0.9;
      });
    });

    confirmarPagamentoPixComRetry();

    cy.contains("#pagamento-aceito button", "Acompanhar Pedido").click();

    cy.location("hash", { timeout: 6000 }).should("include", "#/statuspedido?id_pedido=");
    cy.get("#pedido-status").should("contain", "Recebido");
    cy.get("#pedido-itens .list-group-item").should("have.length", 5);
    cy.get("#pedido-total").should("not.contain", "0,00");
    cy.get("#cart-quantity").should("contain", "0");
  });
});
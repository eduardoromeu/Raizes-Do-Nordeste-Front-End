describe("Responsividade - login e navegacao", () => {
  const viewports = ["iphone-x", "ipad-2", "macbook-15"];

  function validarSemOverflowHorizontal() {
    cy.document().then((doc) => {
      const larguraConteudo = doc.documentElement.scrollWidth;
      const larguraTela = doc.documentElement.clientWidth;
      expect(larguraConteudo).to.be.at.most(larguraTela + 1);
    });
  }

  function fazerLogin() {
    cy.get("#username").type("joaosilvada@netmail.com");
    cy.get("#password").type("cliente123");
    cy.contains("button", "Logar").click();
    cy.location("hash", { timeout: 6000 }).should("eq", "#/unidades");
  }

  viewports.forEach((viewport) => {
    it(`valida fluxo principal no viewport ${viewport}`, () => {
      cy.viewport(viewport);

      cy.visit("/#/login", {
        onBeforeLoad(win) {
          [
            "raizes_nordeste_usuario",
            "raizes_nordeste_unidade",
            "raizes_nordeste_carrinho",
            "raizes_nordeste_pedidos",
            "raizes_nordeste_registered_users"
          ].forEach((key) => win.localStorage.removeItem(key));
        }
      });

      fazerLogin();
      validarSemOverflowHorizontal();

      cy.contains("#container-unidades a", "Matriz").click();
      cy.location("hash", { timeout: 6000 }).should("eq", "#/cardapio");
      cy.get("#nome-unidade-atual").should("contain", "Matriz");
      cy.get("#container-cardapio button[data-id-produto]").should("have.length.greaterThan", 0);
      validarSemOverflowHorizontal();

      cy.visit("/#/carrinho");
      cy.contains("h1", "Carrinho").should("be.visible");
      cy.contains("Seu carrinho está vazio.").should("be.visible");
      validarSemOverflowHorizontal();

      cy.visit("/#/historicopedidos");
      cy.contains("h1", "Histórico de Pedidos").should("be.visible");
      cy.get("#order-search").should("be.visible");
      validarSemOverflowHorizontal();

      cy.visit("/#/perfil");
      cy.get("#username-text").should("contain", "João da Silva");
      cy.contains("a", "Privacidade e Dados").should("be.visible");
      validarSemOverflowHorizontal();

      cy.visit("/#/privacidade");
      cy.contains("h1", "Privacidade e Dados").should("be.visible");
      cy.get("#politicaPrivacidade").should("be.visible");
      validarSemOverflowHorizontal();
    });
  });
});
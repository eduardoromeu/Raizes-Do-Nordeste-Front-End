describe("Login invalido", () => {
  it("exibe erro ao tentar logar com credenciais invalidas", () => {
    cy.visit("/#/login", {
      onBeforeLoad(win) {
        [
          "raizes_nordeste_usuario",
          "raizes_nordeste_unidade",
          "raizes_nordeste_carrinho",
          "raizes_nordeste_pedidos"
        ].forEach((key) => win.localStorage.removeItem(key));
      }
    });

    cy.get("#username").type("usuario.invalido@netmail.com");
    cy.get("#password").type("senhaErrada123");
    cy.contains("button", "Logar").click();

    cy.get("#login-error")
      .should("be.visible")
      .and("contain", "Usuário ou senha inválidos.");

    cy.location("hash").should("eq", "#/login");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("raizes_nordeste_usuario")).to.be.null;
    });
  });
});
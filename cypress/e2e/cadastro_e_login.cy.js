describe("Cadastro e Login", () => {

  it("realiza cadastro e login com o novo usuário", () => {
    const senhaAleatoria = `Cy@1efouc9`;

    cy.visit("/#/cadastro", {
      onBeforeLoad(win) {
        win.localStorage.removeItem("raizes_nordeste_registered_users");
        win.localStorage.removeItem("raizes_nordeste_usuario");
      }
    });

    cy.get("#register-name").type("Cypress José de Souza");
    cy.get("#register-email").type("cypjds@netmail.com");
    cy.get("#register-telephone").type("23987654321");
    cy.get("#register-birthdate").type("2005-05-05");
    cy.get("#register-password").type(senhaAleatoria);
    cy.get("#register-confirm-password").type(senhaAleatoria);
    cy.get("#checkPrivacidade").check();
    cy.get("#checkDados").check();

    cy.contains("button", "Cadastrar").click();

    cy.get("#register-message")
      .should("be.visible")
      .and("contain", "Cadastro efetuado com sucesso");

    cy.location("hash", { timeout: 6000 }).should("eq", "#/login");

    cy.get("#username").type("cypjds@netmail.com");
    cy.get("#password").type(senhaAleatoria);
    cy.contains("button", "Logar").click();

    cy.location("hash", { timeout: 6000 }).should("eq", "#/unidades");
  });
});
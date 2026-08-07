describe("Privacidade (LGPD)", () => {
  const email = `cypresslgpd@netmail.com`;
  const senha = `Cy@lgpd12`;
  const nome = "Cypress Luis Gonçalves Dutra";
  const telefone = "23987655555";

  function limparEstado(win) {
    [
      "raizes_nordeste_usuario",
      "raizes_nordeste_unidade",
      "raizes_nordeste_carrinho",
      "raizes_nordeste_pedidos",
      "raizes_nordeste_registered_users"
    ].forEach((key) => win.localStorage.removeItem(key));
  }

  it("permite cadastro sem marketing e altera preferencia na pagina de privacidade", () => {
    cy.visit("/#/cadastro", {
      onBeforeLoad(win) {
        limparEstado(win);
      }
    });

    cy.get("#register-name").type(nome);
    cy.get("#register-email").type(email);
    cy.get("#register-telephone").type(telefone);
    cy.get("#register-birthdate").type("2005-05-05");
    cy.get("#register-password").type(senha);
    cy.get("#register-confirm-password").type(senha);
    cy.get("#checkPrivacidade").check();
    cy.get("#checkDados").check();
    cy.get("#checkMarketing").should("not.be.checked");

    cy.contains("button", "Cadastrar").click();
    cy.get("#register-message").should("contain", "Cadastro efetuado com sucesso");
    cy.location("hash", { timeout: 6000 }).should("eq", "#/login");

    cy.window().then((win) => {
      const usuarios = JSON.parse(win.localStorage.getItem("raizes_nordeste_registered_users") || "[]");
      const usuarioCriado = usuarios.find((u) => u.email === email);
      expect(usuarioCriado).to.exist;
      expect(usuarioCriado.consentDados).to.equal(false);
    });

    cy.get("#username").type(email);
    cy.get("#password").type(senha);
    cy.contains("button", "Logar").click();
    cy.location("hash", { timeout: 6000 }).should("eq", "#/unidades");
    cy.contains("h1", "Unidades").should("be.visible");

    const alerta = cy.stub();
    cy.on("window:alert", alerta);

    cy.visit("/#/privacidade");
    cy.contains("h1", "Privacidade e Dados").should("be.visible");
    cy.get("#checkMarketing").should("not.be.checked").check();
    cy.wrap(alerta).should("have.been.calledWithMatch", "Alteração de preferência salva");

    cy.window().then((win) => {
      const usuarioLogado = JSON.parse(win.localStorage.getItem("raizes_nordeste_usuario") || "{}");
      const usuarios = JSON.parse(win.localStorage.getItem("raizes_nordeste_registered_users") || "[]");
      const usuarioAtualizado = usuarios.find((u) => u.email === email);

      expect(usuarioLogado.consentDados).to.equal(true);
      expect(usuarioAtualizado).to.exist;
      expect(usuarioAtualizado.consentDados).to.equal(true);
    });

    cy.reload();
    cy.get("#checkMarketing").should("be.checked");
  });
});
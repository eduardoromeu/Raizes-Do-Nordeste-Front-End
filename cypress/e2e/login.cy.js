describe('Login', () => {

  it('Realiza login com sucesso', () => {

    cy.visit('/#/login')

    cy.get('#username')
      .type('joaosilvada@netmail.com')

    cy.get('#password')
      .type('cliente123')

    cy.contains('Logar').click()

    cy.url().should('include', 'unidades')

  })

})
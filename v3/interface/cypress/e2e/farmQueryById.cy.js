import '@testing-library/cypress/add-commands'

;[false, true].forEach((testSmallScreen) => {
  before(() => cy.clearIndexedDB())
  describe('"Create Farm" Form Page', () => {
    beforeEach(() => {
      if (testSmallScreen) cy.viewport(320, 568)
      cy.connectWallet()
      cy.visit('http://localhost:3000/')
    })

    it('Renders regular farm list when no id present in URL', () => {
      cy.visit('http://localhost:3000/farm')
      cy.contains('Popular farms').should('exist')
      cy.findAllByTestId('farm-item').its('length').should('gt', 0)
      cy.findByTestId('farm-filter').should('be.visible')
    })

    it('Renders individual empty farm page when an invalid id is present in URL', () => {
      cy.visit('http://localhost:3000/farm?id=11111111')
      cy.contains('Farm ID 11111111').should('exist')
      cy.findByTestId('farm-item').should('not.exist')
      cy.contains('No farm with id 11111111 found').should('exist')
    })

    it('Renders individual farm page when an id is present in URL', () => {
      cy.visit('http://localhost:3000/farm')
      cy.get('[data-testid="farm-item-ALGO-SWAP662"] [data-testid="farm-item-dropdown-icon"] > .Icon-sc-127rh4w-0').click();
      cy.get('[data-testid="view-contract-link"]').invoke('attr', 'href').then((href) => {
        const farmId = href.substring(href.indexOf('n/') + 2)
        cy.visit(`http://localhost:3000/farm?id=${farmId}`)
        cy.contains(`Farm ID ${farmId}`).should('exist')
        cy.findAllByTestId('farm-item').its('length').should('eq', 1)
        cy.findByTestId(`farm-item-ALGO-SWAP662`).should('exist')
      })
    })

    it('Checks if the "Back to Farm" button works', () => {
      cy.visit('http://localhost:3000/farm?id=96238906')
      cy.findByRole('link', { name: /Back to Farms/i })
        .should('exist')
        .click()
      cy.url().should('eq', 'http://localhost:3000/farm')
    })
  })
})

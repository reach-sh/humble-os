import '@testing-library/cypress/add-commands'

[false, true].forEach((testSmallScreen) => {
  before(() => cy.clearIndexedDB());
  describe(`${testSmallScreen ? '(small screens)' : ''
    } Test Pools List Page`, () => {
      beforeEach(() => {
        if (testSmallScreen) cy.viewport(320, 568)
        cy.connectWalletVariant()
        cy.visit('http://localhost:3000/pool')
      })

      it('Test pools list', () => {
        cy.findByTestId('pools-list').its('length').should('gt', 0)
      })

      it('Test reload button', () => {
        cy.findByTestId('reload-pools').click()
        cy.get('div').contains('Pools updated!').should('be.visible')
      })

      it('Test search by token ID', () => {
        const SEARCH_TEXT = '0'
        cy.findByRole('textbox').type(SEARCH_TEXT)
        cy.findByTestId('pools-list').each((item) => {
          cy.wrap(item).find('p').should('contain.text', SEARCH_TEXT)
        })
      })

      it('Test search by symbol', () => {
        const SEARCH_TEXT = 'ALGO'
        cy.findByRole('textbox').type(SEARCH_TEXT)
        cy.findByTestId('pools-list').each((item) => {
          cy.wrap(item).find('p').should('contain.text', SEARCH_TEXT)
        })
      })

      it('Test search clear', () => {
        // TODO figure out a better way to wait for the farms to load
        cy.wait(10000)
        cy.findAllByTestId('list-item').then((initialList) => {
          const initialListLength = initialList.length

          const SEARCH_TEXT = 'ALGO'
          cy.findByRole('textbox').type(SEARCH_TEXT)
          cy.findByRole('textbox').clear()

          cy.findAllByTestId('list-item')
            .its('length')
            .should('eq', initialListLength)
        })
      })
    })
})

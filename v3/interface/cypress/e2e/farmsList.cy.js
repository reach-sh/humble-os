import '@testing-library/cypress/add-commands'
  ;[false, true].forEach((testSmallScreen) => {
    before(() => cy.clearIndexedDB());
    describe(`${testSmallScreen ? '(small screens)' : ''
      } Test Farms List Page`, () => {
        beforeEach(() => {
          if (testSmallScreen) cy.viewport(320, 568)
          cy.connectWalletVariant()
          cy.visit('http://localhost:3000/farm')
        })

        it('Test farms list', () => {
          cy.findAllByTestId('farm-item').its('length').should('gt', 0)
        })

        it('Test ended farms button', () => {
          cy.findByTestId('toggle').children().last().click()
          cy.findByTestId('farm-item').should('not.exist')
        })

        it('Test live farms button', () => {
          cy.findByTestId('toggle').children().last().click()
          cy.findByTestId('farm-item').should('not.exist')
          cy.findByTestId('toggle').children().first().click()
          cy.findAllByTestId('farm-item').its('length').should('gt', 0)
        })

        it('Test My Farms only button', () => {
          /* Wait for a farm to load */
          cy.get('[data-testid="farm-item"]').first().should('be.visible')

          cy.findByTestId('farm-filter')
            .findByTestId('checkmark')
            .should('have.class', 'checkmark')
            .should('not.have.class', 'checked')

          cy.findByTestId('farm-filter')
            .get('[type="checkbox"]')
            .should('not.have.checked')

          cy.findByTestId('farm-filter')
            .get('[type="checkbox"]')
            .check({ force: true })

          cy.findByTestId('farm-filter')
            .get('[type="checkbox"]')
            .should('have.checked')

          cy.findByTestId('farm-filter')
            .findByTestId('checkmark')
            .should('have.class', 'checkmark')
            .should('have.class', 'checked')

          // Conditional testing
          cy.findAllByTestId('farm-table').then(($table) => {
            // If there is an item in the list, it should not have 0 staked
            if ($table.find('[data-testid="farm-item-dropdown-icon"]').length) {
              $table.find('[data-testid="farm-item-dropdown-icon"]').first().click()
              cy.findByTestId('farm-item-detail').should(
                'not.have.text',
                'Staked: 0',
              )
            } else {
              // Otherwise assert there are no list items (or anything using that class) on display
              cy.findByTestId('farm-item').should('not.exist')
            }
          })
        })

        it('Test search by token name', () => {
          const SEARCH_TEXT = 'ALGO'
          cy.findByRole('textbox').type(SEARCH_TEXT)
          cy.findByTestId('farm-list').each((item) => {
            cy.wrap(item).find('div').should('contain.text', SEARCH_TEXT)
          })
        })

        it('Test search by symbol', () => {
          const SEARCH_TEXT = 'ALGO'
          cy.findByRole('textbox').type(SEARCH_TEXT)
          cy.findByTestId('farm-list').each((item) => {
            cy.wrap(item).find('div').should('contain.text', SEARCH_TEXT)
          })
        })

        it('Test farm dropdown', () => {
          cy.findAllByTestId('farm-item-dropdown-icon').first().click()
          cy.findByTestId('farm-item-dropdown').should('be.visible')
        })
      })
  })

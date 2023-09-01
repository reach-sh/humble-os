/// <reference types="cypress" />

[false, true].forEach(testSmallScreen => {
    before(() => cy.clearIndexedDB());
    describe(`${testSmallScreen ? '(small screens)' : ''} Confirm assorted edgecases`, () => {
      beforeEach(() => {
        if (testSmallScreen) cy.viewport(320, 568)
      })
  
      /* ==== Test Created with Cypress Studio ==== */
      it('Verify Farm loads on initial visit', function () {
        /* ==== Generated with Cypress Studio ==== */
        cy.clearLocalStorage()
        cy.visit('http://localhost:3000/farm')
        cy.get(
            '.RightContainer-sc-6dl9lv-2 > .ButtonBase-sc-xlra4z-0 > .content',
        ).should('have.text', 'Connect')
        cy.get(
            '.RightContainer-sc-6dl9lv-2 > .ButtonBase-sc-xlra4z-0 > .content',
        ).click()
        cy.get('[style="order: 0;"]').click()
        cy.get('[data-testid="farm-item-ALGO-KEEGANZ-name"]', { timeout: 10000 }).should('have.text', 'ALGO/KEEGANZ')
        /* ==== End Cypress Studio ==== */
      });

      /* ==== Test Created with Cypress Studio ==== */
      it('Verify Create Farm page doesn\'t show the modal if you aren\'t connected', function () {
        /* ==== Generated with Cypress Studio ==== */
        cy.clearLocalStorage()
        cy.visit('http://localhost:3000/farm/create')
        cy.get('[data-testid="checkbox"]').should('not.exist')
        /* ==== End Cypress Studio ==== */
      });
    })
  })
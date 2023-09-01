/// <reference types="cypress" />

[false, true].forEach(testSmallScreen => {
  before(() => cy.clearIndexedDB());
  describe(`${testSmallScreen ? '(small screens)' : ''} Confirm assorted edgecases`, () => {
    beforeEach(() => {
      if (testSmallScreen) cy.viewport(320, 568)
      cy.connectWallet()
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Affirm ALGO balance is larger than zero', function () {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.YourBalance-sc-1ixidk6-3 > span').should('not.have.text', 'Your balance: 0 ALGO');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Verify Farm loads on initial visit', function () {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[href="/farm"]').click();
      cy.get('[data-testid="farm-item-ALGO-KEEGANZ-name"]', { timeout: 15000 }).should('have.text', 'ALGO/KEEGANZ')
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Do not display duplicates in token select', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.TokData-sc-xlra4z-14 > div > .Icon-sc-127rh4w-0').click();
      cy.get('[data-testid="token-swap857"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="select-B"] > .content').click();
      cy.get('[data-testid="token-Algorand"]').click();
      /* ==== End Cypress Studio ==== */
    });
  })
})
/// <reference types="cypress" />

[false, true].forEach(testSmallScreen => {
  before(() => cy.clearIndexedDB());
  describe(`${testSmallScreen ? '(small screens)' : ''} Run tests against the settings dropdown`, () => {
    beforeEach(() => {
      if (testSmallScreen) cy.viewport(320, 568)
      cy.connectWallet()
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Dark Mode Toggle', () => {
      /* ==== Generated with Cypress Studio ==== */
      cy.get(
        '.SettingsContainer-sc-sats59-0 > .MuiButtonBase-root > .IconImg-sc-tb7xr1-1',
      ).click()
      cy.get(':nth-child(2) > .IconImage-sc-9bnokb-3').click()
      cy.get(
        '.SettingsContainer-sc-sats59-0 > .MuiButtonBase-root > .IconImg-sc-tb7xr1-1',
      ).click()
      /* ==== End Cypress Studio ==== */
    })

    it('Change to risky slippage', function () {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.SettingsContainer-sc-sats59-0 > .MuiButtonBase-root > .IconImg-sc-tb7xr1-1').click();
      cy.get('.Input-sc-37pfk1-0').clear();
      cy.get('.Input-sc-37pfk1-0').type('9');
      cy.get('.SettingsContainer-sc-18w3zq2-0 > .FlexColumnContainer-sc-1jizax6-1').click();
      cy.get('.PageContainerWrapper-sc-1u6v2b6-0').click();
      cy.get('[data-testid="slippage-warning-proceed"]').click();
      cy.get('.SettingsContainer-sc-sats59-0 > .MuiButtonBase-root').click();
      cy.get('.Input-sc-37pfk1-0').should('have.value', '9');
      /* ==== End Cypress Studio ==== */
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Change display currency to USD', function () {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.SettingsContainer-sc-sats59-0 > .MuiButtonBase-root > .IconImg-sc-tb7xr1-1').click();
      cy.get('.CurrencySelect-sc-pwiezw-2').select('usd');
      cy.get('.SettingsContainer-sc-sats59-0 > .MuiButtonBase-root > .IconImg-sc-tb7xr1-1').click();
      cy.get('.DisplaySymbol-sc-i802ym-0').should('have.text', '$');
      /* ==== End Cypress Studio ==== */
    });

    if (testSmallScreen) {
      /* ==== Test Created with Cypress Studio ==== */
      it('CheckOpeningWyreModalSmallScreen', function() {
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.WalletAddressText-sc-1gqen66-1').click();
        cy.get('.AccountContainer-sc-1ci94ec-0 > .itfWBF > .content').click();
        cy.get('.SelectContainer-sc-vlha1i-6').select('ARS');
        cy.get('.RotateIconContainer-sc-15baeod-1 > .MuiButtonBase-root > .IconImg-sc-tb7xr1-1').click();
        /* ==== End Cypress Studio ==== */
      });
    } else {
      /* ==== Test Created with Cypress Studio ==== */
      it('CheckOpeningWyreModal', function() {
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.FlexContainer-sc-1jizax6-0 > .ButtonBase-sc-xlra4z-0 > .content').click();
        cy.get('.SelectContainer-sc-vlha1i-6').select('ARS');
        cy.get('.RotateIconContainer-sc-15baeod-1 > .MuiButtonBase-root > .IconImg-sc-tb7xr1-1').click();
        /* ==== End Cypress Studio ==== */
      });
    }
  })
})

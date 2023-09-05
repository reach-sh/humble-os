/// <reference types="cypress" />

;[false, true].forEach((testSmallScreen) => {
  before(() => cy.clearIndexedDB());
  describe(`${testSmallScreen ? '(small screens)' : ''
    } Test Pool Creation Page`, () => {
    beforeEach(() => {
      if (testSmallScreen) cy.viewport(320, 568)
      cy.connectWallet()
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Create and confirm pool creation', function() {
      /* ==== Generated with Cypress Studio ==== */
      let tokenBSymbol = testSmallScreen ? 'TPC2' : 'TPC1'
      let tokenBName = tokenBSymbol.toLowerCase()
      cy.get('.StyledMenu-sc-1bpuuus-0 > [href="/pool"]').click();
      cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
      cy.get('[data-testid="select-A"] > .content').click();
      cy.get('[data-testid="token-Algorand"] > .SymbolWrapper-sc-1n7uqvm-0').click();
      cy.get('[data-testid="select-B"] > .content').click();
      cy.get(`[data-testid="token-${tokenBName}"] > .SymbolWrapper-sc-1n7uqvm-0`).click();
      cy.get('[data-testid="amount-A"]').clear();
      cy.get('[data-testid="amount-A"]').type('1');
      cy.get('[data-testid="amount-B"]').clear();
      cy.get('[data-testid="amount-B"]').type('1');
      cy.get('[data-testid="create-pool-btn"]', { timeout: 20000 }).click();
      cy.get('.Message-sc-ywo34w-2').should('have.text', 'Creating pool');
      cy.get('.Message-sc-ywo34w-2').should('have.text', 'Opting-in to LP token');
      cy.get('.Message-sc-ywo34w-2').should('have.text', 'Depositing funds');
      cy.get('[data-testid="pool-creation-success-modal-close-btn"]', { timeout: 20000 }).should('be.enabled');
      cy.get('[data-testid="success-modal-amount"]').should('have.text', '1');
      cy.get('[data-testid="success-modal-token-description"]').should('have.text', `ALGO/${tokenBSymbol} Pool Tokens`);
      cy.get('[data-testid="success-modal-token-A"]').should('have.text', '1 ALGO');
      cy.get('[data-testid="success-modal-token-B"]').should('have.text', `1 ${tokenBSymbol}`);
      cy.get('[data-testid="modal-title"]').should('have.text', 'You have created a new pool!');
      cy.get('[data-testid="pool-creation-success-modal-close-btn"]', { timeout: 20000 }).click();
      cy.get(`[data-testid="pool-Algorand-${tokenBName}-symbol"]`).should('have.text', `ALGO / ${tokenBSymbol}`);
      cy.get(`[data-testid="pool-Algorand-${tokenBName}-tvl"] > .FlexContainer-sc-1jizax6-0 > .Value-sc-tey69z-1 > .ContainerGeneral-sc-1ikybuq-3 > .Body-sc-1ikybuq-2 > .border-bottom`).should('have.text', '2 ALGO');
      cy.get(`[data-testid="pool-liq-item-ALGO-${tokenBSymbol}"] > .PoolTokensCell-sc-17kn8wv-16 > .PoolName-sc-17kn8wv-6`).should('have.text', `ALGO/${tokenBSymbol} Pool Tokens`);
      cy.get(`[data-testid="pool-liq-item-ALGO-${tokenBSymbol}-amt"]`).should('have.text', '1');
      cy.get(`[data-testid="pool-liq-item-ALGO-${tokenBSymbol}-tvl"]`).should('have.text', '≈2 ALGO');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it("Verify user can\\'t create pool if they don\\'t have the funds", function () {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.StyledMenu-sc-1bpuuus-0 > [href="/pool"]').click();
      cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
      cy.get('[data-testid="select-A"] > .content').click();
      cy.get('[data-testid="token-Algorand"] > .SymbolWrapper-sc-1n7uqvm-0').click();
      cy.get('[data-testid="select-B"] > .content').click();
      cy.get('[data-testid="token-nopool"] > .SymbolWrapper-sc-1n7uqvm-0').click();
      cy.get('[data-testid="amount-A"]').clear();
      cy.get('[data-testid="amount-A"]').type('0.001');
      cy.get('[data-testid="amount-B"]').clear();
      cy.get('[data-testid="amount-B"]').type('10000000');
      cy.get('[data-testid="create-pool-btn"]').should('have.text', 'Not enough funds ');
      /* ==== End Cypress Studio ==== */
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Verify user is prevented from creating partially empty pool tokA', function () {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.StyledMenu-sc-1bpuuus-0 > [href="/pool"]').click();
      cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
      cy.get('[data-testid="select-A"] > .content').click();
      cy.get('[data-testid="token-Algorand"] > .SymbolWrapper-sc-1n7uqvm-0').click();
      cy.get('[data-testid="select-B"] > .content').click();
      cy.get('[data-testid="token-nopool"] > .SymbolWrapper-sc-1n7uqvm-0').click();
      cy.get('[data-testid="amount-A"]').clear();
      cy.get('[data-testid="amount-A"]').type('0.001');
      cy.get('[data-testid="create-pool-btn"]').should('have.text', 'Cannot create a partially empty pool ');
      /* ==== End Cypress Studio ==== */
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Verify user is prevented from creating partially empty pool tokB', function () {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.StyledMenu-sc-1bpuuus-0 > [href="/pool"]').click();
      cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
      cy.get('[data-testid="select-A"] > .content').click();
      cy.get('[data-testid="token-Algorand"] > .SymbolWrapper-sc-1n7uqvm-0').click();
      cy.get('[data-testid="select-B"] > .content').click();
      cy.get('[data-testid="token-nopool"] > .SymbolWrapper-sc-1n7uqvm-0').click();
      cy.get('[data-testid="amount-B"]').clear();
      cy.get('[data-testid="amount-B"]').type('100');
      cy.get('[data-testid="create-pool-btn"]').should('have.text', 'Cannot create a partially empty pool ');
      /* ==== End Cypress Studio ==== */
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Verify Redirect to Add Liquidity Page', function () {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.StyledMenu-sc-1bpuuus-0 > [href="/pool"]').click();
      cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
      cy.get('[data-testid="select-A"] > .content').click();
      cy.get('[data-testid="token-Algorand"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="select-B"] > .content').click();
      cy.get('.Input-sc-vlha1i-0').clear();
      cy.get('.Input-sc-vlha1i-0').type('kee');
      cy.get('[data-testid="token-keeganz"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('.CardTitle-sc-1j0ig8k-1').should('have.text', 'Add Liquidity');
      /* ==== End Cypress Studio ==== */
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Verify Redirect to Add Liquidity Page Inverse', function () {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.StyledMenu-sc-1bpuuus-0 > [href="/pool"]').click();
      cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
      cy.get('[data-testid="select-A"] > .content').click();
      cy.get('.Input-sc-vlha1i-0').clear();
      cy.get('.Input-sc-vlha1i-0').type('kee');
      cy.get('[data-testid="token-keeganz"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="select-B"] > .content').click();
      cy.get('[data-testid="token-Algorand"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('.CardTitle-sc-1j0ig8k-1').should('have.text', 'Add Liquidity');
      /* ==== End Cypress Studio ==== */
    })
  })
})

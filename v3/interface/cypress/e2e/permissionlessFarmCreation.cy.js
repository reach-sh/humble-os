/// <reference types="cypress" />

[false, true].forEach(testSmallScreen => {
  before(() => cy.clearIndexedDB());
  describe(`${testSmallScreen ? '(small screens)' : ''} permissionless farm creation tests`, () => {
    beforeEach(() => {
      if (testSmallScreen) cy.viewport(320, 568)
      cy.connectWallet()
      cy.get('[href="/farm"]').click();
      cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
      cy.get('[data-testid="checkbox"]', { timeout: 20000 }).click();
      cy.get('.ModalContent-sc-53jizc-0 > .ButtonBase-sc-xlra4z-0 > .content').click();
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Ensure ALGO balance loads when you visit the create farm page', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('.StyledMenu-sc-1bpuuus-0 > [href="/pool"]').click();
      cy.get('[href="/farm"]').click();
      cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
      cy.get('[data-testid="checkbox"] > div').click();
      cy.get('.ModalContent-sc-53jizc-0 > .ButtonBase-sc-xlra4z-0').click();
      cy.get('[data-testid="create-farm-error-message"]').should('not.exist');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Verify includes and startswith token search', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.wait(4500); // wait for data to load
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('.Form-sc-vlha1i-8 > .Input-sc-vlha1i-0')
        .clear()
        .type('algo/ke', { delay: 100 });
      cy.get('[data-testid="token-HUMBLE LP - ALGO/KEEGANZ"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 })
        .should('be.visible')
        .should('include.text', 'HUMBLE LP - ALGO/KEEGANZ');
      cy.get('.Form-sc-vlha1i-8 > .Input-sc-vlha1i-0')
        .clear()
        .type('algo/keeganz');
      cy.get('[data-testid="token-HUMBLE LP - ALGO/KEEGANZ"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 }).should('be.visible')
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Verify Create Farm is enabled if inputs are correct', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-gar-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-gar"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="total-rewards-input"]').clear();
      cy.get('[data-testid="total-rewards-input"]').type('1');
      cy.get('[data-test="submit-button"]').should('be.enabled');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Create farm is disabled (with message) if users reward balance won\'t cover the input amount', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-keeganz-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-keeganz"] > .SymbolWrapper-sc-1n7uqvm-0').click();
      cy.get('[data-testid="total-rewards-input"]').clear();
      cy.get('[data-testid="total-rewards-input"]').type('1000');
      cy.get('[data-test="submit-button"]').should('be.disabled');
      cy.get('[data-testid="create-farm-error-message"]').should('include.text', 'The user has an insufficient Reward Token balance');
      cy.get('[data-testid="create-farm-error-message"]').should('include.text', 'but your account only has');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Create farm is disabled (with message) if users reward input won\'t cover the farm duration', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-swap821-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-swap821"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="start-date-trigger-input"]').invoke('val').then((someText) => {
        cy.log(someText)
        const startDate = new Date(someText)
        const twoMonthsAhead = ('0' + (((startDate.getUTCMonth() + 2) % 12) + 1).toString()).slice(-2)
        const endDate = `${startDate.getUTCFullYear() + 1}-${twoMonthsAhead}-27`
        cy.get('[data-testid="end-date-trigger-input"]').click();
        cy.get('[data-testid="hsd-date-input"]').click();
        cy.get('[data-testid="hsd-date-input"]').clear();
        cy.get('[data-testid="hsd-date-input"]').type(endDate);
      })
      cy.get('[data-testid="modal-confirm"] > .content').click();
      cy.get('[data-testid="total-rewards-input"]').clear();
      cy.get('[data-testid="total-rewards-input"]').type('1');
      cy.get('[data-test="submit-button"]').should('be.disabled');
      cy.get('[data-testid="create-farm-error-message"]').should('have.text', 'Rewards cannot be evenly distributed across the duration of your farm. If possible, try either a shorter duration or increased rewards payout.');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Create farm is disabled (with message) if users ALGO balance won\'t cover the input amount', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-gar-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-gar"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="total-rewards-input"]').clear();
      cy.get('[data-testid="total-rewards-input"]').type('100');
      cy.get('[data-testid="radio-true"]').click();
      cy.get('[data-testid="net-rewards-amt-input"]').clear();
      cy.get('[data-testid="net-rewards-amt-input"]').type('1000');
      cy.get('[data-test="submit-button"]').should('be.disabled');
      cy.get('[data-testid="create-farm-error-message"]').should('include.text', 'The user has an insufficient ALGO balance.');
      cy.get('[data-testid="create-farm-error-message"]').should('include.text', 'ALGO in the farm but your account only has');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Create farm is disabled (with message) if users stake token balance won\'t cover the baseline amount', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP821"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-gar"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="total-rewards-input"]').clear();
      cy.get('[data-testid="total-rewards-input"]').type('100');
      cy.get('[data-test="submit-button"]').should('be.disabled');
      cy.get('[data-testid="create-farm-error-message"]').should('include.text', 'The user has an insufficient Staking Token balance.');
      cy.get('[data-testid="create-farm-error-message"]').should('include.text', 'Your wallet must hold at least');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Create farm is disabled (with message) if users stake token balance won\'t cover the baseline amount', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP821"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-gar"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="total-rewards-input"]').clear();
      cy.get('[data-testid="total-rewards-input"]').type('100');
      cy.get('[data-testid="radio-true"]').click();
      cy.get('[data-testid="net-rewards-amt-input"]').clear();
      cy.get('[data-testid="net-rewards-amt-input"]').type('1');
      cy.get('[data-test="submit-button"]').should('be.disabled');
      cy.get('[data-testid="create-farm-error-message"]').should('include.text', 'The user has an insufficient Staking Token balance.');
      cy.get('[data-testid="create-farm-error-message"]').should('include.text', 'Your wallet must hold at least');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Create a farm and verify it is shown on farms page', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP657"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-swap821-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-swap821"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="total-rewards-input"]').clear();
      cy.get('[data-testid="total-rewards-input"]').type('100');
      cy.get('[data-test="submit-button"]').click();
      cy.get('[data-testid="return-to-farms-btn"]', { timeout: 20000 }).click();
      cy.get('[data-testid="farm-item-ALGO-SWAP657-total-staked"]', { timeout: 20000 }).should('include.text', '0.000001≈ALGO 0');
      cy.get('[data-testid="farm-item-ALGO-SWAP657-ends-or-starts"]').should('include.text', 'Starts: in 1 day(s)');
      cy.get('[data-testid="farm-item-ALGO-SWAP657-name"]').should('include.text', 'ALGO/SWAP657');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Create a farm and verify it is shown on individual farms page', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP857-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP857"] > .AssetName-sc-4gsxwg-2', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-swap821-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-swap821"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-testid="total-rewards-input"]').clear();
      cy.get('[data-testid="total-rewards-input"]').type('100');
      cy.get('[data-test="submit-button"]').click();
      cy.get('[data-testid="farm-link"]', { timeout: 20000 }).then(($div) => {
        const text = $div.text()
        cy.visit(text)
      })
      cy.get('[data-testid="farm-item-ALGO-SWAP857-total-staked"]', { timeout: 20000 }).should('include.text', '0.000001≈ALGO 0');
      cy.get('[data-testid="farm-item-ALGO-SWAP857-ends-or-starts"]').should('include.text', 'Starts: in 1 day(s)');
      cy.get('[data-testid="farm-item-ALGO-SWAP857-name"]').should('include.text', 'ALGO/SWAP857');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Create disabled no reward token amount', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/KEEGANZ-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-HUMBLE LP - ALGO/KEEGANZ"]', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-keeganz-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-keeganz"] > .AssetName-sc-4gsxwg-2').click();
      cy.get('[data-test="submit-button"]').should('be.disabled');
      cy.get('[data-testid="create-farm-error-message"]').should('have.text', 'You need to specify a KEEGANZ reward amount.');
      /* ==== End Cypress Studio ==== */
    });

    /* ==== Test Created with Cypress Studio ==== */
    it('Create disabled if network reward enabled with no amount', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-test="stake-token-input"]').click();
      cy.get('[data-testid="token-HUMBLE LP - ALGO/KEEGANZ-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-HUMBLE LP - ALGO/KEEGANZ"]', { timeout: 20000 }).click();
      cy.get('[data-test="reward-token-input"]').click();
      cy.get('[data-testid="token-keeganz-balance"]', { timeout: 20000 }).should('not.have.text', '0');
      cy.get('[data-testid="token-keeganz"]').click();
      cy.get('[data-testid="total-rewards-input"]').clear();
      cy.get('[data-testid="total-rewards-input"]').type('1');
      cy.get('[data-test="create-farm-form"] > :nth-child(1)').click();
      cy.get('[data-testid="radio-true"] > [data-testid="indicator"]').click();
      cy.get('[data-testid="create-farm-error-message"]').should('have.text', 'You need to specify an ALGO rewards amount');
      cy.get('[data-test="submit-button"]').should('be.disabled');
      /* ==== End Cypress Studio ==== */
    });
  })
})
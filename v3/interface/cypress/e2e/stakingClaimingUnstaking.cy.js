/// <reference types="cypress" />

[false, true].forEach(testSmallScreen => {
  before(() => cy.clearIndexedDB());
  describe(`${testSmallScreen ? '(small screens)' : ''} Test Staking/Unstaking for Farm Page`, () => {
    beforeEach(() => {
      if (testSmallScreen) cy.viewport(320, 568)
      cy.connectWallet()
    })

    it('Stake a ALGO/SP660 pool token in the ALGO/SP660 farm', () => {
      cy.visit('http://localhost:3000/farm')
      cy.get('[data-testid="farm-item-ALGO-SP660"] [data-testid="farm-item-dropdown-icon"] > .Icon-sc-127rh4w-0', { timeout: 12000 }).click();
      cy.get('[data-testid="stake-btn"] > .content').click();
      cy.get('.AmountInput-sc-13oo82w-8').clear();
      cy.get('.AmountInput-sc-13oo82w-8').type('0.1');
      cy.get('.StakeButton-sc-13oo82w-4 > .content').click();
      cy.get('.StyledProgressBarImage-sc-ay57wk-0').should('be.visible');
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').click();
    })

    it('Open stake modal and assert the percentages work (25%, 50%, 75%, 100%)', () => {
      cy.visit('http://localhost:3000/farm')
      cy.get('[data-testid="farm-item-ALGO-SP660"] [data-testid="farm-item-dropdown-icon"] > .Icon-sc-127rh4w-0', { timeout: 12000 }).click();
      cy.get('[data-testid="stake-btn"]').click();
      cy.get('[data-testid="your-balance"]').should('not.include.text', 'Loading...');
      cy.get('[data-testid="your-balance"]').then(($div) => {
        const text = $div.text()
        cy.get('[data-testid="your-balance"]', { timeout: 10000 }).should('include.text', 'ALGO/SP660');
        const splits = text.split(' ')
        const total = parseFloat(splits[0])
        console.log(total)
        cy.get('[for="25"]').click()
        cy.get('.AmountInput-sc-13oo82w-8').invoke('val').then((inputStr) => {
          const value = parseFloat(inputStr);
          const compareValue = total * 0.25;
          expect(value).to.be.closeTo(compareValue, 2);
        })
        cy.get('[for="50"]').click()
        cy.get('.AmountInput-sc-13oo82w-8').invoke('val').then((inputStr) => {
          const value = parseFloat(inputStr);
          const compareValue = total * 0.5;
          expect(value).to.be.closeTo(compareValue, 4);
        })
        cy.get('[for="75"]').click()
        cy.get('.AmountInput-sc-13oo82w-8').invoke('val').then((inputStr) => {
          const value = parseFloat(inputStr);
          const compareValue = total * 0.75;
          expect(value).to.be.closeTo(compareValue, 6);
        })
        cy.get('[for="100"]').click()
        cy.get('.AmountInput-sc-13oo82w-8').invoke('val').then((inputStr) => {
          const value = parseFloat(inputStr);
          expect(value).to.be.closeTo(total, 8);
        })
      })
    })

    it('Open the stake modal and assert that they can’t stake more than their balance', () => {
      cy.visit('http://localhost:3000/farm')
      cy.get('[data-testid="farm-item-ALGO-SWAP662"] [data-testid="farm-item-dropdown-icon"] > .Icon-sc-127rh4w-0', { timeout: 12000 }).click();
      cy.get('[data-testid="stake-btn"]').click();
      cy.get('[data-testid="your-balance"]').should('not.include.text', 'Loading...');
      cy.get('[data-testid="your-balance"]').then(($div) => {
        const text = $div.text()
        cy.get('[data-testid="your-balance"]', { timeout: 10000 }).should('include.text', 'ALGO/SWAP662');
        const splits = text.split(' ')
        const total = parseFloat(splits[0])
        cy.get('.AmountInput-sc-13oo82w-8').clear();
        cy.get('.AmountInput-sc-13oo82w-8').type((total + 1).toString());
        cy.get('.StakeButton-sc-13oo82w-4').should('be.disabled');
      })
    })

    it('Go to ended farms and assert you can’t stake to ended farms', function () {
      cy.visit('http://localhost:3000/farm')
      cy.get('[data-testid="farm-item-ALGO-SP660"] .ItemDetails-sc-ys1l6c-0', { timeout: 10000 }).should('include.text', 'ALGO/SP660')
      cy.get('[data-testid="toggle"] :nth-child(2) .ToggleText-sc-q39o5j-2').click();
      cy.get(':nth-child(1) > [data-testid="farm-item-ALGO-KEEGANZ"] [data-testid="farm-item-dropdown-icon"] > .Icon-sc-127rh4w-0').click();
      cy.get('[data-testid="stake-btn"]').should('be.disabled');
    });


    it('Open unstake modal and assert the percentages work (25%, 50%, 75%, 100%)', () => {
      cy.visit('http://localhost:3000/farm')
      cy.get('[data-testid="farm-item-ALGO-SWAP662"] [data-testid="farm-item-dropdown-icon"] > .Icon-sc-127rh4w-0', { timeout: 10000 }).click();
      cy.get('[data-testid="stake-btn"]').click();
      cy.get('[data-testid="your-balance"]').should('not.include.text', 'Loading...');
      cy.get('[data-testid="your-balance"]').then(($div) => {
        const text = $div.text()
        cy.get('[data-testid="your-balance"]', { timeout: 10000 }).should('include.text', 'ALGO/SWAP662');
        const splits = text.split(' ')
        const total = parseFloat(splits[0])
        cy.get('[for="25"]').debug().click()
        cy.get('.AmountInput-sc-13oo82w-8').invoke('val').then((inputStr) => {
          const value = parseFloat(inputStr);
          const compareValue = total * 0.25;
          expect(value).to.be.closeTo(compareValue, 2);
        })
        cy.get('[for="50"]').debug().click()
        cy.get('.AmountInput-sc-13oo82w-8').invoke('val').then((inputStr) => {
          const value = parseFloat(inputStr);
          const compareValue = total * 0.5;
          expect(value).to.be.closeTo(compareValue, 4);
        })
        cy.get('[for="75"]').debug().click()
        cy.get('.AmountInput-sc-13oo82w-8').invoke('val').then((inputStr) => {
          const value = parseFloat(inputStr);
          const compareValue = total * 0.75;
          expect(value).to.be.closeTo(compareValue, 6);
        })
        cy.get('[for="100"]').debug().click()
        cy.get('.AmountInput-sc-13oo82w-8').invoke('val').then((inputStr) => {
          const value = parseFloat(inputStr);
          expect(value).to.be.closeTo(total, 8);
        })
      })
    })

    it('Open the unstake modal and assert that they can’t unstake more than their balance', () => {
      cy.visit('http://localhost:3000/farm')
      cy.get('[data-testid="farm-item-ALGO-SWAP662"] [data-testid="farm-item-dropdown-icon"] > .Icon-sc-127rh4w-0', { timeout: 10000 }).click();
      cy.get('[data-testid="stake-btn"]').click();
      cy.get('[data-testid="your-balance"]').should('not.include.text', 'Loading...');
      cy.get('[data-testid="your-balance"]').then(($div) => {
        const text = $div.text()
        cy.get('[data-testid="your-balance"]', { timeout: 10000 }).should('include.text', 'ALGO/SWAP662');
        const splits = text.split(' ')
        const total = parseFloat(splits[0])
        const overTotal = (total + 1).toString()
        cy.get('.AmountInput-sc-13oo82w-8').clear();
        cy.get('.AmountInput-sc-13oo82w-8').type(overTotal);
        cy.get('.AmountInput-sc-13oo82w-8').should('have.value', overTotal);
        cy.get('.StakeButton-sc-13oo82w-4').should('be.disabled');
      })
    })

    /* ==== Test Created with Cypress Studio ==== */
    it('Claim your rewards from the ALGO/SWAP660 farm', function() {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[href="/farm"]').click();
      cy.get('[data-testid="farm-item-ALGO-SP660"] [data-testid="farm-item-dropdown-icon"] > .Icon-sc-127rh4w-0').click();
      cy.get('[data-testid="claim-btn"]', { timeout: 10000 }).click();
      cy.get('.ClaimRewardsContainer-sc-19wky2k-0 > .ButtonBase-sc-xlra4z-0').should('be.enabled');
      cy.get('.ClaimRewardsContainer-sc-19wky2k-0 > .ButtonBase-sc-xlra4z-0').click();
      cy.get('[data-testid="modal-title"]').should('have.text', 'You claimed your rewards!');
      cy.get('[data-testid="pool-creation-success-modal-close-btn"]').click();
      cy.get('[data-testid="claim-btn"]').should('be.disabled');
      /* ==== End Cypress Studio ==== */
    });

    it('Unstake a ALGO/SWAP660 pool token in the ALGO/SWAP660 farm', () => {
      cy.visit('http://localhost:3000/farm')
      cy.get('[data-testid="farm-item-ALGO-SP660"] [data-testid="farm-item-dropdown-icon"] > .Icon-sc-127rh4w-0', { timeout: 10000 }).debug().click()
      cy.get('[data-testid="unstake-btn"]').should('be.visible');
      cy.get('[data-testid="unstake-btn"]').click();
      cy.get('.ModalContents-sc-15baeod-4').should('be.visible')
      cy.get('[id="100"]').should('be.enabled')
      cy.get('[for="100"]').click();
      cy.get('.StakeButton-sc-13oo82w-4').debug().click()
      cy.get('.StyledProgressBarImage-sc-ay57wk-0').should('be.visible');
      cy.get('.ModalContents-sc-15baeod-4').should('be.visible')
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').debug().click()
    })
  })
})
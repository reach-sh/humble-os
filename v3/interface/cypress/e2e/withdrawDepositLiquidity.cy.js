import '@testing-library/cypress/add-commands'

  ;[false, true].forEach((testSmallScreen) => {
    before(() => cy.clearIndexedDB());
    describe(`${testSmallScreen ? '(small screens)' : ''
      } Test Deposit and Withdraw Liquidity`, () => {
      beforeEach(() => {
        if (testSmallScreen) cy.viewport(320, 568)
        cy.connectWalletVariant()
        cy.visit('http://localhost:3000/pool')
      })

      it(`(Slider Input) Verify you can't withdraw liquidity with 0%`, () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        ).set
        cy.findByTestId('pool-liq-item-ALGO-KEEGANZ', { timeout: 20000 }).findByRole('link', { name: 'Remove' }).click()
        cy.get('[data-testid="remove-liq-button"]').should('have.text', 'Remove liquidity');
        cy.findByRole('slider').then(($range) => {
          const range = $range[0]
          nativeInputValueSetter.call(range, 0)
          range.dispatchEvent(new Event('change', { value: 0, bubbles: true }))
        })
        cy.findByTestId('remove-liq-button').should('be.disabled')
      })

      it(`(Text Input) Verify you can't withdraw liquidity with 0%`, () => {
        cy.findByTestId('pool-liq-item-ALGO-KEEGANZ', { timeout: 20000 }).findByRole('link', { name: 'Remove' }).click()
        cy.get('[data-testid="remove-liq-button"]').should('have.text', 'Remove liquidity');
        cy.findByPlaceholderText('Custom').click().clear().type(0)
        cy.findByTestId('remove-liq-button').should('be.disabled')
      })

      it(`Verify percentage buttons selector on withdraw liquidity`, () => {
        cy.findByTestId('pool-liq-item-ALGO-KEEGANZ', { timeout: 20000 }).findByRole('link', { name: 'Remove' }).click()
        cy.get('[data-testid="remove-liq-button"]').should('have.text', 'Remove liquidity');
        cy.findByTestId('slider').findAllByRole('button').first().click()
        cy.findByTestId('percentage-input').should('have.value', 25)
        cy.findByTestId('remove-liq-button').should('be.enabled')
        cy.findByTestId('slider').findAllByRole('button').eq(1).click()
        cy.findByTestId('percentage-input').should('have.value', 50)
        cy.findByTestId('remove-liq-button').should('be.enabled')
        cy.findByTestId('slider').findAllByRole('button').eq(2).click()
        cy.findByTestId('percentage-input').should('have.value', 75)
        cy.findByTestId('remove-liq-button').should('be.enabled')
        cy.findByTestId('slider').findAllByRole('button').last().click()
        cy.findByTestId('percentage-input').should('have.value', 100)
        cy.findByTestId('remove-liq-button').should('be.enabled')
      })

      it(`Verify you can withdraw liquidity`, () => {
        cy.findByTestId('pool-liq-item-ALGO-KEEGANZ', { timeout: 20000 }).findByRole('link', { name: 'Remove' }).click()
        cy.get('[data-testid="remove-liq-button"]').should('have.text', 'Remove liquidity');
        cy.findByPlaceholderText('Custom').click().clear().type(1)
        cy.findByTestId('remove-liq-button').should('be.enabled').click()
        cy.get('.Title-sc-15baeod-3').should('have.text', 'Confirm removing liquidity');
        cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').should('be.enabled');
        cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').should('have.text', 'Confirm');
        cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').click();
        cy.get('.Title-sc-15baeod-3').should('have.text', 'You removed liquidity!');
        cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').should('be.enabled');
        cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').should('have.text', 'Close');
        cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').click();
      })

      it(`Verify you can't deposit liquidity with a token of no-balance`, () => {
        cy.findByTestId('pool-liq-item-ALGO-KEEGANZ', { timeout: 20000 })
          .findByRole('link', { name: 'Add more' })
          .click()
        cy.findByTestId('add-liq-button').should('be.disabled')
        cy.findByTestId('amount-A').type(1000000)
        cy.findByTestId('add-liq-button')
          .should('be.disabled')
          .and('have.text', 'Not enough funds ')
      })

      it(`Verify you can deposit liquidity`, () => {
        cy.findByTestId('pool-liq-item-ALGO-KEEGANZ', { timeout: 20000 })
          .findByRole('link', { name: 'Add more' })
          .click()
        cy.findByTestId('amount-A').type(0.1)
        cy.findByTestId('add-liq-button')
          .should('be.enabled')
          .and('have.text', 'Add Liquidity ')
          .click()
        cy.get('.Title-sc-15baeod-3').should('have.text', 'You added liquidity!');
        cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').should('be.enabled');
        cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').should('have.text', 'Close');
        cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0').click();
      })

      /* ==== Test Created with Cypress Studio ==== */
      it('Verify balance adjusts in stake token dropdown', function() {
        /* ==== Generated with Cypress Studio ==== */
        cy.get('[data-testid="pool-liq-item-ALGO-SWAP896"]', { timeout: 20000 }).should('be.visible')
        cy.get('[data-testid="pool-liq-item-ALGO-SWAP896-amt"]').then(($div) => {
          const text = $div.text()
          cy.get('[href="/farm"]').click();
          cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
          cy.get('[data-testid="checkbox"] > div').click();
          cy.get('.ModalContent-sc-53jizc-0 > .ButtonBase-sc-xlra4z-0').click();
          cy.get('[data-test="stake-token-input"]').click();
          cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP896-balance"]', { timeout: 10000 }).should('have.text', text);
          cy.get('.MuiDialog-container').click();
          cy.get('.StyledMenu-sc-1bpuuus-0 > [href="/pool"]').click();
          cy.get('[data-testid="pool-liq-item-ALGO-SWAP896-remove"]').click();
          cy.get('[data-testid="remove-liq-button"]').should('have.text', 'Remove liquidity');
          cy.get('[data-testid="remove-liq-button"]').click();
          cy.get('[data-testid="remove-liquidity-confirmation"]').click();
          cy.get('[data-testid="pool-creation-success-modal-close-btn"]').click();
          cy.get('[href="/farm"]').click();
          cy.get('.LinkWithButtonProps-sc-xlra4z-2').click();
          cy.get('[data-testid="checkbox"] > div').click();
          cy.get('.ModalContent-sc-53jizc-0 > .ButtonBase-sc-xlra4z-0').click();
          cy.get('[data-test="stake-token-input"]').click();
          cy.get('[data-testid="token-HUMBLE LP - ALGO/SWAP896-balance"]').should('include.text', (Number(text) / 2));
        })
        /* ==== End Cypress Studio ==== */
      });
    })
  })

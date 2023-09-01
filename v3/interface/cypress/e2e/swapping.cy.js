/// <reference types="cypress" />

Cypress.Commands.add('selectToken', (selector, tokenName) => {
  cy.get(`[data-testid="${selector}"]`).click()
  cy.get(`[data-testid="token-${tokenName}"]`).should('exist')
  cy.wait(1000)
  cy.get(`[data-testid="token-${tokenName}"]`).click()
})

;[false, true].forEach((testSmallScreen) => {
  const label = testSmallScreen ? 'Small' : 'Large'

  before(() => cy.clearIndexedDB());
  describe(`${label} screen Swapping Tests`, () => {
    beforeEach(() => {
      if (testSmallScreen) cy.viewport(320, 568)
      cy.connectWallet()
    })

    it('Warns of insufficient funds (KEEGANZ [44110986]/VAR [26674979]) B-to-A', function () {
      cy.get('[data-testid="select-A"] .content').should('have.text', 'ALGO')
      cy.selectToken('select-A', 'keeganz')
      cy.get('[data-testid="select-A"] .content').should('have.text', 'KEEGANZ')
      cy.get('[data-testid="amount-A"]').should('be.disabled')
      cy.selectToken('select-B', 'var')
      cy.get('[data-testid="select-B"] .content').should('have.text', 'VAR')
      cy.get('[data-testid="amount-A"]').should('be.enabled')
      cy.get('[data-testid="amount-B"]').should('be.enabled')
      cy.get('[data-testid="amount-A"]').clear().type('700')
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.disabled')
        .should('have.text', 'Not enough funds for this swap ')
    })

    it('Warns of insufficient funds (KEEGANZ [44110986]/VAR [26674979]) A-to-B', function () {
      cy.get('[data-testid="select-A"] .content').should('have.text', 'ALGO')
      cy.selectToken('select-A', 'keeganz')
      cy.get('[data-testid="select-A"] .content').should('have.text', 'KEEGANZ')
      cy.get('[data-testid="amount-A"]').should('be.disabled')
      cy.selectToken('select-B', 'var')
      cy.get('[data-testid="select-B"] .content').should('have.text', 'VAR')
      cy.get('[data-testid="amount-A"]').should('be.enabled')
      cy.get('[data-testid="amount-B"]').should('be.enabled')
      cy.get('[data-testid="amount-A"]').clear().type('700')
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.disabled')
        .should('have.text', 'Not enough funds for this swap ')
    })

    it('Warns of insufficient liquidity (KEEGANZ [44110986]/VAR [26674979]) A-to-B', function () {
      cy.get('[data-testid="select-A"] .content').should('have.text', 'ALGO')
      cy.selectToken('select-A', 'keeganz')
      cy.get('[data-testid="select-A"] .content').should('have.text', 'KEEGANZ')
      cy.get('[data-testid="amount-A"]').should('be.disabled')
      cy.selectToken('select-B', 'var')
      cy.get('[data-testid="select-B"] .content').should('have.text', 'VAR')
      cy.get('[data-testid="amount-A"]').should('be.enabled')
      cy.get('[data-testid="amount-B"]').should('be.enabled')
      cy.get('[data-testid="amount-B"]').clear().type('2000')
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.disabled')
        .should('have.text', 'Not enough liquidity for this swap ')
    })

    it('Pre-selects ALGO and disables fields', function () {
      cy.get('[data-testid="select-A"] .content').should('have.text', 'ALGO')
      cy.get('[data-testid="select-B"] .content').should(
        'have.text',
        'Select a Token',
      )
      cy.get('[data-testid="amount-B"]').should('be.disabled')
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.disabled')
        .should('have.text', 'Select a token above ')
    })

    it('Swaps ALGO to GAR (26674964) A-to-B', function () {
      cy.selectToken('select-B', 'gar')
      cy.get('[data-testid="select-B"] .content').should('have.text', 'GAR')
      cy.get('[data-testid="amount-A"]').clear().type('0.0001')
      cy.get(
        ':nth-child(1) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4 > .TokenSymbol-sc-14oyy26-5',
      ).should('have.text', 'ALGO')
      cy.get(
        ':nth-child(2) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4 > .TokenSymbol-sc-14oyy26-5',
      ).should('have.text', 'GAR')
      cy.get('.HeaderTop-sc-19z3l3g-2 > .material-icons').click()
      cy.get('.WarningBodyWapper-sc-19z3l3g-6').should('be.visible')
      cy.get('.HeaderTop-sc-19z3l3g-2 > .material-icons').click()
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.enabled')
        .should('have.text', 'Swap Tokens ')
      cy.get('[data-testid="do-swap-btn"]').click()
      cy.get('.ModalContents-sc-15baeod-4').should('be.visible')
      cy.get('.ConfirmSwapContainer-sc-1rrm23p-0').click()
      cy.get('[data-testid="modal-confirm"]').should(
        'have.text',
        'Confirm',
      )
      cy.get('[data-testid="modal-cancel"]').should('have.text', 'Cancel')
      cy.get('[data-testid="modal-confirm"]').click()
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.disabled')
        .should('have.text', 'Loading... ')
      cy.get('.Title-sc-15baeod-3').should('have.text', 'You swapped successfully!');
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0 > .content').should('have.text', 'Close');
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0 > .content').click();
    })

    it('Swaps ALGO to GAR (26674964) B-to-A', function () {
      cy.selectToken('select-B', 'gar')
      cy.get('[data-testid="select-B"] .content').should('have.text', 'GAR')
      cy.get('[data-testid="amount-B"]').clear().type('0.0001')
      cy.get(
        '.StatsCardContainer-sc-1384fa3-0 > :nth-child(1) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4',
      ).should('have.text', '0  ALGO')
      cy.get(
        ':nth-child(2) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4 > .TokenSymbol-sc-14oyy26-5',
      ).should('have.text', 'GAR')
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.enabled')
        .should('have.text', 'Swap Tokens ')
      cy.get('[data-testid="do-swap-btn"]').click()
      cy.get('.MuiPaper-root').should('be.visible')
      cy.get(
        '.ConfirmSwapContainer-sc-1rrm23p-0 > .StatsCardContainer-sc-1384fa3-0 > :nth-child(1) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4 > .TokenSymbol-sc-14oyy26-5',
      ).should('have.text', 'ALGO')
      cy.get(
        '.ConfirmSwapContainer-sc-1rrm23p-0 > .StatsCardContainer-sc-1384fa3-0 > :nth-child(2) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4 > .TokenSymbol-sc-14oyy26-5',
      ).should('have.text', 'GAR')
      cy.get('[data-testid="modal-confirm"]').should(
        'have.text',
        'Confirm',
      )
      cy.get('[data-testid="modal-cancel"]').should('have.text', 'Cancel')
      cy.get('[data-testid="modal-confirm"]').click()
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.disabled')
        .should('have.text', 'Loading... ')
      cy.get('.Title-sc-15baeod-3').should('have.text', 'You swapped successfully!');
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0 > .content').should('have.text', 'Close');
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0 > .content').click();
    })

    it('Swaps GAR (26674964) to ALGO A-to-B', function () {
      cy.get('[data-testid="select-A"] .content').should('have.text', 'ALGO')
      cy.selectToken('select-A', 'gar')
      cy.get('[data-testid="select-A"] .content').should('have.text', 'GAR')
      cy.selectToken('select-B', 'Algorand')
      cy.get('[data-testid="select-B"] .content').should('have.text', 'ALGO')
      cy.get('[data-testid="amount-A"]').clear().type('0.0001')
      cy.get(
        ':nth-child(1) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4 > .TokenSymbol-sc-14oyy26-5',
      ).should('have.text', 'GAR')
      cy.get(
        ':nth-child(2) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4 > .TokenSymbol-sc-14oyy26-5',
      ).should('have.text', 'ALGO')
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.enabled')
        .should('have.text', 'Swap Tokens ')
      cy.get('[data-testid="do-swap-btn"]').click()
      cy.get('[data-testid="modal-confirm"]').should('be.visible')
      cy.get('[data-testid="modal-confirm"]').should(
        'have.text',
        'Confirm',
      )
      cy.get('[data-testid="modal-cancel"]').should('have.text', 'Cancel')
      cy.get('[data-testid="modal-confirm"]').click()
      cy.get('.Title-sc-15baeod-3').should('have.text', 'You swapped successfully!');
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0 > .content').should('have.text', 'Close');
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0 > .content').click();
    })

    it('Swaps GAR (26674964) to ALGO B-to-A', function () {
      cy.get('[data-testid="select-A"] .content').should('have.text', 'ALGO')
      cy.selectToken('select-A', 'gar')
      cy.get('[data-testid="select-A"] .content').should('have.text', 'GAR')
      cy.selectToken('select-B', 'Algorand')
      cy.get('[data-testid="select-B"] .content').should('have.text', 'ALGO')
      cy.get('[data-testid="amount-B"]').clear().type('0.0001')
      cy.get(
        ':nth-child(1) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4 > .TokenSymbol-sc-14oyy26-5',
      ).should('have.text', 'GAR')
      cy.get(
        ':nth-child(2) > .ValuesWrapper-sc-14oyy26-3 > .BoldText-sc-14oyy26-4 > .TokenSymbol-sc-14oyy26-5',
      ).should('have.text', 'ALGO')
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.enabled')
        .should('have.text', 'Swap Tokens ')
      cy.get('[data-testid="do-swap-btn"]').click()
      cy.get('[data-testid="modal-confirm"]').should('be.visible')
      cy.get('[data-testid="modal-confirm"]').should(
        'have.text',
        'Confirm',
      )
      cy.get('[data-testid="modal-cancel"]').should('have.text', 'Cancel')
      cy.get('[data-testid="modal-confirm"]').click()
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.disabled')
        .should('have.text', 'Loading... ')
      cy.get('.Title-sc-15baeod-3').should('have.text', 'You swapped successfully!');
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0 > .content').should('have.text', 'Close');
      cy.get('.FlexColumnContainer-sc-1jizax6-1 > .ButtonBase-sc-xlra4z-0 > .content').click();
    })

    it('Warns of slippage over 100% (KEEGANZ [44110986]/VAR [26674979])', function () {
      cy.get('[data-testid="select-A"] .content').should('have.text', 'ALGO')
      cy.selectToken('select-A', 'gar')
      cy.get('[data-testid="select-A"] .content').should('have.text', 'GAR')
      cy.selectToken('select-B', 'var')
      cy.get('[data-testid="select-B"] .content').should('have.text', 'VAR')
      cy.get('[data-testid="amount-A"]').clear().type('500000')
      cy.get('.HeaderTitle-sc-19z3l3g-4').should(
        'have.text',
        'High Risk: Sizeable Swap',
      )
      cy.get('[data-testid="do-swap-btn"]')
        .should('be.disabled')
        .should('have.text', 'Slippage is at (or over) 100% ')
    })

  })
})

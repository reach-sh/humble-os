/// <reference types="cypress" />

;[false].forEach((testSmallScreen) => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const utcMonth = now.getUTCMonth()
  const currMonth = months[now.getUTCMonth()]

  before(() => cy.clearIndexedDB());
  describe('"Create Farm" Form Page', () => {
    beforeEach(() => {
      if (testSmallScreen) cy.viewport(320, 568)
      cy.connectWallet()
      cy.visit('http://localhost:3000/farm/new')
      cy.get('[data-testid="checkbox"]').click();
      cy.get('.ModalContent-sc-53jizc-0 > .ButtonBase-sc-xlra4z-0 > .content').click();
    })

    it('Renders placeholders and a disabled "submit" button', () => {
      const $inputs = [
        '[data-test="stake-token-input"]',
        '[data-test="reward-token-input"]',
      ]

      $inputs.forEach(($attr) =>
        cy.get($attr).should('have.attr', 'placeholder', '10458941'),
      )

      cy.get('[data-testid="total-rewards-input"]').should(
        'have.attr',
        'placeholder',
        '10000000',
      )

      cy.get('[data-testid="radio-false"]')
        .get('[data-testid="indicator"]')
        .should('have.class', 'checked')

      cy.get('[data-testid="radio-false"]')
        .get('[type="radio"]')
        .should('have.checked')

      cy.get('[data-test="submit-button"]')
        .should('be.disabled')
        .should('include.text', 'Create Farm')
    })

    it('Selects tokens with the Token Selector', function () {
      cy.get('[data-test="stake-token-input"]')
        .should('be.empty')
        .and('have.attr', 'placeholder', '10458941')
        .click()
      cy.get('[data-testid="token-HUMBLE LP - ALGO/GAR"]', { timeout: 10000 }).click()
      cy.get('[data-test="stake-token-input"]').should('include.value', 'HUMBLE LP - ALGO/GAR')

      cy.get('[data-test="reward-token-input"]').click()
      cy.get('[data-testid="token-var"]', { timeout: 10000 }).click()
      cy.get('[data-test="reward-token-input"]').should('include.value', 'var')
      cy.get('[data-testid="total-rewards-input"]')
        .should('be.empty')
        .and('have.attr', 'placeholder', '10000000')
        .clear()
        .type('2500')
      cy.get('[data-testid="total-rewards-input"]').should('have.value', '2500')
      cy.get('[data-test="submit-button"]').should('be.disabled')
    })

    it('Toggles network rewards', function () {
      cy.get('[data-testid="radio-false"] > [data-testid="indicator"]').should(
        'have.class',
        'checked',
      )
      cy.get('[data-testid="radio-true"] > [data-testid="indicator"]').should(
        'not.have.class',
        'checked',
      )
      cy.get('[data-testid="radio-true"] > [type="radio"]').check({
        force: true,
      })
      cy.get('[data-testid="radio-true"] > [data-testid="indicator"]').should(
        'have.class',
        'checked',
      )
      cy.get('[data-testid="net-rewards-funder-input"]')
        .should('be.visible')
        .should('be.enabled')
      cy.get('[data-testid="net-rewards-amt-input"]')
        .should('be.visible')
        .should('be.empty')
        .should('have.attr', 'placeholder', '10000000')
      cy.get('[data-testid="radio-false"] > [data-testid="indicator"]').should(
        'not.have.class',
        'checked',
      )

      cy.get('[data-testid="radio-false"] > [type="radio"]').check({
        force: true,
      })
      cy.get('[data-testid="radio-false"] > [data-testid="indicator"]').should(
        'have.class',
        'checked',
      )
      cy.get('[data-testid="net-rewards-funder-input"]').should('not.exist')
      cy.get('[data-testid="net-rewards-amt-input"]').should('not.exist')
      cy.get('[data-testid="radio-true"] > [data-testid="indicator"]').should(
        'not.have.class',
        'checked',
      )
    })

    it('Toggles the modal', function () {
      // Trigger "select start date"
      const $assertElementsAndClose = () => {
        cy.get('[data-test="modal-picker"]').should('be.visible')
        cy.get('[data-testid="hsd-date-input"]').should('be.visible')
        cy.get('[data-testid="hsd-time-input"]').should('be.visible')
        cy.get('[data-testid="modal-confirm"]').should('be.visible')
        cy.get('[data-testid="modal-cancel"]').should('be.visible').click()
      }

      cy.get('[data-testid="start-date-trigger-input"]')
        .should('be.visible')
        .click()
      $assertElementsAndClose()

      // Trigger "select end date"
      cy.get('[data-testid="end-date-trigger-input"]')
        .should('be.visible')
        .click()
      $assertElementsAndClose()
    })

    it('Changes dates in the modal', function () {
      const newMonth = months[utcMonth + 1]
      const newUTCMonth = (utcMonth + 2).toString().padStart(2, '0')
      const day = 15
      const datePickerDay = `.react-datepicker__day--0${day}`
      const input = `${year}-${newUTCMonth}-${day}`
      cy.get('[data-testid="radio-false"]').get('[type="radio"]').check({
        force: true,
      })
      cy.get('[data-testid="start-date-trigger-input"]').click()
      cy.get('[data-test="modal-picker"]').should('be.visible')
      cy.get('[data-testid="modal-confirm"]').should('be.visible')
      cy.get('[data-testid="modal-cancel"]').should('be.visible')

      // Enter selections but don't save
      cy.get('[data-testid="hsd-date-input"]')
        .should('have.attr', 'aria-invalid', 'false')
        .clear()
      cy.get('[data-testid="hsd-date-input"]')
        .should('have.attr', 'aria-invalid', 'true')
        .clear()
        .type(input)
      cy.get('[data-testid="hsd-time-input"]').should(
        'have.attr',
        'aria-invalid',
        'false',
      )

      // Confirm UI state
      cy.get(datePickerDay).should(
        'have.class',
        'react-datepicker__day--selected',
      )
      cy.get('[data-testid="hsd-time-input"]').should(
        'have.attr',
        'aria-invalid',
        'false',
      )
      cy.get('[data-testid="hsd-time-input"]').clear().type('10:00 A')
      cy.get('[data-testid="hsd-time-input"]').should(
        'have.attr',
        'aria-invalid',
        'true',
      )

      // Cancel action
      cy.get('[data-testid="modal-cancel"]').should('be.visible').click()

      // Confirm nothing was saved and reopen modal
      cy.get('[data-testid="start-date-trigger-input"]')
        .should('not.have.value', `2022-${newMonth}-${day} (10:00:00 AM)`)
        .click()

      // repeat and save inputs
      cy.get('[data-testid="hsd-date-input"]')
        .should('have.attr', 'aria-invalid', 'false')
        .clear()
        .type(input)
      cy.get('[data-testid="hsd-time-input"]').clear().type('10:00 AM')
      cy.get('[data-testid="modal-confirm"]').click()
      cy.get('[data-testid="start-date-trigger-input"]').should(
        'have.value',
        `2022-${newMonth}-${day} (10:00:00 AM)`,
      )

      // change start day and ensure the hour/minute doesn't change
      cy.get('[data-testid="start-date-trigger-input"]').click()
      cy.get('[data-testid="hsd-date-input"]')
        .should('have.attr', 'aria-invalid', 'false')
        .clear()
        .type(`${year}-${newUTCMonth}-${day + 1}`)
      cy.get('[data-testid="hsd-time-input"]').clear().type('10:00 AM')
      cy.get('[data-testid="modal-confirm"]').click()
      cy.get('[data-testid="start-date-trigger-input"]').should(
        'have.value',
        `2022-${months[Number(newUTCMonth) - 1]}-${day + 1} (10:00:00 AM)`,
      )
    })

    it('Changes range dates', function () {
      // Select dates anyway
      cy.get('[data-testid="start-date-trigger-input"]').click()
      cy.get('[data-test="modal-picker"]').should('be.visible')
      cy.get('[data-testid="modal-confirm"]').should('be.visible')
      cy.get('[data-testid="modal-cancel"]').should('be.visible')

      // Enter date selections
      const day = 16
      const datePickerDay = `.react-datepicker__day--0${day}`
      const newMonth = months[utcMonth + 1]
      const newUTCMonth = (utcMonth + 2).toString().padStart(2, '0')
      const dateInput = `${year}-${newUTCMonth}-${day}`
      cy.get('[data-testid="hsd-date-input"]').clear().type(dateInput)

      // Confirm UI state
      cy.get(datePickerDay).should(
        'have.class',
        'react-datepicker__day--selected',
      )
      cy.get('[data-testid="hsd-time-input"]').clear().type('10:00 AM')
      cy.get('[data-testid="modal-confirm"]').should('be.visible').click()

      // Confirm changes were saved, and that end date matches start
      cy.get('[data-testid="start-date-trigger-input"]').should(
        'have.value',
        `2022-${newMonth}-${day} (10:00:00 AM)`,
      )
    })

    it('Disable the submit button when all fields are filled but you don\'t have enough ALGO', function () {
      // Select stake + reward tokens (check button state on every step)
      cy.get('[data-test="stake-token-input"]')
        .should('be.empty')
        .should('have.attr', 'placeholder', '10458941')
        .click()
      cy.get('[data-testid="token-HUMBLE LP - ALGO/GAR"]', { timeout: 10000 }).click()
      cy.get('[data-test="stake-token-input"]').should('include.value', 'HUMBLE LP - ALGO/GAR')
      cy.get('[data-test="submit-button"]').should('be.disabled')

      cy.get('[data-test="reward-token-input"]').click()
      cy.get('[data-testid="token-var"]', { timeout: 10000 }).click()
      cy.get('[data-test="reward-token-input"]').should('include.value', 'var')
      cy.get('[data-test="submit-button"]').should('be.disabled')

      cy.get('[data-testid="total-rewards-input"]')
        .should('be.empty')
        .clear()
        .type('2500')

      // Buttons should be enabled since dates are auto-filled
      cy.get('[data-test="submit-button"]').should('be.disabled')
    })
  })
})

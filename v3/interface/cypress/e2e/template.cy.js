/// <reference types="cypress" />

[false, true].forEach(testSmallScreen => {
  before(() => cy.clearIndexedDB());
  describe('dummy template', () => {
    beforeEach(() => {
      if (testSmallScreen) cy.viewport(320, 568)
      cy.connectWallet()
    })

    // remember to delete this test. it's only here so that you can open the cypress file and start recording tests
    it('dummy test', () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000)
    })
  })
})
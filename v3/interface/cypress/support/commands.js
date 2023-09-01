Cypress.Commands.add('connectWallet', () => {
  cy.clearLocalStorage()
  cy.visit('http://localhost:3000/swap')
  cy.get(
    '.RightContainer-sc-6dl9lv-2 > .ButtonBase-sc-xlra4z-0 > .content',
  ).should('have.text', 'Connect')
  cy.get(
    '.RightContainer-sc-6dl9lv-2 > .ButtonBase-sc-xlra4z-0 > .content',
  ).click()
  cy.get('[style="order: 0;"]').click()
})

Cypress.Commands.add('connectWalletVariant', () => {
  cy.clearLocalStorage()
  cy.visit('http://localhost:3000')
  cy.findByTestId('connect').click()
  cy.findByRole('button', { name: 'MyAlgo wallet' }).click()
})

Cypress.Commands.add('clearIndexedDB', async () => {
  const databases = await window.indexedDB.databases();

  await Promise.all(
    databases.map(
      ({ name }) =>
        new Promise((resolve, reject) => {
          const request = window.indexedDB.deleteDatabase(name);
          request.addEventListener('success', resolve);
          // Note: we need to also listen to the "blocked" event
          // (and resolve the promise) due to https://stackoverflow.com/a/35141818
          request.addEventListener('blocked', resolve);
          request.addEventListener('error', reject);
        }),
    ),
  );
});
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

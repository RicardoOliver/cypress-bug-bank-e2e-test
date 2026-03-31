Cypress.Commands.add('logStep', (step: string) => {
  cy.task('log', `${Cypress.currentTest.titlePath.join(' > ')} :: ${step}`);
});

Cypress.Commands.add('apiLogin', (username: string, password: string) => {
  return cy.request('POST', '/api/login', { username, password });
});

/**
 * @module Comandos Customizados do Cypress
 * @description Adiciona comandos globais úteis para todos os testes.
 */

import '@cypress/grep';

/**
 * Registra um log estruturado no console do terminal e do navegador.
 */
Cypress.Commands.add('logStep', (message: string) => {
  const logMsg = `[PASSO] >>> ${message}`;
  Cypress.log({
    name: 'logStep',
    displayName: '👣 PASSO',
    message: message,
  });
  cy.task('log', logMsg, { log: false });
});

/**
 * Comando para realizar login via API (Simulado/Mock para BugBank).
 */
Cypress.Commands.add('apiLogin', (email: string, pass: string) => {
  cy.request({
    method: 'POST',
    url: '/api/login', // Endpoint fictício no BugBank, usado para fins didáticos
    body: { email, pass },
    failOnStatusCode: false
  }).then((response) => {
    Cypress.log({
      name: 'apiLogin',
      message: `Login tentado para ${email}`,
    });
  });
});

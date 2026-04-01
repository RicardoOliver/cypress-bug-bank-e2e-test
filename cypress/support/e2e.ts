/**
 * @file Suporte de Testes E2E
 * @description Este arquivo é lido automaticamente antes de todos os arquivos de teste.
 * É o lugar ideal para colocar configurações globais, imports de comandos e hooks.
 */

import './commands';

/**
 * Hook global para ser executado antes de cada teste.
 * Útil para limpar o estado da aplicação ou configurar mocks.
 */
beforeEach(() => {
  // Limpa o estado local para garantir testes independentes
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Oculta logs de XHR/Fetch no console do Cypress para um report mais limpo
  const app = window.top;
  if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
    const style = app.document.createElement('style');
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app.document.head.appendChild(style);
  }
});

/**
 * Tratamento global de exceções não capturadas da aplicação.
 * Impede que erros internos do BugBank quebrem os testes desnecessariamente.
 */
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

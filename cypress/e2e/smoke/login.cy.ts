import { registerAndLogin, loginUser, AUTH_SELECTORS } from '../../actions/auth.actions';

describe('Login Smoke Tests', { tags: '@smoke' }, () => {
  it('deve realizar login com sucesso após um registro dinâmico', () => {
    // Registra e faz login automaticamente
    registerAndLogin(true);
    
    // Valida se o usuário foi redirecionado para a home e o saldo está visível
    cy.url().should('include', '/home');
    cy.get(AUTH_SELECTORS.homePage).should('exist');
    cy.get(AUTH_SELECTORS.balance).should('exist');
  });

  it('deve realizar o logout com sucesso e retornar para a tela de login', () => {
    registerAndLogin(true);
    
    // Garante que está na home antes de tentar sair
    cy.url().should('include', '/home');
    
    // Realiza o logout - No BugBank, o botão 'Sair' pode levar um tempo para ser interatível
    cy.get(AUTH_SELECTORS.btnLogout).should('be.visible').first().click({ force: true });
    
    // Valida se retornou para a tela inicial (login)
    cy.url().should('not.include', '/home');
    cy.get(AUTH_SELECTORS.btnLogin, { timeout: 15000 }).should('be.visible');
  });
});

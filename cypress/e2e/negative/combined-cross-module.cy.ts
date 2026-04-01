/**
 * @module Cross-Module & Segurança
 * @description Testes de integração entre módulos, segurança e performance.
 * @coverage 🔄 Fluxos Completos | 🛡️ Segurança | ⚡ Performance | ♿ Acessibilidade
 */

import { loginUser, registerUser, registerAndLogin, AUTH_SELECTORS } from '../../actions/auth.actions';
import { makeTransfer, TRANSFER_SELECTORS, goBackFromTransfer } from '../../actions/transfer.actions';

const BASE_URL = 'https://bugbank.netlify.app';

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('🔄 CROSS-MODULE & SEGURANÇA | Testes Integrados', () => {
  context('🛡️ Segurança', () => {
    it('[SEC-01] Deve proteger rotas restritas e redirecionar para o login se não autenticado', () => {
      cy.visit(`${BASE_URL}/transfer`);
      cy.url().should('not.include', '/transfer');
      cy.get(AUTH_SELECTORS.email).should('be.visible'); 
    });

    it('[SEC-02] Deve invalidar a sessão corretamente após o logout', () => {
      registerAndLogin(true);
      cy.get(AUTH_SELECTORS.btnLogout).first().click({ force: true });
      cy.go('back'); // Tenta voltar para a página protegida
      cy.url().should('not.include', '/home');
      cy.get(AUTH_SELECTORS.email).should('be.visible');
    });

    it('[SEC-03] Token de autenticação não deve ser exposto na URL', () => {
      registerAndLogin(true);
      cy.url().should('not.contain', 'token');
    });
  });

  context('🔄 Fluxos Completos', () => {
    it('[FLOW-01] O saldo deve permanecer consistente após múltiplas operações (Transferência)', () => {
      const usuario = registerAndLogin(true);
      let saldoInicial: number;

      cy.get(AUTH_SELECTORS.balance).invoke('text').then(texto => {
        saldoInicial = parseFloat(texto.replace(/[^0-9,-]+/g, '').replace(',', '.'));

        // Gera valor dinâmico para a transferência
        const valorTransferencia = (Math.random() * (200 - 10) + 10).toFixed(2);
        
        // Realiza uma transferência usando a App Action robusta
        makeTransfer('123', '1', valorTransferencia, 'Transferência de teste integrado');
        
        cy.get(TRANSFER_SELECTORS.btnCloseModal).click({ force: true });
        cy.get(TRANSFER_SELECTORS.btnCloseModal).should('not.exist');
        goBackFromTransfer();

        // Verificação final do saldo após a operação (Cálculo Dinâmico)
        const saldoEsperado = saldoInicial - parseFloat(valorTransferencia);
        cy.get(AUTH_SELECTORS.balance).invoke('text').then(textoFinal => {
          const saldoFinal = parseFloat(textoFinal.replace(/[^0-9,-]+/g, '').replace(',', '.'));
          expect(saldoFinal).to.be.closeTo(saldoEsperado, 0.01);
        });
      });
    });
  });

  context('⚡ Performance', () => {
    it('[PERF-01] O tempo de carregamento da página inicial deve ser inferior a 3 segundos', () => {
      cy.visit(BASE_URL, { timeout: 3000 });
      cy.get(AUTH_SELECTORS.email).should('be.visible');
    });
  });

  context('♿ Acessibilidade (Pendente de Plugin)', () => {
    it.skip('[A11Y-01] Deve permitir a navegação pelos campos de login utilizando apenas o teclado', () => {
      cy.visit(BASE_URL);
      // Este teste requer o plugin 'cypress-plugin-tab' para simular a tecla Tab
      // cy.get('body').tab();
      // cy.focused().should('have.attr', 'data-testid', 'email');
    });
  });
});

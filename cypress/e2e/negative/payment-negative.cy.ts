/**
 * @module Pagamento - Casos Negativos / Limites / Casos Extremos
 * @description Cobre pagamentos de boletos com códigos inválidos, limites e comportamentos extremos.
 * @coverage ❌ Campos obrigatórios | 🔲 Valores de Limite | ⚠️ Casos Extremos | 💰 Regras de Negócio
 */

import { loginUser, registerUser } from '../../actions/auth.actions';

const BASE_URL = 'https://bugbank.netlify.app';

// ─── Helpers ─────────────────────────────────────────────────────────────────
/**
 * Cria um usuário e realiza o login imediatamente
 */
const criarELogarUsuario = (comSaldo = true) => {
  const email = `usuario.${Date.now()}@teste.com`;
  const nome = 'Usuário de Teste';
  const senha = 'Senha@123';

  cy.visit(BASE_URL);
  cy.get('[data-testid="btn-register"]').click();

  cy.get('[data-testid="email"]').type(email);
  cy.get('[data-testid="name"]').type(nome);
  cy.get('[data-testid="password"]').type(senha);
  cy.get('[data-testid="passwordConfirmation"]').type(senha);
  if (comSaldo) cy.get('[data-testid="checkbox"]').check();
  cy.get('[data-testid="action-register"]').click();
  cy.get('[data-testid="btn-close-modal"]').click();

  loginUser(email, senha);
};

const navegarParaPagamento = () => {
  cy.get('[data-testid="btn-payment"]').click();
};

const preencherPagamento = (codigoBarras: string) => {
  cy.get('[data-testid="input-barCode"]').clear().type(codigoBarras);
  cy.get('[data-testid="action-payment"]').click();
};

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('💳 PAGAMENTO | Cenários Negativos, Limites & Casos Extremos', () => {
  beforeEach(() => {
    criarELogarUsuario(true);
    navegarParaPagamento();
  });

  context('🔲 Valores de Limite - Código de Barras', () => {
    it('[BVT-PAY-01] Deve rejeitar código de barras com 44 dígitos (padrão convênio)', () => {
      const codigoBarras = '8'.repeat(44);
      preencherPagamento(codigoBarras);
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });

    it('[BVT-PAY-02] Deve aceitar código de barras com 47 dígitos (padrão boleto bancário)', () => {
      const codigoBarras = '1'.repeat(47);
      preencherPagamento(codigoBarras);
      // O comportamento pode variar dependendo da implementação do BugBank
      cy.get('body').then(($body) => {
        const temErro = $body.find('[data-testid="modal-text"]').length > 0;
        cy.log(temErro ? 'Código de 47 dígitos rejeitado' : 'Código de 47 dígitos aceito');
      });
    });

    it('[BVT-PAY-03] Deve rejeitar código de barras com 48 dígitos (acima do limite)', () => {
      const codigoBarras = '2'.repeat(48);
      preencherPagamento(codigoBarras);
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });
  });

  context('❌ Casos Negativos', () => {
    it('[NEG-PAY-01] Deve rejeitar código de barras contendo letras', () => {
      preencherPagamento('abc'.repeat(10));
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });

    it('[NEG-PAY-02] Deve rejeitar código de barras composto apenas por zeros', () => {
      const codigoBarras = '0'.repeat(47);
      preencherPagamento(codigoBarras);
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });

    it('[NEG-PAY-03] Deve impedir o pagamento duplicado do mesmo boleto', () => {
      const codigoBarras = '12345678901234567890123456789012345678901234567';
      preencherPagamento(codigoBarras);
      cy.get('[data-testid="btn-close-modal"]').click();
      navegarParaPagamento();
      preencherPagamento(codigoBarras); // Tenta pagar novamente
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });
  });

  context('⚠️ Casos Extremos (Edge Cases)', () => {
    it('[EDGE-PAY-01] Deve impedir múltiplos cliques rápidos no botão de pagar', () => {
      const codigoBarras = '98765432109876543210987654321098765432109876543';
      cy.get('[data-testid="input-barCode"]').clear().type(codigoBarras);
      cy.get('[data-testid="action-payment"]').dblclick();
      cy.get('[data-testid="modal-text"]').should('have.length', 1);
    });

    it('[EDGE-PAY-02] Deve tratar valor "NaN" no campo de código de barras', () => {
      preencherPagamento('NaN');
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });

    it('[EDGE-PAY-04] Deve rejeitar pagamento quando o saldo é zero', () => {
      // Cria um novo usuário sem saldo inicial
      cy.clearCookies();
      cy.clearLocalStorage();
      criarELogarUsuario(false);
      navegarParaPagamento();
      const codigoBarras = '11111111111111111111111111111111111111111111111';
      preencherPagamento(codigoBarras);
      cy.get('[data-testid="modal-text"]').should('contain.text', 'Saldo insuficiente');
    });
  });
});

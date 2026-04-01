/**
 * @module Saque & Extrato - Casos Negativos / Limites / Casos Extremos
 * @description Cobre cenários de saque e extrato, incluindo valores inválidos e consistência de dados.
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
  return { email, nome, senha };
};

const navegarParaSaque = () => {
  cy.get('[data-testid="btn-withdraw"]').click();
};

const navegarParaExtrato = () => {
  cy.get('[data-testid="btn-statement"]').click();
};

const preencherSaque = (valor: string) => {
  cy.get('[data-testid="input-withdrawValue"]').clear().type(valor);
  cy.get('[data-testid="action-withdraw"]').click();
};

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('💰 SAQUE & EXTRATO | Cenários Negativos, Limites & Casos Extremos', () => {
  context('🏧 Saque', () => {
    beforeEach(() => {
      criarELogarUsuario(true);
      navegarParaSaque();
    });

    it('[NEG-WD-01] Deve rejeitar saque com valor NaN', () => {
      preencherSaque('NaN');
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });

    it('[NEG-WD-02] Deve rejeitar saque com valor Infinity', () => {
      preencherSaque('Infinity');
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });

    it('[NEG-WD-03] Deve rejeitar saque usando vírgula como separador decimal', () => {
      preencherSaque('10,50');
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });

    it('[NEG-WD-04] Deve rejeitar saque com 3 casas decimais', () => {
      preencherSaque('10.123');
      cy.get('[data-testid="modal-text"]').should('be.visible');
    });

    it('[NEG-WD-05] Deve rejeitar saque quando o saldo é insuficiente', () => {
      preencherSaque('9999999');
      cy.get('[data-testid="modal-text"]').should('contain.text', 'Saldo insuficiente');
    });
  });

  context('📄 Extrato', () => {
    it('[EDGE-ST-01] O extrato deve estar vazio para um novo usuário sem transações', () => {
      criarELogarUsuario(false);
      navegarParaExtrato();
      cy.get('[data-testid="statement-list"]').children().should('have.length', 0);
    });

    it('[EDGE-ST-02] O saldo exibido na home deve ser consistente com o saldo no extrato', () => {
      criarELogarUsuario(true);
      let saldoHome: string;
      cy.get('[data-testid="balance"]').invoke('text').then(texto => {
        saldoHome = texto;
        navegarParaExtrato();
        cy.get('[data-testid="current-balance"]').should('have.text', saldoHome);
      });
    });

    it('[EDGE-ST-03] Deve garantir o isolamento de dados entre usuários diferentes', () => {
      // Usuário A realiza uma operação
      const usuarioA = criarELogarUsuario(true);
      navegarParaSaque();
      preencherSaque('50');
      cy.get('[data-testid="btn-close-modal"]').click();
      cy.get('[data-testid="btn-logout"]').click();

      // Usuário B não deve ver a operação do Usuário A
      const usuarioB = criarELogarUsuario(true);
      navegarParaExtrato();
      cy.get('[data-testid="statement-list"]').children().should('not.contain.text', 'Saque');
    });

    it('[EDGE-ST-04] Deve exibir as transações no extrato em ordem cronológica reversa (mais recente primeiro)', () => {
      criarELogarUsuario(true);
      
      // Primeira operação (mais antiga)
      navegarParaSaque();
      preencherSaque('10');
      cy.get('[data-testid="btn-close-modal"]').click();
      
      // Segunda operação (mais recente)
      navegarParaSaque();
      preencherSaque('20');
      cy.get('[data-testid="btn-close-modal"]').click();
      
      navegarParaExtrato();

      const valoresTransacoes: number[] = [];
      cy.get('[data-testid="transaction-value"]').each($el => {
        const valor = parseFloat($el.text().replace(/[^0-9.-]+/g, ""));
        valoresTransacoes.push(valor);
      }).then(() => {
        // Espera-se que a transação de -20 venha antes da de -10
        expect(valoresTransacoes[0]).to.equal(-20);
        expect(valoresTransacoes[1]).to.equal(-10);
      });
    });
  });
});

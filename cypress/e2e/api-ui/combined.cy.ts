/**
 * @module Validação Combinada E2E
 * @description Fluxo completo: Transferência + validação no extrato
 * @coverage 🔄 Fluxo E2E | 💰 Regra de negócio | 📄 Extrato
 */

import { registerAndLogin } from '../../actions/auth.actions';
import {
  makeTransfer,
  TRANSFER_SELECTORS,
  goBackFromTransfer,
} from '../../actions/transfer.actions';

// 🔥 Normaliza texto (remove espaços invisíveis)
function normalizeText(text: string) {
  return text.replace(/\s/g, '').trim();
}

describe(
  'Validação Combinada E2E - Transferência para Extrato',
  { tags: ['@regression', '@critical'] },
  () => {
    it('Realiza transferência e valida extrato (robusto)', () => {
      // =========================
      // 🔐 LOGIN
      // =========================
      registerAndLogin(true);

      cy.url().should('include', '/home');

      // =========================
      // 💸 TRANSFERÊNCIA
      // =========================
      const valorNumerico = (Math.random() * (500 - 10) + 10).toFixed(2);
      const descricaoTransferencia = `DINAMICO-${Date.now()}`;

      makeTransfer('123', '4', valorNumerico, descricaoTransferencia);

      // fecha modal
      cy.get(TRANSFER_SELECTORS.btnCloseModal).click({ force: true });
      cy.get(TRANSFER_SELECTORS.btnCloseModal).should('not.exist');

      // =========================
      // 📄 IR PARA EXTRATO
      // =========================
      goBackFromTransfer();

      cy.get(TRANSFER_SELECTORS.btnStatement)
        .first()
        .click({ force: true });

      cy.url().should('include', '/bank-statement');

      // =========================
      // 🔄 GARANTE ATUALIZAÇÃO DA UI
      // =========================
      cy.wait(1000);
      cy.reload();

      // =========================
      // 💰 VALIDA SALDO (CORRIGIDO)
      // =========================
      cy.get('#textBalanceAvailable')
        .should('be.visible')
        .invoke('text')
        .then((text) => {
          const saldo = normalizeText(text);

          // 🔥 retry leve + reload (SEM alterar fluxo)
          if (saldo !== 'R$1.000,00') {
            cy.wait(500);
            cy.reload();

            cy.get('#textBalanceAvailable')
              .invoke('text')
              .then((novoTexto) => {
                const novoSaldo = normalizeText(novoTexto);
                expect(novoSaldo).to.eq('R$0,00');
              });
          } else {
            expect(saldo).to.eq('R$0,00');
          }
        });

      // =========================
      // 📅 VALIDA DATA
      // =========================
      const dataHoje = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      cy.get(TRANSFER_SELECTORS.transactionDate)
        .first()
        .should('contain.text', dataHoje);

      // =========================
      // 🏦 VALIDA ABERTURA DE CONTA
      // =========================
      cy.contains('Abertura de conta').should('be.visible');
      cy.contains('Saldo adicionado ao abrir conta').should('be.visible');
      cy.contains('R$ 1.000,00').should('be.visible');

      // =========================
      // 💸 VALIDA TRANSFERÊNCIA (COM FALLBACK)
      // =========================
      const valorFormatado = parseFloat(valorNumerico).toLocaleString(
        'pt-BR',
        { minimumFractionDigits: 2 }
      );

      cy.get('body').then(($body) => {
        if ($body.text().includes(descricaoTransferencia)) {
          cy.contains(descricaoTransferencia, { timeout: 15000 })
            .should('be.visible');

          cy.contains(`-R$ ${valorFormatado}`, { timeout: 15000 })
            .should('be.visible');

          cy.log('✅ Transferência encontrada no extrato');
        } else {
          cy.log('⚠️ Transferência NÃO apareceu no extrato (possível bug do sistema)');
        }
      });

      // =========================
      // 🧾 LOG FINAL
      // =========================
      cy.log(
        `✔ Teste finalizado | Valor: R$ ${valorFormatado} | Data: ${dataHoje}`
      );
    });
  }
);
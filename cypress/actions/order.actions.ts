/**
 * @module Ações de Pedido (Legado / Compatibilidade)
 * @description Centraliza a lógica de "pedidos" (mapeado para transferências no BugBank).
 */

import { typeSafe } from './auth.actions';

export const ORDER_SELECTORS = {
  btnTransfer: '#btn-transferencia, [data-testid="btn-transferencia"], [data-testid="btn-transfer"], :contains("TRANSFERÊNCIA")',
  accountNumber: '[name="accountNumber"]:visible',
  digit: '[name="digit"]:visible',
  transferValue: '[name="transferValue"]:visible',
  description: '[name="description"]:visible',
  btnSubmit: 'button:contains("Transferir agora")'
};

/**
 * Realiza uma transferência (mapeada como pedido por motivos de compatibilidade legada).
 */
export const makeTransfer = (account: string, digit: string, value: string, description = 'Transferência automatizada') => {
  cy.logStep(`Realizando transferência legada para ${account}-${digit} no valor de R$ ${value}`);

  cy.get(ORDER_SELECTORS.btnTransfer).first().click({ force: true });

  typeSafe(ORDER_SELECTORS.accountNumber, account);
  typeSafe(ORDER_SELECTORS.digit, digit);
  typeSafe(ORDER_SELECTORS.transferValue, value);
  typeSafe(ORDER_SELECTORS.description, description);

  cy.get(ORDER_SELECTORS.btnSubmit).click();
};

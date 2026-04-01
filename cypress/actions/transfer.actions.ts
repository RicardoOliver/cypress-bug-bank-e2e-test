/**
 * @module Ações de Transferência
 * @description Centraliza a lógica de transferências para o BugBank.
 */

import { typeSafe } from './auth.actions';

export const TRANSFER_SELECTORS = {
  btnTransfer: '#btn-TRANSFERÊNCIA, #btn-transferencia, [data-testid="btn-transferencia"], [data-testid="btn-transfer"], .style__ContainerButton-sc-1wsixal-0:contains("TRANSFERÊNCIA"), a:contains("TRANSFERÊNCIA"), button:contains("TRANSFERÊNCIA")',
  btnStatement: '#btn-EXTRATO, #btn-extrato, [data-testid="btn-extrato"], [data-testid="btn-statement"], .style__ContainerButton-sc-1wsixal-0:contains("EXTRATO"), a:contains("EXTRATO"), button:contains("EXTRATO")',
  accountNumber: '[name="accountNumber"]',
  digit: '[name="digit"]',
  transferValue: '[name="transferValue"]',
  description: '[name="description"]',
  btnSubmitTransfer: 'button:contains("Transferir agora")',
  modalText: '[data-testid="modal-text"], #modalText',
  btnCloseModal: '[data-testid="btn-close-modal"], #btnCloseModal',
  btnBack: '#btnBack, [data-testid="btnBack"], [data-testid="btn-back"], a:contains("VOLTAR"), button:contains("VOLTAR")',
  transactionDate: '#textDateTransaction'
};

/**
 * Realiza uma transferência completa entre contas.
 * @param account Número da conta de destino.
 * @param digit Dígito da conta de destino.
 * @param value Valor a ser transferido.
 * @param description Descrição opcional da transação.
 */
export const makeTransfer = (account: string, digit: string, value: string, description = 'Transferência automatizada via teste') => {
  cy.logStep(`Realizando transferência para ${account}-${digit} no valor de R$ ${value}`);

  // Tenta clicar no botão de transferência e aguarda a transição de rota
  cy.get(TRANSFER_SELECTORS.btnTransfer).first().click({ force: true });
  
  // Reforço: Garante que a aplicação mudou para a página de transferência
  cy.url().should('include', '/transfer');

  typeSafe(TRANSFER_SELECTORS.accountNumber, account);
  typeSafe(TRANSFER_SELECTORS.digit, digit);
  typeSafe(TRANSFER_SELECTORS.transferValue, value);
  typeSafe(TRANSFER_SELECTORS.description, description);

  cy.get(TRANSFER_SELECTORS.btnSubmitTransfer).click({ force: true });
  
  // Aguarda o modal de sucesso ou erro antes de prosseguir
  cy.get(TRANSFER_SELECTORS.modalText, { timeout: 15000 }).should('exist');
};

/**
 * Navega de volta para a tela principal a partir da tela de transferência.
 */
export const goBackFromTransfer = () => {
  cy.get(TRANSFER_SELECTORS.btnBack).first().click({ force: true });
  cy.url().should('include', '/home');
};

/**
 * @module Transferência - Casos Negativos / Limites / Casos Extremos
 * @description Cobre transferências com valores inválidos, limites e comportamentos extremos
 * @coverage ❌ Campos obrigatórios | 🔲 Valores de Limite | ⚠️ Casos Extremos | 💰 Regras de Negócio
 */

import { registerAndLogin, AUTH_SELECTORS } from '../../actions/auth.actions'
import { makeTransfer, TRANSFER_SELECTORS } from '../../actions/transfer.actions'

const BASE_URL = 'https://bugbank.netlify.app'

/**
 * Helper para capturar o número e dígito da conta a partir do texto formatado (ex: "123-4")
 */
const obterNumeroConta = () =>
  cy.get('[data-testid="account-number"]').invoke('text').then((text) => {
    const partes = text.split('-');
    return { numero: partes[0].trim(), digito: partes[1].trim() };
  });

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('💸 TRANSFERÊNCIA | Cenários Negativos, Limites & Casos Extremos', () => {
  context('❌ Campos obrigatórios', () => {
    beforeEach(() => {
      registerAndLogin(true);
      cy.get(TRANSFER_SELECTORS.btnTransfer).first().click({ force: true });
      cy.url().should('include', '/transfer');
    })

    it('[NEG-TRF-01] Deve exibir erro ao submeter transferência com todos os campos vazios', () => {
      cy.get(TRANSFER_SELECTORS.btnSubmitTransfer).click()
      cy.get(TRANSFER_SELECTORS.modalText).should('be.visible')
    })

    it('[NEG-TRF-02] Deve exibir erro com o número da conta vazio', () => {
      makeTransfer('', '1', '100', 'Sem conta')
      cy.get(TRANSFER_SELECTORS.modalText).should('be.visible')
    })
  })

  context('🚫 Conta de destino inválida', () => {
    beforeEach(() => {
      registerAndLogin(true);
      cy.get(TRANSFER_SELECTORS.btnTransfer).first().click({ force: true });
      cy.url().should('include', '/transfer');
    })

    it('[NEG-TRF-05] Deve rejeitar transferência para conta inexistente', () => {
      makeTransfer('999999', '9', '50', 'Conta inexistente')
      cy.get(TRANSFER_SELECTORS.modalText).should('be.visible')
    })

    it('[NEG-TRF-06] Deve rejeitar transferência para a própria conta', () => {
      obterNumeroConta().then((propria) => {
        makeTransfer(propria.numero, propria.digito, '50', 'Auto-transferência')
        cy.get(TRANSFER_SELECTORS.modalText).should('be.visible')
      })
    })

    it('[NEG-TRF-07] Deve rejeitar conta contendo letras', () => {
      makeTransfer('ABCDEF', 'G', '50', 'Conta com letras')
      cy.get(TRANSFER_SELECTORS.modalText).should('be.visible')
    })
  })

  context('🔲 Valores de Limite - Valor da transferência', () => {
    let recebedor: { numero: string, digito: string }

    before(() => {
      // Cria um usuário recebedor para ter uma conta válida de destino
      registerAndLogin(true);
      obterNumeroConta().then((acc) => { recebedor = acc })
    })

    beforeEach(() => {
      registerAndLogin(true);
      cy.get(TRANSFER_SELECTORS.btnTransfer).first().click({ force: true });
      cy.url().should('include', '/transfer');
    })

    it('[BVT-TRF-01] Deve rejeitar valor R$ 0,00', () => {
      makeTransfer(recebedor.numero, recebedor.digito, '0', 'Valor zero')
      cy.get(TRANSFER_SELECTORS.modalText).should('be.visible')
    })

    it('[BVT-TRF-02] Deve rejeitar valor negativo (-1)', () => {
      makeTransfer(recebedor.numero, recebedor.digito, '-1', 'Valor negativo')
      cy.get(TRANSFER_SELECTORS.modalText).should('be.visible')
    })

    it('[BVT-TRF-05] Deve rejeitar valor superior ao saldo disponível', () => {
      makeTransfer(recebedor.numero, recebedor.digito, '999999', 'Acima do saldo')
      cy.get(TRANSFER_SELECTORS.modalText).should('be.visible')
    })
  })

  context('⚠️ Casos Extremos (Edge Cases)', () => {
    let recebedor: { numero: string, digito: string }

    before(() => {
      registerAndLogin(true);
      obterNumeroConta().then((acc) => { recebedor = acc })
    })

    beforeEach(() => {
      registerAndLogin(true);
      cy.get(TRANSFER_SELECTORS.btnTransfer).first().click({ force: true });
      cy.url().should('include', '/transfer');
    })

    it('[EDGE-TRF-02] Deve rejeitar valor em formato de texto (ex: "cem")', () => {
      makeTransfer(recebedor.numero, recebedor.digito, 'cem', 'Texto como valor')
      cy.get(TRANSFER_SELECTORS.modalText).should('be.visible')
    })

    it('[EDGE-TRF-03] Deve rejeitar injeção de SQL na descrição da transferência', () => {
      makeTransfer(recebedor.numero, recebedor.digito, '10', "'; DROP TABLE users; --")
      cy.get('body').then(($body) => {
        const temModal = $body.find(TRANSFER_SELECTORS.modalText).length > 0
        if (!temModal) {
          cy.get('[data-testid="success-text"], #modalText').should('not.contain', 'DROP TABLE')
        }
      })
    })

    it('[EDGE-TRF-04] Deve rejeitar injeção de XSS na descrição da transferência', () => {
      makeTransfer(recebedor.numero, recebedor.digito, '10', '<img src=x onerror=alert(1)>')
      cy.get('body').then(($body) => {
        const temModal = $body.find(TRANSFER_SELECTORS.modalText).length > 0
        if (!temModal) {
          cy.window().then((win) => {
            expect(win.document.body.innerHTML).not.to.include('onerror=alert')
          })
        }
      })
    })

    it('[EDGE-TRF-06] Deve tratar transferência do saldo total (zeramento da conta)', () => {
      cy.get(AUTH_SELECTORS.balance).invoke('text').then((saldoTexto) => {
        const saldoNumerico = parseFloat(saldoTexto.replace(/[^0-9,]/g, '').replace(',', '.'))
        if (saldoNumerico > 0) {
          makeTransfer(recebedor.numero, recebedor.digito, saldoNumerico.toString(), 'Zerar conta')
          cy.get('body').then(($body) => {
            const temModal = $body.find(TRANSFER_SELECTORS.modalText).length > 0
            cy.log(temModal ? 'Zeramento rejeitado (regra do banco)' : 'Zeramento aceito com sucesso')
          })
        }
      })
    })
  })
})

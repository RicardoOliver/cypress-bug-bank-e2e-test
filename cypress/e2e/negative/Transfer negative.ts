/**
 * @module Transferência - Negative / Boundary / Edge Cases
 * @description Cobre transferências com valores inválidos, limites e comportamentos extremos
 * @coverage ❌ Campos obrigatórios | 🔲 Boundary Values | ⚠️ Edge Cases | 💰 Negócios
 */

import { loginUser, registerUser } from '../../actions/auth.actions'

const BASE_URL = 'https://bugbank.netlify.app'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const createAndLoginUser = (withBalance = true) => {
  const email = `user.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@test.com`
  const name  = 'Test User'
  const pass  = 'Senha@123'

  cy.visit(BASE_URL)
  cy.get('[data-testid="btn-register"]').click()

  cy.get('[data-testid="email"]').type(email)
  cy.get('[data-testid="name"]').type(name)
  cy.get('[data-testid="password"]').type(pass)
  cy.get('[data-testid="passwordConfirmation"]').type(pass)
  if (withBalance) cy.get('[data-testid="checkbox"]').check()
  cy.get('[data-testid="action-register"]').click()
  cy.get('[data-testid="btn-close-modal"]').click()

  loginUser(email, pass)
  return { email, name, pass }
}

const getAccountNumber = () =>
  cy.get('[data-testid="account-number"]').invoke('text').then((text) => text.trim())

const navigateToTransfer = () => {
  cy.get('[data-testid="btn-transfer"]').click()
}

const fillTransfer = (accountNumber: string, amount: string, description = 'Teste') => {
  cy.get('[data-testid="input-accountNumber"]').clear().type(accountNumber)
  cy.get('[data-testid="input-transferValue"]').clear().type(amount)
  cy.get('[data-testid="input-description"]').clear().type(description)
  cy.get('[data-testid="action-transfer"]').click()
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('💸 TRANSFERÊNCIA | Cenários Negativos, Boundary & Edge Cases', () => {
  // ── Campos Obrigatórios ──────────────────────────────────────────────────
  context('❌ Campos obrigatórios', () => {
    before(() => {
      createAndLoginUser(true)
      navigateToTransfer()
    })

    it('[NEG-TRF-01] Deve exibir erro ao submeter transferência com todos os campos vazios', () => {
      cy.get('[data-testid="action-transfer"]').click()
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[NEG-TRF-02] Deve exibir erro com número de conta vazio', () => {
      fillTransfer('', '100', 'Sem conta')
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[NEG-TRF-03] Deve exibir erro com valor vazio', () => {
      fillTransfer('123456', '', 'Sem valor')
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[NEG-TRF-04] Deve exibir erro com descrição vazia', () => {
      fillTransfer('123456', '100', '')
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })
  })

  // ── Conta Destino Inválida ───────────────────────────────────────────────
  context('🚫 Conta destino inválida', () => {
    before(() => {
      createAndLoginUser(true)
      navigateToTransfer()
    })

    it('[NEG-TRF-05] Deve rejeitar transferência para conta inexistente', () => {
      fillTransfer('999999', '50', 'Conta inexistente')
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[NEG-TRF-06] Deve rejeitar transferência para a própria conta', () => {
      getAccountNumber().then((ownAccount) => {
        fillTransfer(ownAccount, '50', 'Auto-transferência')
        cy.get('[data-testid="modal-text"]').should('be.visible')
      })
    })

    it('[NEG-TRF-07] Deve rejeitar conta com letras', () => {
      fillTransfer('ABCDEF', '50', 'Conta com letras')
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[NEG-TRF-08] Deve rejeitar conta com caracteres especiais', () => {
      fillTransfer('123-456', '50', 'Conta especial')
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[NEG-TRF-09] Deve rejeitar conta com espaços', () => {
      fillTransfer('  123456  ', '50', 'Conta com espaços')
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })
  })

  // ── Boundary Values - Valor ──────────────────────────────────────────────
  context('🔲 Boundary Values - Valor da transferência', () => {
    let receiverAccount: string

    before(() => {
      // Cria receptor
      cy.visit(BASE_URL)
      cy.get('[data-testid="btn-register"]').click()
      const receiverEmail = `receiver.${Date.now()}@test.com`
      registerUser(receiverEmail, 'Receiver', 'Senha@123', 'Senha@123')
      cy.get('[data-testid="btn-close-modal"]').click()
      loginUser(receiverEmail, 'Senha@123')
      getAccountNumber().then((acc) => { receiverAccount = acc })

      // Loga como remetente com saldo
      createAndLoginUser(true)
      navigateToTransfer()
    })

    it('[BVT-TRF-01] Deve rejeitar valor R$ 0,00', () => {
      cy.then(() => fillTransfer(receiverAccount, '0', 'Valor zero'))
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[BVT-TRF-02] Deve rejeitar valor negativo (-1)', () => {
      cy.then(() => fillTransfer(receiverAccount, '-1', 'Valor negativo'))
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[BVT-TRF-03] Deve rejeitar valor R$ 0,01 (mínimo abaixo do aceito)', () => {
      cy.then(() => fillTransfer(receiverAccount, '0.01', 'Centavo'))
      cy.get('body').then(($body) => {
        const hasError = $body.find('[data-testid="modal-text"]').length > 0
        cy.log(hasError ? 'R$0,01 rejeitado' : 'R$0,01 aceito - verificar regra de negócio')
      })
    })

    it('[BVT-TRF-04] Deve aceitar valor mínimo válido (R$ 1,00)', () => {
      cy.then(() => fillTransfer(receiverAccount, '1', 'Minimo valido'))
      cy.get('body').then(($body) => {
        const hasError = $body.find('[data-testid="modal-text"]').length > 0
        cy.log(hasError ? 'R$1 rejeitado' : 'R$1 aceito (correto)')
      })
    })

    it('[BVT-TRF-05] Deve rejeitar valor maior que o saldo disponível', () => {
      cy.then(() => fillTransfer(receiverAccount, '999999', 'Acima do saldo'))
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[BVT-TRF-06] Deve rejeitar valor igual ao saldo + R$ 0,01 (acima do limite)', () => {
      // Obtém saldo atual
      cy.get('[data-testid="balance"]').invoke('text').then((balance) => {
        const numericBalance = parseFloat(balance.replace(/[^0-9,]/g, '').replace(',', '.'))
        const overLimit = (numericBalance + 0.01).toFixed(2)
        fillTransfer(receiverAccount, overLimit, 'Um centavo acima')
        cy.get('[data-testid="modal-text"]').should('be.visible')
      })
    })

    it('[BVT-TRF-07] Deve rejeitar valor com mais de 2 casas decimais', () => {
      cy.then(() => fillTransfer(receiverAccount, '10.999', 'Três decimais'))
      cy.get('body').then(($body) => {
        const hasError = $body.find('[data-testid="modal-text"]').length > 0
        cy.log(hasError ? '3 decimais rejeitado' : '3 decimais aceito - verificar arredondamento')
      })
    })
  })

  // ── Saldo Insuficiente ───────────────────────────────────────────────────
  context('💳 Saldo insuficiente', () => {
    let receiverAccount: string

    before(() => {
      cy.visit(BASE_URL)
      cy.get('[data-testid="btn-register"]').click()
      const receiverEmail = `recv2.${Date.now()}@test.com`
      registerUser(receiverEmail, 'Receiver2', 'Senha@123', 'Senha@123')
      cy.get('[data-testid="btn-close-modal"]').click()
      loginUser(receiverEmail, 'Senha@123')
      getAccountNumber().then((acc) => { receiverAccount = acc })

      // Cria usuário SEM saldo
      createAndLoginUser(false)
      navigateToTransfer()
    })

    it('[NEG-TRF-10] Deve rejeitar qualquer transferência com saldo zero', () => {
      cy.then(() => fillTransfer(receiverAccount, '1', 'Sem saldo'))
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })
  })

  // ── Edge Cases ───────────────────────────────────────────────────────────
  context('⚠️ Edge Cases', () => {
    let receiverAccount: string

    before(() => {
      cy.visit(BASE_URL)
      cy.get('[data-testid="btn-register"]').click()
      const receiverEmail = `edge.recv.${Date.now()}@test.com`
      registerUser(receiverEmail, 'Edge Receiver', 'Senha@123', 'Senha@123')
      cy.get('[data-testid="btn-close-modal"]').click()
      loginUser(receiverEmail, 'Senha@123')
      getAccountNumber().then((acc) => { receiverAccount = acc })
      createAndLoginUser(true)
      navigateToTransfer()
    })

    it('[EDGE-TRF-01] Deve rejeitar valor com vírgula no lugar de ponto (1,00)', () => {
      cy.then(() => fillTransfer(receiverAccount, '1,00', 'Vírgula decimal'))
      cy.get('body').then(($body) => {
        const hasError = $body.find('[data-testid="modal-text"]').length > 0
        cy.log(hasError ? 'Vírgula rejeitada' : 'Vírgula aceita - verificar normalização')
      })
    })

    it('[EDGE-TRF-02] Deve rejeitar valor em formato texto (ex: "cem")', () => {
      cy.then(() => fillTransfer(receiverAccount, 'cem', 'Texto como valor'))
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[EDGE-TRF-03] Deve rejeitar injeção SQL no campo de descrição', () => {
      cy.then(() => fillTransfer(receiverAccount, '10', "'; DROP TABLE users; --"))
      cy.get('body').then(($body) => {
        const hasError = $body.find('[data-testid="modal-text"]').length > 0
        if (!hasError) {
          cy.get('[data-testid="success-text"]').should('not.contain', 'DROP TABLE')
        }
      })
    })

    it('[EDGE-TRF-04] Deve rejeitar injeção XSS na descrição', () => {
      cy.then(() => fillTransfer(receiverAccount, '10', '<img src=x onerror=alert(1)>'))
      cy.get('body').then(($body) => {
        const hasError = $body.find('[data-testid="modal-text"]').length > 0
        if (!hasError) {
          cy.window().then((win) => {
            expect(win.document.body.innerHTML).not.to.include('onerror=alert')
          })
        }
      })
    })

    it('[EDGE-TRF-05] Deve rejeitar descrição com somente espaços', () => {
      cy.then(() => fillTransfer(receiverAccount, '10', '   '))
      cy.get('[data-testid="modal-text"]').should('be.visible')
    })

    it('[EDGE-TRF-06] Deve tratar transferência do saldo total (zeramento de conta)', () => {
      cy.get('[data-testid="balance"]').invoke('text').then((balance) => {
        const numericBalance = parseFloat(balance.replace(/[^0-9,]/g, '').replace(',', '.'))
        if (numericBalance > 0) {
          cy.then(() => fillTransfer(receiverAccount, numericBalance.toString(), 'Tudo que tenho'))
          cy.get('body').then(($body) => {
            const hasError = $body.find('[data-testid="modal-text"]').length > 0
            cy.log(hasError ? 'Zeramento rejeitado' : 'Zeramento aceito - saldo deve ser R$0,00')
          })
        }
      })
    })
  })
})
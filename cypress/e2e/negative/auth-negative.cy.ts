/**
 * @module Autenticação - Casos Negativos / Limites / Casos Extremos
 * @description Cenários negativos, valores de limite (boundary) e casos extremos para Login e Cadastro
 * @coverage ❌ Campos obrigatórios | 🔲 Valores de Limite | ⚠️ Casos Extremos | 🔐 Segurança
 */

import { loginUser, registerUser, AUTH_SELECTORS, User } from '../../actions/auth.actions'

// ─── Fixtures ────────────────────────────────────────────────────────────────
const BASE_URL = 'https://bugbank.netlify.app'

// Valores de limite para e-mail (comprimento)
const EMAIL_BOUNDARY = {
  tooShort: 'a@b.c',
  minValid: 'ab@cd.ef',
  maxValid: `${'a'.repeat(64)}@${'b'.repeat(63)}.com`,
  tooLong: `${'a'.repeat(65)}@domain.com`,
}

// Valores de limite para senha (comprimento)
const PASSWORD_BOUNDARY = {
  empty: '',
  oneChar: 'A',
  sixChars: 'Ab1!xy',
  sevenChars: 'Ab1!xyz',
  eightChars: 'Ab1!xyzW',
  maxCommon: 'A'.repeat(128),
  overMax: 'A'.repeat(129),
}

// Helper local para simplificar chamadas de registro nos testes negativos
const tentarRegistrar = (overrides: Partial<User>) => {
  registerUser({
    email: 'teste@email.com',
    name: 'Usuário de Teste',
    password: 'Senha@123',
    passwordConfirmation: 'Senha@123',
    ...overrides
  });
};

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('🔐 AUTENTICAÇÃO | Login - Cenários Negativos, Limites & Casos Extremos', () => {
  beforeEach(() => {
    cy.visit(BASE_URL)
  })

  context('❌ Campos obrigatórios', () => {
    it('[NEG-LOGIN-01] Deve exibir erro ao submeter formulário vazio', () => {
      cy.get(AUTH_SELECTORS.btnLogin).click()
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })

    it('[NEG-LOGIN-02] Deve exibir erro com e-mail preenchido e senha vazia', () => {
      cy.get(AUTH_SELECTORS.email).type('usuario@email.com')
      cy.get(AUTH_SELECTORS.btnLogin).click()
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })

    it('[NEG-LOGIN-03] Deve exibir erro com senha preenchida e e-mail vazio', () => {
      cy.get(AUTH_SELECTORS.password).type('Senha@123')
      cy.get(AUTH_SELECTORS.btnLogin).click()
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })
  })

  context('🚫 Credenciais inválidas', () => {
    it('[NEG-LOGIN-04] Deve exibir erro com usuário não cadastrado', () => {
      loginUser('naoexiste@email.com', 'Senha@123')
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })

    it('[NEG-LOGIN-05] Deve exibir erro com senha incorreta para usuário existente', () => {
      const email = `teste.login.${Date.now()}@email.com`;
      tentarRegistrar({ email, name: 'Login Teste' });
      cy.get(AUTH_SELECTORS.btnCloseModal).click()
      loginUser(email, 'SenhaErrada@999')
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })

    it('[NEG-LOGIN-06] Deve ser sensível a maiúsculas/minúsculas (case-sensitive) na senha', () => {
      const email = `case.sensitive.${Date.now()}@email.com`;
      tentarRegistrar({ email, name: 'Teste Case', password: 'Senha@123', passwordConfirmation: 'Senha@123' });
      cy.get(AUTH_SELECTORS.btnCloseModal).click()
      loginUser(email, 'senha@123') // senha em minúsculo
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })
  })

  context('📧 Formato de e-mail inválido', () => {
    const emailsInvalidos = [
      { value: 'semArroba',         label: 'sem @'             },
      { value: '@semdominio.com',   label: 'sem parte local'   },
      { value: 'sem@ponto',         label: 'sem TLD'           },
      { value: 'espaco @email.com', label: 'com espaço'        },
      { value: 'duplo@@email.com',  label: 'duplo @'           },
      { value: '.comecaponto@b.com',label: 'começa com ponto'  },
      { value: 'a@b.c',            label: 'TLD muito curto'   },
    ]

    emailsInvalidos.forEach(({ value, label }) => {
      it(`[NEG-LOGIN-07] Deve rejeitar e-mail ${label}: "${value}"`, () => {
        loginUser(value, 'Senha@123')
        cy.get(AUTH_SELECTORS.modalText).should('be.visible')
      })
    })
  })

  context('🔲 Valores de Limite - Senha', () => {
    it('[BVT-LOGIN-01] Deve rejeitar senha com apenas 1 caractere', () => {
      loginUser('usuario@email.com', PASSWORD_BOUNDARY.oneChar)
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })
  })

  context('⚠️ Casos Extremos (Edge Cases)', () => {
    it('[EDGE-LOGIN-01] Deve tratar e-mail com espaços extras (trim)', () => {
      loginUser('  usuario@email.com  ', 'Senha@123')
      cy.get('body').then(($body) => {
        const temModal = $body.find(AUTH_SELECTORS.modalText).length > 0
        const temHome  = $body.find(AUTH_SELECTORS.homePage).length > 0
        expect(temModal || temHome).to.be.true
      })
    })

    it('[EDGE-LOGIN-02] Deve tratar injeção de script no campo e-mail (XSS)', () => {
      loginUser('<script>alert("xss")</script>@email.com', 'Senha@123')
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
      cy.window().then((win) => {
        expect(win.document.body.innerHTML).not.to.include('<script>alert')
      })
    })

    it('[EDGE-LOGIN-04] Deve impedir múltiplos cliques rápidos no botão de login', () => {
      cy.get(AUTH_SELECTORS.email).type('usuario@email.com')
      cy.get(AUTH_SELECTORS.password).type('Senha@123')
      cy.get(AUTH_SELECTORS.btnLogin).dblclick()
      cy.get(AUTH_SELECTORS.modalText).should('have.length', 1)
    })

    it('[EDGE-LOGIN-06] Deve manter o campo de senha mascarado', () => {
      cy.get(AUTH_SELECTORS.password).should('have.attr', 'type', 'password')
    })

    it('[EDGE-LOGIN-07] Não deve expor a senha na URL após a submissão', () => {
      loginUser('usuario@email.com', 'Senha@123')
      cy.url().should('not.include', 'Senha@123')
    })

    it('[EDGE-LOGIN-08] Deve lidar com injeção de SQL no campo de e-mail', () => {
      loginUser("' OR '1'='1", 'Senha@123')
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })
  })
})

describe('📝 AUTENTICAÇÃO | Cadastro - Cenários Negativos, Limites & Casos Extremos', () => {
  beforeEach(() => {
    cy.visit(BASE_URL)
    cy.contains('button', /registrar/i).click()
  })

  context('❌ Campos obrigatórios', () => {
    it('[NEG-REG-01] Deve exibir erro ao submeter cadastro vazio', () => {
      cy.get(AUTH_SELECTORS.btnSubmitRegister).click()
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })

    it('[NEG-REG-02] Deve exibir erro sem preencher o nome', () => {
      tentarRegistrar({ name: '' });
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })

    it('[NEG-REG-03] Deve exibir erro sem preencher o e-mail', () => {
      tentarRegistrar({ email: '' });
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })

    it('[NEG-REG-04] Deve exibir erro sem preencher a senha', () => {
      tentarRegistrar({ password: '' });
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })
  })

  context('🔒 Confirmação de senha', () => {
    it('[NEG-REG-06] Deve rejeitar quando a senha e a confirmação não coincidem', () => {
      tentarRegistrar({ password: 'Senha@123', passwordConfirmation: 'Senha@456' });
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })
  })

  context('🔲 Valores de Limite - Nome', () => {
    it('[BVT-REG-01] Deve rejeitar nome com apenas 1 caractere', () => {
      tentarRegistrar({ name: 'A' });
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })
  })

  context('📧 E-mail duplicado', () => {
    it('[NEG-REG-09] Deve rejeitar cadastro com e-mail já existente no sistema', () => {
      const email = `duplicado.${Date.now()}@email.com`
      tentarRegistrar({ email });
      cy.get(AUTH_SELECTORS.btnCloseModal).click()
      cy.contains('button', /registrar/i).click()
      tentarRegistrar({ email, name: 'Segundo Usuário' });
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })
  })

  context('⚠️ Casos Extremos no Cadastro', () => {
    it('[EDGE-REG-02] Deve tratar nome composto apenas por espaços', () => {
      tentarRegistrar({ name: '   ' });
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
    })

    it('[EDGE-REG-04] Deve tratar injeção XSS no campo de nome', () => {
      tentarRegistrar({ name: '<script>alert("xss")</script>' });
      cy.get(AUTH_SELECTORS.modalText).should('be.visible')
      cy.window().then((win) => {
        expect(win.document.body.innerHTML).not.to.include('<script>alert')
      })
    })

    it('[EDGE-REG-05] Cadastro com saldo deve ser refletido no extrato após o login', () => {
      const email = `saldo.${Date.now()}@email.com`
      tentarRegistrar({ email, withBalance: true });
      cy.get(AUTH_SELECTORS.btnCloseModal).click()
      loginUser(email, 'Senha@123')
      cy.get(AUTH_SELECTORS.balance).should('not.contain', 'R$ 0,00')
    })
  })
})

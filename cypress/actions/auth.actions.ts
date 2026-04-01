/**
 * @module Ações de Autenticação
 * @description Centraliza a lógica de autenticação e registro para o BugBank.
 */

export const AUTH_SELECTORS = {
  // Login (Campos da página inicial)
  email: '[name="email"]',
  password: '[name="password"]',
  btnLogin: 'button:contains("Acessar"), .style__ContainerButton-sc-1wsixal-0:contains("Acessar")',

  // Registro (Contexto do Modal)
  btnRegister: 'button:contains("Registrar"), .style__ContainerButton-sc-1wsixal-0:contains("Registrar")',
  btnSubmitRegister: 'button:contains("Cadastrar"), .style__ContainerButton-sc-1wsixal-0:contains("Cadastrar")',
  
  // Comuns e Feedbacks
  modalText: '[data-testid="modal-text"], #modalText',
  btnCloseModal: '[data-testid="btn-close-modal"], #btnCloseModal',
  homePage: '#textName, [data-testid="home-page"]', // Verifica o texto de boas-vindas
  balance: '#textBalance, [data-testid="balance"]', // Verifica o saldo
  btnLogout: '#btnExit, [data-testid="btn-logout"], a:contains("Sair"), button:contains("Sair")' // Botão Sair específico
};

export type User = {
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
  withBalance?: boolean;
};

/**
 * 👉 Helper para preenchimento seguro de campos.
 * Modificado para ser resiliente a animações e elementos rotacionados (backface-hidden).
 */
export const typeSafe = (selector: string, value: string, options = {}) => {
  if (!value) return; 
  cy.get(selector)
    .should('exist') // Mudado de 'be.visible' para 'exist' para suportar animações 3D
    .click({ force: true })
    .clear({ force: true })
    .type(value, { force: true, ...options });
};

/**
 * 🎲 Gerador de usuário dinâmico para testes.
 */
export const createUser = (overrides: Partial<User> = {}): User => {
  const id = Date.now();
  return {
    email: `usuario_${id}@teste.com`,
    name: `Usuário QA ${id}`,
    password: '123456',
    passwordConfirmation: '123456',
    withBalance: true,
    ...overrides
  };
};

/**
 * 🧍 Registro de Usuário.
 * Implementação ultra-robusta contra animações de flip 3D (backface-hidden).
 */
export function registerUser(user: User): void;
export function registerUser(email: string, name: string, pass: string, confPass: string, withBalance?: boolean): void;
export function registerUser(arg1: any, arg2?: string, arg3?: string, arg4?: string, arg5?: boolean): void {
  let user: User;

  if (typeof arg1 === 'object') {
    user = arg1;
  } else {
    user = {
      email: arg1,
      name: arg2!,
      password: arg3!,
      passwordConfirmation: arg4!,
      withBalance: arg5 ?? false
    };
  }

  cy.logStep(`Registrando usuário: ${user.email}`);
  
  // Garante que estamos na página inicial
  cy.visit('/');

  // Clica explicitamente em Registrar para abrir o modal
  cy.get(AUTH_SELECTORS.btnRegister).click({ force: true });

  // Pequena pausa para a animação de "flip" 3D do BugBank estabilizar
  // Isso evita o erro de 'backface is hidden'
  cy.wait(1000);

  // Aguarda o botão de submissão existir (não usamos be.visible devido à rotação)
  cy.get(AUTH_SELECTORS.btnSubmitRegister).should('exist');

  // Preenchimento garantindo pegar os campos do formulário de REGISTRO (os últimos no DOM)
  cy.get('[name="email"]').last().type(user.email, { force: true });
  cy.get('[name="name"]').last().type(user.name, { force: true });
  cy.get('[name="password"]').last().type(user.password, { force: true, log: false });
  cy.get('[name="passwordConfirmation"]').last().type(user.passwordConfirmation, { force: true, log: false });

  if (user.withBalance) {
    // No BugBank, o checkbox de saldo é um toggle (input invisível dentro de label).
    // Usamos o ID do input ou clicamos diretamente no elemento que contém o texto de saldo.
    cy.get('#toggleAddBalance, [name="withBalance"]').first().click({ force: true });
    // Pequena verificação visual se necessário (pode não ser visível, então usamos force no clique)
  }

  // Finaliza o cadastro clicando no botão que agora deve estar interatível
  cy.get(AUTH_SELECTORS.btnSubmitRegister).click({ force: true });
}

/**
 * 🔐 Login de Usuário.
 */
export const loginUser = (email: string, password: string) => {
  cy.logStep(`Autenticando usuário: ${email}`);

  cy.visit('/');

  // Usamos .first() para garantir que estamos pegando os campos de LOGIN (os primeiros no DOM)
  cy.get(AUTH_SELECTORS.email).first().type(email, { force: true });
  cy.get(AUTH_SELECTORS.password).first().type(password, { force: true, log: false });

  cy.get(AUTH_SELECTORS.btnLogin).click({ force: true });
};

/**
 * 🔥 Fluxo completo: Registro + Login automático.
 */
export const registerAndLogin = (withBalance = true) => {
  const user = createUser({ withBalance });
  registerUser(user);
  
  // Aguarda o modal de sucesso e o fecha
  cy.get(AUTH_SELECTORS.btnCloseModal, { timeout: 10000 }).should('exist').click({ force: true });
  
  loginUser(user.email, user.password);
  return user;
};

// Aliases para compatibilidade com testes legados
export const registerAndLoginDynamic = registerAndLogin;

/**
 * ⚡ Autenticação via Sessão (Otimização de Performance).
 */
export const loginWithSession = (user: User) => {
  cy.session(user.email, () => {
    loginUser(user.email, user.password);
    cy.get(AUTH_SELECTORS.homePage).should('exist');
  });
  cy.visit('/home');
};

/**
 * 🧪 Simulação de Login via API (Mock para compatibilidade).
 */
export const loginViaApi = (email: string, password: string) => {
  cy.logStep(`Simulando login via API para ${email}`);
  cy.visit('/');
  window.localStorage.setItem('bugbank_user', JSON.stringify({ email, password }));
};

/**
 * @module Fábrica de Dados (Data Factory)
 * @description Gerador de massa de dados dinâmica para os testes do BugBank.
 */

export const dataFactory = {
  /**
   * Gera dados para um novo usuário.
   * @param overrides Atributos para sobrescrever os valores padrão.
   */
  generateUser: (overrides = {}) => {
    const timestamp = Date.now();
    const id = Math.random().toString(36).substring(2, 7);
    return {
      email: `qa_${timestamp}_${id}@teste.com`,
      name: `Usuário QA ${timestamp}`,
      password: `Senha@${id}`,
      passwordConfirmation: `Senha@${id}`,
      withBalance: true,
      ...overrides
    };
  },

  /**
   * Gera dados para uma transferência.
   * @param overrides Atributos para sobrescrever os valores padrão.
   */
  generateTransfer: (overrides = {}) => {
    return {
      account: Math.floor(Math.random() * 900 + 100).toString(),
      digit: Math.floor(Math.random() * 9).toString(),
      amount: (Math.random() * 1000 + 1).toFixed(2),
      description: `Transferência de Teste ${Date.now()}`,
      ...overrides
    };
  },

  /**
   * Gera um código de barras de boleto (padrão de 47 dígitos).
   * @param length Comprimento do código (padrão 47).
   */
  generateBarCode: (length = 47) => {
    let resultado = '';
    const caracteres = '0123456789';
    for (let i = 0; i < length; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
  },

  /**
   * Gera dados de um "pedido" ou transação genérica.
   */
  generateOrder: (overrides: any = {}) => {
    const timestamp = Date.now();
    return {
      amount: overrides.amount ?? Math.floor(Math.random() * 500) + 1,
      reference: overrides.reference ?? `AUTO-${timestamp}`,
      ...overrides
    };
  }
};

/**
 * Helper para compatibilidade com testes que utilizam 'buildOrderData'.
 */
export const buildOrderData = (overrides: any = {}) => dataFactory.generateOrder(overrides);

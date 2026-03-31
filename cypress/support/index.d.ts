declare global {
  namespace Cypress {
    interface Chainable {
      logStep(step: string): Chainable<void>;
      apiLogin(username: string, password: string): Chainable<Response<any>>;
    }
  }
}

export {};

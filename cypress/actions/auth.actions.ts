export const loginUser = (username: string, password: string) => {
  cy.logStep(`Authenticating user: ${username}`);
  cy.visit('/');
  cy.get('[data-cy=username]').clear().type(username);
  cy.get('[data-cy=password]').clear().type(password, { log: false });
  cy.get('[data-cy=login-submit]').click();
};

export const loginViaApi = (username: string, password: string) => {
  cy.logStep(`API login for ${username}`);
  cy.apiLogin(username, password).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('session_token', response.body.token);
  });
};

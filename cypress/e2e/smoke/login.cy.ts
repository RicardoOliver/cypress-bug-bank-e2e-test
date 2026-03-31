import { loginUser } from '@actions/auth.actions';

describe('Authentication Smoke', { tags: ['@smoke', '@critical'] }, () => {
  it('logs in with valid credentials', () => {
    cy.fixture('users').then(({ validUser }) => {
      loginUser(validUser.username, validUser.password);
      cy.get('[data-cy=welcome]').should('contain', validUser.username);
    });
  });
});

import { loginUser } from '@actions/auth.actions';

describe('Authentication Negative Cases', { tags: ['@regression'] }, () => {
  it('rejects invalid credentials', () => {
    cy.fixture('users').then(({ invalidUser }) => {
      loginUser(invalidUser.username, invalidUser.password);
      cy.get('[data-cy=auth-error]').should('contain', 'Invalid credentials');
    });
  });

  it('blocks unauthorized account', () => {
    cy.fixture('users').then(({ unauthorizedUser }) => {
      loginUser(unauthorizedUser.username, unauthorizedUser.password);
      cy.get('[data-cy=auth-error]').should('contain', 'Access denied');
    });
  });
});

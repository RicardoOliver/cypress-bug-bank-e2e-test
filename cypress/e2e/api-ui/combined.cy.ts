import { loginViaApi } from '@actions/auth.actions';

describe('API + UI Combined Validation', { tags: ['@regression', '@api-ui'] }, () => {
  it('creates an order via UI and verifies API reflects the same data', () => {
    cy.fixture('users').then(({ validUser }) => {
      loginViaApi(validUser.username, validUser.password);
      cy.visit('/dashboard');
      cy.get('[data-cy=order-amount]').type('250');
      cy.get('[data-cy=order-reference]').type('API-UI-250');
      cy.get('[data-cy=create-order]').click();

      cy.request('/api/orders/latest').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.reference).to.eq('API-UI-250');
      });
    });
  });
});

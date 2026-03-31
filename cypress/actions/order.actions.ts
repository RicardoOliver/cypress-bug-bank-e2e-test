export const createOrder = (amount: number, reference: string) => {
  cy.logStep(`Creating order ${reference}`);
  cy.get('[data-cy=order-amount]').clear().type(`${amount}`);
  cy.get('[data-cy=order-reference]').clear().type(reference);
  cy.get('[data-cy=create-order]').click();
};

export const checkoutFlow = () => {
  cy.logStep('Executing checkout flow');
  cy.get('[data-cy=checkout]').click();
  cy.get('[data-cy=checkout-status]').should('contain', 'SUCCESS');
};

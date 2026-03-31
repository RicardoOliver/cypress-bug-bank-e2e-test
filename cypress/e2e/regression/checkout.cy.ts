import { loginUser } from '@actions/auth.actions';
import { checkoutFlow, createOrder } from '@actions/order.actions';
import { buildOrderData } from '@utils/dataFactory';

describe('Checkout Regression', { tags: ['@regression', '@critical'] }, () => {
  beforeEach(() => {
    cy.fixture('users').then(({ validUser }) => {
      loginUser(validUser.username, validUser.password);
    });
  });

  it('completes checkout for a standard order', () => {
    const order = buildOrderData();
    createOrder(order.amount, order.reference);
    checkoutFlow();
  });

  it('supports boundary order amounts', () => {
    cy.fixture('orders').then(({ boundaryMinOrder, boundaryMaxOrder }) => {
      [boundaryMinOrder, boundaryMaxOrder].forEach((order) => {
        createOrder(order.amount, order.reference);
        checkoutFlow();
      });
    });
  });
});

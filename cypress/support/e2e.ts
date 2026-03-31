import './commands';
import registerCypressGrep from 'cypress-grep';

registerCypressGrep();

beforeEach(() => {
  cy.logStep('Starting test');
});

afterEach(function () {
  if (this.currentTest?.state === 'failed') {
    cy.logStep('Test failed, artifact capture expected (screenshot/video).');
  }
});

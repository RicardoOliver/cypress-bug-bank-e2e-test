import { registerAndLogin } from '../../actions/auth.actions';
import { makeTransfer } from '../../actions/transfer.actions';
import { dataFactory } from '../../utils/dataFactory';

describe('Regressão de Transferência', { tags: ['@regression', '@critical'] }, () => {
  beforeEach(() => {
    // Para testes de regressão, iniciamos com um novo usuário com saldo
    registerAndLogin(true);
  });

  it('deve completar uma transferência padrão entre contas', () => {
    const dadosTransferencia = dataFactory.generateTransfer({ account: '123', digit: '4', amount: '100' });
    makeTransfer(dadosTransferencia.account, dadosTransferencia.digit, dadosTransferencia.amount, dadosTransferencia.description);
    cy.contains(/sucesso/i).should('be.visible');
  });

  it('deve suportar transferências com valores de limite (boundary)', () => {
    cy.fixture('orders').then(({ boundaryMinOrder, boundaryMaxOrder }) => {
      [boundaryMinOrder, boundaryMaxOrder].forEach((ordem) => {
        // Realiza transferências baseadas nos limites definidos na fixture
        makeTransfer('123', '4', ordem.amount.toString(), `Regressão: ${ordem.reference}`);
        cy.get('[data-testid="btn-close-modal"]').click();
      });
    });
  });
});

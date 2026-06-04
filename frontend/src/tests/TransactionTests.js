const { TransactionService } = require('../../../shared/database/services/TransactionService');
const { FatigueTransactionService } = require('../../../shared/database/services/FatigueTransactionService');

describe('Transaction Services - SGTQ', () => {
    let transactionService;
    let fatigueService;

    beforeAll(() => {
        transactionService = new TransactionService();
        fatigueService = new FatigueTransactionService();
    });

    test('TransactionService executeTransaction debe manejar commit exitoso', async () => {
        const result = await transactionService.executeTransaction(async (client) => {
            return { test: 'success' };
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ test: 'success' });
    });

    test('TransactionService debe hacer rollback en error', async () => {
        const result = await transactionService.executeTransaction(async (client) => {
            throw new Error('Test error');
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Test error');
    });

    test('FatigueTransactionService debe validar límites de horas', async () => {
        const result = await fatigueService.validateAndUpdateFatigue(1, 50);
        expect(result.approved).toBe(false);
        expect(result.error).toContain('supera límite de fatiga');
    });

    test('Debe obtener reporte de fatiga', async () => {
        const report = await fatigueService.getFatigueReport();
        expect(report).toHaveProperty('medicos');
        expect(Array.isArray(report.medicos)).toBe(true);
    });
});

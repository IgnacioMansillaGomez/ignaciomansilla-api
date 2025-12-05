import { InMemoryTransferRepository } from './in-memory-transfer.repository';
import { Transfer } from '../../../../domain/entities/transfer.entity';
import { TransferStatus } from '../../../../../util/enum';

describe('InMemoryTransferRepository', () => {
  let repository: InMemoryTransferRepository;

  beforeEach(() => {
    repository = new InMemoryTransferRepository();
  });

  it('should return transfers completed in the last month', async () => {
    const transfers = await repository.findCompletedInLastMonth();

    // From seedData: all 3 transfers are completed within the last month
    const ids = transfers.map((t) => t.id).sort();
    expect(ids).toEqual(['1', '2', '3']);
  });

  it('should find transfers by companyId', async () => {
    const company1Transfers = await repository.findByCompanyId('1');

    expect(company1Transfers).toHaveLength(2);
    const ids = company1Transfers.map((t) => t.id).sort();
    expect(ids).toEqual(['1', '3']);
    company1Transfers.forEach((t) => {
      expect(t.companyId).toBe('1');
    });

    const company2Transfers = await repository.findByCompanyId('2');
    expect(company2Transfers).toHaveLength(1);
    expect(company2Transfers[0].id).toBe('2');
    expect(company2Transfers[0].companyId).toBe('2');
  });

  it('should count transfers completed in the last month', async () => {
    const initialCount = await repository.countInLastMonth();
    expect(initialCount).toBe(3);

    // Add an old transfer (older than one month) – should NOT be counted
    const now = new Date();
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

    (repository as any).transfers.push(
      new Transfer(
        '4',
        '3',
        99999,
        fortyDaysAgo,
        'USD',
        TransferStatus.COMPLETED,
        'Old transfer',
      ),
    );

    const countAfterAddingOld = await repository.countInLastMonth();
    expect(countAfterAddingOld).toBe(3);
  });

  it('should sum amounts of transfers completed in the last month', async () => {
    const sum = await repository.sumAmountInLastMonth();

    // From seed:
    // 1:  50000
    // 2: 150000
    // 3:  25000
    // total = 225000
    expect(sum).toBe(225000);

    // Add an old completed transfer, should NOT affect the sum for last month
    const now = new Date();
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

    (repository as any).transfers.push(
      new Transfer(
        '5',
        '1',
        77777,
        fortyDaysAgo,
        'USD',
        TransferStatus.COMPLETED,
        'Very old transfer',
      ),
    );

    const sumAfterOld = await repository.sumAmountInLastMonth();
    expect(sumAfterOld).toBe(225000);
  });
});

import { TransferStatus } from 'src/util/enum';
import { Transfer } from './transfer.entity';

describe('Transfer Entity', () => {
  describe('isCompletedInLastMonth', () => {
    it('should return true for completed transfer from 10 days ago', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);

      const transfer = new Transfer(
        '1',
        'company-1',
        50000,
        recentDate,
        'USD',
        TransferStatus.COMPLETED,
        'Test transfer',
      );

      expect(transfer.isCompletedInLastMonth()).toBe(true);
    });

    it('should return false for completed transfer from 45 days ago', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 45);

      const transfer = new Transfer(
        '2',
        'company-1',
        50000,
        oldDate,
        'USD',
        TransferStatus.COMPLETED,
        'Old transfer',
      );

      expect(transfer.isCompletedInLastMonth()).toBe(false);
    });

    it('should return false for pending transfer even if recent', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5);

      const transfer = new Transfer(
        '3',
        'company-1',
        50000,
        recentDate,
        'USD',
        TransferStatus.PENDING,
        'Pending transfer',
      );

      expect(transfer.isCompletedInLastMonth()).toBe(false);
    });

    it('should return false for failed transfer even if recent', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5);

      const transfer = new Transfer(
        '4',
        'company-1',
        50000,
        recentDate,
        'USD',
        TransferStatus.FAILED,
        'Failed transfer',
      );

      expect(transfer.isCompletedInLastMonth()).toBe(false);
    });
  });
});

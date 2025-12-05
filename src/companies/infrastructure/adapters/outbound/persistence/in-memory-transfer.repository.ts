import { Injectable } from '@nestjs/common';
import { Transfer } from '../../../../domain/entities/transfer.entity';
import { ITransferRepository } from '../../../../application/ports/outbound/transfer.repository';
import { TransferStatus } from '../../../../../util/enum';

@Injectable()
export class InMemoryTransferRepository implements ITransferRepository {
  private transfers: Transfer[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    const now = new Date();

    this.transfers = [
      new Transfer(
        '1',
        '1',
        50000,
        new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        'USD',
        TransferStatus.COMPLETED,
        'Service payment',
      ),
      new Transfer(
        '2',
        '2',
        150000,
        new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        'USD',
        TransferStatus.COMPLETED,
        'International transfer',
      ),
      new Transfer(
        '3',
        '1',
        25000,
        new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        'USD',
        TransferStatus.COMPLETED,
        'Monthly payment',
      ),
    ];
  }

  async findCompletedInLastMonth(): Promise<Transfer[]> {
    return this.transfers.filter((t) => t.isCompletedInLastMonth());
  }

  async findByCompanyId(companyId: string): Promise<Transfer[]> {
    return this.transfers.filter((t) => t.companyId === companyId);
  }

  async countInLastMonth(): Promise<number> {
    return this.transfers.filter((t) => t.isCompletedInLastMonth()).length;
  }

  async sumAmountInLastMonth(): Promise<number> {
    return this.transfers
      .filter((t) => t.isCompletedInLastMonth())
      .reduce((sum, t) => sum + t.amount, 0);
  }
}

import { TransferStatus } from '../../../util/enum';

export class Transfer {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly amount: number,
    public readonly date: Date,
    public readonly currency: string,
    public status: TransferStatus,
    public description?: string,
  ) {}

  isCompletedInLastMonth(): boolean {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return this.status === TransferStatus.COMPLETED && this.date >= oneMonthAgo;
  }
}

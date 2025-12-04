import { Transfer } from '../../../domain/entities/transfer.entity';

export interface ITransferRepository {
  findCompletedInLastMonth(): Promise<Transfer[]>;
  findByCompanyId(companyId: string): Promise<Transfer[]>;
  countInLastMonth(): Promise<number>;
  sumAmountInLastMonth(): Promise<number>;
}

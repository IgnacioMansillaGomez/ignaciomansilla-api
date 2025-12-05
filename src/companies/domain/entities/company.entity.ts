import { CompanyType } from 'src/util/enum';
import { TaxId } from '../value-objects/tax-id.vo';
import { Name } from '../value-objects/name.vo';
import { Email } from '../value-objects/email.vo';

export class Company {
  constructor(
    public readonly id: string,
    public readonly name: Name,
    public readonly taxId: TaxId,
    public readonly type: CompanyType,
    public readonly email: Email | null,
    public readonly registrationDate: Date,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  isRegisteredInLastMonth(): boolean {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return this.registrationDate >= oneMonthAgo;
  }
}

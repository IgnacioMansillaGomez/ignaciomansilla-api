import { CompanyType } from 'src/util/enum';

export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly taxId: string,
    public readonly type: CompanyType,
    public readonly email: string | null,
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

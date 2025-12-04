import { UUID } from 'crypto';
import { CompanyType } from 'src/util/enum';

export class Company {
  id: UUID;
  name: string;
  taxId: string;
  type: CompanyType;
  registrationDate: Date;
  email: string;
}

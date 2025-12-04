import { CompanyType } from 'src/util/enum';

export class Company {
  id: string;
  name: string;
  taxId: string;
  type: CompanyType;
  registrationDate: Date;
  email: string;
  phone?: string;
  address?: string;
}

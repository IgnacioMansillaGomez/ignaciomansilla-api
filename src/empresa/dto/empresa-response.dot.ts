import { CompanyType } from 'src/util/enum';

export class CompanyResponseDto {
  id: string;
  name: string;
  taxId: string;
  type: CompanyType;
  registrationDate: Date;
  email: string;
  phone?: string;
  address?: string;
}

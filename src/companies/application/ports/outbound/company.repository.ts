import { Company } from '../../../domain/entities/company.entity';
import {
  CompanyFilters,
  PaginationParams,
} from '../inbound/company.uses-cases';

export interface ICompanyRepository {
  save(company: Company): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findByTaxId(taxId: string): Promise<Company | null>;
  findAll(
    filters: CompanyFilters,
    pagination: PaginationParams,
  ): Promise<{ data: Company[]; total: number }>;
  findRegisteredInLastMonth(): Promise<Company[]>;
}

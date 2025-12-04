import { Company } from '../../../domain/entities/company.entity';

export interface CreateCompanyCommand {
  name: string;
  taxId: string;
  type: string;
  email: string;
}

export interface CompanyFilters {
  type?: string;
  industry?: string;
  search?: string;
  email?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ICompanyUseCases {
  registerCompany(command: CreateCompanyCommand): Promise<Company>;
  getCompaniesWithRecentTransfers(): Promise<Company[]>;
  getRecentlyRegisteredCompanies(): Promise<Company[]>;
  findCompanyById(id: string): Promise<Company>;
  findAllCompanies(
    filters: CompanyFilters,
    pagination: PaginationParams,
  ): Promise<{ data: Company[]; total: number }>;
}

import { Injectable } from '@nestjs/common';
import { Company } from '../../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../../../application/ports/outbound/company.repository';
import { CompanyType } from '../../../../../util/enum';
import {
  CompanyFilters,
  PaginationParams,
} from 'src/companies/application/ports/inbound/company.uses-cases';

@Injectable()
export class InMemoryCompanyRepository implements ICompanyRepository {
  private companies: Company[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    this.companies = [
      new Company(
        '1',
        'Tech Solutions Inc',
        '30-12345678-9',
        CompanyType.PYME,
        'email@gmail.com',
        new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      ),
      new Company(
        '2',
        'Global Corp',
        '30-98765432-1',
        CompanyType.CORPORATE,
        'email@gmail.com',
        new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      ),
      new Company(
        '3',
        'Old Company Ltd',
        '30-55555555-5',
        CompanyType.PYME,
        'email@gmail.com',
        twoMonthsAgo,
      ),
    ];
  }

  async save(company: Company): Promise<Company> {
    this.companies.push(company);
    return company;
  }

  async findById(id: string): Promise<Company | null> {
    return this.companies.find((c) => c.id === id) || null;
  }

  async findByTaxId(taxId: string): Promise<Company | null> {
    return this.companies.find((c) => c.taxId === taxId) || null;
  }

  async findAll(
    filters: CompanyFilters,
    pagination: PaginationParams,
  ): Promise<{ data: Company[]; total: number }> {
    let filtered = [...this.companies];

    if (filters.type) {
      filtered = filtered.filter((c) => c.type === filters.type);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) || c.taxId.includes(search),
      );
    }

    if (filters.email) {
      const emailSearch = filters.email.toLowerCase();
      filtered = filtered.filter(
        (c) => c.email && c.email.toLowerCase().includes(emailSearch),
      );
    }

    const total = filtered.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;

    return {
      data: filtered.slice(startIndex, endIndex),
      total,
    };
  }

  async findRegisteredInLastMonth(): Promise<Company[]> {
    return this.companies.filter((c) => c.isRegisteredInLastMonth());
  }
}

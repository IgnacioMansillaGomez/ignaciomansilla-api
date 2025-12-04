import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Company } from '../../domain/entities/company.entity';
import { TaxId } from '../../domain/value-objects/tax-id.vo';
import type { ICompanyRepository } from '../ports/outbound/company.repository';
import type { ITransferRepository } from '../ports/outbound/transfer.repository';
import {
  CompanyFilters,
  CreateCompanyCommand,
  ICompanyUseCases,
  PaginationParams,
} from '../ports/inbound/company.uses-cases';
import { CompanyStatus, CompanyType } from 'src/util/enum';

@Injectable()
export class CompanyService implements ICompanyUseCases {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ITransferRepository')
    private readonly transferRepository: ITransferRepository,
  ) {}

  async registerCompany(command: CreateCompanyCommand): Promise<Company> {
    const taxId = new TaxId(command.taxId);

    const existingByTaxId = await this.companyRepository.findByTaxId(
      taxId.getValue(),
    );
    if (existingByTaxId) {
      throw new BadRequestException(
        'A company with this tax ID already exists',
      );
    }

    const company = new Company(
      this.generateId(),
      command.name,
      taxId.getValue(),
      command.type as CompanyType,
      CompanyStatus.ACTIVE,
      command.email || null,
      new Date(),
    );

    return await this.companyRepository.save(company);
  }

  async getCompaniesWithRecentTransfers(): Promise<Company[]> {
    const recentTransfers =
      await this.transferRepository.findCompletedInLastMonth();
    const companyIds = new Set(recentTransfers.map((t) => t.companyId));

    const allCompanies = await this.companyRepository.findAll(
      {},
      { page: 1, limit: 1000 },
    );
    return allCompanies.data.filter((c) => companyIds.has(c.id));
  }

  async getRecentlyRegisteredCompanies(): Promise<Company[]> {
    return await this.companyRepository.findRegisteredInLastMonth();
  }

  async findCompanyById(id: string): Promise<Company> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async findAllCompanies(
    filters: CompanyFilters,
    pagination: PaginationParams,
  ): Promise<{ data: Company[]; total: number }> {
    return await this.companyRepository.findAll(filters, pagination);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

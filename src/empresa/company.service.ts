import { Injectable, BadRequestException } from '@nestjs/common';

import { CreateCompanyDto } from './dto/create-company.dto';
import { Company } from './entities/empresa.entity';
import { Transfer } from './entities/transfer.entity';
import { CompanyType } from 'src/util/enum';
import { CompanyResponseDto } from './dto/empresa-response.dot';

@Injectable()
export class CompaniesService {
  private companies: Company[] = [];
  private transfers: Transfer[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    this.companies = [
      {
        id: '1',
        name: 'Tech Solutions Inc',
        taxId: '30-12345678-9',
        type: CompanyType.PYME,
        registrationDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        email: 'info@techsolutions.com',
        phone: '+1-555-1234567',
      },
      {
        id: '2',
        name: 'Global Corp',
        taxId: '30-98765432-1',
        type: CompanyType.CORPORATE,
        registrationDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        email: 'contact@globalcorp.com',
      },
      {
        id: '3',
        name: 'Old Company Ltd',
        taxId: '30-55555555-5',
        type: CompanyType.PYME,
        registrationDate: twoMonthsAgo,
        email: 'info@oldcompany.com',
      },
    ];

    // Sample transfers
    this.transfers = [
      {
        id: '1',
        companyId: '1',
        amount: 50000,
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        description: 'Service payment',
      },
      {
        id: '2',
        companyId: '2',
        amount: 150000,
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        description: 'International transfer',
      },
      {
        id: '3',
        companyId: '3',
        amount: 25000,
        date: twoMonthsAgo,
        description: 'Old payment',
      },
    ];
  }

  getCompaniesWithTransfersLastMonth(): CompanyResponseDto[] {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get IDs of companies with recent transfers
    const companyIdsWithTransfers = new Set(
      this.transfers
        .filter((t) => t.date >= oneMonthAgo)
        .map((t) => t.companyId),
    );

    // Filter companies
    return this.companies
      .filter((c) => companyIdsWithTransfers.has(c.id))
      .map(this.toResponseDto);
  }

  // 2. Get companies registered in the last month
  getCompaniesRegisteredLastMonth(): CompanyResponseDto[] {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return this.companies
      .filter((c) => c.registrationDate >= oneMonthAgo)
      .map(this.toResponseDto);
  }

  // 3. Register new company
  registerCompany(createCompanyDto: CreateCompanyDto): CompanyResponseDto {
    // Validate unique tax ID
    const taxIdExists = this.companies.some(
      (c) => c.taxId === createCompanyDto.taxId,
    );
    if (taxIdExists) {
      throw new BadRequestException(
        'A company with this tax ID already exists',
      );
    }

    // Create new company
    const newCompany: Company = {
      id: (this.companies.length + 1).toString(),
      ...createCompanyDto,
      registrationDate: new Date(),
    };

    this.companies.push(newCompany);

    return this.toResponseDto(newCompany);
  }

  // Helper method to convert to DTO
  private toResponseDto(company: Company): CompanyResponseDto {
    return {
      id: company.id,
      name: company.name,
      taxId: company.taxId,
      type: company.type,
      registrationDate: company.registrationDate,
      email: company.email,
      phone: company.phone,
      address: company.address,
    };
  }
}

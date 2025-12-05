import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from '../../domain/entities/company.entity';
import { Transfer } from '../../domain/entities/transfer.entity';
import { ICompanyRepository } from '../ports/outbound/company.repository';
import { ITransferRepository } from '../ports/outbound/transfer.repository';
import { CompanyType, TransferStatus } from '../../../util/enum';

describe('CompanyService', () => {
  let service: CompanyService;
  let companyRepository: jest.Mocked<ICompanyRepository>;
  let transferRepository: jest.Mocked<ITransferRepository>;

  const mockCompanyRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByTaxId: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    findRegisteredInLastMonth: jest.fn(),
    update: jest.fn(),
    countByType: jest.fn(),
    countByStatus: jest.fn(),
    countTotal: jest.fn(),
  };

  const mockTransferRepository = {
    findCompletedInLastMonth: jest.fn(),
    findByCompanyId: jest.fn(),
    countInLastMonth: jest.fn(),
    sumAmountInLastMonth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: 'ICompanyRepository',
          useValue: mockCompanyRepository,
        },
        {
          provide: 'ITransferRepository',
          useValue: mockTransferRepository,
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    companyRepository = module.get('ICompanyRepository');
    transferRepository = module.get('ITransferRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerCompany', () => {
    const validCommand = {
      name: 'Test Company',
      taxId: '30-12345678-9',
      type: 'PYME',
      email: 'test@company.com',
      phone: '+1-555-1234567',
      address: '123 Test St',
      industry: 'Technology',
    };

    it('should register a new company successfully', async () => {
      companyRepository.findByTaxId.mockResolvedValue(null);

      companyRepository.save.mockImplementation((company) =>
        Promise.resolve(company),
      );

      const result = await service.registerCompany(validCommand);

      expect(result.name).toBe('Test Company');
      expect(result.type).toBe(CompanyType.PYME);

      expect(companyRepository.findByTaxId).toHaveBeenCalledWith(
        '30-12345678-9',
      );

      expect(companyRepository.save).toHaveBeenCalled();
    });

    it('should throw error for invalid tax ID format', async () => {
      const invalidCommand = { ...validCommand, taxId: '123456789' };

      await expect(service.registerCompany(invalidCommand)).rejects.toThrow();
    });

    it('should throw error for duplicate tax ID', async () => {
      const existingCompany = new Company(
        '1',
        'Existing Company',
        '30-12345678-9',
        CompanyType.PYME,
        'existing@company.com',
        new Date(),
      );

      companyRepository.findByTaxId.mockResolvedValue(existingCompany);

      await expect(service.registerCompany(validCommand)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.registerCompany(validCommand)).rejects.toThrow(
        'A company with this tax ID already exists',
      );
    });
  });

  describe('getCompaniesWithRecentTransfers', () => {
    it('should return companies with recent transfers', async () => {
      const company1 = new Company(
        '1',
        'Company 1',
        '30-12345678-9',
        CompanyType.CORPORATE,
        'company1@test.com',
        new Date(),
      );

      const company2 = new Company(
        '2',
        'Company 2',
        '30-98765432-1',
        CompanyType.CORPORATE,
        'company2@test.com',
        new Date(),
      );

      const transfers = [
        new Transfer(
          '1',
          '1',
          50000,
          new Date(),
          'USD',
          TransferStatus.COMPLETED,
        ),
        new Transfer(
          '2',
          '2',
          100000,
          new Date(),
          'USD',
          TransferStatus.COMPLETED,
        ),
      ];

      transferRepository.findCompletedInLastMonth.mockResolvedValue(transfers);
      companyRepository.findAll.mockResolvedValue({
        data: [company1, company2],
        total: 2,
      });

      const result = await service.getCompaniesWithRecentTransfers();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should return empty array when no recent transfers', async () => {
      transferRepository.findCompletedInLastMonth.mockResolvedValue([]);
      companyRepository.findAll.mockResolvedValue({ data: [], total: 0 });

      const result = await service.getCompaniesWithRecentTransfers();

      expect(result).toHaveLength(0);
    });
  });

  describe('getRecentlyRegisteredCompanies', () => {
    it('should return recently registered companies', async () => {
      const recentCompanies = [
        new Company(
          '1',
          'Recent Company 1',
          '30-12345678-9',
          CompanyType.PYME,
          'recent1@test.com',
          new Date(),
        ),
        new Company(
          '2',
          'Recent Company 2',
          '30-98765432-1',
          CompanyType.CORPORATE,
          'recent2@test.com',
          new Date(),
        ),
      ];

      companyRepository.findRegisteredInLastMonth.mockResolvedValue(
        recentCompanies,
      );

      const result = await service.getRecentlyRegisteredCompanies();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Recent Company 1');
      expect(result[1].name).toBe('Recent Company 2');
    });
  });

  describe('findCompanyById', () => {
    it('should return company when found', async () => {
      const company = new Company(
        '1',
        'Test Company',
        '30-12345678-9',
        CompanyType.PYME,
        'test@company.com',
        new Date(),
      );

      companyRepository.findById.mockResolvedValue(company);

      const result = await service.findCompanyById('1');

      expect(result.id).toBe('1');
      expect(result.name).toBe('Test Company');
    });

    it('should throw NotFoundException when company not found', async () => {
      companyRepository.findById.mockResolvedValue(null);

      await expect(service.findCompanyById('999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findCompanyById('999')).rejects.toThrow(
        'Company with ID 999 not found',
      );
    });
  });
});

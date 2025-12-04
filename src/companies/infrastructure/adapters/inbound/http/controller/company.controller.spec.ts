import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './company.controller';
import { ICompanyUseCases } from '../../../../../application/ports/inbound/company.uses-cases';
import { Company } from '../../../../../domain/entities/company.entity';
import { CreateCompanyDto } from '../dtos/create-company.dto';
import { QueryCompaniesDto } from '../dtos/query-companies.dto';
import { CompanyType } from '../../../../../../util/enum';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let companyUseCases: jest.Mocked<ICompanyUseCases>;

  const mockCompanyUseCases = {
    registerCompany: jest.fn(),
    getCompaniesWithRecentTransfers: jest.fn(),
    getRecentlyRegisteredCompanies: jest.fn(),
    findCompanyById: jest.fn(),
    findAllCompanies: jest.fn(),
    updateCompany: jest.fn(),
    getStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: 'ICompanyUseCases',
          useValue: mockCompanyUseCases,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    companyUseCases = module.get('ICompanyUseCases');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompaniesWithTransfers', () => {
    it('should return companies with recent transfers', async () => {
      const mockCompanies = [
        new Company(
          '1',
          'Tech Solutions Inc',
          '30-12345678-9',
          CompanyType.PYME,
          'info@tech.com',
          new Date(),
        ),
      ];

      companyUseCases.getCompaniesWithRecentTransfers.mockResolvedValue(
        mockCompanies,
      );

      const result = await controller.getCompaniesWithTransfers();

      expect(result).toEqual(mockCompanies);
      expect(
        companyUseCases.getCompaniesWithRecentTransfers,
      ).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no companies have transfers', async () => {
      companyUseCases.getCompaniesWithRecentTransfers.mockResolvedValue([]);

      const result = await controller.getCompaniesWithTransfers();

      expect(result).toEqual([]);
      expect(
        companyUseCases.getCompaniesWithRecentTransfers,
      ).toHaveBeenCalled();
    });
  });

  describe('getCompaniesRegistered', () => {
    it('should return recently registered companies', async () => {
      const mockCompanies = [
        new Company(
          '1',
          'New Company',
          '30-12345678-9',
          CompanyType.PYME,
          'new@company.com',
          new Date(),
        ),
      ];

      companyUseCases.getRecentlyRegisteredCompanies.mockResolvedValue(
        mockCompanies,
      );

      const result = await controller.getCompaniesRegistered();

      expect(result).toEqual(mockCompanies);
      expect(
        companyUseCases.getRecentlyRegisteredCompanies,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return paginated companies without filters', async () => {
      const queryParams: QueryCompaniesDto = {
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        data: [
          new Company(
            '1',
            'Company 1',
            '30-12345678-9',
            CompanyType.PYME,
            'company1@test.com',
            new Date(),
          ),
        ],
        total: 1,
      };

      companyUseCases.findAllCompanies.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryParams);

      expect(result).toEqual(mockResponse);
      expect(companyUseCases.findAllCompanies).toHaveBeenCalledWith(
        {
          type: undefined,
          search: undefined,
        },
        {
          page: 1,
          limit: 10,
        },
      );
    });

    it('should return filtered companies by type', async () => {
      const queryParams: QueryCompaniesDto = {
        type: 'PYME',
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        data: [],
        total: 0,
      };

      companyUseCases.findAllCompanies.mockResolvedValue(mockResponse);

      await controller.findAll(queryParams);

      expect(companyUseCases.findAllCompanies).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PYME',
        }),
        expect.any(Object),
      );
    });

    it('should return searched companies', async () => {
      const queryParams: QueryCompaniesDto = {
        search: 'tech',
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        data: [],
        total: 0,
      };

      companyUseCases.findAllCompanies.mockResolvedValue(mockResponse);

      await controller.findAll(queryParams);

      expect(companyUseCases.findAllCompanies).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'tech',
        }),
        expect.any(Object),
      );
    });
  });

  describe('registerCompany', () => {
    it('should register a new SME company', async () => {
      const createDto: CreateCompanyDto = {
        name: 'New SME Company',
        taxId: '30-11111111-1',
        type: 'SME',
        email: 'newsme@company.com',
      };

      const mockCompany = new Company(
        'generated-id',
        createDto.name,
        createDto.taxId,
        CompanyType.PYME,
        createDto.email,
        new Date(),
      );

      companyUseCases.registerCompany.mockResolvedValue(mockCompany);

      const result = await controller.registerCompany(createDto);

      expect(result).toEqual(mockCompany);
      expect(result.name).toBe('New SME Company');
      expect(result.type).toBe(CompanyType.PYME);
      expect(companyUseCases.registerCompany).toHaveBeenCalledWith(createDto);
    });

    it('should register a new Corporate company', async () => {
      const createDto: CreateCompanyDto = {
        name: 'New Corporate Company',
        taxId: '30-22222222-2',
        type: 'CORPORATE',
        email: 'corporate@company.com',
      };

      const mockCompany = new Company(
        'generated-id',
        createDto.name,
        createDto.taxId,
        CompanyType.CORPORATE,
        'example@gmail.com',
        new Date(),
      );

      companyUseCases.registerCompany.mockResolvedValue(mockCompany);

      const result = await controller.registerCompany(createDto);

      expect(result.type).toBe(CompanyType.CORPORATE);
    });

    it('should propagate validation errors', async () => {
      const createDto: CreateCompanyDto = {
        name: 'Bad Company',
        taxId: 'invalid',
        type: 'SME',
        email: 'bad@company.com',
      };

      companyUseCases.registerCompany.mockRejectedValue(
        new Error('Invalid tax ID format'),
      );

      await expect(controller.registerCompany(createDto)).rejects.toThrow(
        'Invalid tax ID format',
      );
    });
  });
});

import { InMemoryCompanyRepository } from './in-memory-company.repository';
import { Company } from '../../../../domain/entities/company.entity';
import { CompanyType } from '../../../../../util/enum';
import {
  CompanyFilters,
  PaginationParams,
} from 'src/companies/application/ports/inbound/company.uses-cases';

describe('InMemoryCompanyRepository', () => {
  let repository: InMemoryCompanyRepository;

  beforeEach(() => {
    repository = new InMemoryCompanyRepository();
  });

  it('should return seeded companies with findAll (no filters)', async () => {
    const filters: CompanyFilters = {};
    const pagination: PaginationParams = { page: 1, limit: 10 };

    const result = await repository.findAll(filters, pagination);

    expect(result.total).toBe(3);
    expect(result.data).toHaveLength(3);
    const names = result.data.map((c) => c.name);
    expect(names).toEqual([
      'Tech Solutions Inc',
      'Global Corp',
      'Old Company Ltd',
    ]);
  });

  it('should save a new company', async () => {
    const newCompany = new Company(
      '4',
      'New Startup',
      '30-11111111-1',
      CompanyType.PYME,
      'new@company.com',
      new Date(),
    );

    const saved = await repository.save(newCompany);
    expect(saved).toBe(newCompany);

    const fetched = await repository.findById('4');
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('New Startup');

    const filters: CompanyFilters = {};
    const pagination: PaginationParams = { page: 1, limit: 10 };
    const all = await repository.findAll(filters, pagination);
    expect(all.total).toBe(4);
  });

  it('should find company by id when it exists', async () => {
    const company = await repository.findById('1');

    expect(company).not.toBeNull();
    expect(company?.name).toBe('Tech Solutions Inc');
  });

  it('should return null when company id does not exist', async () => {
    const company = await repository.findById('999');

    expect(company).toBeNull();
  });

  it('should find company by taxId when it exists', async () => {
    const company = await repository.findByTaxId('30-98765432-1');

    expect(company).not.toBeNull();
    expect(company?.id).toBe('2');
  });

  it('should return null when taxId does not exist', async () => {
    const company = await repository.findByTaxId('30-00000000-0');

    expect(company).toBeNull();
  });

  it('should filter by type in findAll', async () => {
    const filters: CompanyFilters = {
      type: CompanyType.PYME,
    };
    const pagination: PaginationParams = { page: 1, limit: 10 };

    const result = await repository.findAll(filters, pagination);

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(2);
    result.data.forEach((c) => {
      expect(c.type).toBe(CompanyType.PYME);
    });
  });

  it('should filter by search (name) in findAll', async () => {
    const filters: CompanyFilters = {
      search: 'tech',
    };
    const pagination: PaginationParams = { page: 1, limit: 10 };

    const result = await repository.findAll(filters, pagination);

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Tech Solutions Inc');
  });

  it('should filter by search (taxId) in findAll', async () => {
    const filters: CompanyFilters = {
      search: '98765432',
    };
    const pagination: PaginationParams = { page: 1, limit: 10 };

    const result = await repository.findAll(filters, pagination);

    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe('2');
  });

  it('should filter by email in findAll', async () => {
    const filters: CompanyFilters = {
      email: 'gmail.com',
    };
    const pagination: PaginationParams = { page: 1, limit: 10 };

    const result = await repository.findAll(filters, pagination);

    expect(result.total).toBe(3);
    result.data.forEach((c) => {
      expect(c.email).toContain('gmail.com');
    });
  });

  it('should paginate results correctly', async () => {
    const filters: CompanyFilters = {};
    const pagination: PaginationParams = { page: 2, limit: 1 };

    const result = await repository.findAll(filters, pagination);

    expect(result.total).toBe(3);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('2'); // second company in seedData
  });

  it('should return companies registered in the last month', async () => {
    const recentCompanies = await repository.findRegisteredInLastMonth();

    const ids = recentCompanies.map((c) => c.id).sort();
    expect(ids).toEqual(['1', '2']);
  });
});

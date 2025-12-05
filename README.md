# 🏢 Company Registration System

A scalable company registration and management system built with **Hexagonal Architecture** using NestJS and TypeScript, with an optional AWS Lambda serverless component.

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Key Design Decisions](#key-design-decisions)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [AWS Lambda Integration](#aws-lambda-integration)
- [Design Patterns Used](#design-patterns-used)

---

## 🏗️ Architecture

This project implements **Hexagonal Architecture (Ports and Adapters)**, which provides:

- **Clear separation of concerns** between business logic and infrastructure
- **Framework independence** - The domain layer has zero dependencies
- **Easy testability** - Mock adapters without touching business logic
- **Flexibility** - Swap implementations (in-memory → JSON files → PostgreSQL) without changing core logic

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                   │
│  (HTTP Controllers, JSON Repositories, External APIs)   │
│                                                          │
│  src/companies/infrastructure/                          │
│    ├── adapters/                                        │
│    │   ├── inbound/                                    │
│    │   │   └── http/                                   │
│    │   │       ├── controllers/                        │
│    │   │       └── dtos/                               │
│    │   └── outbound/                                   │
│    │       └── persistence/                            │
│    │           ├── in-memory-company.repository.ts     │
│    │           └── in-memory-transfer.repository.ts    │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│        (Use Cases, Ports/Interfaces, Services)          │
│                                                          │
│  src/companies/application/                             │
│    ├── ports/                                           │
│    │   ├── inbound/                                    │
│    │   │   └── company.use-cases.ts (ICompanyUseCases) │
│    │   └── outbound/                                   │
│    │       ├── company.repository.ts (ICompanyRepo)    │
│    │       └── transfer.repository.ts (ITransferRepo)  │
│    └── use-cases/                                       │
│        └── company.service.ts                           │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│    (Entities, Value Objects, Business Rules)            │
│                  NO EXTERNAL DEPENDENCIES                │
│                                                          │
│  src/companies/domain/                                  │
│    ├── entities/                                        │
│    │   ├── company.entity.ts                           │
│    │   └── transfer.entity.ts                          │
│    └── value-objects/                                   │
│        ├── tax-id.vo.ts                                 │
│        └── company-stats.vo.ts                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type safety and modern JavaScript features
- **Jest** - Unit and integration testing
- **class-validator** - DTO validation
- **Swagger/OpenAPI** - API documentation
- **AWS Lambda** (optional) - Serverless function for high-volume registrations
- **AWS DynamoDB** (optional) - NoSQL database for Lambda

---

## 📁 Project Structure

```
src/
├── companies/
│   ├── domain/                           # Core business logic
│   │   ├── entities/
│   │   │   ├── company.entity.ts        # Rich domain model
│   │   │   └── transfer.entity.ts
│   │   └── value-objects/
│   │       ├── tax-id.vo.ts             # Encapsulates validation
│   │       └── company-stats.vo.ts
│   │
│   ├── application/                      # Use cases orchestration
│   │   ├── ports/
│   │   │   ├── inbound/
│   │   │   │   └── company.use-cases.ts # What app can do
│   │   │   └── outbound/
│   │   │       ├── company.repository.ts # What app needs
│   │   │       └── transfer.repository.ts
│   │   └── use-cases/
│   │       └── company.service.ts       # Business workflows
│   │
│   ├── infrastructure/                   # Technical implementation
│   │   └── adapters/
│   │       ├── inbound/
│   │       │   └── http/
│   │       │       ├── controllers/     # HTTP endpoints
│   │       │       └── dtos/            # Request/response DTOs
│   │       └── outbound/
│   │           └── persistence/
│   │           ├── in-memory-company.repository.ts     # File storage
│   │           └── in-memory-transfer.repository.ts
│   │
│   └── companies.module.ts              # Dependency injection
│
├── app.module.ts
├── main.ts
└── util/
    └── enum.ts                          # Shared enums

test/
├── unit/
└── e2e/

lambda/                                  # AWS Lambda function
└── registerCompany.ts
```

---

## 💡 Key Design Decisions

### 1. **Why Hexagonal Architecture?**

**Problem:** Traditional layered architectures create tight coupling between business logic and infrastructure, making testing difficult and technology changes expensive.

**Solution:** Hexagonal Architecture inverts dependencies. The domain layer is at the center with zero external dependencies. All infrastructure depends on domain interfaces (ports), not vice versa.

**Benefits:**

- ✅ **Testability**: Mock repositories easily without touching business logic
- ✅ **Flexibility**: Swap JSON files → PostgreSQL → MongoDB by changing one line in the module
- ✅ **Maintainability**: Clear boundaries between layers
- ✅ **Framework independence**: Domain logic doesn't know about NestJS

**Example:**

```typescript
// Application layer depends on INTERFACE (port)
export class CompanyService {
  constructor(
    @Inject('ICompanyRepository')  // ← Interface, not implementation
    private repo: ICompanyRepository
  ) {}
}

// Easy to swap implementations
{
  provide: 'ICompanyRepository',
  // useClass: PostgresRepository,     // Future: PostgreSQL
  // useClass: MongoRepository,        // Future: MongoDB
}
```

---

### 2. **Why Value Objects?**

**Problem:** Validation scattered throughout the codebase, leading to inconsistencies and bugs.

**Solution:** Encapsulate validation logic in Value Objects that guarantee validity at construction time.

**Example:**

```typescript
// Bad: Validation everywhere
function registerCompany(taxId: string) {
  if (!/^\d{2}-\d{8}-\d{1}$/.test(taxId)) throw new Error('Invalid');
  // ... repeated in 10 different places
}

// Good: Validation in one place
class TaxId {
  constructor(value: string) {
    this.validate(value); // Guaranteed valid or throws
  }
}

const taxId = new TaxId('30-12345678-9'); // Valid or throws
```

---

### 3. **Why Rich Domain Entities?**

**Problem:** Anemic domain models where entities are just data bags and all logic lives in services.

**Solution:** Domain entities contain their own business logic and behavior.

**Example:**

```typescript
// Entity with behavior
export class Company {
  isRegisteredInLastMonth(): boolean {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return this.registrationDate >= oneMonthAgo;
  }
}

// Usage
if (company.isRegisteredInLastMonth()) {
  // Business logic stays in the domain
}
```

---

### 4. **Why Dependency Injection with Tokens?**

**Decision:** Use string tokens (`'ICompanyRepository'`) instead of class-based DI.

**Example:**

```typescript
// String token approach (chosen)
@Inject('ICompanyRepository')
private repo: ICompanyRepository

// vs Class-based approach
@Inject(CompanyRepository)
private repo: CompanyRepository
```

**Reasoning:**

- ✅ **Interface-based**: TypeScript interfaces don't exist at runtime, tokens work
- ✅ **Multiple implementations**: Easy to have dev/prod implementations
- ✅ **Clearer intent**: Explicitly states "this is an abstraction"

---

### 5. **Why Readonly Fields in Domain Entities?**

**Decision:** Make most entity fields `readonly`.

**Example:**

```typescript
export class Company {
  constructor(
    public readonly id: string, // ← Can't change
    public readonly name: string, // ← Can't change
    public readonly taxId: string, // ← Can't change
    public updatedAt: Date, // ← Can change
  ) {}
}
```

**Reasoning:**

- ✅ **Immutability**: Prevents accidental modifications
- ✅ **Predictability**: Entity state is more predictable
- ✅ **Thread safety**: Safer in concurrent scenarios
- ✅ **Intent**: Clearly shows what can/cannot change

---

### 6. **Why Separate DTOs and Domain Entities?**

**Problem:** Using domain entities as HTTP request/response objects creates coupling.

**Solution:** DTOs for HTTP layer, Entities for domain layer.

**Example:**

```typescript
// DTO: For HTTP requests
export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

// Entity: For business logic
export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    // ... domain logic
  ) {}

  isRegisteredInLastMonth(): boolean { ... }
}
```

**Benefits:**

- ✅ **Separation**: HTTP concerns don't leak into domain
- ✅ **Validation**: Different rules for input vs internal state
- ✅ **Evolution**: Can change DTOs without affecting domain

---

### 7. **Why Optional Email Field?**

**Decision:** Email is optional (`string | null`).

**Reasoning:**

- ✅ **Flexibility**: Some companies may not have email during registration
- ✅ **Real-world**: Matches actual business requirements
- ✅ **Gradual onboarding**: Can register first, add email later

---

### 8. **Why AWS Lambda for Registration?**

**Decision:** Provide optional Lambda function for company registration.

**Reasoning:**

- ✅ **Scalability**: Auto-scales to handle spikes (e.g., campaign launches)
- ✅ **Cost-effective**: Pay only for executions, not idle time
- ✅ **High availability**: Multi-AZ by default
- ✅ **Hybrid architecture**: NestJS for complex operations, Lambda for simple high-volume

**Architecture:**

```
Frontend → API Gateway → Lambda → DynamoDB  (High-volume registrations)
Frontend → NestJS API           → PostgreSQL (Complex queries, updates)
```

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.x
npm >= 9.x
```

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ignaciomansilla-api

# Install dependencies
npm install
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:8080`

Swagger documentation: `http://localhost:8080/api/docs`

---

### **Base URL:** `http://localhost:8080/api/v1`

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

## ☁️ AWS Lambda Integration

### Lambda Input/Output

**Input:**

```json
{
  "name": "Tech Solutions Inc",
  "taxId": "30-12345678-9",
  "type": "SME",
  "email": "info@techsolutions.com"
}
```

**Output:**

```json
{
  "statusCode": 201,
  "body": {
    "message": "Company registered successfully",
    "data": {
      "id": "COMPANY#1733334567890-abc123def",
      "name": "Tech Solutions Inc",
      "taxId": "30-12345678-9",
      "type": "SME",
      "email": "info@techsolutions.com",
      "registrationDate": "2024-12-04T15:30:00.000Z"
    }
  }
}
```

---

## 🎨 Design Patterns Used

### 1. **Hexagonal Architecture (Ports and Adapters)**

- Core business logic isolated from infrastructure
- Dependencies point inward

### 2. **Repository Pattern**

- Abstraction over data access
- Easy to swap implementations

### 3. **Dependency Injection**

- Loose coupling between components
- Easier testing and maintenance

### 4. **Value Object Pattern**

- Encapsulates validation logic
- Ensures data integrity

### 5. **DTO Pattern**

- Separates HTTP layer from domain
- Validation at API boundary

### 6. **Factory Pattern**

- Centralized object creation
- Consistent entity instantiation

### Migration to Database

To migrate to PostgreSQL/MongoDB:

1. Create new repository implementing `ICompanyRepository`
2. Update `companies.module.ts`:

```typescript
{
  provide: 'ICompanyRepository',
  useClass: PostgresCompanyRepository,  // Changed!
}
```

3. No changes needed in domain or application layers!

---

## 👥 Contributors

- Ignacio Mansilla - Technical Challenge

**Built with ❤️ using Hexagonal Architecture and NestJS**

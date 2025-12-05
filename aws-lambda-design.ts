
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

interface CompanyInput {
  name: string;
  taxId: string;
  type: 'PYME' | 'CORPORATE';
  email?: string | null;
}

interface Company {
  id: string;
  name: string;
  taxId: string;
  type: 'PYME' | 'CORPORATE';
  email: string | null;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// AWS Setup
// ==========================================
const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'Companies';

// ==========================================
// Validation Functions
// ==========================================
function validateTaxId(taxId: string): string | null {
  const regex = /^\d{2}-\d{8}-\d{1}$/;
  if (!taxId) return 'Tax ID is required';
  if (!regex.test(taxId)) return 'Invalid tax ID format (expected: XX-XXXXXXXX-X)';
  return null;
}

function validateEmail(email: string | null | undefined): string | null {
  if (!email) return null; // Email is optional
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return 'Invalid email format';
  return null;
}

function validateInput(input: CompanyInput): string[] {
  const errors: string[] = [];
  
  if (!input.name || input.name.trim().length < 3) {
    errors.push('Name must be at least 3 characters');
  }
  
  if (input.name && input.name.length > 100) {
    errors.push('Name must not exceed 100 characters');
  }
  
  const taxIdError = validateTaxId(input.taxId);
  if (taxIdError) errors.push(taxIdError);
  
  const emailError = validateEmail(input.email);
  if (emailError) errors.push(emailError);
  
  if (!input.type || !['SME', 'CORPORATE'].includes(input.type)) {
    errors.push('Type must be SME or CORPORATE');
  }
  
  return errors;
}

// ==========================================
// Database Functions
// ==========================================
async function checkDuplicateTaxId(taxId: string): Promise<boolean> {
  try {
    const result = await dynamoDB.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: `TAXID#${taxId}` }
    }));
    
    return !!result.Item;
  } catch (error) {
    console.error('Error checking tax ID:', error);
    throw new Error('Database error while checking tax ID');
  }
}

async function checkDuplicateEmail(email: string | null): Promise<boolean> {
  if (!email) return false; // No email, no duplicate
  
  try {
    const result = await dynamoDB.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: `EMAIL#${email.toLowerCase()}` }
    }));
    
    return !!result.Item;
  } catch (error) {
    console.error('Error checking email:', error);
    throw new Error('Database error while checking email');
  }
}

async function saveCompany(company: Company): Promise<void> {
  const timestamp = new Date().toISOString();
  
  try {
    // Save main company record
    await dynamoDB.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: company.id,
        name: company.name,
        taxId: company.taxId,
        type: company.type,
        email: company.email,
        registrationDate: company.registrationDate,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    }));
    
    // Save tax ID reference (for duplicate checking)
    await dynamoDB.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: `TAXID#${company.taxId}`,
        companyId: company.id,
        createdAt: timestamp,
      }
    }));
    
    // Save email reference if email exists (for duplicate checking)
    if (company.email) {
      await dynamoDB.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id: `EMAIL#${company.email.toLowerCase()}`,
          companyId: company.id,
          createdAt: timestamp,
        }
      }));
    }
    
    console.log(`Company saved successfully: ${company.id}`);
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('Company with this ID already exists');
    }
    console.error('Error saving company:', error);
    throw new Error('Database error while saving company');
  }
}

// ==========================================
// Lambda Handler
// ==========================================
export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event));
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };
  
  try {
    // Handle OPTIONS request (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'OK' })
      };
    }
    
    // Parse input
    let input: CompanyInput;
    try {
      input = JSON.parse(event.body || '{}');
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Invalid JSON in request body'
        })
      };
    }
    
    // Validate input
    const validationErrors = validateInput(input);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Validation failed',
          errors: validationErrors
        })
      };
    }
    
    // Check for duplicate tax ID
    const taxIdExists = await checkDuplicateTaxId(input.taxId);
    if (taxIdExists) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'Conflict',
          message: 'A company with this tax ID already exists',
          field: 'taxId'
        })
      };
    }
    
    // Check for duplicate email (only if email provided)
    if (input.email) {
      const emailExists = await checkDuplicateEmail(input.email);
      if (emailExists) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            error: 'Conflict',
            message: 'A company with this email already exists',
            field: 'email'
          })
        };
      }
    }
    
    // Create company record
    const companyId = `COMPANY#${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const company: Company = {
      id: companyId,
      name: input.name.trim(),
      taxId: input.taxId,
      type: input.type,
      email: input.email || null,
      registrationDate: now,
      createdAt: now,
      updatedAt: now,
    };
    
    // Save to database
    await saveCompany(company);
    
    // Return success
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Company registered successfully',
        data: {
          id: company.id,
          name: company.name,
          taxId: company.taxId,
          type: company.type,
          email: company.email,
          registrationDate: company.registrationDate,
        }
      })
    };
    
  } catch (error: any) {
    console.error('Lambda execution error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred'
      })
    };
  }
};

// ==========================================
// DEPLOYMENT CONFIGURATION
// ==========================================

/*
=====================================
FILE: package.json
=====================================
{
  "name": "company-registration-lambda",
  "version": "1.0.0",
  "description": "Lambda function for company registration",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "package": "npm run build && cd dist && zip -r ../function.zip .",
    "deploy": "aws lambda update-function-code --function-name registerCompany --zip-file fileb://function.zip"
  },
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.470.0",
    "@aws-sdk/lib-dynamodb": "^3.470.0"
  },
  "devDependencies": {
    "@types/aws-lambda": "^8.10.130",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.2"
  }
}

=====================================
FILE: tsconfig.json
=====================================
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["*.ts"],
  "exclude": ["node_modules", "dist"]
}

=====================================
AWS CLI - Create DynamoDB Table
=====================================
aws dynamodb create-table \
  --table-name Companies \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

=====================================
AWS CLI - Create Lambda Function
=====================================
# Build and package
npm run build
npm run package

# Create Lambda execution role
aws iam create-role \
  --role-name lambda-company-registration-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name lambda-company-registration-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam put-role-policy \
  --role-name lambda-company-registration-role \
  --policy-name DynamoDBAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/Companies"
    }]
  }'

# Create Lambda function
aws lambda create-function \
  --function-name registerCompany \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-company-registration-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables={TABLE_NAME=Companies} \
  --region us-east-1

=====================================
AWS CLI - Create API Gateway
=====================================
# Create HTTP API
aws apigatewayv2 create-api \
  --name CompanyRegistrationAPI \
  --protocol-type HTTP \
  --target arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:registerCompany \
  --region us-east-1

# Add Lambda permission for API Gateway
aws lambda add-permission \
  --function-name registerCompany \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:YOUR_ACCOUNT_ID:YOUR_API_ID/*/*" \
  --region us-east-1

*/

// ==========================================
// INPUT/OUTPUT EXAMPLES
// ==========================================

/*
=====================================
INPUT - SME Company with Email
=====================================
POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/companies/register

{
  "name": "Tech Solutions Inc",
  "taxId": "30-12345678-9",
  "type": "SME",
  "email": "info@techsolutions.com"
}

=====================================
OUTPUT - Success (201)
=====================================
{
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

=====================================
INPUT - Corporate Company without Email
=====================================
{
  "name": "Global Finance Corporation",
  "taxId": "30-98765432-1",
  "type": "CORPORATE"
}

=====================================
OUTPUT - Success (201)
=====================================
{
  "message": "Company registered successfully",
  "data": {
    "id": "COMPANY#1733334567891-xyz789ghi",
    "name": "Global Finance Corporation",
    "taxId": "30-98765432-1",
    "type": "CORPORATE",
    "email": null,
    "registrationDate": "2024-12-04T15:30:00.000Z"
  }
}

=====================================
INPUT - SME with null email
=====================================
{
  "name": "Small Business LLC",
  "taxId": "30-11111111-1",
  "type": "SME",
  "email": null
}

=====================================
OUTPUT - Success (201)
=====================================
{
  "message": "Company registered successfully",
  "data": {
    "id": "COMPANY#1733334567892-def456jkl",
    "name": "Small Business LLC",
    "taxId": "30-11111111-1",
    "type": "SME",
    "email": null,
    "registrationDate": "2024-12-04T15:30:00.000Z"
  }
}

=====================================
OUTPUT - Validation Error (400)
=====================================
{
  "error": "Validation failed",
  "errors": [
    "Name must be at least 3 characters",
    "Invalid tax ID format (expected: XX-XXXXXXXX-X)"
  ]
}

=====================================
OUTPUT - Duplicate Tax ID (409)
=====================================
{
  "error": "Conflict",
  "message": "A company with this tax ID already exists",
  "field": "taxId"
}

=====================================
OUTPUT - Duplicate Email (409)
=====================================
{
  "error": "Conflict",
  "message": "A company with this email already exists",
  "field": "email"
}

=====================================
OUTPUT - Invalid JSON (400)
=====================================
{
  "error": "Bad Request",
  "message": "Invalid JSON in request body"
}

=====================================
OUTPUT - Internal Error (500)
=====================================
{
  "error": "Internal Server Error",
  "message": "Database error while saving company"
}

=====================================
TEST with curl
=====================================
# Test SME with email
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/companies/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "taxId": "30-11111111-1",
    "type": "SME",
    "email": "test@company.com"
  }'

# Test Corporate without email
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/companies/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corporate Test",
    "taxId": "30-22222222-2",
    "type": "CORPORATE"
  }'

# Test with null email
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/companies/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Email Company",
    "taxId": "30-33333333-3",
    "type": "SME",
    "email": null
  }'

# Test validation error
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/companies/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AB",
    "taxId": "invalid",
    "type": "INVALID"
  }'

*/
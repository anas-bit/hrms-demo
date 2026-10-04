import { faker } from '@faker-js/faker';
import { subDays } from 'date-fns';

// Generate Mock Invoices
export const MOCK_INVOICES = Array.from({ length: 15 }).map((_, i) => ({
    id: `INV-${2024001 + i}`,
    client: faker.company.name(),
    amount: parseFloat(faker.finance.amount({ min: 1000, max: 50000, dec: 2 })),
    status: faker.helpers.arrayElement(['paid', 'pending', 'overdue']),
    date: subDays(new Date(), i * 2),
    dueDate: subDays(new Date(), i * 2 - 30),
}));

// Generate Mock Leads
export const MOCK_LEADS = Array.from({ length: 20 }).map((_, i) => ({
    id: `LEA-${100 + i}`,
    name: faker.person.fullName(),
    company: faker.company.name(),
    value: parseFloat(faker.finance.amount({ min: 5000, max: 100000, dec: 0 })),
    stage: faker.helpers.arrayElement(['new', 'qualified', 'proposal', 'negotiation', 'won']),
    email: faker.internet.email(),
    lastContact: subDays(new Date(), i),
}));

// Generate Mock Products
export const MOCK_PRODUCTS = Array.from({ length: 10 }).map((_, i) => ({
    id: `PRD-${500 + i}`,
    name: faker.commerce.productName(),
    category: faker.commerce.department(),
    price: faker.commerce.price(),
    stock: faker.number.int({ min: 0, max: 500 }),
    sku: faker.string.alphanumeric(8).toUpperCase(),
}));

// Generate Mock Employees
export const MOCK_EMPLOYEES = Array.from({ length: 12 }).map((_, i) => ({
    id: `EMP-${1000 + i}`,
    name: faker.person.fullName(),
    role: faker.person.jobTitle(),
    department: faker.commerce.department(),
    status: faker.helpers.arrayElement(['Active', 'On Leave', 'Remote']),
    avatar: `https://i.pravatar.cc/150?u=${1000 + i}`
}));

// Generate Mock Production Orders
export const MOCK_PRODUCTION = Array.from({ length: 8 }).map((_, i) => ({
    id: `MFG-${2024001 + i}`,
    product: faker.commerce.productName(),
    quantity: faker.number.int({ min: 10, max: 100 }),
    status: faker.helpers.arrayElement(['Scheduled', 'In Progress', 'QC', 'Completed']),
    startDate: subDays(new Date(), i),
    completion: faker.number.int({ min: 0, max: 100 })
}));

// Generate Mock Customers
export const MOCK_CUSTOMERS = Array.from({ length: 15 }).map((_, i) => ({
    id: `CUST-${100 + i}`,
    name: faker.company.name(),
    contact: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    status: faker.helpers.arrayElement(['Active', 'Inactive']),
    totalSpent: parseFloat(faker.finance.amount({ min: 10000, max: 500000, dec: 2 }))
}));

// Generate Mock Payroll
export const MOCK_PAYROLL = Array.from({ length: 12 }).map((_, i) => ({
    id: `PAY-${202401 + i}`,
    employeeId: `EMP-${1000 + i}`,
    employeeName: faker.person.fullName(),
    basicSalary: parseFloat(faker.finance.amount({ min: 3000, max: 8000, dec: 2 })),
    allowances: parseFloat(faker.finance.amount({ min: 100, max: 1000, dec: 2 })),
    deductions: parseFloat(faker.finance.amount({ min: 50, max: 500, dec: 2 })),
    netSalary: 0, // Calculated in component
    status: 'Processed',
    date: subDays(new Date(), 5)
}));

// Generate Mock Purchase Orders
export const MOCK_PURCHASE_ORDERS = Array.from({ length: 10 }).map((_, i) => ({
    id: `PO-${5000 + i}`,
    vendor: faker.company.name(),
    date: subDays(new Date(), i * 3),
    total: parseFloat(faker.finance.amount({ min: 500, max: 10000, dec: 2 })),
    status: faker.helpers.arrayElement(['Draft', 'Sent', 'Received']),
    items: faker.number.int({ min: 1, max: 5 })
}));

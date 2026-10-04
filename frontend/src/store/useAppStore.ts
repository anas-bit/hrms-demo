import { create } from 'zustand';
import { MOCK_EMPLOYEES, MOCK_PRODUCTS, MOCK_LEADS, MOCK_INVOICES, MOCK_CUSTOMERS, MOCK_PURCHASE_ORDERS } from '../services/mockData';

// Define Types (In a real app, these would be in a types file)
export interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    status: string;
    avatar?: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: string | number;
    stock: number;
    sku: string;
}

export interface Lead {
    id: string;
    name: string;
    company: string;
    value: number;
    stage: string;
    email: string;
    lastContact?: Date;
}

export interface Order {
    id: string;
    client: string;
    amount: number;
    status: string;
    date: Date;
}

export interface Customer {
    id: string;
    name: string;
    contact: string;
    email: string;
    status: string;
    totalSpent: number;
}

export interface PurchaseOrder {
    id: string;
    vendor: string;
    date: Date;
    total: number;
    status: string;
    items: number;
}

export interface BOMNode {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    cost: number;
}

export interface ProductionOrder {
    id: string;
    productName: string;
    quantity: number;
    startDate: Date;
    status: string;
}

interface AppState {
    // State
    employees: Employee[];
    products: Product[];
    leads: Lead[];
    orders: Order[];
    customers: Customer[];
    purchaseOrders: PurchaseOrder[];
    boms: BOMNode[];
    productionOrders: ProductionOrder[];

    // Actions - Employees
    addEmployee: (employee: Omit<Employee, 'id'>) => void;
    updateEmployee: (id: string, updates: Partial<Employee>) => void;
    deleteEmployee: (id: string) => void;

    // Actions - Products
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;

    // Actions - Leads
    addLead: (lead: Omit<Lead, 'id'>) => void;
    updateLead: (id: string, updates: Partial<Lead>) => void;
    deleteLead: (id: string) => void;

    // Actions - Orders
    addOrder: (order: Omit<Order, 'id'>) => void;
    deleteOrder: (id: string) => void;

    // Actions - Customers
    addCustomer: (customer: Omit<Customer, 'id'>) => void;
    updateCustomer: (id: string, updates: Partial<Customer>) => void;
    deleteCustomer: (id: string) => void;

    // Actions - Purchase Orders
    addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => void;
    deletePurchaseOrder: (id: string) => void;

    // Actions - Manufacturing
    addBOM: (bom: BOMNode) => void;
    addProductionOrder: (order: Omit<ProductionOrder, 'id'>) => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Initialize with ID-stable Mock Data
    employees: MOCK_EMPLOYEES,
    products: MOCK_PRODUCTS,
    leads: MOCK_LEADS,
    orders: MOCK_INVOICES, // Using invoices as base for orders
    customers: MOCK_CUSTOMERS,
    purchaseOrders: MOCK_PURCHASE_ORDERS,
    boms: [],
    productionOrders: [],

    // Encryption / Actions
    addEmployee: (emp) => set((state) => ({
        employees: [...state.employees, { ...emp, id: `EMP-${Date.now()}`, avatar: `https://i.pravatar.cc/150?u=${Date.now()}` }]
    })),
    updateEmployee: (id, updates) => set((state) => ({
        employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e)
    })),
    deleteEmployee: (id) => set((state) => ({
        employees: state.employees.filter(e => e.id !== id)
    })),

    addProduct: (prod) => set((state) => ({
        products: [...state.products, { ...prod, id: `PRD-${Date.now()}` }]
    })),
    updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
    })),

    addLead: (lead) => set((state) => ({
        leads: [...state.leads, { ...lead, id: `LEA-${Date.now()}` }]
    })),
    updateLead: (id, updates) => set((state) => ({
        leads: state.leads.map(l => l.id === id ? { ...l, ...updates } : l)
    })),
    deleteLead: (id) => set((state) => ({
        leads: state.leads.filter(l => l.id !== id)
    })),

    addOrder: (order) => set((state) => ({
        orders: [...state.orders, { ...order, id: `ORD-${Date.now()}` }]
    })),
    deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter(o => o.id !== id)
    })),

    // Encryption / Actions - Customers
    addCustomer: (customer) => set((state) => ({
        customers: [...state.customers, { ...customer, id: `CUST-${Date.now()}` }]
    })),
    updateCustomer: (id, updates) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
    })),
    deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
    })),

    // Actions - Purchase Orders
    addPurchaseOrder: (po) => set((state) => ({
        purchaseOrders: [...state.purchaseOrders, { ...po, id: `PO-${5000 + state.purchaseOrders.length + 1}` }]
    })),
    deletePurchaseOrder: (id) => set((state) => ({
        purchaseOrders: state.purchaseOrders.filter(po => po.id !== id)
    })),

    // Actions - Manufacturing
    addBOM: (bom) => set((state) => ({
        boms: [...state.boms, bom]
    })),
    addProductionOrder: (order) => set((state) => ({
        productionOrders: [...state.productionOrders, { ...order, id: `PROD-${Date.now()}` }]
    })),
}));

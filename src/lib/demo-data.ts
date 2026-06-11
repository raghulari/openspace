// ============================================
// OneSpace AI — Demo Data
// Realistic, cross-referenced seed data for
// all modules. All IDs are deterministic so
// relationships stay consistent.
// ============================================

// ── Helpers ──────────────────────────────────
const id = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, '0')}`

// ── Types ────────────────────────────────────
export type BusinessType = 'service' | 'product' | 'hybrid'
export type ClientType = 'regular' | 'one-time'
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type ProjectStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'
export type InvoiceStatus = 'pending' | 'paid' | 'overdue'
export type InvoiceType = 'products' | 'services' | 'mixed'

export interface DemoUser {
  id: string
  fullName: string
  email: string
  avatarInitials: string
}

export interface DemoWorkspace {
  id: string
  name: string
  companyName: string
  businessType: BusinessType
  teamMembersCount: number
  departments: string[]
  gstNumber: string
  businessAddress: string
  invoicePrefix: string
  defaultTaxRate: number
  logoUrl: string | null
}

export interface DemoClient {
  id: string
  name: string
  phone: string
  companyName: string
  email: string
  address: string
  gstNumber: string
  notes: string
  type: ClientType
  billingCycle: BillingCycle
  createdAt: string
}

export interface DemoProduct {
  id: string
  name: string
  sku: string
  sellingPrice: number
  costPrice: number
  stockQuantity: number
  lowStockThreshold: number
  description: string
  createdAt: string
}

export interface DemoService {
  id: string
  name: string
  price: number
  description: string
  estimatedDuration: string
  category: string
  createdAt: string
}

export interface DemoTeamMember {
  id: string
  name: string
  role: string
  phone: string
  email: string
  department: string
  avatarInitials: string
  createdAt: string
}

export interface DemoProject {
  id: string
  name: string
  clientId: string
  serviceId: string
  startDate: string
  endDate: string
  teamMemberId: string
  status: ProjectStatus
  createdAt: string
}

export interface DemoInvoiceItem {
  id: string
  type: 'product' | 'service'
  referenceId: string // productId or serviceId
  name: string
  quantity: number
  rate: number
  amount: number
}

export interface DemoInvoice {
  id: string
  invoiceNumber: string
  clientId: string
  type: InvoiceType
  items: DemoInvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  status: InvoiceStatus
  invoiceDate: string
  dueDate: string
  paidDate: string | null
  projectId: string | null
  notes: string
  createdAt: string
}

export interface StockMovement {
  id: string
  productId: string
  type: 'sale' | 'restock' | 'adjustment'
  quantity: number
  date: string
  invoiceId: string | null
  note: string
}

// ── Demo User ────────────────────────────────
export const DEMO_USER: DemoUser = {
  id: 'user-0001',
  fullName: 'SRK',
  email: 'srk@openspace.ai',
  avatarInitials: 'SRK',
}

// ── Demo Workspace ───────────────────────────
export const DEMO_WORKSPACE: DemoWorkspace = {
  id: 'ws-0001',
  name: 'SRK Enterprise',
  companyName: 'SRK Enterprise Pvt. Ltd.',
  businessType: 'hybrid',
  teamMembersCount: 12,
  departments: ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations'],
  gstNumber: '27AABCD1234F1Z5',
  businessAddress: '42 MG Road, Bengaluru, Karnataka 560001',
  invoicePrefix: 'INV',
  defaultTaxRate: 18,
  logoUrl: null,
}

// ── Demo Clients ─────────────────────────────
export const DEMO_CLIENTS: DemoClient[] = [
  {
    id: id('cli', 1),
    name: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    companyName: 'TechNova Solutions',
    email: 'rajesh@technova.in',
    address: '12 Koramangala, Bengaluru',
    gstNumber: '29AAACT1234H1Z5',
    notes: 'Key enterprise client. Prefers weekly status calls.',
    type: 'regular',
    billingCycle: 'monthly',
    createdAt: '2025-08-15',
  },
  {
    id: id('cli', 2),
    name: 'Priya Menon',
    phone: '+91 87654 32109',
    companyName: 'GreenLeaf Organics',
    email: 'priya@greenleaf.co.in',
    address: '45 Indiranagar, Bengaluru',
    gstNumber: '29AABCG5678K1Z2',
    notes: 'Organic food company. Needs monthly inventory reports.',
    type: 'regular',
    billingCycle: 'quarterly',
    createdAt: '2025-09-20',
  },
  {
    id: id('cli', 3),
    name: 'Amit Patel',
    phone: '+91 76543 21098',
    companyName: 'Patel Constructions',
    email: 'amit@patelcon.com',
    address: '78 Whitefield, Bengaluru',
    gstNumber: '29AADCP9012L1Z8',
    notes: 'Construction firm. Large project orders.',
    type: 'regular',
    billingCycle: 'monthly',
    createdAt: '2025-10-05',
  },
  {
    id: id('cli', 4),
    name: 'Sneha Kulkarni',
    phone: '+91 65432 10987',
    companyName: 'PixelCraft Studios',
    email: 'sneha@pixelcraft.in',
    address: '23 HSR Layout, Bengaluru',
    gstNumber: '29AABCP3456M1Z1',
    notes: 'Design studio. Frequent small projects.',
    type: 'regular',
    billingCycle: 'monthly',
    createdAt: '2025-11-12',
  },
  {
    id: id('cli', 5),
    name: 'Vikram Singh',
    phone: '+91 54321 09876',
    companyName: 'Singh & Associates',
    email: 'vikram@singhassoc.in',
    address: '56 MG Road, Mumbai',
    gstNumber: '27AABCS7890N1Z4',
    notes: 'Law firm. Requires detailed invoice breakdowns.',
    type: 'regular',
    billingCycle: 'yearly',
    createdAt: '2025-12-01',
  },
  {
    id: id('cli', 6),
    name: 'Ananya Reddy',
    phone: '+91 43210 98765',
    companyName: 'Reddy Pharma',
    email: 'ananya@reddypharma.com',
    address: '89 Jubilee Hills, Hyderabad',
    gstNumber: '36AABCR1234P1Z7',
    notes: 'Pharmaceutical company. Bulk product orders.',
    type: 'regular',
    billingCycle: 'quarterly',
    createdAt: '2026-01-10',
  },
  {
    id: id('cli', 7),
    name: 'Karthik Nair',
    phone: '+91 32109 87654',
    companyName: '',
    email: 'karthik.nair@gmail.com',
    address: '34 Adyar, Chennai',
    gstNumber: '',
    notes: 'One-time branding project.',
    type: 'one-time',
    billingCycle: 'custom',
    createdAt: '2026-02-18',
  },
  {
    id: id('cli', 8),
    name: 'Meera Joshi',
    phone: '+91 21098 76543',
    companyName: 'Joshi Textiles',
    email: 'meera@joshitextiles.in',
    address: '67 FC Road, Pune',
    gstNumber: '27AABCJ5678Q1Z0',
    notes: 'Textile manufacturer. Seasonal bulk orders.',
    type: 'regular',
    billingCycle: 'monthly',
    createdAt: '2026-03-05',
  },
  {
    id: id('cli', 9),
    name: 'Arjun Gupta',
    phone: '+91 10987 65432',
    companyName: '',
    email: 'arjun.gupta@outlook.com',
    address: '12 Sector 62, Noida',
    gstNumber: '',
    notes: 'Freelance consultation. One-time engagement.',
    type: 'one-time',
    billingCycle: 'custom',
    createdAt: '2026-04-12',
  },
  {
    id: id('cli', 10),
    name: 'Deepika Iyer',
    phone: '+91 09876 54321',
    companyName: 'Iyer Foods Pvt Ltd',
    email: 'deepika@iyerfoods.com',
    address: '90 Anna Nagar, Chennai',
    gstNumber: '33AABCI9012R1Z3',
    notes: 'Food processing company. Regular ingredient supply orders.',
    type: 'regular',
    billingCycle: 'monthly',
    createdAt: '2026-04-25',
  },
]

// ── Demo Products ────────────────────────────
export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: id('prod', 1),
    name: 'Premium Business Cards (500 pcs)',
    sku: 'BC-500-PREM',
    sellingPrice: 2500,
    costPrice: 1200,
    stockQuantity: 85,
    lowStockThreshold: 20,
    description: 'Premium matte finish business cards, 350gsm, double-sided printing',
    createdAt: '2025-09-01',
  },
  {
    id: id('prod', 2),
    name: 'Corporate Letterhead Pack (100 pcs)',
    sku: 'LH-100-CORP',
    sellingPrice: 1800,
    costPrice: 800,
    stockQuantity: 120,
    lowStockThreshold: 25,
    description: 'A4 corporate letterhead, watermark enabled, premium bond paper',
    createdAt: '2025-09-15',
  },
  {
    id: id('prod', 3),
    name: 'Custom Packaging Box (Large)',
    sku: 'PB-LRG-CUST',
    sellingPrice: 450,
    costPrice: 180,
    stockQuantity: 12,
    lowStockThreshold: 30,
    description: 'Custom printed corrugated packaging box, 30x20x15 cm',
    createdAt: '2025-10-01',
  },
  {
    id: id('prod', 4),
    name: 'Branded Merchandise Kit',
    sku: 'BM-KIT-STD',
    sellingPrice: 3500,
    costPrice: 1500,
    stockQuantity: 45,
    lowStockThreshold: 10,
    description: 'Kit includes: T-shirt, cap, pen, notebook with company branding',
    createdAt: '2025-10-20',
  },
  {
    id: id('prod', 5),
    name: 'Roll-Up Banner Stand',
    sku: 'RB-STD-85',
    sellingPrice: 4200,
    costPrice: 2100,
    stockQuantity: 8,
    lowStockThreshold: 5,
    description: '85x200 cm retractable roll-up banner with aluminum stand',
    createdAt: '2025-11-05',
  },
  {
    id: id('prod', 6),
    name: 'Vinyl Sticker Sheet (A3)',
    sku: 'VS-A3-GLOSS',
    sellingPrice: 350,
    costPrice: 120,
    stockQuantity: 200,
    lowStockThreshold: 50,
    description: 'Glossy vinyl sticker sheets, weatherproof, UV resistant',
    createdAt: '2025-11-15',
  },
  {
    id: id('prod', 7),
    name: 'Acrylic Name Plate',
    sku: 'AN-PLATE-STD',
    sellingPrice: 1200,
    costPrice: 450,
    stockQuantity: 0,
    lowStockThreshold: 10,
    description: 'Desktop acrylic name plate with brushed aluminum base',
    createdAt: '2025-12-01',
  },
  {
    id: id('prod', 8),
    name: 'Custom Invoice Pad (50 sheets)',
    sku: 'IP-50-CUST',
    sellingPrice: 800,
    costPrice: 300,
    stockQuantity: 65,
    lowStockThreshold: 15,
    description: 'Carbonless duplicate invoice pad with company logo',
    createdAt: '2026-01-10',
  },
  {
    id: id('prod', 9),
    name: 'Flex Board (4x6 ft)',
    sku: 'FB-4X6-FLEX',
    sellingPrice: 2800,
    costPrice: 1100,
    stockQuantity: 18,
    lowStockThreshold: 5,
    description: 'High-resolution flex printing on 280gsm frontlit material',
    createdAt: '2026-02-01',
  },
  {
    id: id('prod', 10),
    name: 'Eco-Friendly Paper Bag (Pack of 50)',
    sku: 'EB-50-ECO',
    sellingPrice: 1500,
    costPrice: 650,
    stockQuantity: 3,
    lowStockThreshold: 15,
    description: 'Kraft paper bags with twisted handles, custom printed',
    createdAt: '2026-03-01',
  },
]

// ── Demo Services ────────────────────────────
export const DEMO_SERVICES: DemoService[] = [
  {
    id: id('svc', 1),
    name: 'Brand Identity Design',
    price: 75000,
    description: 'Complete brand identity including logo, color palette, typography, and brand guidelines',
    estimatedDuration: '3 weeks',
    category: 'Design',
    createdAt: '2025-08-01',
  },
  {
    id: id('svc', 2),
    name: 'Website Development',
    price: 150000,
    description: 'Custom responsive website with CMS, SEO optimization, and analytics integration',
    estimatedDuration: '6 weeks',
    category: 'Development',
    createdAt: '2025-08-15',
  },
  {
    id: id('svc', 3),
    name: 'Social Media Management',
    price: 25000,
    description: 'Monthly social media strategy, content creation, and analytics for 3 platforms',
    estimatedDuration: '1 month',
    category: 'Marketing',
    createdAt: '2025-09-01',
  },
  {
    id: id('svc', 4),
    name: 'SEO Optimization',
    price: 35000,
    description: 'On-page and off-page SEO, keyword research, technical audit, and monthly reporting',
    estimatedDuration: '2 months',
    category: 'Marketing',
    createdAt: '2025-09-15',
  },
  {
    id: id('svc', 5),
    name: 'UI/UX Design',
    price: 90000,
    description: 'User research, wireframes, high-fidelity prototypes, and design system creation',
    estimatedDuration: '4 weeks',
    category: 'Design',
    createdAt: '2025-10-01',
  },
  {
    id: id('svc', 6),
    name: 'Mobile App Development',
    price: 250000,
    description: 'Cross-platform mobile application with React Native, backend API integration',
    estimatedDuration: '10 weeks',
    category: 'Development',
    createdAt: '2025-10-15',
  },
  {
    id: id('svc', 7),
    name: 'Business Consulting',
    price: 15000,
    description: 'Strategic business consultation session (per session), growth strategy planning',
    estimatedDuration: '2 hours',
    category: 'Consulting',
    createdAt: '2025-11-01',
  },
  {
    id: id('svc', 8),
    name: 'Video Production',
    price: 45000,
    description: 'Corporate video production including scripting, shooting, editing, and color grading',
    estimatedDuration: '2 weeks',
    category: 'Media',
    createdAt: '2025-11-15',
  },
]

// ── Demo Team Members ────────────────────────
export const DEMO_TEAM: DemoTeamMember[] = [
  {
    id: id('tm', 1),
    name: 'Rohit Kapoor',
    role: 'Lead Designer',
    phone: '+91 99887 76655',
    email: 'rohit@davisent.com',
    department: 'Design',
    avatarInitials: 'RK',
    createdAt: '2025-08-01',
  },
  {
    id: id('tm', 2),
    name: 'Neha Agarwal',
    role: 'Senior Developer',
    phone: '+91 88776 65544',
    email: 'neha@davisent.com',
    department: 'Engineering',
    avatarInitials: 'NA',
    createdAt: '2025-08-15',
  },
  {
    id: id('tm', 3),
    name: 'Siddharth Rao',
    role: 'Marketing Manager',
    phone: '+91 77665 54433',
    email: 'sid@davisent.com',
    department: 'Marketing',
    avatarInitials: 'SR',
    createdAt: '2025-09-01',
  },
  {
    id: id('tm', 4),
    name: 'Kavitha Reddy',
    role: 'Project Manager',
    phone: '+91 66554 43322',
    email: 'kavitha@davisent.com',
    department: 'Operations',
    avatarInitials: 'KR',
    createdAt: '2025-09-15',
  },
  {
    id: id('tm', 5),
    name: 'Arun Mehta',
    role: 'Sales Executive',
    phone: '+91 55443 32211',
    email: 'arun@davisent.com',
    department: 'Sales',
    avatarInitials: 'AM',
    createdAt: '2025-10-01',
  },
  {
    id: id('tm', 6),
    name: 'Pooja Nair',
    role: 'Junior Developer',
    phone: '+91 44332 21100',
    email: 'pooja@davisent.com',
    department: 'Engineering',
    avatarInitials: 'PN',
    createdAt: '2025-11-01',
  },
]

// ── Demo Projects ────────────────────────────
export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: id('proj', 1),
    name: 'TechNova Brand Refresh',
    clientId: id('cli', 1),
    serviceId: id('svc', 1),
    startDate: '2026-01-15',
    endDate: '2026-02-05',
    teamMemberId: id('tm', 1),
    status: 'completed',
    createdAt: '2026-01-10',
  },
  {
    id: id('proj', 2),
    name: 'GreenLeaf E-Commerce Website',
    clientId: id('cli', 2),
    serviceId: id('svc', 2),
    startDate: '2026-02-01',
    endDate: '2026-03-15',
    teamMemberId: id('tm', 2),
    status: 'completed',
    createdAt: '2026-01-25',
  },
  {
    id: id('proj', 3),
    name: 'Patel Constructions Marketing',
    clientId: id('cli', 3),
    serviceId: id('svc', 3),
    startDate: '2026-03-01',
    endDate: '2026-06-01',
    teamMemberId: id('tm', 3),
    status: 'in-progress',
    createdAt: '2026-02-20',
  },
  {
    id: id('proj', 4),
    name: 'PixelCraft App Design',
    clientId: id('cli', 4),
    serviceId: id('svc', 5),
    startDate: '2026-04-01',
    endDate: '2026-04-28',
    teamMemberId: id('tm', 1),
    status: 'in-progress',
    createdAt: '2026-03-25',
  },
  {
    id: id('proj', 5),
    name: 'Singh Associates Website',
    clientId: id('cli', 5),
    serviceId: id('svc', 2),
    startDate: '2026-05-01',
    endDate: '2026-06-15',
    teamMemberId: id('tm', 2),
    status: 'pending',
    createdAt: '2026-04-20',
  },
  {
    id: id('proj', 6),
    name: 'Reddy Pharma Mobile App',
    clientId: id('cli', 6),
    serviceId: id('svc', 6),
    startDate: '2026-05-15',
    endDate: '2026-07-25',
    teamMemberId: id('tm', 6),
    status: 'in-progress',
    createdAt: '2026-05-10',
  },
  {
    id: id('proj', 7),
    name: 'Karthik Nair Branding',
    clientId: id('cli', 7),
    serviceId: id('svc', 1),
    startDate: '2026-03-01',
    endDate: '2026-03-20',
    teamMemberId: id('tm', 1),
    status: 'completed',
    createdAt: '2026-02-25',
  },
  {
    id: id('proj', 8),
    name: 'Iyer Foods SEO Campaign',
    clientId: id('cli', 10),
    serviceId: id('svc', 4),
    startDate: '2026-05-01',
    endDate: '2026-07-01',
    teamMemberId: id('tm', 3),
    status: 'pending',
    createdAt: '2026-04-28',
  },
]

// ── Demo Invoices ────────────────────────────
export const DEMO_INVOICES: DemoInvoice[] = [
  {
    id: id('inv', 1),
    invoiceNumber: 'INV-0001',
    clientId: id('cli', 1),
    type: 'services',
    items: [
      { id: 'ii-01', type: 'service', referenceId: id('svc', 1), name: 'Brand Identity Design', quantity: 1, rate: 75000, amount: 75000 },
    ],
    subtotal: 75000,
    taxRate: 18,
    taxAmount: 13500,
    discount: 5000,
    total: 83500,
    status: 'paid',
    invoiceDate: '2026-02-06',
    dueDate: '2026-02-20',
    paidDate: '2026-02-18',
    projectId: id('proj', 1),
    notes: 'Brand refresh project completed successfully.',
    createdAt: '2026-02-06',
  },
  {
    id: id('inv', 2),
    invoiceNumber: 'INV-0002',
    clientId: id('cli', 2),
    type: 'services',
    items: [
      { id: 'ii-02', type: 'service', referenceId: id('svc', 2), name: 'Website Development', quantity: 1, rate: 150000, amount: 150000 },
    ],
    subtotal: 150000,
    taxRate: 18,
    taxAmount: 27000,
    discount: 10000,
    total: 167000,
    status: 'paid',
    invoiceDate: '2026-03-16',
    dueDate: '2026-03-30',
    paidDate: '2026-03-28',
    projectId: id('proj', 2),
    notes: 'E-commerce website delivered.',
    createdAt: '2026-03-16',
  },
  {
    id: id('inv', 3),
    invoiceNumber: 'INV-0003',
    clientId: id('cli', 3),
    type: 'services',
    items: [
      { id: 'ii-03', type: 'service', referenceId: id('svc', 3), name: 'Social Media Management', quantity: 3, rate: 25000, amount: 75000 },
    ],
    subtotal: 75000,
    taxRate: 18,
    taxAmount: 13500,
    discount: 0,
    total: 88500,
    status: 'pending',
    invoiceDate: '2026-05-01',
    dueDate: '2026-06-01',
    paidDate: null,
    projectId: id('proj', 3),
    notes: '3 months of social media management.',
    createdAt: '2026-05-01',
  },
  {
    id: id('inv', 4),
    invoiceNumber: 'INV-0004',
    clientId: id('cli', 6),
    type: 'products',
    items: [
      { id: 'ii-04a', type: 'product', referenceId: id('prod', 1), name: 'Premium Business Cards (500 pcs)', quantity: 10, rate: 2500, amount: 25000 },
      { id: 'ii-04b', type: 'product', referenceId: id('prod', 4), name: 'Branded Merchandise Kit', quantity: 5, rate: 3500, amount: 17500 },
    ],
    subtotal: 42500,
    taxRate: 18,
    taxAmount: 7650,
    discount: 2500,
    total: 47650,
    status: 'paid',
    invoiceDate: '2026-03-10',
    dueDate: '2026-03-25',
    paidDate: '2026-03-22',
    projectId: null,
    notes: 'Bulk branding materials order.',
    createdAt: '2026-03-10',
  },
  {
    id: id('inv', 5),
    invoiceNumber: 'INV-0005',
    clientId: id('cli', 4),
    type: 'services',
    items: [
      { id: 'ii-05', type: 'service', referenceId: id('svc', 5), name: 'UI/UX Design', quantity: 1, rate: 90000, amount: 90000 },
    ],
    subtotal: 90000,
    taxRate: 18,
    taxAmount: 16200,
    discount: 0,
    total: 106200,
    status: 'pending',
    invoiceDate: '2026-05-15',
    dueDate: '2026-06-15',
    paidDate: null,
    projectId: id('proj', 4),
    notes: 'App design in progress.',
    createdAt: '2026-05-15',
  },
  {
    id: id('inv', 6),
    invoiceNumber: 'INV-0006',
    clientId: id('cli', 8),
    type: 'products',
    items: [
      { id: 'ii-06a', type: 'product', referenceId: id('prod', 2), name: 'Corporate Letterhead Pack (100 pcs)', quantity: 5, rate: 1800, amount: 9000 },
      { id: 'ii-06b', type: 'product', referenceId: id('prod', 8), name: 'Custom Invoice Pad (50 sheets)', quantity: 10, rate: 800, amount: 8000 },
    ],
    subtotal: 17000,
    taxRate: 18,
    taxAmount: 3060,
    discount: 0,
    total: 20060,
    status: 'paid',
    invoiceDate: '2026-04-01',
    dueDate: '2026-04-15',
    paidDate: '2026-04-14',
    projectId: null,
    notes: 'Textile business stationery order.',
    createdAt: '2026-04-01',
  },
  {
    id: id('inv', 7),
    invoiceNumber: 'INV-0007',
    clientId: id('cli', 5),
    type: 'mixed',
    items: [
      { id: 'ii-07a', type: 'service', referenceId: id('svc', 7), name: 'Business Consulting', quantity: 2, rate: 15000, amount: 30000 },
      { id: 'ii-07b', type: 'product', referenceId: id('prod', 1), name: 'Premium Business Cards (500 pcs)', quantity: 3, rate: 2500, amount: 7500 },
    ],
    subtotal: 37500,
    taxRate: 18,
    taxAmount: 6750,
    discount: 3000,
    total: 41250,
    status: 'overdue',
    invoiceDate: '2026-04-10',
    dueDate: '2026-04-25',
    paidDate: null,
    projectId: null,
    notes: 'Consulting and branding materials.',
    createdAt: '2026-04-10',
  },
  {
    id: id('inv', 8),
    invoiceNumber: 'INV-0008',
    clientId: id('cli', 7),
    type: 'services',
    items: [
      { id: 'ii-08', type: 'service', referenceId: id('svc', 1), name: 'Brand Identity Design', quantity: 1, rate: 75000, amount: 75000 },
    ],
    subtotal: 75000,
    taxRate: 18,
    taxAmount: 13500,
    discount: 0,
    total: 88500,
    status: 'paid',
    invoiceDate: '2026-03-21',
    dueDate: '2026-04-05',
    paidDate: '2026-04-02',
    projectId: id('proj', 7),
    notes: 'One-time branding project.',
    createdAt: '2026-03-21',
  },
  {
    id: id('inv', 9),
    invoiceNumber: 'INV-0009',
    clientId: id('cli', 10),
    type: 'products',
    items: [
      { id: 'ii-09a', type: 'product', referenceId: id('prod', 10), name: 'Eco-Friendly Paper Bag (Pack of 50)', quantity: 20, rate: 1500, amount: 30000 },
      { id: 'ii-09b', type: 'product', referenceId: id('prod', 6), name: 'Vinyl Sticker Sheet (A3)', quantity: 50, rate: 350, amount: 17500 },
    ],
    subtotal: 47500,
    taxRate: 18,
    taxAmount: 8550,
    discount: 2000,
    total: 54050,
    status: 'paid',
    invoiceDate: '2026-05-01',
    dueDate: '2026-05-15',
    paidDate: '2026-05-12',
    projectId: null,
    notes: 'Food packaging materials.',
    createdAt: '2026-05-01',
  },
  {
    id: id('inv', 10),
    invoiceNumber: 'INV-0010',
    clientId: id('cli', 6),
    type: 'services',
    items: [
      { id: 'ii-10', type: 'service', referenceId: id('svc', 6), name: 'Mobile App Development', quantity: 1, rate: 250000, amount: 250000 },
    ],
    subtotal: 250000,
    taxRate: 18,
    taxAmount: 45000,
    discount: 15000,
    total: 280000,
    status: 'pending',
    invoiceDate: '2026-05-20',
    dueDate: '2026-07-20',
    paidDate: null,
    projectId: id('proj', 6),
    notes: 'Mobile app development — 50% advance.',
    createdAt: '2026-05-20',
  },
  {
    id: id('inv', 11),
    invoiceNumber: 'INV-0011',
    clientId: id('cli', 3),
    type: 'products',
    items: [
      { id: 'ii-11a', type: 'product', referenceId: id('prod', 5), name: 'Roll-Up Banner Stand', quantity: 4, rate: 4200, amount: 16800 },
      { id: 'ii-11b', type: 'product', referenceId: id('prod', 9), name: 'Flex Board (4x6 ft)', quantity: 6, rate: 2800, amount: 16800 },
    ],
    subtotal: 33600,
    taxRate: 18,
    taxAmount: 6048,
    discount: 0,
    total: 39648,
    status: 'overdue',
    invoiceDate: '2026-04-20',
    dueDate: '2026-05-05',
    paidDate: null,
    projectId: null,
    notes: 'Construction site signage order.',
    createdAt: '2026-04-20',
  },
  {
    id: id('inv', 12),
    invoiceNumber: 'INV-0012',
    clientId: id('cli', 9),
    type: 'services',
    items: [
      { id: 'ii-12', type: 'service', referenceId: id('svc', 7), name: 'Business Consulting', quantity: 1, rate: 15000, amount: 15000 },
    ],
    subtotal: 15000,
    taxRate: 18,
    taxAmount: 2700,
    discount: 0,
    total: 17700,
    status: 'paid',
    invoiceDate: '2026-04-15',
    dueDate: '2026-04-30',
    paidDate: '2026-04-28',
    projectId: null,
    notes: 'One-time consultation session.',
    createdAt: '2026-04-15',
  },
  {
    id: id('inv', 13),
    invoiceNumber: 'INV-0013',
    clientId: id('cli', 2),
    type: 'mixed',
    items: [
      { id: 'ii-13a', type: 'service', referenceId: id('svc', 3), name: 'Social Media Management', quantity: 1, rate: 25000, amount: 25000 },
      { id: 'ii-13b', type: 'product', referenceId: id('prod', 3), name: 'Custom Packaging Box (Large)', quantity: 50, rate: 450, amount: 22500 },
    ],
    subtotal: 47500,
    taxRate: 18,
    taxAmount: 8550,
    discount: 0,
    total: 56050,
    status: 'pending',
    invoiceDate: '2026-05-25',
    dueDate: '2026-06-25',
    paidDate: null,
    projectId: null,
    notes: 'Monthly marketing + packaging order.',
    createdAt: '2026-05-25',
  },
  {
    id: id('inv', 14),
    invoiceNumber: 'INV-0014',
    clientId: id('cli', 1),
    type: 'products',
    items: [
      { id: 'ii-14a', type: 'product', referenceId: id('prod', 4), name: 'Branded Merchandise Kit', quantity: 8, rate: 3500, amount: 28000 },
    ],
    subtotal: 28000,
    taxRate: 18,
    taxAmount: 5040,
    discount: 0,
    total: 33040,
    status: 'paid',
    invoiceDate: '2026-05-10',
    dueDate: '2026-05-25',
    paidDate: '2026-05-22',
    projectId: null,
    notes: 'Merchandise for team event.',
    createdAt: '2026-05-10',
  },
  {
    id: id('inv', 15),
    invoiceNumber: 'INV-0015',
    clientId: id('cli', 4),
    type: 'products',
    items: [
      { id: 'ii-15a', type: 'product', referenceId: id('prod', 7), name: 'Acrylic Name Plate', quantity: 5, rate: 1200, amount: 6000 },
      { id: 'ii-15b', type: 'product', referenceId: id('prod', 1), name: 'Premium Business Cards (500 pcs)', quantity: 2, rate: 2500, amount: 5000 },
    ],
    subtotal: 11000,
    taxRate: 18,
    taxAmount: 1980,
    discount: 0,
    total: 12980,
    status: 'pending',
    invoiceDate: '2026-06-01',
    dueDate: '2026-06-15',
    paidDate: null,
    projectId: null,
    notes: 'Office branding supplies.',
    createdAt: '2026-06-01',
  },
]

// ── Demo Stock Movements ─────────────────────
export const DEMO_STOCK_MOVEMENTS: StockMovement[] = [
  { id: 'sm-01', productId: id('prod', 1), type: 'sale', quantity: 10, date: '2026-03-10', invoiceId: id('inv', 4), note: 'Invoice INV-0004' },
  { id: 'sm-02', productId: id('prod', 4), type: 'sale', quantity: 5, date: '2026-03-10', invoiceId: id('inv', 4), note: 'Invoice INV-0004' },
  { id: 'sm-03', productId: id('prod', 2), type: 'sale', quantity: 5, date: '2026-04-01', invoiceId: id('inv', 6), note: 'Invoice INV-0006' },
  { id: 'sm-04', productId: id('prod', 8), type: 'sale', quantity: 10, date: '2026-04-01', invoiceId: id('inv', 6), note: 'Invoice INV-0006' },
  { id: 'sm-05', productId: id('prod', 1), type: 'sale', quantity: 3, date: '2026-04-10', invoiceId: id('inv', 7), note: 'Invoice INV-0007' },
  { id: 'sm-06', productId: id('prod', 10), type: 'sale', quantity: 20, date: '2026-05-01', invoiceId: id('inv', 9), note: 'Invoice INV-0009' },
  { id: 'sm-07', productId: id('prod', 6), type: 'sale', quantity: 50, date: '2026-05-01', invoiceId: id('inv', 9), note: 'Invoice INV-0009' },
  { id: 'sm-08', productId: id('prod', 5), type: 'sale', quantity: 4, date: '2026-04-20', invoiceId: id('inv', 11), note: 'Invoice INV-0011' },
  { id: 'sm-09', productId: id('prod', 9), type: 'sale', quantity: 6, date: '2026-04-20', invoiceId: id('inv', 11), note: 'Invoice INV-0011' },
  { id: 'sm-10', productId: id('prod', 4), type: 'sale', quantity: 8, date: '2026-05-10', invoiceId: id('inv', 14), note: 'Invoice INV-0014' },
  { id: 'sm-11', productId: id('prod', 3), type: 'sale', quantity: 50, date: '2026-05-25', invoiceId: id('inv', 13), note: 'Invoice INV-0013' },
  { id: 'sm-12', productId: id('prod', 3), type: 'restock', quantity: 100, date: '2026-04-01', invoiceId: null, note: 'Restocked from supplier' },
  { id: 'sm-13', productId: id('prod', 7), type: 'sale', quantity: 5, date: '2026-06-01', invoiceId: id('inv', 15), note: 'Invoice INV-0015' },
  { id: 'sm-14', productId: id('prod', 1), type: 'sale', quantity: 2, date: '2026-06-01', invoiceId: id('inv', 15), note: 'Invoice INV-0015' },
  { id: 'sm-15', productId: id('prod', 1), type: 'restock', quantity: 50, date: '2026-01-15', invoiceId: null, note: 'Initial restock' },
]

// ── Helper to get next invoice number ────────
export function getNextInvoiceNumber(existingInvoices: DemoInvoice[]): string {
  const maxNum = existingInvoices.reduce((max, inv) => {
    const num = parseInt(inv.invoiceNumber.replace('INV-', ''), 10)
    return num > max ? num : max
  }, 0)
  return `INV-${String(maxNum + 1).padStart(4, '0')}`
}

// ── Currency formatter ───────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

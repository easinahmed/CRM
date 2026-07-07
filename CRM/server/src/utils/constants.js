export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  HR: 'hr',
  ACCOUNTANT: 'accountant',
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
};

export const ROLE_HIERARCHY = {
  super_admin: 0,
  admin: 1,
  manager: 2,
  sales: 3,
  hr: 3,
  accountant: 3,
  employee: 4,
  customer: 5,
};

export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_CRM: 'view_crm',
  MANAGE_CRM: 'manage_crm',
  VIEW_SALES: 'view_sales',
  MANAGE_SALES: 'manage_sales',
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_EMPLOYEES: 'view_employees',
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_ACCOUNTING: 'view_accounting',
  MANAGE_ACCOUNTING: 'manage_accounting',
  VIEW_REPORTS: 'view_reports',
  MANAGE_SETTINGS: 'manage_settings',
};

export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.VIEW_CRM, PERMISSIONS.MANAGE_CRM,
    PERMISSIONS.VIEW_SALES, PERMISSIONS.MANAGE_SALES,
    PERMISSIONS.VIEW_INVENTORY, PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_ACCOUNTING,
    PERMISSIONS.VIEW_REPORTS,
  ],
  sales: [
    PERMISSIONS.VIEW_CRM, PERMISSIONS.MANAGE_CRM,
    PERMISSIONS.VIEW_SALES, PERMISSIONS.MANAGE_SALES,
  ],
  hr: [
    PERMISSIONS.VIEW_EMPLOYEES, PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_REPORTS,
  ],
  accountant: [
    PERMISSIONS.VIEW_ACCOUNTING, PERMISSIONS.MANAGE_ACCOUNTING,
    PERMISSIONS.VIEW_REPORTS,
  ],
  employee: [
    PERMISSIONS.VIEW_CRM,
  ],
  customer: [],
};

export const DEAL_STAGES = [
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
];

export const PAYMENT_METHODS = [
  'cash',
  'card',
  'bank_transfer',
  'check',
  'online',
];

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'disqualified',
  'converted',
];

export const ATTENDANCE_STATUS = [
  'present',
  'absent',
  'late',
  'half_day',
  'leave',
];

export const LEAVE_STATUS = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
];

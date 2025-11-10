import type { ChangeEvent, ReactNode } from 'react';

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'citizen' | 'admin' | 'enforcer';
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  driverLicenseNumber?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Violation Types
export interface Violation {
  id: string;
  ovrNumber: string;
  citationNumber: string;
  plateNumber: string;
  vehicleType: 'motorcycle' | 'car' | 'truck' | 'bus' | 'tricycle' | 'other';
  driverName: string;
  driverLicenseNumber?: string;
  violationType: string;
  violationDescription: string;
  violationLocation: string;
  violationDate: string;
  violationTime: string;
  baseFine: number;
  additionalPenalties: number;
  totalFine: number;
  status: 'pending' | 'paid' | 'disputed' | 'dismissed' | 'overdue' | 'cancelled';
  dueDate: string;
  paymentDeadline: string;
  enforcerId: string;
  enforcerName: string;
  isDisputed: boolean;
  disputeReason?: string;
  disputeStatus?: 'pending' | 'approved' | 'rejected';
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  paymentId: string;
  violationId: string;
  ovrNumber: string;
  citationNumber: string;
  payerId?: string;
  payerName: string;
  payerEmail: string;
  amount: number;
  paymentMethod: 'paymongo' | 'gcash' | 'maya' | 'dragonpay' | 'credit_card' | 'debit_card';
  paymentProvider: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gatewayTransactionId?: string;
  receiptNumber: string;
  qrCodeData?: string;
  qrCodeUrl?: string;
  totalAmount: number;
  initiatedAt: string;
  completedAt?: string;
  receiptEmailSent: boolean;
  receiptSMSSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment Gateway Types
export interface PaymentGateway {
  id: string;
  name: string;
  displayName: string;
  description: string;
  logo: string;
  icons: string[];
  isActive: boolean;
  processingFee: number;
  processingFeeType: 'percentage' | 'fixed';
}

export interface PaymentInitiationRequest {
  violationId: string;
  paymentMethod: string;
  amount: number;
  payerEmail: string;
  payerName: string;
}

export interface PaymentConfirmationRequest {
  paymentId: string;
  gatewayTransactionId: string;
  gatewayReference?: string;
  gatewayResponse?: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  driverLicenseNumber?: string;
}

export interface ViolationSearchForm {
  searchType: 'ovr' | 'plate' | 'license';
  searchValue: string;
}

export interface DisputeForm {
  reason: string;
  evidence?: File[];
}

// Dashboard Types
export interface DashboardStats {
  totalViolations: number;
  pendingViolations: number;
  paidViolations: number;
  overdueViolations: number;
  totalRevenue: number;
  totalAmountPaid: number;
  monthlyRevenue: number;
  recentViolations: Violation[];
  recentPayments: Payment[];
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    verified: number;
  };
  violations: {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
  };
  payments: {
    total: number;
    completed: number;
    revenue: number;
  };
  recentViolations: Violation[];
  recentPayments: Payment[];
  violationsByType: { type: string; count: number }[];
  paymentsByMethod: { method: string; count: number; totalAmount: number }[];
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkUrl?: string;
  linkText?: string;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

// Filter and Sort Types
export interface FilterOptions {
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  violationType?: string;
  paymentMethod?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Error Types
export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
  details?: any;
}

// Component Props Types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white' | 'gray';
  className?: string;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: ((value: string) => void) | ((event: ChangeEvent<HTMLInputElement>) => void);
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  startIcon?: ReactNode;
  endAdornment?: ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Route Types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  adminOnly?: boolean;
  title?: string;
}

// Theme Types
export interface Theme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  text: string;
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'tl';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  twoFactorEnabled: boolean;
}


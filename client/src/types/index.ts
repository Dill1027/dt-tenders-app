export interface UserPermissions {
  canViewAll: boolean;
  canEditPart1: boolean;
  canEditPart2: boolean;
  canEditPart3: boolean;
  canEditInvoicePayment: boolean;
}

export interface User {
  id: string;
  username: string;
  role: 'project_team' | 'finance_team' | 'all_users' | 'admin';
  permissions?: UserPermissions;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword?: string;  // For client-side validation only
}

export interface PasswordResetRequestData {
  username: string;
}

export interface PasswordResetData {
  username: string;
  resetCode: string;
  newPassword: string;
  confirmNewPassword?: string;  // For client-side validation only
}

// Common type aliases
export type YesNo = 'Yes' | 'No';
export type YesNoNA = 'Yes' | 'No' | 'N/A';

export interface Project {
  _id: string;
  // Part 1 - Project Creation
  nameOfAwardedTender: string;
  performanceBondSubmission: YesNoNA;
  agreementSigned: YesNoNA;
  siteDetails: string;
  createProjectInDislio: YesNo;
  noteForFinanceTeam_part1: string;
  
  // Part 2 - Finance Section
  checkWithStoreManager: YesNo;
  readyOrNot: boolean;
  purchasingNote: string;
  noteForFinanceTeam_part2: string;
  
  // Part 3 - Project Team Section
  selectTeam: TeamType;
  structurePanel: string;
  timeline: string;
  siteInstallationNote: string;
  noteForFinanceTeam_part3: string;
  
  // Invoice & Payment
  invoiceCreate: InvoiceStatus;
  paymentStatus: PaymentStatus;
  
  // Metadata
  createdBy: User;
  lastModifiedBy?: User;
  status: ProjectStatus;
  part1Completed: boolean;
  part2Completed: boolean;
  part3Completed: boolean;
  part1CompletedAt?: string;
  part2CompletedAt?: string;
  part3CompletedAt?: string;
  completionPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}


export interface LoginData {
  username: string;
  password: string;
}

export interface ProjectFormData {
  // Part 1
  nameOfAwardedTender?: string;
  performanceBondSubmission?: YesNoNA;
  agreementSigned?: YesNoNA;
  siteDetails?: string;
  createProjectInDislio?: YesNo;
  noteForFinanceTeam_part1?: string;
  
  // Part 2
  checkWithStoreManager?: YesNo;
  readyOrNot?: boolean;
  purchasingNote?: string;
  noteForFinanceTeam_part2?: string;
  
  // Part 3
  selectTeam?: TeamType;
  structurePanel?: string;
  timeline?: string;
  siteInstallationNote?: string;
  noteForFinanceTeam_part3?: string;
  
  // Invoice & Payment
  invoiceCreate?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
}

// More type aliases
export type TeamType = 'Company' | 'Subcontractor';
export type InvoiceStatus = 'Done' | 'Not Yet';
export type PaymentStatus = 'Done' | 'Half' | 'None' | '80%' | '20%';
export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: PaginationInfo;
}

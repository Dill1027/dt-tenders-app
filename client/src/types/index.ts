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

export interface Project {
  _id: string;
  // Part 1 - Project Creation
  nameOfAwardedTender: string;
  performanceBondSubmission: 'Yes' | 'No' | 'N/A';
  agreementSigned: 'Yes' | 'No' | 'N/A';
  siteDetails: string;
  createProjectInDislio: 'Yes' | 'No';
  noteForFinanceTeam_part1: string;
  
  // Part 2 - Finance Section
  checkWithStoreManager: 'Yes' | 'No';
  readyOrNot: boolean;
  purchasingNote: string;
  noteForFinanceTeam_part2: string;
  
  // Part 3 - Project Team Section
  selectTeam: 'Company' | 'Subcontractor';
  structurePanel: string;
  timeline: string;
  siteInstallationNote: string;
  noteForFinanceTeam_part3: string;
  
  // Invoice & Payment
  invoiceCreate: 'Done' | 'Not Yet';
  paymentStatus: 'Done' | 'Half' | 'None' | '80%' | '20%';
  
  // Metadata
  createdBy: User;
  lastModifiedBy?: User;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
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
  performanceBondSubmission?: 'Yes' | 'No' | 'N/A';
  agreementSigned?: 'Yes' | 'No' | 'N/A';
  siteDetails?: string;
  createProjectInDislio?: 'Yes' | 'No';
  noteForFinanceTeam_part1?: string;
  
  // Part 2
  checkWithStoreManager?: 'Yes' | 'No';
  readyOrNot?: boolean;
  purchasingNote?: string;
  noteForFinanceTeam_part2?: string;
  
  // Part 3
  selectTeam?: 'Company' | 'Subcontractor';
  structurePanel?: string;
  timeline?: string;
  siteInstallationNote?: string;
  noteForFinanceTeam_part3?: string;
  
  // Invoice & Payment
  invoiceCreate?: 'Done' | 'Not Yet';
  paymentStatus?: 'Done' | 'Half' | 'None' | '80%' | '20%';
}

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

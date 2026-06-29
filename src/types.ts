export interface Employee {
  id: string;
  tenantId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: 'Active' | 'Onboarding' | 'Terminated' | 'On Leave';
  startDate: string;
  salary: number;
  notes: string;
}

export interface ResumeAnalysis {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  targetRole: string;
  rawText: string;
  score: number; // 0-100 rating
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  analyzedAt: string;
}

export interface InterviewTemplate {
  id: string;
  tenantId?: string;
  title: string;
  department: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  questions: {
    question: string;
    purpose: string;
    expectedAnswer: string;
  }[];
}

export interface PerformanceReview {
  id: string;
  tenantId?: string;
  employeeId: string;
  reviewer: string;
  ratingWork: number; // 1-5
  ratingTeam: number; // 1-5
  ratingGrowth: number; // 1-5
  strengths: string;
  improvements: string;
  goals: string;
  submittedAt: string;
}

export interface ChecklistItem {
  id: string;
  tenantId?: string;
  category: 'Onboarding' | 'Offboarding' | 'Compliance' | 'Audit';
  task: string;
  completed: boolean;
  notes?: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'Data Access' | 'System' | 'Modification' | 'Security';
  details: string;
}

export interface SecurityState {
  isMasked: boolean;
  encryptionKey: string;
  lastBackupDate: string | null;
}

export interface DocumentSummary {
  overview: string;
  keyPoints: string[];
  audienceAssessment: string;
}

export interface DocumentRisk {
  id: string;
  clause: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
}

export interface ExtractedClause {
  id: string;
  name: string;
  exactText: string;
  explanation: string;
  riskScore: number; // 0-10 format
}

export interface DocumentMetadata {
  title?: string;
  parties?: string[];
  governingLaw?: string;
  effectiveDate?: string;
  terminationNotice?: string;
}

export interface AnalyzedDocument {
  id: string;
  name: string;
  type: 'Contract' | 'Policy' | 'Handbook' | 'Other';
  rawText?: string;
  analyzedAt: string;
  summary: DocumentSummary;
  risks: DocumentRisk[];
  clauses: ExtractedClause[];
  metadata: DocumentMetadata;
}

export interface HrRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  requestType: 'PTO Rollover' | 'PTO Rollover Exception' | 'WFH Allowance' | 'Tuition Reimbursement' | 'Equipment Request' | 'Maternity Leave Extension';
  description: string;
  amount?: number;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Clarification';
  approvals: {
    manager?: { approved: boolean; date?: string; reviewer?: string; notes?: string };
    compliance?: { approved: boolean; date?: string; reviewer?: string; notes?: string };
    finance?: { approved: boolean; date?: string; reviewer?: string; notes?: string };
  };
  currentStep: 'Manager' | 'Compliance' | 'Finance' | 'Completed';
  category: string;
}

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  status: 'Pending' | 'Automated' | 'Completed';
  automatedAt?: string;
  isAutomatedEligible: boolean;
  notes?: string;
}

export interface EmployeeOnboarding {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  startDate: string;
  percentage: number;
  steps: OnboardingStep[];
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  createdAt: string;
}

export interface WhitelabelConfig {
  companyName: string;
  theme: 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan';
  customDomain: string;
  logoIcon: 'shield' | 'globe' | 'briefcase' | 'cpu' | 'terminal' | 'users';
  isWhitelabelActive: boolean;
}



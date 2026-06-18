import { Employee, InterviewTemplate, ChecklistItem, AuditLog } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 's.connor@cyberdyne.org',
    phone: '555-0199',
    department: 'Engineering',
    role: 'Lead Systems Architect',
    status: 'Active',
    startDate: '2023-03-12',
    salary: 145000,
    notes: 'Exceptional performance. Strong advocate for security policies and offline safe infrastructure backups.',
  },
  {
    id: 'emp-102',
    firstName: 'Marcus',
    lastName: 'Aurelius',
    email: 'm.aurelius@meditations.com',
    phone: '555-0120',
    department: 'HR & Legal',
    role: 'Ethics & Compliance Officer',
    status: 'Active',
    startDate: '2022-01-15',
    salary: 118000,
    notes: 'Maintains unparalleled focus on fairness and employee mental well-being in all internal feedback sessions.',
  },
  {
    id: 'emp-103',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@analyticalengine.net',
    phone: '555-1815',
    department: 'Engineering',
    role: 'Senior Algorithm Specialist',
    status: 'Onboarding',
    startDate: '2026-06-01',
    salary: 135000,
    notes: 'Relocated from London. Currently finishing compliance and identity training procedures.',
  },
  {
    id: 'emp-104',
    firstName: 'Winston',
    lastName: 'Smith',
    email: 'winston@ministryoftruth.gov',
    phone: '555-1984',
    department: 'Marketing',
    role: 'Archivist & Content Lead',
    status: 'On Leave',
    startDate: '2021-04-04',
    salary: 82000,
    notes: 'Exhibits stress; recommended for local support sessions. On temporary stress-related sabbatical.',
  }
];

export const DEFAULT_CHECKLISTS: ChecklistItem[] = [
  {
    id: 'chk-1',
    category: 'Onboarding',
    task: 'Verify government-issued photo ID & right-to-work documents',
    completed: true,
    notes: 'Identity verified locally in physical archive suite',
    completedAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 'chk-2',
    category: 'Onboarding',
    task: 'Initiate offline local database record creation with custom identifier',
    completed: true,
    notes: 'Stored on local HR internal encrypted sandbox secure layer',
    completedAt: '2026-06-01T10:15:00Z',
  },
  {
    id: 'chk-3',
    category: 'Onboarding',
    task: 'Conduct private security briefing (No external uploads or data retention)',
    completed: false,
    notes: 'Scheduled for first day back on duty',
  },
  {
    id: 'chk-4',
    category: 'Compliance',
    task: 'Quarterly review of payroll and local records redundancy backup',
    completed: true,
    notes: 'Executed secure external USB target validation test',
    completedAt: '2026-05-15T14:30:00Z',
  },
  {
    id: 'chk-5',
    category: 'Compliance',
    task: 'De-provision former employees\' offline disk partitions & keys',
    completed: false,
  },
  {
    id: 'chk-6',
    category: 'Offboarding',
    task: 'Return physical access badges and encrypted storage dongles',
    completed: false,
  },
  {
    id: 'chk-7',
    category: 'Offboarding',
    task: 'Conduct physical exit interview with physical records closure signoff',
    completed: false,
  }
];

export const DEFAULT_TEMPLATES: InterviewTemplate[] = [
  {
    id: 'temp-1',
    title: 'Senior Software Engineer Structural Interview',
    department: 'Engineering',
    seniority: 'Senior',
    questions: [
      {
        question: 'Can you describe a scenario where you designed a system that was restricted from external API access due to privacy regulations? How did you approach state sync?',
        purpose: 'Verify offline architecture knowledge, local sync designs, and network constraints processing.',
        expectedAnswer: 'Should mention local database (SQLite/IndexedDB), queuing mechanisms, change trackers, and selective synchronizers.',
      },
      {
        question: 'Explain how you balance clean code separation and performance under memory-tight sandboxed client containers.',
        purpose: 'Measures low-overhead execution strategy awareness and bundle optimization skills.',
        expectedAnswer: 'Understands memory limits, garbage collection, garbage minimization, and dependency minimalism.',
      },
      {
        question: 'How do you structure code testing to prevent leakage of client production data to external testing suites?',
        purpose: 'Tests secure coding practices and isolation rules.',
        expectedAnswer: 'Prefers full local mock generation over production databases sanitization and isolates automated UI testing offline.',
      }
    ]
  },
  {
    id: 'temp-2',
    title: 'HR Generalist & Talent Lead',
    department: 'HR & Legal',
    seniority: 'Mid',
    questions: [
      {
        question: 'How do you handle employees raising critical ethics concerns without using cloud-shared workspace folders?',
        purpose: 'Assesses confidential records management and secure local file custody techniques.',
        expectedAnswer: 'Maintains structured local storage, paper trails, or isolated sandboxed drives with hardware-based access control keys.',
      },
      {
        question: 'Describe a time when you resolved department conflict while strictly preserving individual anonymity.',
        purpose: 'Tests safe mediation strategies and ethical boundaries.',
        expectedAnswer: 'Separates investigative interview logs, uses general feedback abstractions, and maintains zero identifiable metadata sharing.',
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-15T08:00:15Z',
    action: 'HR Assistant Initialized',
    category: 'System',
    details: 'Verified offline status. 100% Client-side sandbox storage initialized.',
  },
  {
    id: 'log-2',
    timestamp: '2026-06-15T08:12:44Z',
    action: 'Employee Record Opened',
    category: 'Data Access',
    details: 'Viewed Lead Systems Architect profile (Sarah Connor). Data decrypted in memory.',
  },
  {
    id: 'log-3',
    timestamp: '2026-06-15T09:41:02Z',
    action: 'Resume Screening Mock Engine Prepped',
    category: 'Security',
    details: 'Validated job-matching local taxonomy rules. Local CPU analysis configured.',
  }
];

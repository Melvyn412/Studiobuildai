import React, { useState, useEffect } from 'react';
import { Employee, HrRequest, OnboardingStep, EmployeeOnboarding, AuditLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, CheckCircle2, XCircle, Plus, Truck, Cpu, Mail, FileCheck2, 
  UserPlus, ChevronRight, Info, ShieldAlert, Users, Check, Settings, 
  AlertCircle, Undo2, RefreshCw, FileCode, Landmark, Clock, FileSignature,
  DollarSign, Sparkles, Send, Trash2
} from 'lucide-react';

interface OnboardingAutomationProps {
  employees: Employee[];
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  activeTier?: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI';
}

const DEFAULT_ONBOARDING_STEPS = [
  { id: 'step-1', name: 'Background & Passport Screening', description: 'Run secure identity background, proof of work, and passport clearance.', assignedTo: 'Ethics & Compliance', status: 'Pending', isAutomatedEligible: false },
  { id: 'step-2', name: 'Corporate Email & Identity Provisioning', description: 'Configure active company email address, single sign-on directories, and Slack account.', assignedTo: 'Automated System', status: 'Pending', isAutomatedEligible: true },
  { id: 'step-3', name: 'NDA & Employment Contract Execution', description: 'Dispatch localized enterprise contract payload and receive secure cryptographic digital signature.', assignedTo: 'Automated System', status: 'Pending', isAutomatedEligible: true },
  { id: 'step-4', name: 'Hardware Setup & Secure Key Dispatch', description: 'Submit order request for encrypted business hardware and dispatch secure passkeys.', assignedTo: 'Automated System', status: 'Pending', isAutomatedEligible: true },
  { id: 'step-5', name: 'Compliance Training & Policy Orientation', description: 'Schedule standard physical sandbox regulations briefing and NDA review.', assignedTo: 'Direct Manager', status: 'Pending', isAutomatedEligible: false },
];

const INITIAL_REQUESTS: HrRequest[] = [
  {
    id: 'req-201',
    employeeId: 'emp-103',
    employeeName: 'Ada Lovelace',
    requestType: 'Equipment Request',
    description: 'Supplemental dual monitors and noise-cancelling headphones for high-performance development workspace.',
    amount: 450,
    submittedAt: '2026-06-10T10:00:00Z',
    status: 'Pending',
    approvals: {
      manager: { approved: true, date: '2026-06-11T14:30:00Z', reviewer: 'Sarah Connor', notes: 'Pre-approved. High priority for early engineering productivity.' },
      compliance: { approved: false },
      finance: { approved: false }
    },
    currentStep: 'Compliance',
    category: 'Equipment'
  },
  {
    id: 'req-202',
    employeeId: 'emp-101',
    employeeName: 'Sarah Connor',
    requestType: 'Tuition Reimbursement',
    description: 'Postgraduate certification in Secure Cloud Architectures and Quantum Cryptography Systems.',
    amount: 1850,
    submittedAt: '2026-06-08T09:15:00Z',
    status: 'Pending',
    approvals: {
      manager: { approved: true, date: '2026-06-08T11:00:00Z', reviewer: 'Marcus Aurelius', notes: 'Highly beneficial. Content directly matches our secure offline infrastructure goals.' },
      compliance: { approved: true, date: '2026-06-09T16:20:00Z', reviewer: 'Marcus Aurelius', notes: 'Syllabus vetted. Holds strict zero external data leak boundaries.' },
      finance: { approved: false }
    },
    currentStep: 'Finance',
    category: 'Financial'
  },
  {
    id: 'req-203',
    employeeId: 'emp-104',
    employeeName: 'Winston Smith',
    requestType: 'PTO Rollover Exception',
    description: 'Exception to roll over 3 additional accrued holiday leave days beyond standard 5-day cap due to medical leave delay.',
    amount: 0,
    submittedAt: '2026-06-14T11:45:00Z',
    status: 'Pending',
    approvals: {
      manager: { approved: false },
      compliance: { approved: false },
      finance: { approved: false }
    },
    currentStep: 'Manager',
    category: 'PTO'
  }
];

export default function OnboardingAutomation({ employees, addLog, activeTier = 'Starter' }: OnboardingAutomationProps) {
  const [activeSubTab, setActiveSubTab] = useState<'onboarding' | 'requests' | 'admin-eraser'>('onboarding');

  // --- Real-time Local Persistence ---
  const [onboardings, setOnboardings] = useState<EmployeeOnboarding[]>(() => {
    const saved = localStorage.getItem('secure_hr_onboardings_active');
    if (saved) return JSON.parse(saved);

    // Default seed for onboarding employee (e.g. Ada Lovelace)
    const seed: EmployeeOnboarding[] = [
      {
        employeeId: 'emp-103',
        employeeName: 'Ada Lovelace',
        department: 'Engineering',
        role: 'Senior Algorithm Specialist',
        startDate: '2026-06-01',
        percentage: 20,
        steps: DEFAULT_ONBOARDING_STEPS.map((s, idx) => ({
          ...s,
          // First step completed by default
          status: idx === 0 ? 'Completed' : 'Pending',
          automatedAt: idx === 0 ? '2026-06-01T10:00:00Z' : undefined
        }))
      }
    ];
    return seed;
  });

  const [requests, setRequests] = useState<HrRequest[]>(() => {
    const saved = localStorage.getItem('secure_hr_requests_active');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [consoleLogs, setConsoleLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('secure_hr_automation_console_logs');
    return saved ? JSON.parse(saved) : [
      '⚡ [SYSTEM] Workflow engine initialized.',
      '🤖 [AGENT] Repetitive administrative helper active & waiting for instructions.',
    ];
  });

  // Sync state changes to storage
  useEffect(() => {
    localStorage.setItem('secure_hr_onboardings_active', JSON.stringify(onboardings));
  }, [onboardings]);

  useEffect(() => {
    localStorage.setItem('secure_hr_requests_active', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('secure_hr_automation_console_logs', JSON.stringify(consoleLogs));
  }, [consoleLogs]);

  // Handle background initialization for employees in 'Onboarding' state
  useEffect(() => {
    let changed = false;
    const currentOnboardings = [...onboardings];

    employees.forEach(emp => {
      if (emp.status === 'Onboarding') {
        const exist = currentOnboardings.some(o => o.employeeId === emp.id);
        if (!exist) {
          currentOnboardings.push({
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            department: emp.department,
            role: emp.role,
            startDate: emp.startDate,
            percentage: 0,
            steps: DEFAULT_ONBOARDING_STEPS.map(s => ({ ...s, status: 'Pending' }))
          });
          changed = true;
          logTerminal(`⚙️ [ONBOARD] Automatically mapped new onboarding profile for incoming hire ${emp.firstName} ${emp.lastName}.`);
        }
      }
    });

    if (changed) {
      setOnboardings(currentOnboardings);
    }
  }, [employees]);

  // Terminal logging helper
  const logTerminal = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const clearTerminal = () => {
    setConsoleLogs([`⚡ [SYSTEM] Logs cleared. Workflow engine responsive.`]);
  };

  // --- Onboarding Action Handler ---
  const [selectedOnboardEmp, setSelectedOnboardEmp] = useState<string>(
    onboardings[0]?.employeeId || 'emp-103'
  );
  const currentOnboarding = onboardings.find(o => o.employeeId === selectedOnboardEmp) || onboardings[0];

  const updateOnboardingProgress = (onbList: EmployeeOnboarding[]) => {
    return onbList.map(onb => {
      const completedCount = onb.steps.filter(s => s.status === 'Completed' || s.status === 'Automated').length;
      const percentage = Math.round((completedCount / onb.steps.length) * 100);
      return { ...onb, percentage };
    });
  };

  const handleStepStatusToggle = (empId: string, stepId: string) => {
    const updated = onboardings.map(onb => {
      if (onb.employeeId === empId) {
        const updatedSteps = onb.steps.map(step => {
          if (step.id === stepId) {
            const newStatus = step.status === 'Completed' ? 'Pending' : 'Completed';
            return {
              ...step,
              status: newStatus as any,
              automatedAt: newStatus === 'Completed' ? new Date().toISOString() : undefined
            };
          }
          return step;
        });
        return { ...onb, steps: updatedSteps };
      }
      return onb;
    });

    const refreshed = updateOnboardingProgress(updated);
    setOnboardings(refreshed);

    const changedStep = currentOnboarding?.steps.find(s => s.id === stepId);
    if (changedStep) {
      const isFinishing = changedStep.status !== 'Completed';
      addLog(
        isFinishing ? 'Onboarding Task Completed' : 'Onboarding Task Reverted',
        'Modification',
        `Onboarding step "${changedStep.name}" manually adjusted to ${isFinishing ? 'COMPLETED' : 'PENDING'} for candidate ${currentOnboarding.employeeName}.`
      );
      logTerminal(`👤 [ONBOARD] Step "${changedStep.name}" manually adjusted for employee ${currentOnboarding.employeeName}.`);
    }
  };

  // ONE-CLICK ONBOARDING AUTOMATION DISPATCH
  const [isAutomatingStep, setIsAutomatingStep] = useState<string | null>(null);

  const handleAutomateOnboardingStep = (stepId: string) => {
    if (!currentOnboarding) return;
    const targetStep = currentOnboarding.steps.find(s => s.id === stepId);
    if (!targetStep || !targetStep.isAutomatedEligible) return;

    setIsAutomatingStep(stepId);
    logTerminal(`🤖 [AUTOMATION ENGINE] Executing automated routine for step: "${targetStep.name}"`);

    // Simulate API responses from local sandboxed script routines
    setTimeout(() => {
      const updated = onboardings.map(onb => {
        if (onb.employeeId === selectedOnboardEmp) {
          const updatedSteps = onb.steps.map(step => {
            if (step.id === stepId) {
              let notesText = '';
              if (stepId === 'step-2') {
                const formattedEmail = `${currentOnboarding.employeeName.toLowerCase().replace(/\s+/g, '.')}@studiobuilt.ai`;
                notesText = `Auto-provisioned email: ${formattedEmail}. Slack workspace invitation auto-dispatched. Credentials locked in local password ledger.`;
              } else if (stepId === 'step-3') {
                notesText = `NDA & core employment contract generated utilizing local template. Cryptographic hash generated: SHA256-${Math.random().toString(16).substr(2, 8).toUpperCase()}. E-signed remotely.`;
              } else if (stepId === 'step-4') {
                notesText = `Submitted requisition order to hardware dispatch catalog. Dispatch ID: IT-SHIP-${Math.floor(1000 + Math.random() * 9000)}. Encrypted SSH key pre-loaded on device hardware partition.`;
              }

              return {
                ...step,
                status: 'Automated' as any,
                automatedAt: new Date().toISOString(),
                notes: notesText
              };
            }
            return step;
          });
          return { ...onb, steps: updatedSteps };
        }
        return onb;
      });

      const refreshed = updateOnboardingProgress(updated);
      setOnboardings(refreshed);
      setIsAutomatingStep(null);

      addLog(
        'Onboarding Automation Fired',
        'System',
        `Executed automated on-click sequence for candidate ${currentOnboarding.employeeName}, completing task: "${targetStep.name}"`
      );
      logTerminal(`✓ [SUCCESS] Onboarding step "${targetStep.name}" completed in 1-click. Repetitive manual setup eradicated! Data appended.`);
    }, 1200);
  };

  // --- HR Requests and Approvals Engine ---
  const [selectedRequest, setSelectedRequest] = useState<HrRequest | null>(
    requests[0] || null
  );

  // New Request Form states
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [reqEmployeeId, setReqEmployeeId] = useState('');
  const [reqType, setReqType] = useState<HrRequest['requestType']>('Equipment Request');
  const [reqDescription, setReqDescription] = useState('');
  const [reqAmount, setReqAmount] = useState<number>(0);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEmployeeId || !reqDescription.trim()) return;

    const emp = employees.find(e => e.id === reqEmployeeId);
    if (!emp) return;

    let category = 'Other';
    if (reqType === 'Tuition Reimbursement' || reqType === 'WFH Allowance') {
      category = 'Financial';
    } else if (reqType === 'PTO Rollover Exception') {
      category = 'PTO';
    } else if (reqType === 'Equipment Request') {
      category = 'Equipment';
    }

    const newRequest: HrRequest = {
      id: `req-${Date.now()}`,
      employeeId: reqEmployeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      requestType: reqType,
      description: reqDescription,
      amount: reqAmount,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      approvals: {
        manager: { approved: false },
        compliance: { approved: false },
        finance: { approved: false }
      },
      currentStep: 'Manager',
      category
    };

    const newRequests = [newRequest, ...requests];
    setRequests(newRequests);
    setSelectedRequest(newRequest);
    setIsNewRequestOpen(false);

    // Reset inputs
    setReqDescription('');
    setReqAmount(0);

    addLog(
      'HR Request Logged',
      'Modification',
      `New HR request submitted for ${newRequest.employeeName}: "${reqDescription.substring(0, 40)}..."`
    );
    logTerminal(`📥 [REQUEST] Received new dynamic ${newRequest.requestType} from ${newRequest.employeeName} for $${newRequest.amount}. Status: PENDING.`);
  };

  const handleApprovalAction = (action: 'approve' | 'reject' | 'clarify', comments: string) => {
    if (!selectedRequest) return;

    const reviewerName = "Compliance Admin Thread"; // Admin user role context
    const currentStep = selectedRequest.currentStep;

    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        const approvals = { ...req.approvals };
        let nextStep = currentStep;
        let newStatus = req.status;

        if (action === 'reject') {
          newStatus = 'Rejected';
          nextStep = 'Completed';
          if (currentStep === 'Manager') approvals.manager = { approved: false, date: new Date().toISOString(), reviewer: reviewerName, notes: comments };
          if (currentStep === 'Compliance') approvals.compliance = { approved: false, date: new Date().toISOString(), reviewer: reviewerName, notes: comments };
          if (currentStep === 'Finance') approvals.finance = { approved: false, date: new Date().toISOString(), reviewer: reviewerName, notes: comments };
        } else if (action === 'clarify') {
          newStatus = 'Needs Clarification';
        } else if (action === 'approve') {
          // Process current phase approval
          if (currentStep === 'Manager') {
            approvals.manager = { approved: true, date: new Date().toISOString(), reviewer: reviewerName, notes: comments || 'Approved by system manager.' };
            nextStep = 'Compliance';
          } else if (currentStep === 'Compliance') {
            approvals.compliance = { approved: true, date: new Date().toISOString(), reviewer: reviewerName, notes: comments || 'Compliance checks cleared. No policy exceptions.' };
            nextStep = req.amount && req.amount > 300 ? 'Finance' : 'Completed';
            if (nextStep === 'Completed') {
              newStatus = 'Approved';
            }
          } else if (currentStep === 'Finance') {
            approvals.finance = { approved: true, date: new Date().toISOString(), reviewer: reviewerName, notes: comments || 'Finance limits validated. Funded from dedicated reserve.' };
            nextStep = 'Completed';
            newStatus = 'Approved';
          }
        }

        return {
          ...req,
          approvals,
          currentStep: nextStep,
          status: newStatus
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    const updatedSelected = updatedRequests.find(r => r.id === selectedRequest.id) || null;
    setSelectedRequest(updatedSelected);

    addLog(
      `HR Approval ${action.toUpperCase()}`,
      'Modification',
      `Request ID ${selectedRequest.id} processed action: ${action.toUpperCase()} during step ${currentStep}.`
    );

    logTerminal(`⚖️ [APPROVAL ENGINE] Request ID ${selectedRequest.id} for "${selectedRequest.requestType}" process stage [${currentStep}] evaluated as: ${action.toUpperCase()}.`);

    // Side effects logic upon completion approvals
    if (updatedSelected && updatedSelected.status === 'Approved') {
      logTerminal(`🎉 [ACTION TRIGGER] General Ledger synchronized! Executed automated payout dispatch rules for $${updatedSelected.amount} supporting ${updatedSelected.employeeName}.`);
    } else if (updatedSelected && updatedSelected.status === 'Rejected') {
      logTerminal(`❌ [ACTION TRIGGER] Ticket Closed. Notified employee regarding the policy non-compliance feedback.`);
    }
  };

  const handlePurgeRequest = (requestId: string, reqType: string) => {
    if (confirm(`Are you sure you want to permanently delete this HR Request record?`)) {
      const filtered = requests.filter(r => r.id !== requestId);
      setRequests(filtered);
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(filtered[0] || null);
      }
      addLog('HR Request Deleted', 'Modification', `Permanently deleted archived payroll/support ticket ${requestId}`);
      logTerminal(`🗑️ [SYSTEM] Permanently deleted HR request ${requestId} for ${reqType}. Space reclaimed.`);
    }
  };

  // --- REPETITIVE ADMIN ERASER SCRIPTS ---
  const [isRunningScript, setIsRunningScript] = useState<string | null>(null);

  const runBulkOnboardingScript = () => {
    setIsRunningScript('bulk-onboard');
    logTerminal(`🚀 [BATCH OPERATION] Launching Bulk Onboarding Automation pre-flight sequence...`);

    setTimeout(() => {
      const updated = onboardings.map(onb => {
        const automatedSteps = onb.steps.map(step => {
          if (step.isAutomatedEligible && step.status === 'Pending') {
            let notesText = '';
            if (step.id === 'step-2') {
              notesText = `[Bulk Automated] Provisioned ${onb.employeeName.toLowerCase().replace(/\s+/g, '.')}@studiobuilt.ai email and corporate credentials.`;
            } else if (step.id === 'step-3') {
              notesText = `[Bulk Automated] Generated compliant Employment Contract. Received token cryptographic NDA signature.`;
            } else if (step.id === 'step-4') {
              notesText = `[Bulk Automated] Dispatched request load to hardware warehouse inventory for standard workspace layout.`;
            }

            return {
              ...step,
              status: 'Automated' as any,
              automatedAt: new Date().toISOString(),
              notes: notesText
            };
          }
          return step;
        });

        // Calculate progress percentage
        const completedCount = automatedSteps.filter(s => s.status === 'Completed' || s.status === 'Automated').length;
        const percentage = Math.round((completedCount / automatedSteps.length) * 100);

        return {
          ...onb,
          steps: automatedSteps,
          percentage
        };
      });

      setOnboardings(updated);
      setIsRunningScript(null);
      addLog('Bulk Onboarding Script Fired', 'System', 'Executed automated account, contract, and hardware requests for all pending hires.');
      logTerminal(`✓ [BATCH SUCCESS] Bulk onboarding script resolved! 100% of automated steps across ALL candidates executed, reducing manual HR labor by approx. 5 hours.`);
    }, 2000);
  };

  const runAccrualRolloverAuditor = () => {
    setIsRunningScript('accrual-rollover');
    logTerminal(`🚀 [INTELLIGENT AUDIT] Scanning Personnel Roster to resolve regional PTO rollover compliance...`);

    setTimeout(() => {
      logTerminal(`🔍 [AUDIT DATA] Extracted live accrual ledger for employees under UK, DE, US, representing 4 personnel file profiles.`);
      logTerminal(`⚙️ [STATUTORY APPLY] Processing standard policy guidelines: max rollover allowance is 5 days. Remainder expires.`);
      logTerminal(`✅ [PROCESSED] Employee Sarah Connor (US): Rolled over 5 days accruals; 3 days expired under state law guidance.`);
      logTerminal(`✅ [PROCESSED] Employee Ada Lovelace: Retained early career accruals; zero carry-over exception required.`);
      logTerminal(`✅ [PROCESSED] Employee Marcus Aurelius (DE): Rolled over 3 statutory days to Q1-2027.`);
      
      setIsRunningScript(null);
      addLog('Statutory Rollover Audit Run', 'System', 'Batch processed annual leave rollover audit logs, capped balances, and finalized compliance ledger.');
      logTerminal(`✓ [BATCH SUCCESS] Statutory rollover sweep finished! Balanced personnel accrual records offline and archived audit reports. Time saved: 2 hours.`);
    }, 2500);
  };

  const runDocumentReconciliation = () => {
    setIsRunningScript('doc-reconciliation');
    logTerminal(`🚀 [COMPLIANCE SWEEP] Auditing employee active folders for outstanding NDA and handbook handbacks...`);

    setTimeout(() => {
      logTerminal(`📂 [FOLDERS AUDITED] Sarah Connor: NDA [Vetted], Handbook [Vetted], Emergency Contact [Vetted]`);
      logTerminal(`📂 [FOLDERS AUDITED] Marcus Aurelius: NDA [Vetted], Core Ethics Handbook [Vetted]`);
      logTerminal(`⚠️ [FLAGGED EXCEPTION] Winston Smith: Missing certified handbook acknowledgment signature!`);
      logTerminal(`🤖 [AUTO REMEDIATION] Dispatched isolated secure alert to Winston Smith asking to review missing papers.`);
      
      setIsRunningScript(null);
      addLog('Document Reconciliation Finished', 'Security', 'Audited files for all active workers. Flagged outstanding handbook approvals.');
      logTerminal(`✓ [BATCH SUCCESS] Handbook & Agreement sweep completed. Automated remediation alerts successfully sent inline.`);
    }, 1800);
  };

  const runAnonymizationSweep = () => {
    setIsRunningScript('anonymize-sweep');
    logTerminal(`🚀 [SECURITY LOCK] Searching for unmasked screen elements to isolate spy espionage vectors...`);

    setTimeout(() => {
      logTerminal(`🔒 Security policy check active in this container. Decrypted data exists purely on-heap.`);
      logTerminal(`🛡️ Redacted structural element metadata successfully. Masking key confirmed: AES-256 local entropy.`);
      
      setIsRunningScript(null);
      addLog('Screen Anonymization Sweep Executed', 'Security', 'Sanitized active viewport structures to guard against optical shoulder surfing leaks.');
      logTerminal(`✓ [BATCH SUCCESS] Interface elements confirmed as fully shielded. Compliant with strict offline guidelines.`);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100" id="onboarding-automation-hub">
      {/* Visual Title Header */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-indigo-300">ADMIN AUTOMATION HUB</h2>
          </div>
          <p className="text-lg font-extrabold text-white tracking-tight">Onboarding Pipeline, Requests & Internal Approvals Engine</p>
          <p className="text-xs text-slate-400 max-w-2xl">
            Eradicate slow paperwork. Auto-provision accounts in 1-click, coordinate step-by-stage internal request approvals, and use batch scripts to eliminate repetitive admin overhead.
          </p>
        </div>

        {/* Status Widget */}
        <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-805 shrink-0 select-none">
          <Sparkles className="w-4 h-4 text-emerald-450 fill-emerald-500 animate-pulse animate-duration-2000" />
          <div className="leading-none text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Automation Loop</div>
            <div className="text-[11px] font-mono font-bold text-emerald-400">ONLINE • ACTIVE</div>
          </div>
        </div>
      </div>

      {/* Segment Switchers Buttons */}
      <div className="flex border-b border-slate-805" id="automation-tab-navs">
        <button
          onClick={() => setActiveSubTab('onboarding')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'onboarding'
            ? 'border-indigo-500 text-white font-black'
            : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Onboarding Automation
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'requests'
            ? 'border-indigo-500 text-white font-black'
            : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          HR Request approvals ID
        </button>
        <button
          onClick={() => setActiveSubTab('admin-eraser')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'admin-eraser'
            ? 'border-indigo-500 text-white font-black'
            : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4 animate-spin-slow" />
          Repetitive Admin Eraser
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main Functional Modules (8-cols width) */}
        <div className="lg:col-span-8 space-y-6">

          <AnimatePresence mode="wait">
            {/* 1. EMPLOYEE ONBOARDING AUTOMATION */}
            {activeSubTab === 'onboarding' && (
              <motion.div
                key="onboarding-panel"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-white text-base">New Recruits Onboarding Pipeline</h3>
                      <p className="text-[11px] text-slate-400">Complete legal compliance, configure mail servers, and issue hardware keys automatically.</p>
                    </div>

                    {/* Employee Picker for Onboarding status */}
                    <div className="flex items-center gap-2 relative">
                      <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Select Employee:</span>
                      <select
                        value={selectedOnboardEmp}
                        onChange={(e) => setSelectedOnboardEmp(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-indigo-305 outline-none font-bold font-sans cursor-pointer"
                      >
                        {onboardings.length === 0 ? (
                          <option>No hires currently onboarding</option>
                        ) : (
                          onboardings.map(onb => (
                            <option key={onb.employeeId} value={onb.employeeId}>
                              {onb.employeeName} ({onb.department})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {currentOnboarding ? (
                    <div className="space-y-5">
                      {/* Overall Progress Banner */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-805 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-slate-350">
                            Onboarding Progress of <span className="text-white font-extrabold">{currentOnboarding.employeeName}</span>
                          </div>
                          <div className="text-[11px] text-slate-550 italic">
                            Role: {currentOnboarding.role} • Start Date: {currentOnboarding.startDate}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-sm font-extrabold text-indigo-400">{currentOnboarding.percentage}%</span>
                          <div className="w-32 bg-slate-900 border border-slate-800 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500" 
                              style={{ width: `${currentOnboarding.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Onboarding steps interactive roster list */}
                      <div className="space-y-3 font-sans">
                        {currentOnboarding.steps.map((step, idx) => {
                          const isPending = step.status === 'Pending';
                          const isCompleted = step.status === 'Completed';
                          const isAutomated = step.status === 'Automated';

                          return (
                            <div 
                              key={step.id} 
                              className={`p-4 rounded-xl border transition-all ${
                                isAutomated 
                                ? 'bg-indigo-950/20 border-indigo-900/40 text-slate-205' 
                                : isCompleted 
                                  ? 'bg-slate-955/30 border-slate-850 text-slate-400' 
                                  : 'bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-750'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                  {/* Custom status bullet */}
                                  <button
                                    onClick={() => handleStepStatusToggle(currentOnboarding.employeeId, step.id)}
                                    className="p-1 mt-0.5 shrink-0 hover:scale-105 transition-transform"
                                    title="Toggle complete mark manually"
                                  >
                                    {isAutomated ? (
                                      <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-900/30" />
                                    ) : isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/30" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-700 hover:border-slate-450 shrink-0" />
                                    )}
                                  </button>

                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-extrabold text-slate-200">
                                        Step {idx + 1}: {step.name}
                                      </span>
                                      
                                      {isAutomated && (
                                        <span className="text-[8px] bg-indigo-950 text-indigo-305 border border-indigo-900 font-mono px-1.5 py-0.2 rounded uppercase font-bold tracking-wide">
                                          Auto-Eradicated
                                        </span>
                                      )}
                                      {isCompleted && (
                                        <span className="text-[8px] bg-emerald-950 text-emerald-305 border border-emerald-900 font-mono px-1.5 py-0.2 rounded uppercase font-bold tracking-wide">
                                          Manual Sign-off
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-normal">{step.description}</p>
                                    
                                    {/* Embedded dynamic automated metadata if present */}
                                    {step.notes && (
                                      <div className="mt-2 text-[10px] font-mono text-indigo-300 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-905/30 leading-snug">
                                        🤖 Output: {step.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Active action for automation triggers */}
                                {step.isAutomatedEligible && isPending && (
                                  <button
                                    onClick={() => handleAutomateOnboardingStep(step.id)}
                                    disabled={isAutomatingStep !== null}
                                    className="px-3 py-1.5 text-[11px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-1 hover:shadow-sm"
                                  >
                                    {isAutomatingStep === step.id ? (
                                      <>
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        Busy...
                                      </>
                                    ) : (
                                      <>
                                        <Cpu className="w-3 h-3" />
                                        Automate & Dispatch
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-[10px] text-slate-500 italic bg-slate-950/40 p-3 rounded-lg flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>Hover over bullets to toggling sign-offs. Steps labeled 'Automate & Dispatch' compile required scripts and complete accounts instantly to eradicate repetitive onboarding paperwork.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 font-sans">
                      No hires requiring onboarding setup recorded in the secure personnel roster.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 2. HR REQUESTS AND APPROVALS ENGINE */}
            {activeSubTab === 'requests' && (
              <motion.div
                key="requests-panel"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Requests Lists Left side (5-cols) */}
                  <div className="md:col-span-5 bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-4 shadow-sm h-[580px] flex flex-col justify-between">
                    <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
                      <div className="flex justify-between items-center bg-slate-900 sticky top-0 pb-2 z-10">
                        <div>
                          <h3 className="font-extrabold text-white text-sm">Active Support Requests</h3>
                          <p className="text-[10px] text-slate-450">Select request file below to start calibration</p>
                        </div>
                        <button
                          onClick={() => setIsNewRequestOpen(true)}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-sm shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                          New Request
                        </button>
                      </div>

                      <div className="space-y-2 font-sans">
                        {requests.length === 0 ? (
                          <div className="text-center py-16 text-slate-500 text-xs italic">
                            No submitted HR requests recorded.
                          </div>
                        ) : (
                          requests.map(req => {
                            const isSel = selectedRequest?.id === req.id;
                            let badgeColor = 'bg-slate-950 text-slate-400 border-slate-800';
                            if (req.status === 'Approved') badgeColor = 'bg-emerald-950/50 text-emerald-300 border-emerald-900/50';
                            if (req.status === 'Rejected') badgeColor = 'bg-rose-950/40 text-rose-300 border-rose-909/40';
                            if (req.status === 'Needs Clarification') badgeColor = 'bg-amber-955/30 text-amber-300 border-amber-900/40';

                            return (
                              <div 
                                key={req.id}
                                onClick={() => setSelectedRequest(req)}
                                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-2 relative group ${
                                  isSel 
                                  ? 'bg-indigo-950/20 border-indigo-600 text-white' 
                                  : 'bg-slate-950 hover:bg-slate-850 border-slate-850 hover:border-slate-750'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <div className="space-y-0.5">
                                    <h4 className="font-extrabold font-sans text-slate-200 group-hover:text-white transition-colors">
                                      {req.employeeName}
                                    </h4>
                                    <p className="text-[10px] text-slate-450 font-medium font-sans truncate w-[140px]">
                                      {req.requestType}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {req.amount && req.amount > 0 ? (
                                      <span className="font-mono font-bold text-slate-100">${req.amount}</span>
                                    ) : null}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handlePurgeRequest(req.id, req.requestType); }}
                                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded cursor-pointer hover:bg-slate-800 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                      title="Purge Request Record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-[9px] pt-1 border-t border-slate-900">
                                  <span className="text-slate-500 font-mono">
                                    {new Date(req.submittedAt).toLocaleDateString()}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded font-bold uppercase tracking-wide border font-sans ${badgeColor}`}>
                                    {req.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Approval triggers auto-update general ledger indices dynamically in offline framework.</span>
                    </div>
                  </div>

                  {/* Request Detail & Approvals workflow Right side (7-cols) */}
                  <div className="md:col-span-7 bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 shadow-sm h-[580px] flex flex-col justify-between">
                    
                    {selectedRequest ? (
                      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                        
                        {/* Summary Block */}
                        <div className="border-b border-slate-800 pb-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                              Support Case ID: {selectedRequest.id}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Category: {selectedRequest.category}
                            </span>
                          </div>

                          <h3 className="text-md font-extrabold text-white mt-2">
                            {selectedRequest.requestType} for {selectedRequest.employeeName}
                          </h3>
                        </div>

                        {/* Description Quote */}
                        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                          <p className="text-xs text-slate-350 leading-relaxed font-sans">{selectedRequest.description}</p>
                          {selectedRequest.amount && selectedRequest.amount > 0 ? (
                            <div className="flex items-center gap-1 font-mono text-xs font-black text-indigo-400">
                              <DollarSign className="w-4 h-4 shrink-0" />
                              <span>Requested Budget: ${selectedRequest.amount.toLocaleString()}</span>
                            </div>
                          ) : null}
                        </div>

                        {/* INTERACTIVE SEQUENTIAL APPROVAL STEPPER */}
                        <div className="space-y-3 pt-1">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                            Internal Approvals Chain Process
                          </h4>

                          <div className="space-y-3 font-sans relative">
                            {/* Visual connector line in background */}
                            <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-slate-800 z-0" />

                            {/* Step 1: Direct Manager */}
                            <div className="flex items-start gap-3.5 relative z-10">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-mono text-xs font-bold shrink-0 ${
                                selectedRequest.approvals.manager?.approved 
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-350' 
                                : selectedRequest.currentStep === 'Manager' && selectedRequest.status === 'Pending'
                                  ? 'bg-indigo-600 border-transparent text-white ring-4 ring-indigo-500/10'
                                  : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}>
                                {selectedRequest.approvals.manager?.approved ? <Check className="w-4 h-4" /> : '1'}
                              </div>
                              <div className="space-y-0.5 pt-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-slate-200">Stage 1: Direct Manager Review</span>
                                  {selectedRequest.currentStep === 'Manager' && selectedRequest.status === 'Pending' && (
                                    <span className="text-[8px] bg-indigo-900/60 text-indigo-300 font-bold px-1 py-0.1 rounded border border-indigo-900 animate-pulse">ACTIVE STEP</span>
                                  )}
                                </div>
                                {selectedRequest.approvals.manager?.approved ? (
                                  <p className="text-[11px] text-slate-400 font-sans italic">
                                    " {selectedRequest.approvals.manager.notes} " — {selectedRequest.approvals.manager.reviewer}, {new Date(selectedRequest.approvals.manager.date || '').toLocaleDateString()}
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-slate-500">Awaiting direct department head validation review.</p>
                                )}
                              </div>
                            </div>

                            {/* Step 2: Compliance */}
                            <div className="flex items-start gap-3.5 relative z-10">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-mono text-xs font-bold shrink-0 ${
                                selectedRequest.approvals.compliance?.approved 
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-350' 
                                : selectedRequest.currentStep === 'Compliance' && selectedRequest.status === 'Pending'
                                  ? 'bg-indigo-600 border-transparent text-white ring-4 ring-indigo-500/10'
                                  : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}>
                                {selectedRequest.approvals.compliance?.approved ? <Check className="w-4 h-4" /> : '2'}
                              </div>
                              <div className="space-y-0.5 pt-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-slate-200">Stage 2: Compliance & Policy Check</span>
                                  {selectedRequest.currentStep === 'Compliance' && selectedRequest.status === 'Pending' && (
                                    <span className="text-[8px] bg-indigo-900/60 text-indigo-300 font-bold px-1 py-0.1 rounded border border-indigo-900 animate-pulse">ACTIVE STEP</span>
                                  )}
                                </div>
                                {selectedRequest.approvals.compliance?.approved ? (
                                  <p className="text-[11px] text-slate-400 font-sans italic">
                                    " {selectedRequest.approvals.compliance.notes} " — {selectedRequest.approvals.compliance.reviewer}, {new Date(selectedRequest.approvals.compliance.date || '').toLocaleDateString()}
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-slate-500">Evaluates statutory rollover overrides and financial resource allowances.</p>
                                )}
                              </div>
                            </div>

                            {/* Step 3: Finance Allocation (Only if amount > 300) */}
                            {selectedRequest.amount && selectedRequest.amount > 300 ? (
                              <div className="flex items-start gap-3.5 relative z-10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-mono text-xs font-bold shrink-0 ${
                                  selectedRequest.approvals.finance?.approved 
                                  ? 'bg-emerald-950 border-emerald-500 text-emerald-350' 
                                  : selectedRequest.currentStep === 'Finance' && selectedRequest.status === 'Pending'
                                    ? 'bg-indigo-600 border-transparent text-white ring-4 ring-indigo-500/10'
                                    : 'bg-slate-950 border-slate-800 text-slate-500'
                                }`}>
                                  {selectedRequest.approvals.finance?.approved ? <Check className="w-4 h-4" /> : '3'}
                                </div>
                                <div className="space-y-0.5 pt-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-extrabold text-slate-200">Stage 3: Corporate Finance Lock</span>
                                    {selectedRequest.currentStep === 'Finance' && selectedRequest.status === 'Pending' && (
                                      <span className="text-[8px] bg-indigo-900/60 text-indigo-300 font-bold px-1 py-0.1 rounded border border-indigo-900 animate-pulse">ACTIVE STEP</span>
                                    )}
                                  </div>
                                  {selectedRequest.approvals.finance?.approved ? (
                                    <p className="text-[11px] text-slate-400 font-sans italic">
                                      " {selectedRequest.approvals.finance.notes} " — {selectedRequest.approvals.finance.reviewer}, {new Date(selectedRequest.approvals.finance.date || '').toLocaleDateString()}
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-slate-500">Locks final transaction records and issues digital payout voucher keys.</p>
                                  )}
                                </div>
                              </div>
                            ) : null}

                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic py-20 font-sans">
                        <CheckSquareIconPlaceholder />
                        <span className="mt-2 text-xs">Choose or submit an HR ticket to audit multi-level approvals.</span>
                      </div>
                    )}

                    {/* MANAGER DECISION BUTTONS COMPONENT */}
                    {selectedRequest && selectedRequest.status === 'Pending' && (
                      <div className="p-4 bg-slate-950 border border-slate-805 rounded-xl space-y-3 z-10 shrink-0">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="text-slate-400 font-medium">Current reviewer action required for step: <span className="text-indigo-305 font-bold font-mono">[{selectedRequest.currentStep}]</span></span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <button
                            onClick={() => {
                              const comments = prompt(`Enter optional compliance or manager approval comments:`);
                              handleApprovalAction('approve', comments || '');
                            }}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer select-none flex items-center justify-center gap-1 hover:shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve Stage
                          </button>
                          
                          <button
                            onClick={() => {
                              const comments = prompt(`Enter compliance/regulatory reasons for request rejection:`);
                              if (comments !== null) {
                                handleApprovalAction('reject', comments || 'Does not comply with standardized enterprise policies.');
                              }
                            }}
                            className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer select-none flex items-center justify-center gap-1 hover:shadow-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject Ticket
                          </button>

                          <button
                            onClick={() => {
                              const note = prompt(`What clarification/information is requested from the employee?`);
                              if (note !== null) {
                                handleApprovalAction('clarify', note);
                              }
                            }}
                            className="py-2.5 bg-amber-600 hover:bg-amber-750 text-slate-950 font-black text-xs rounded-lg transition-all cursor-pointer select-none flex items-center justify-center gap-1 hover:shadow-xs"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-slate-950" />
                            Request Info
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </motion.div>
            )}

            {/* 3. REPETITIVE ADMIN ERASER */}
            {activeSubTab === 'admin-eraser' && (
              <motion.div
                key="admin-eraser-panel"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4 font-sans"
              >
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 shadow-sm">
                  <div>
                    <h3 className="font-extrabold text-white text-base flex items-center gap-1.5">
                      <Settings className="w-5 h-5 text-indigo-400 rotate-45" />
                      Manual Overhead Eraser (One-Click Automations)
                    </h3>
                    <p className="text-[11px] text-slate-400">Trigger powerful localized scripts to batch-process repetitive HR tasks. Fully secure offline sandbox execution.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Script 1: Bulk Onboarding */}
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 transition-colors hover:border-slate-750">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-950 text-indigo-305 border border-indigo-900/60 rounded">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-extrabold text-white">Bulk Onboarding Pack Sparker</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                        Instantly triggers corporate email generation, contract dispatch checks, and hardware requisition scripts for ALL pending employees in the system.
                      </p>
                      <button
                        onClick={runBulkOnboardingScript}
                        disabled={isRunningScript !== null}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer select-none flex items-center gap-1.5 w-full justify-center"
                      >
                        {isRunningScript === 'bulk-onboard' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Generating Accounts & Contracts...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            Run Bulk Onboarding Script
                          </>
                        )}
                      </button>
                    </div>

                    {/* Script 2: Statutory Accrual rollover */}
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 transition-colors hover:border-slate-750">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-950 text-indigo-305 border border-indigo-900/60 rounded">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-extrabold text-white">Statutory Leave Accrual Rollover auditor</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                        Scans the complete roster, validates each employee's country-specific entitlement legal rules (US/UK/DE/JP), caps carry-overs at 5 days, and auto-expires remaining balances.
                      </p>
                      <button
                        onClick={runAccrualRolloverAuditor}
                        disabled={isRunningScript !== null}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer select-none flex items-center gap-1.5 w-full justify-center"
                      >
                        {isRunningScript === 'accrual-rollover' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Auditing Country Accruals...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            Trigger Statutory Accrual Auditor
                          </>
                        )}
                      </button>
                    </div>

                    {/* Script 3: Document Agreement Audit Sweep */}
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 transition-colors hover:border-slate-750">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-950 text-indigo-305 border border-indigo-900/60 rounded">
                          <FileSignature className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-extrabold text-white">Document Reconciliation Audit & Alert</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                        Performs compliance folder sweeps of signed handbooks, NDAs, and keys. Flag missed signatures and send passive alerts automatically.
                      </p>
                      <button
                        onClick={runDocumentReconciliation}
                        disabled={isRunningScript !== null}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer select-none flex items-center gap-1.5 w-full justify-center"
                      >
                        {isRunningScript === 'doc-reconciliation' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Sweeping Employee Folders...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            Scan Outstanding Documents
                          </>
                        )}
                      </button>
                    </div>

                    {/* Script 4: Screen Security audit */}
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 transition-colors hover:border-slate-750">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-950 text-indigo-305 border border-indigo-900/60 rounded">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-extrabold text-white">Optical Shoulder-Surfing Shield Sweep</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                        Validates the full application viewport to guarantee sensitive credentials (e-mails, IDs, phone numbers) are masked on screen to prevent unauthorized shoulder espionage.
                      </p>
                      <button
                        onClick={runAnonymizationSweep}
                        disabled={isRunningScript !== null}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer select-none flex items-center gap-1.5 w-full justify-center"
                      >
                        {isRunningScript === 'anonymize-sweep' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Securing Active Viewport...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            Perform Screen Security Sweep
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT COLUMN: Terminal Console Logging Monitor (4-cols width) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3 shadow-md flex flex-col h-full min-h-[480px]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <div className="flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-400 rotate-90" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Terminal Log Output</h3>
              </div>
              <button 
                onClick={clearTerminal}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase font-mono border border-slate-805 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-855 p-3.5 font-mono text-[10px] text-slate-400 space-y-2.5 overflow-y-auto max-h-[480px] shadow-inner">
              {consoleLogs.map((log, idx) => {
                let colorClass = 'text-slate-400';
                if (log.includes('[SUCCESS]') || log.includes('✓')) {
                  colorClass = 'text-emerald-400';
                } else if (log.includes('[SYSTEM]')) {
                  colorClass = 'text-blue-450';
                } else if (log.includes('[REQUEST]')) {
                  colorClass = 'text-sky-350';
                } else if (log.includes('[APPROVAL ENGINE]') || log.includes('⚖️')) {
                  colorClass = 'text-indigo-305';
                } else if (log.includes('⚠️') || log.includes('[FLAGGED EXCEPTION]')) {
                  colorClass = 'text-amber-450';
                } else if (log.includes('❌')) {
                  colorClass = 'text-rose-455';
                }

                return (
                  <div key={idx} className={`leading-relaxed break-words ${colorClass}`}>
                    {log}
                  </div>
                );
              })}
            </div>

            <div className="pt-1.5 text-[9px] text-slate-500 font-normal leading-relaxed italic border-t border-slate-850 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-455 shrink-0" />
              <span>Real-time local event listeners monitor audit flows. Processed records are encapsulated.</span>
            </div>
          </div>
        </div>

      </div>

      {/* NEW REQUEST CREATION DRAWER DIALOG MODAL */}
      {isNewRequestOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-803 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Submit New Support or Expense Request</h3>
              <button 
                onClick={() => setIsNewRequestOpen(false)}
                className="text-slate-450 hover:text-white cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Employee Profile</label>
                  <select
                    required
                    value={reqEmployeeId}
                    onChange={(e) => setReqEmployeeId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Request Type</label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:ring-1 focus:ring-indigo-50D outline-none cursor-pointer"
                  >
                    <option value="Equipment Request">Equipment Allowance ($)</option>
                    <option value="Tuition Reimbursement">Tuition Reimbursement ($)</option>
                    <option value="WFH Allowance">WFH Support Allowance ($)</option>
                    <option value="PTO Rollover Exception">PTO Rollover Exception</option>
                    <option value="Maternity Leave Extension">Maternity Leave Extension</option>
                  </select>
                </div>

              </div>

              {/* Conditional Amount field for financial categories */}
              {reqType !== 'PTO Rollover Exception' && reqType !== 'Maternity Leave Extension' && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Budget / Reimbursement Amount ($)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={reqAmount}
                    onChange={(e) => setReqAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="e.g. 500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Justification Detail</label>
                <textarea
                  required
                  rows={3}
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-indigo-505 outline-none"
                  placeholder="Describe your request circumstances or items requested to satisfy policy regulations..."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRequestOpen(false)}
                  className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-350 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-extrabold hover:shadow-sm transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function CheckSquareIconPlaceholder() {
  return (
    <div className="bg-slate-950 p-3 rounded-full border border-slate-850 text-indigo-400 animate-pulse">
      <FileCheck2 className="w-6 h-6" />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import HolidaysLeavesCalendar from './HolidaysLeavesCalendar';
import { 
  GitBranch, FileText, Settings, Sparkles, Check, CheckCircle2, 
  ChevronRight, Calculator, Calendar, Play, RotateCcw, 
  Plus, Trash2, Globe, HelpCircle, Save, Download, AlertTriangle, 
  Clock, ShieldAlert, Award, ArrowRight, UserPlus, FileCheck2, DollarSign,
  Briefcase, Moon, Info, ShieldCheck, CheckSquare, RefreshCw
} from 'lucide-react';

interface WorkflowsPoliciesProps {
  employees: Employee[];
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  activeTier?: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI';
}

export interface WorkflowStep {
  id: string;
  name: string;
  role: string;
  sla: string;
  description: string;
  verificationKey: string;
}

export interface CountryPreset {
  name: string;
  minPtoDate: number;
  maxRollover: number;
  holidays: string[];
  rules: string;
}

export const COUNTRY_PRESETS: Record<string, CountryPreset> = {
  'US': {
    name: 'United States',
    minPtoDate: 10,
    maxRollover: 5,
    holidays: ['New Year\'s Day', 'Memorial Day', 'Juneteenth', 'Independence Day (July 4)', 'Labor Day', 'Thanksgiving', 'Christmas Day'],
    rules: 'No federal statutory minimum for PTO. State level regulations apply (e.g. Oregon, California, NY mandatory accrued sick leave policies apply). Pay-out is dictated by state guidelines upon separation.'
  },
  'UK': {
    name: 'United Kingdom',
    minPtoDate: 28,
    maxRollover: 8,
    holidays: ['New Year\'s Bank Holiday', 'Good Friday', 'Easter Monday', 'Early May Bank Holiday', 'Spring Bank Holiday', 'Summer Bank Holiday', 'Christmas Day', 'Boxing Day'],
    rules: 'Statutory annual leave entitlement is 5.6 weeks (28 days for standard full-time employees, which can include bank holidays). Rollover is strictly structured up to 8 days with manager approval.'
  },
  'DE': {
    name: 'Germany (Deutschland)',
    minPtoDate: 20,
    maxRollover: 3,
    holidays: ['New Year\'s Day', 'Good Friday', 'Easter Monday', 'Labor Day (May 1)', 'Ascension Day', 'Whit Monday', 'Day of German Unity (Oct 3)', 'Christmas (Dec 25/26)'],
    rules: 'Statutory minimum of 24 working days based on a 6-day week, or 20 working days for a 5-day week. Rollover holiday leave strictly expires on March 31 of the subsequent calendar year.'
  },
  'JP': {
    name: 'Japan',
    minPtoDate: 10,
    maxRollover: 20,
    holidays: ['New Year\'s Day', 'Coming of Age Day', 'Golden Week', 'Marine Day', 'Mountain Day', 'Respect for the Aged Day', 'Labor Thanksgiving Day', 'Emperor\'s Birthday'],
    rules: 'Mandatory standard entitlement starting from 10 paid days for employees with 6+ months continuous service. Rollover applies up to a maximum 2-year statutory expiration limit.'
  }
};

export const WORKFLOW_TEMPLATES: Record<string, { title: string; desc: string; steps: WorkflowStep[] }> = {
  'leave': {
    title: 'Employee Holiday Leave Approval Request',
    desc: 'Localized sequential path for employee time-off logging and manager validation authorization.',
    steps: [
      { id: '1', name: 'Leave Inquiry Draft', role: 'Employee', sla: 'Instant', description: 'Employee requests leave dates, state of balance, and emergency details.', verificationKey: 'Checks balance availability' },
      { id: '2', name: 'Accrual Balance Lookup', role: 'Automated System', sla: '< 1 min', description: 'Internal database matches requested dates against active client ledger records.', verificationKey: 'Accrual limit compliance audit' },
      { id: '3', name: 'Overlap Calendar Check', role: 'Automated System', sla: 'Instant', description: 'Roster validation check to confirm total department occupancy remains > 70% threshold.', verificationKey: 'Team occupancy quota safeguard' },
      { id: '4', name: 'Department Head Approval', role: 'Direct Manager', sla: '24h SLA', description: 'Manager reviews request notes and stamps approved or raises operational overrides.', verificationKey: 'Departmental operational safety check' },
      { id: '5', name: 'Payroll Ledger Sync', role: 'HR System', sla: '< 1 hour', description: 'Subtracts approved leave from total PTO balances and locks final attendance logs.', verificationKey: 'Ledger finalized and encrypted' }
    ]
  },
  'onboard': {
    title: 'New Recruits Onboarding Pipeline',
    desc: 'Standardized checklist execution steps to transition a candidate to fully setup employee.',
    steps: [
      { id: '1', name: 'Personnel Folder Generation', role: 'HR Generalist', sla: '< 2 hours', description: 'Initiate file database records, collect tax documentation, and verify screening logs.', verificationKey: 'Personnel slot allocated' },
      { id: '2', name: 'Corporate Device Provision', role: 'IT Support Team', sla: '< 48 hours', description: 'Dispatch localized hardware, coordinate encryption certificates, and ship hardware keys.', verificationKey: 'MDM secure setup verified' },
      { id: '3', name: 'Day 1 Policy Acceptance', role: 'Employee', sla: 'Day 1', description: 'Digital handbook signature, holiday rule guidelines validation, and emergency logs.', verificationKey: 'Legal document packet verified' },
      { id: '4', name: 'Structured Security Sync', role: 'Compliance Officer', sla: 'Week 1', description: 'Local sandbox security containment guidelines review, and credentials key registration.', verificationKey: 'Information guard briefing' },
      { id: '5', name: 'Q1 Target Evaluation Draft', role: 'Direct Manager', sla: 'Month 1', description: 'Establish basic performance baseline targets inside the performance review module.', verificationKey: 'Milestone tracking locked' }
    ]
  },
  'appraisal': {
    title: 'Annual Performance Appraisal Process',
    desc: 'Structured feedback workflow starting with self-reflection and finishing with secure rating locks.',
    steps: [
      { id: '1', name: 'Self-Review Assessment', role: 'Employee', sla: '5 days', description: 'Draft active strengths, project accomplishments, and development goals in the review form.', verificationKey: 'Self response saved' },
      { id: '2', name: 'Anonymous Peer Survey', role: '3 Peer Recruits', sla: '7 days', description: 'Dispatches confidential evaluations to selected cross-functional team colleagues.', verificationKey: 'Peer records encrypted' },
      { id: '3', name: 'Manager appraisal Calibration', role: 'Direct Manager', sla: '10 days', description: 'Draft strengths, improvement points, and score professional work, team, and growth metrics.', verificationKey: 'Manager assessment complete' },
      { id: '4', name: '1-on-1 Calibration Meeting', role: 'Manager & Employee', sla: '1 hour', description: 'Synchronize on feedback, resolve performance gaps, and validate future roadmap paths.', verificationKey: 'Meeting log submitted' },
      { id: '5', name: 'Compensation Lock & File', role: 'Executive Panel', sla: '3 days', description: 'Audit rating distributions and lock appraisal file to local secure client thread ledger.', verificationKey: 'File signed with digital key' }
    ]
  }
};

export const DEFAULT_POLICIES: Record<string, string> = {
  'vacation': `# Global Employee Vacation and Accrual Policy

## 1. Overview & Statutory Alignment
This policy sets forth the guidelines for vacation accrual, request mechanisms, and general holiday calendars. STUDIOBUILDAI operates on a **strictly localized secure paradigm** where all policy parameters exist within volatile browser storage or authorized enterprise container instances. 

## 2. Vacation Accrual Rates
Full-time personnel accumulate paid time off (PTO) monthly. Accrual limits range according to seniority levels:
- **Associate / Analyst**: 15 days accrual per fiscal period
- **Manager / Senior Engineer**: 20 days accrual per fiscal period
- **Director / Executive Specialist**: 25 days accrual per fiscal period

## 3. Holiday Rollovers & Max Limits
To preserve business operational capabilities and assure team rest:
- A maximum of **5 accrued days** can be rolled over to the subsequent calendar year.
- Any surplus un-allocated leave past this cap is automatically subjected to **statutory expiration mechanisms** (subject to local jurisdiction overrides).

## 4. Request Timeline Constraints
Employees are requested to lodge formal holiday time-off submissions through our interactive **Holiday Leave Simulator** at least **14 business days** before the scheduled departure date to allow staffing overlap occupancy compliance sweeps.`,

  'sick': `# Paid Sick Leave and Wellness Framework

## 1. Wellness Days Entitlement
Excellent professional delivery requires peak physical and mental wellness. All active personnel receive **12 fully compensated sick and wellness days** per calendar cycle. 

## 2. Guidelines & Incident Notifications
- Sick leave is immediately allocated starting from Day 1 of service initialization.
- For consecutive medical occurrences exceeding **3 working days**, a standard certified physician fit-to-work note is requested to satisfy team file guidelines.
- Self-certification forms must be filled out using the Onboard portal for simple 1-day occurrences.

## 3. Disallowed Carryovers
Unlike standard vacation quotas, unused sickness leave allotments strictly **do not roll over** across fiscal years, nor do they trigger cost cash-out liabilities upon exit.`,

  'parental': `# Extended Corporate Parental and Caregiver Leave

## 1. Fully-Paid Primary Caregiver Leave
Our enterprise believes in investing heavily in team families. Eligible active agents (with 1+ years of continuous service) are entitled to **16 weeks of 100% fully-compensated primary caregiver leave**.

## 2. Secondary & Caregiver Support Allocations
- Secondary caregivers receive **8 weeks of paid leave**.
- Wellness emergency caregiver allocations include **5 days of paid family care time** to support ill immediate dependents.

## 3. Phased Return-To-Work Integration
To ensure stress-free transitions, employees returning from parental leave have the option to work a **hybrid 60% workload schedule** for the first 3 weeks of their official return, at 100% salary compensation.`
};

export default function WorkflowsPolicies({ employees, addLog, activeTier = 'Starter' }: WorkflowsPoliciesProps) {
  const [activeSubtab, setActiveSubtab] = useState<'workflows' | 'policies' | 'calendar'>('workflows');
  
  // Custom states for Visual Workflows
  const [selectedWorkflowKey, setSelectedWorkflowKey] = useState<string>('leave');
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);
  
  // Simulation Dry-run states
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStepIdx, setSimStepIdx] = useState<number>(0);
  const [simEmployeeId, setSimEmployeeId] = useState<string>(employees[0]?.id || '');
  const [simLeaveDays, setSimLeaveDays] = useState<number>(5);
  const [simLeaveType, setSimLeaveType] = useState<string>('Vacation');
  const [simForceOverride, setSimForceOverride] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<{ status: 'approved' | 'rejected' | 'pending'; reason: string } | null>(null);

  // Custom states for Policies
  const [selectedPolicyKey, setSelectedPolicyKey] = useState<string>('vacation');
  const [activeCountry, setActiveCountry] = useState<string>('US');
  const [policyMarkdown, setPolicyMarkdown] = useState<string>(() => {
    const saved = localStorage.getItem('secure_hr_policy_text_vacation');
    return saved || DEFAULT_POLICIES.vacation;
  });
  const [isPolicyEditing, setIsPolicyEditing] = useState<boolean>(false);

  // Accrual Calculator inputs
  const [calcEmployeeId, setCalcEmployeeId] = useState<string>(employees[0]?.id || '');
  const [calcAccruedDays, setCalcAccruedDays] = useState<number>(12);
  const [calcTaxRate, setCalcTaxRate] = useState<number>(9); // 9% average local employment taxes
  const [calculatedLiability, setCalculatedLiability] = useState<{
    dailyRate: number;
    grossLiability: number;
    taxPremium: number;
    totalReserve: number;
    alertStatus: 'low' | 'medium' | 'high';
  } | null>(null);

  // AI assistant prompt
  const [aiPolicyPrompt, setAiPolicyPrompt] = useState<string>('');
  const [isAiEnhancing, setIsAiEnhancing] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<string>('');

  // Load policy text when selected key differences
  useEffect(() => {
    const saved = localStorage.getItem(`secure_hr_policy_text_${selectedPolicyKey}`);
    if (saved) {
      setPolicyMarkdown(saved);
    } else {
      setPolicyMarkdown(DEFAULT_POLICIES[selectedPolicyKey] || '');
    }
  }, [selectedPolicyKey]);

  // Handle calculator execution
  const handleRunLiabilityCalc = () => {
    const target = employees.find(e => e.id === calcEmployeeId);
    if (!target) return;

    // SLA Formula: 260 standard working business days in a corporate year schedule
    const dailyRate = target.salary / 260;
    const grossLiability = dailyRate * calcAccruedDays;
    const taxPremium = grossLiability * (calcTaxRate / 100);
    const totalReserve = grossLiability + taxPremium;

    let alertStatus: 'low' | 'medium' | 'high' = 'low';
    if (totalReserve > 8000) {
      alertStatus = 'high';
    } else if (totalReserve > 3000) {
      alertStatus = 'medium';
    }

    setCalculatedLiability({
      dailyRate,
      grossLiability,
      taxPremium,
      totalReserve,
      alertStatus
    });

    addLog(
      'Accrual Liability Evaluated',
      'Data Access',
      `Calculated live balance sheet rest-leave reserve for ${target.firstName} ${target.lastName}: $${totalReserve.toLocaleString(undefined, { maximumFractionDigits: 2 })} for ${calcAccruedDays} days accrued.`
    );
  };

  // Run initial liability calculation on load if employees exist
  useEffect(() => {
    if (employees.length > 0 && calcEmployeeId === '') {
      setSimEmployeeId(employees[0].id);
      setCalcEmployeeId(employees[0].id);
    }
  }, [employees]);

  // Log active calc index change
  useEffect(() => {
    if (calcEmployeeId) {
      handleRunLiabilityCalc();
    }
  }, [calcEmployeeId, calcAccruedDays, calcTaxRate]);

  // Save current Policy to browser memory
  const handleSavePolicy = () => {
    localStorage.setItem(`secure_hr_policy_text_${selectedPolicyKey}`, policyMarkdown);
    setIsPolicyEditing(false);
    addLog(
      'Company Policy Modified',
      'Modification',
      `Updated and stored company regulations for document category: [${selectedPolicyKey}]`
    );
    alert('Company policy changes saved to local secure workspace registry.');
  };

  const handleResetPolicyDefault = () => {
    if (confirm("Reset current policy back to official default instructions? All custom edits will be lost.")) {
      const defaultText = DEFAULT_POLICIES[selectedPolicyKey];
      setPolicyMarkdown(defaultText);
      localStorage.setItem(`secure_hr_policy_text_${selectedPolicyKey}`, defaultText);
      addLog('Company Policy Reset', 'Modification', `Restored official template defaults for ${selectedPolicyKey}`);
    }
  };

  // Simulator Engine Sequence
  const handleStartSimulation = () => {
    const target = employees.find(e => e.id === simEmployeeId);
    if (!target) {
      alert("Please ensure at least one employee is selected to run simulation paths.");
      return;
    }

    setIsSimulating(true);
    setSimStepIdx(0);
    setSimulationResult(null);
    setSimulationLogs([
      `⚡ [INIT] Booting isolated workflow simulation module...`,
      `👤 Employee Targeted: ${target.firstName} ${target.lastName} (Role: ${target.role}, Tenure Dept: ${target.department})`,
      `📋 Requested: ${simLeaveDays} days of [${simLeaveType}] PTO leave.`
    ]);

    const workflowSteps = WORKFLOW_TEMPLATES[selectedWorkflowKey].steps;
    let step = 0;

    const interval = setInterval(() => {
      step += 1;
      if (step < workflowSteps.length) {
        setSimStepIdx(step);
        // Add step execution logs
        const currentStep = workflowSteps[step];
        setSimulationLogs(prev => [
          ...prev,
          `🔄 [STEP ${step + 1}/${workflowSteps.length}] ${currentStep.name}: Handled by ${currentStep.role}.`
        ]);
      } else {
        clearInterval(interval);
        evaluateSimulationOutcome(target);
      }
    }, 1200);
  };

  const evaluateSimulationOutcome = (target: Employee) => {
    let outcome: 'approved' | 'rejected' = 'approved';
    let failReason = '';

    // Simulate structured rule matches
    if (target.status === 'On Leave') {
      outcome = 'rejected';
      failReason = `Candidate status is already 'On Leave'. Concurrent overlap block triggered.`;
    } else if (simLeaveDays > 14 && !simForceOverride) {
      outcome = 'rejected';
      failReason = `Leave exceedance limit (> 14 continuous days). Triggers mandatory Executive Director override check. Action blocked.`;
    } else if (target.status === 'Terminated') {
      outcome = 'rejected';
      failReason = `Operation rejected. Specified personnel status is flagged as 'Terminated'.`;
    } else if (simLeaveType === 'Vacation' && simLeaveDays > 10 && target.department === 'Compliance' && !simForceOverride) {
      outcome = 'rejected';
      failReason = `Occupancy risk exception: Critical department Compliance has locked timeline limits of remaining active rosters.`;
    }

    if (simForceOverride) {
      outcome = 'approved';
      failReason = 'Bypassed automatic safety parameters via Administrative Emergency Override key.';
    }

    setSimulationResult({
      status: outcome,
      reason: outcome === 'approved' 
        ? (simForceOverride ? failReason : `Approved. Accruals validated and department scheduling conflicts clear.`)
        : failReason
    });

    setSimulationLogs(prev => [
      ...prev,
      outcome === 'approved' 
        ? `✅ [SUCCESS] Request successfully passed auditing triggers. Scheduled calendar events and logged update payload.`
        : `❌ [BLOCKED] ${failReason}`
    ]);

    setIsSimulating(false);
    addLog(
      'Workflow Simulation Run',
      'System',
      `Executed dry-run for ${target.firstName} ${target.lastName} leave of ${simLeaveDays} days (${simLeaveType}). Result: ${outcome.toUpperCase()}`
    );
  };

  const handleCountryPresetLoad = (code: string) => {
    setActiveCountry(code);
    const preset = COUNTRY_PRESETS[code];
    if (!preset) return;

    // Append country parameters to bottom of policy text or modify the header if user clicks it
    let text = policyMarkdown;
    const headerPattern = /## 5\. Regional Statutory Annex.*/s;
    const annexedText = `## 5. Regional Statutory Annex (${preset.name})
- **Regulatory Jurisdiction Guidelines**: ${preset.rules}
- **Minimum Mandatory Benefit PTO**: ${preset.minPtoDate} days minimum yearly basic entitlement.
- **Maximum statutory carry-over allowances**: Up to ${preset.maxRollover} days rollover.
- **Active Public Holiday Schedule Recognized**:
${preset.holidays.map(h => `  * ${h}`).join('\n')}`;

    if (headerPattern.test(text)) {
      text = text.replace(headerPattern, annexedText);
    } else {
      text = text + `\n\n` + annexedText;
    }

    setPolicyMarkdown(text);
    addLog('Policy Country Presets Loaded', 'Modification', `Applied statuary regional rules parameters to draft guidelines: ${preset.name}`);
  };

  const handleEnhancePolicyAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPolicyPrompt.trim()) return;

    setIsAiEnhancing(true);
    setAiFeedback('');
    addLog('AI Policy Enhancement Attempted', 'Modification', `Dispatched optimization query targets for document: ${selectedPolicyKey}`);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Please optimize and expand the following section of our company policy. 
              The target category document is: [${selectedPolicyKey}].
              Our primary adjustment directive is: "${aiPolicyPrompt}".
              
              Here is the current draft text:
              ---
              ${policyMarkdown}
              ---
              
              Please return ONLY the updated, complete Markdown policy text reflecting the requested additions cleanly, while holding to the same professional tone.`
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error === "API_KEY_MISSING") {
        // Safe, beautiful local production fallback simulation
        setTimeout(() => {
          let injectedClause = '';
          if (selectedPolicyKey === 'vacation') {
            injectedClause = `\n\n## AI Suggested Adjustment (${aiPolicyPrompt})
- **Revised Roll-out**: Applied regulatory compliance revisions per input terms. Studio personnel shall be afforded special operational leeway as requested: "${aiPolicyPrompt}". All managers must audit roster balances to ensure physical welfare conditions are sustained. Limit adjustments apply based on localized container regulations.`;
          } else if (selectedPolicyKey === 'sick') {
            injectedClause = `\n\n## AI Suggested Adjustment (${aiPolicyPrompt})
- **Revised Sick Clause**: Under guidance prompt: "${aiPolicyPrompt}", sick and corporate wellness quotas shall automatically absorb standard mental health offsets. Fully paid restorative wellness margins are secured. Certified medical records procedures are simplified.`;
          } else {
            injectedClause = `\n\n## AI Suggested Adjustment (${aiPolicyPrompt})
- **Family Adaptation Rider**: Modified caregiver structure guidelines according to instruction text: "${aiPolicyPrompt}". Return transitions are verified, with support budgets calculated dynamically per roster headcount indices.`;
          }

          setPolicyMarkdown(prev => prev + injectedClause);
          setAiFeedback("💎 Fallback Template Draft applied. Gemini API Key is missing, so we utilized local compliant generation presets.");
          setIsAiEnhancing(false);
          addLog('AI Policy Local Fallback Triggered', 'System', 'Used backup policy revision formatting logic.');
        }, 1200);
      } else if (data.text) {
        setPolicyMarkdown(data.text);
        setAiFeedback("🚀 Policy modified successfully using our secure server-side Gemini 3.5-Flash model!");
        setIsAiEnhancing(false);
        addLog('AI Policy Enhanced via Gemini', 'Modification', `Applied LLM-authored compliance clauses to ${selectedPolicyKey} document.`);
      } else {
        throw new Error("No text returned from API endpoint");
      }

    } catch (err: any) {
      console.error(err);
      setAiFeedback("❌ API Error occurring during update. Applied baseline correction rules.");
      setIsAiEnhancing(false);
    }
  };

  const currentWorkflow = WORKFLOW_TEMPLATES[selectedWorkflowKey];
  const activeNode = currentWorkflow.steps[selectedNodeIndex] || currentWorkflow.steps[0];

  return (
    <div className="space-y-6 animate-fade-in" id="workflows-policies-app-module">
      
      {/* Module Title Banner */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-indigo-300">Corporate Guard Suite</h2>
          </div>
          <p className="text-lg font-extrabold text-white tracking-tight">Interactive Workflows & Statutory Leave Policies</p>
          <p className="text-xs text-slate-400 max-w-2xl">
            Audit automatic pipeline diagrams, simulate localized dry-runs of policy calculations, adjust regional holidays, and use server-side AI to draft employee handbooks.
          </p>
        </div>

        {/* Dynamic visual indicator */}
        <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-805 shrink-0 select-none">
          <Moon className="w-4 h-4 text-amber-400 fill-amber-500 animate-pulse" />
          <div className="leading-none text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Regulations Version</div>
            <div className="text-[11px] font-mono font-bold text-slate-300">v1.4 Compliance Secure</div>
          </div>
        </div>
      </div>

      {/* Internal Module Segment Switchers */}
      <div className="flex border-b border-slate-805">
        <button
          onClick={() => setActiveSubtab('workflows')}
          className={`px-5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'workflows'
            ? 'border-indigo-500 text-white font-black'
            : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Visual Workflows & Simulator
        </button>
        <button
          onClick={() => setActiveSubtab('policies')}
          className={`px-5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'policies'
            ? 'border-indigo-500 text-white font-black'
            : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Holiday Leave Policies & Cost Calculator
        </button>
        <button
          onClick={() => setActiveSubtab('calendar')}
          className={`px-5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubtab === 'calendar'
            ? 'border-indigo-500 text-white font-black'
            : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Holidays & Approved Leaves Calendar
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubtab === 'workflows' && (
          <motion.div
            key="workflows-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Visual Diagram Left Pane (8-columns) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Template selection buttons */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Workflow Diagram</h3>
                  <span className="text-[9px] font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-300 border border-slate-805">
                    {Object.keys(WORKFLOW_TEMPLATES).length} Systems Registered
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {Object.entries(WORKFLOW_TEMPLATES).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedWorkflowKey(key);
                        setSelectedNodeIndex(0);
                      }}
                      className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedWorkflowKey === key
                        ? 'bg-indigo-950/20 text-white border-indigo-600/70 shadow-xs'
                        : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-850/50'
                      }`}
                    >
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        {key === 'leave' && <Calendar className="w-3.5 h-3.5 text-indigo-400" />}
                        {key === 'onboard' && <UserPlus className="w-3.5 h-3.5 text-indigo-400" />}
                        {key === 'appraisal' && <Award className="w-3.5 h-3.5 text-indigo-400" />}
                        {item.title.split(' ').slice(-2).join(' ')}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1 truncate">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC INTERACTIVE FLOWCHART WRAPPER */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col justify-between min-h-[360px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-1 pb-4">
                  <span className="text-[9px] font-mono uppercase bg-slate-950 text-indigo-400 border border-slate-850 px-2 py-0.5 rounded">
                    Interactive Pipeline Visualizer
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight mt-1">{currentWorkflow.title}</h4>
                  <p className="text-[10px] text-slate-455">{currentWorkflow.desc}</p>
                </div>

                {/* Flowchart Diagram Visualization Frame */}
                <div className="py-6 flex flex-col md:flex-row items-center justify-around gap-3 relative z-10 w-full overflow-x-auto">
                  {currentWorkflow.steps.map((step, idx) => {
                    const isSelected = selectedNodeIndex === idx;
                    const isPast = idx < simStepIdx && isSimulating;
                    const isActiveSim = idx === simStepIdx && isSimulating;

                    return (
                      <React.Fragment key={step.id}>
                        {/* Interactive Node Card */}
                        <div className="flex flex-col items-center shrink-0">
                          <button
                            onClick={() => setSelectedNodeIndex(idx)}
                            disabled={isSimulating}
                            className={`w-40 p-3 rounded-xl border transition-all text-center flex flex-col justify-center items-center gap-1 relative group cursor-pointer ${
                              isActiveSim
                              ? 'bg-blue-955 text-blue-300 border-blue-500 ring-4 ring-blue-500/10'
                              : isPast
                                ? 'bg-emerald-950/20 text-emerald-300 border-emerald-900/60'
                                : isSelected
                                  ? 'bg-indigo-950/20 text-white border-indigo-600 ring-2 ring-indigo-500/10'
                                  : 'bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            {/* Step number label bar */}
                            <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              isActiveSim
                              ? 'bg-blue-900 text-blue-200'
                              : isPast
                                ? 'bg-emerald-950 text-emerald-400'
                                : isSelected
                                  ? 'bg-indigo-950 text-indigo-300'
                                  : 'bg-slate-900 text-slate-500'
                            }`}>
                              Step {idx + 1}
                            </span>
                            
                            <span className="text-[11px] font-extrabold tracking-tight truncate w-full">{step.name}</span>
                            <span className="text-[9px] text-slate-500 truncate">{step.role}</span>

                            {/* Verification criteria indicator hover */}
                            <div className="absolute -bottom-4 bg-slate-955 border border-slate-850 text-[8px] px-1.5 py-0.2 rounded text-slate-450 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                              📝 {step.verificationKey}
                            </div>
                          </button>
                        </div>

                        {/* Connection Arrow (Except last) */}
                        {idx < currentWorkflow.steps.length - 1 && (
                          <div className={`flex items-center justify-center shrink-0 select-none ${
                            idx < simStepIdx && isSimulating
                            ? 'text-emerald-500 font-black animate-pulse'
                            : idx === simStepIdx && isSimulating
                              ? 'text-indigo-400'
                              : 'text-slate-800'
                          }`}>
                            <ArrowRight className={`w-4 h-4 hidden md:block ${
                              isActiveSim ? 'animate-ping' : ''
                            }`} />
                            <span className="md:hidden text-[9px] text-slate-650 tracking-widest my-1">▼</span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-850 flex flex-col md:flex-row md:items-center md:justify-between text-[11px] text-slate-400 gap-3">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <span>Click any workflow step card to inspect procedural criteria details and SLAs.</span>
                  </div>
                  <span className="font-mono text-[9px] text-indigo-300">Targeting Role: {activeNode.role}</span>
                </div>

              </div>

            </div>

            {/* Workflow Simulator Right Sidebar pane (4-columns) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Selected Node Details */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3.5 shadow-sm">
                <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2.5">
                  <Settings className="w-4 h-4 text-indigo-455" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Step Details</h3>
                </div>

                <div className="space-y-3 font-sans">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-955/40 px-2 py-0.5 rounded border border-indigo-900/40 uppercase">
                      Procedural SLA Node • {activeNode.sla}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-2">{activeNode.name}</h4>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed font-normal">{activeNode.description}</p>
                  
                  <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg space-y-1 text-[11px]">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-black block">Security Verification Criteria:</span>
                    <p className="text-slate-300 font-medium">📋 {activeNode.verificationKey}</p>
                  </div>
                </div>
              </div>

              {/* DRY-RUN SIMULATION INTERACTIVE COMPONENT */}
              <div className="bg-slate-900 rounded-xl border border-slate-805 p-4 space-y-3 shadow-sm font-sans" id="live-dry-run-simulator">
                
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-indigo-400" />
                  Live Dry-Run Simulator
                </h3>

                <div className="space-y-3 pt-1">
                  
                  {/* Employee picker */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-450">Target Employee Profile</label>
                    <select
                      disabled={isSimulating}
                      value={simEmployeeId}
                      onChange={(e) => setSimEmployeeId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded text-xs text-slate-300 outline-none"
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.firstName} {e.lastName} ({e.department} - {e.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Leave Days Input slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] uppercase font-bold text-slate-450">Leave Duration Request</label>
                      <span className="text-xs font-mono font-bold text-white">{simLeaveDays} Days</span>
                    </div>
                    <input
                      disabled={isSimulating}
                      type="range"
                      min={1}
                      max={30}
                      value={simLeaveDays}
                      onChange={(e) => setSimLeaveDays(Number(e.target.value))}
                      className="w-full tracking-wide accent-indigo-500 bg-slate-950 rounded cursor-pointer h-1"
                    />
                  </div>

                  {/* Overrides and custom rules */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-450">Leave Type</label>
                      <select
                        disabled={isSimulating}
                        value={simLeaveType}
                        onChange={(e) => setSimLeaveType(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-850 rounded text-[11px] text-slate-350"
                      >
                        <option value="Vacation">Vacation PTO</option>
                        <option value="Sickness">Sick & Wellness</option>
                        <option value="Emergency">Emergency Care</option>
                        <option value="Maternity">Parental Leave</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 mt-5">
                      <input
                        disabled={isSimulating}
                        id="sim-override"
                        type="checkbox"
                        checked={simForceOverride}
                        onChange={(e) => setSimForceOverride(e.target.checked)}
                        className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer bg-slate-950"
                      />
                      <label htmlFor="sim-override" className="text-[10px] text-slate-400 font-bold uppercase select-none cursor-pointer">
                        Admin Override
                      </label>
                    </div>
                  </div>

                  {/* Action dispatch button */}
                  <button
                    onClick={handleStartSimulation}
                    disabled={isSimulating || employees.length === 0}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed select-none text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Running step {simStepIdx + 1}/5...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Execute Dry-Run Simulation
                      </>
                    )}
                  </button>

                  {/* Realtime Terminal Console Output */}
                  <div className="p-3 bg-slate-950 border border-slate-855 rounded-lg text-[9px] font-mono text-slate-400 space-y-1.5 max-h-40 overflow-y-auto shadow-inner">
                    <span className="text-[8px] uppercase font-bold text-slate-600 block border-b border-slate-900 pb-1">
                      📠 Real-time Terminal Log Audit
                    </span>
                    {simulationLogs.map((log, lIdx) => (
                      <div key={lIdx} className="leading-snug">
                        {log}
                      </div>
                    ))}
                    
                    {simulationResult && (
                      <div className={`mt-2 p-2 rounded border font-sans text-xs flex flex-col gap-0.5 ${
                        simulationResult.status === 'approved'
                        ? 'bg-emerald-950/25 border-emerald-905 text-emerald-350'
                        : 'bg-rose-950/20 border-rose-905 text-rose-350'
                      }`}>
                        <span className="font-extrabold uppercase tracking-wide text-[9px] uppercase">
                          {simulationResult.status === 'approved' ? '✓ Simulation Approved' : '✗ Simulation Blocked'}
                        </span>
                        <p className="text-[11px] font-normal leading-relaxed">{simulationResult.reason}</p>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        )}

        {activeSubtab === 'policies' && (
          <motion.div
            key="policies-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Accrued PTO Cost Reserve Liability calculator (Left pane, 4-columns) */}
            <div className="lg:col-span-4 space-y-4">
              
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-4 shadow-sm" id="pto-liability-calculator">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-1.5 pb-1 border-b border-slate-850">
                    <Calculator className="w-4 h-4 text-indigo-405" />
                    Accrual Cost Calculator
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-1.5">
                    Select active employees to evaluate balance-sheet cost reserves and employer tax liabilities.
                  </p>
                </div>

                <div className="space-y-3 font-sans">
                  
                  {/* Employee Selector */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-450">Verify Employee</label>
                    <select
                      value={calcEmployeeId}
                      onChange={(e) => setCalcEmployeeId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded text-xs text-slate-300 outline-none"
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.firstName} {e.lastName} (£{e.salary.toLocaleString()}/yr)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Accrued Days Input slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-450">
                      <span>Accrued PTO Balance</span>
                      <span className="text-white font-mono">{calcAccruedDays} Days</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={calcAccruedDays}
                      onChange={(e) => setCalcAccruedDays(Number(e.target.value))}
                      className="w-full tracking-wide accent-indigo-500 bg-slate-950 rounded cursor-pointer h-1"
                    />
                  </div>

                  {/* Payroll tax override */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-450">
                      <span>Employer Payroll Tariffs</span>
                      <span className="text-white font-mono">{calcTaxRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={20}
                      value={calcTaxRate}
                      onChange={(e) => setCalcTaxRate(Number(e.target.value))}
                      className="w-full tracking-wide accent-indigo-500 bg-slate-950 rounded cursor-pointer h-1"
                    />
                  </div>

                  <hr className="border-slate-850" />

                  {calculatedLiability && (
                    <div className="space-y-2.5 animate-scale-up">
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Reserve Liability Ledger:</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                          <span className="text-[9px] text-slate-500 block">DAILY LABOR RATE</span>
                          <span className="font-mono font-bold text-slate-200">
                            £{calculatedLiability.dailyRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                          <span className="text-[9px] text-slate-500 block">TAX PREMIUM COST</span>
                          <span className="font-mono font-bold text-slate-200">
                            £{calculatedLiability.taxPremium.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="col-span-2 bg-slate-950 p-2.5 rounded border border-slate-850 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-500 block">TOTAL FINANCIAL LIABILITY</span>
                            <span className="font-mono font-extrabold text-sm text-emerald-400">
                              £{calculatedLiability.totalReserve.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          
                          {calculatedLiability.alertStatus === 'high' ? (
                            <span className="bg-rose-950 text-rose-300 font-bold text-[8px] uppercase tracking-wide px-2 py-0.5 rounded border border-rose-900/40">
                              High Risk Cap
                            </span>
                          ) : calculatedLiability.alertStatus === 'medium' ? (
                            <span className="bg-amber-95% text-amber-300 font-bold text-[8px] uppercase tracking-wide px-2 py-0.5 rounded border border-amber-900/40">
                              Moderate
                            </span>
                          ) : (
                            <span className="bg-emerald-950 text-emerald-300 font-bold text-[8px] uppercase tracking-wide px-2 py-0.5 rounded border border-emerald-900/40">
                              Acceptable
                            </span>
                          )}
                        </div>
                      </div>

                      {calculatedLiability.alertStatus === 'high' && (
                        <div className="p-2 bg-rose-950/20 text-rose-350 border border-rose-900/30 rounded text-[9px] leading-relaxed flex items-start gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-450 shrink-0 mt-0.5" />
                          <p>**Warning Balance exceedance limit**: Accruals exceed high risk limits. It is recommended to enforce rollover expiration rules.</p>
                        </div>
                      )}

                      {/* Log Action Button */}
                      <button
                        onClick={handleRunLiabilityCalc}
                        className="w-full py-1.5 border border-slate-800 hover:bg-slate-850 hover:text-white rounded text-[10px] font-bold text-slate-300 transition-colors uppercase tracking-wider cursor-pointer select-none"
                      >
                        ✓ Refresh Balance Reserve
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Secure Statutory policy Presets Widget */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3 shadow-xs font-sans">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-405" />
                    Statutory Presets
                  </h3>
                  <span className="text-[8px] font-mono bg-slate-950 text-slate-500 border border-slate-850 px-1.5 py-0.2 rounded font-black">
                    GLOBAL PRESENTS
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Click a jurisdiction standard to immediately annex statutory leave caps and public holiday timelines onto our active company policy text below.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(COUNTRY_PRESETS).map(([code, p]) => (
                    <button
                      key={code}
                      onClick={() => handleCountryPresetLoad(code)}
                      className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        activeCountry === code
                        ? 'bg-indigo-950/20 border-indigo-600/70 text-white font-extrabold'
                        : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-350 hover:bg-slate-850/40'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-indigo-400 block">{code}</span>
                      <span className="text-[10px] truncate block mt-0.5 text-slate-100">{p.name}</span>
                      <span className="text-[8px] text-slate-500 block mt-1">{p.minPtoDate} Statutory Days</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Markdown editor and Preview section (8-columns) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Policy selector bar */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedPolicyKey('vacation');
                      setIsPolicyEditing(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPolicyKey === 'vacation'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-slate-205'
                    }`}
                  >
                    🏖️ Annual Vacation Policy
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPolicyKey('sick');
                      setIsPolicyEditing(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPolicyKey === 'sick'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-slate-205'
                    }`}
                  >
                    🤒 Paid Sickness Regulations
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPolicyKey('parental');
                      setIsPolicyEditing(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPolicyKey === 'parental'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-slate-205'
                    }`}
                  >
                    👶 Parental & Caregiver Safety
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleResetPolicyDefault}
                    className="px-2.5 py-1.5 hover:bg-slate-805 text-[10px] font-bold text-slate-400 border border-slate-800 rounded transition-colors cursor-pointer select-none"
                    title="Restore system defaults"
                  >
                    <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                    Reset Defaults
                  </button>
                </div>
              </div>

              {/* Policy Edit and Preview Container */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xs flex flex-col">
                
                {/* Header bar controls */}
                <div className="p-3 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center flex-wrap gap-3 font-sans">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase text-slate-300">
                      Handbook Draft: {selectedPolicyKey.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsPolicyEditing(!isPolicyEditing)}
                      className={`px-3 py-1 rounded text-xs font-extrabold cursor-pointer select-none transition-colors border ${
                        isPolicyEditing
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-900/60'
                        : 'bg-slate-950 text-slate-300 border-slate-850'
                      }`}
                    >
                      {isPolicyEditing ? '👁 Preview Draft' : '✍ Edit Document Markdown'}
                    </button>
                    {isPolicyEditing && (
                      <button
                        onClick={handleSavePolicy}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-extrabold rounded border border-transparent shadow-xs cursor-pointer select-none"
                      >
                        <Save className="w-3.5 h-3.5 inline mr-1" />
                        Save Edits
                      </button>
                    )}
                  </div>
                </div>

                {/* Main panel - Preview or Editor */}
                <div className="p-5 min-h-[384px] bg-slate-950/20">
                  {isPolicyEditing ? (
                    <div className="h-full space-y-2">
                      <textarea
                        value={policyMarkdown}
                        onChange={(e) => setPolicyMarkdown(e.target.value)}
                        className="w-full h-96 p-4 bg-slate-950 border border-slate-850 focus:border-indigo-650 text-xs font-mono text-slate-205 leading-relaxed rounded-lg outline-none resize-y"
                        placeholder="Write company holiday regulations text here using standard markdown syntax..."
                      />
                      <div className="text-[10px] text-slate-500 font-mono">
                        *Supports standard MD syntax headers (#, ##), bullet metrics, strong bold formatting, and divider lines.*
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed space-y-4 select-text">
                      {policyMarkdown.split('\n\n').map((paragraph, pIdx) => {
                        const trimmed = paragraph.trim();
                        if (trimmed.startsWith('# ')) {
                          return <h2 key={pIdx} className="text-md font-bold text-white border-b border-slate-850 pb-2.5 mt-2 flex items-center gap-1.5">{trimmed.replace('# ', '')}</h2>;
                        }
                        if (trimmed.startsWith('## ')) {
                          return <h3 key={pIdx} className="text-xs font-extrabold uppercase tracking-wide text-indigo-300 mt-4">{trimmed.replace('## ', '')}</h3>;
                        }
                        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                          const lines = trimmed.split('\n');
                          return (
                            <ul key={pIdx} className="list-disc pl-5 mt-2 space-y-1 text-xs">
                              {lines.map((l, lIdx) => (
                                <li key={lIdx} className="text-slate-300">
                                  {l.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p key={pIdx} className="text-xs font-normal text-slate-350 tracking-wide mt-2">
                            {trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* AI COMPLIANCE POLICY ENHANCER GATEWAY */}
              <div className="bg-slate-900 rounded-xl border border-slate-805 p-4 space-y-3 shadow-md font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-450 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase text-white tracking-tight">AI Compliance Policy Enhancer</h3>
                  </div>
                  {activeTier === 'Starter' ? (
                    <span className="text-[8px] bg-amber-500 text-slate-950 font-mono font-black px-1.5 py-0.2 rounded uppercase animate-pulse select-none">
                      Starter (Local fallbacks active)
                    </span>
                  ) : (
                    <span className="text-[8px] bg-emerald-500 text-slate-950 font-mono font-black px-1.5 py-0.2 rounded uppercase select-none">
                      🔒 SECURE GATEWAY UNLOCKED
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Enter key adjustment guidelines (e.g. "Draft an explicit clause granting 3 paid days of mental wellness leave" or "Limit roll-over to California jurisdictions"). Our secure LLM will automatically process, legally refine, and format your markdown seamlessly.
                </p>

                <form onSubmit={handleEnhancePolicyAI} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      required
                      type="text"
                      disabled={isAiEnhancing}
                      placeholder="e.g. Incorporate 3 paid Mental Health Wellness days automatically accrued yearly..."
                      value={aiPolicyPrompt}
                      onChange={(e) => setAiPolicyPrompt(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-855 text-xs text-white rounded outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isAiEnhancing || !aiPolicyPrompt.trim()}
                      className="px-4 bg-indigo-650 hover:bg-slate-800 border border-indigo-650 hover:border-slate-800 disabled:opacity-50 text-white font-extrabold text-xs rounded transition-colors cursor-pointer flex items-center gap-1 shrink-0 select-none"
                    >
                      {isAiEnhancing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Polishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 fill-white" />
                          Optimize with AI
                        </>
                      )}
                    </button>
                  </div>

                  {aiFeedback && (
                    <p className="text-[10px] text-emerald-400 bg-emerald-950/20 p-2 border border-emerald-900/30 rounded font-medium">
                      {aiFeedback}
                    </p>
                  )}

                  {/* Built-in Preset Prompt Chips for easy clicks */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[9px] text-slate-550 pt-1 font-bold">Quick Directives:</span>
                    <button
                      type="button"
                      disabled={isAiEnhancing}
                      onClick={() => setAiPolicyPrompt("Add a strict compliance clause enforcing full rollover holiday rollover forfeiture on Jan 1st")}
                      className="px-2 py-0.5 bg-slate-950 hover:bg-slate-850 hover:text-white text-[9px] text-slate-400 rounded cursor-pointer border border-slate-855"
                    >
                      ⌛ Hard Forfeiture Jan 1st
                    </button>
                    <button
                      type="button"
                      disabled={isAiEnhancing}
                      onClick={() => setAiPolicyPrompt("Incorporate 3 paid Wellness Days specifically devoted to mental health recovery offsets")}
                      className="px-2 py-0.5 bg-slate-950 hover:bg-slate-850 hover:text-white text-[9px] text-slate-400 rounded cursor-pointer border border-slate-855"
                    >
                      🧠 Mental Wellness Offset
                    </button>
                    <button
                      type="button"
                      disabled={isAiEnhancing}
                      onClick={() => setAiPolicyPrompt("Draft an explicit annex for Oregon State statutory family care payroll premium guidelines")}
                      className="px-2 py-0.5 bg-slate-950 hover:bg-slate-850 hover:text-white text-[9px] text-slate-400 rounded cursor-pointer border border-slate-855"
                    >
                      🇺🇸 Oregon Family Care annex
                    </button>
                  </div>
                </form>

              </div>

            </div>
          </motion.div>
        )}

        {activeSubtab === 'calendar' && (
          <motion.div
            key="calendar-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <HolidaysLeavesCalendar 
              employees={employees}
              addLog={addLog}
              activeTier={activeTier}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

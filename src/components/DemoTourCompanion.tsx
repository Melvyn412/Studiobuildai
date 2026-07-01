import React, { useState } from 'react';
import { 
  Employee, ChecklistItem, InterviewTemplate, PerformanceReview, AuditLog, ResumeAnalysis
} from '../types';
import { 
  Sparkles, Play, RotateCcw, ChevronDown, ChevronUp, Database, 
  Cpu, Shield, CreditCard, CheckCircle2, Bookmark, ArrowRight, Info, HelpCircle
} from 'lucide-react';

interface DemoTourCompanionProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  checklists: ChecklistItem[];
  setChecklists: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  templates: InterviewTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<InterviewTemplate[]>>;
  reviews: PerformanceReview[];
  setReviews: React.Dispatch<React.SetStateAction<PerformanceReview[]>>;
  analyses: ResumeAnalysis[];
  setAnalyses: React.Dispatch<React.SetStateAction<ResumeAnalysis[]>>;
  activeTier: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI';
  setActiveTier: (tier: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI') => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  isMasked: boolean;
  setIsMasked: (masked: boolean) => void;
}

export default function DemoTourCompanion({
  employees,
  setEmployees,
  checklists,
  setChecklists,
  templates,
  setTemplates,
  reviews,
  setReviews,
  analyses,
  setAnalyses,
  activeTier,
  setActiveTier,
  activeTab,
  setActiveTab,
  addLog,
  isMasked,
  setIsMasked
}: DemoTourCompanionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Guide Steps across all tab components to show off design choices
  const tourSteps = [
    {
      tab: 'roster',
      title: 'Personnel Roster',
      badge: 'Secure Storage',
      desc: 'Double-row secure table holding compliant staff parameters. Supports real-time text obfuscation (masking), instant salary/notes edits, and direct audit trail reporting.',
      actionLabel: 'Inject Luxury Roster',
      highlight: 'Try clicking "Identifiers: Redacted" at the top-right to watch real-time client-side PII encryption masking!',
    },
    {
      tab: 'screener',
      title: 'Resume Screener',
      badge: 'Machine Analysis',
      desc: 'Upload dummy candidate CVs or text fragments to score against desired skills. Local matching algorithms execute on the CPU client-thread safely without external server routing.',
      actionLabel: 'Inject Candidate Resumes',
      highlight: 'Click candidate names to view their detailed skills match card and custom structured recommendations!',
    },
    {
      tab: 'interviews',
      title: 'Interview Guides',
      badge: 'Evaluation Rubric',
      desc: 'Build detailed interview rubrics for engineering or compliance jobs to minimize subjectivism in hiring.',
      actionLabel: 'Inject Security Guide',
      highlight: 'Enforce legal standard question structures that ensure fair and structured staff evaluation.',
    },
    {
      tab: 'evaluations',
      title: 'Performance Appraisal',
      badge: 'Confidentiality Focused',
      desc: 'Draft evaluation records using a multi-factor slider score. Starter plans use manual summaries; upgraded tiers unlock AI appraisal drafting suggestions!',
      actionLabel: 'Gen Appraisal Scores',
      highlight: 'Slide scores for Growth, Teamwork, and Quality. Upgraded CustomAI or Enterprise levels auto-generate summaries!',
    },
    {
      tab: 'checklists',
      title: 'On/Offboarding Checklists',
      badge: 'Audit Control',
      desc: 'A checklist tracker with strict task completions logs. Every toggle writes a monotonic hash sequence directly to local storage audits.',
      actionLabel: 'Inject Onboarding Checkpoints',
      highlight: 'Perfect for tracking Right-To-Work verifications & secure data-storage wipe downs upon employee departures.',
    },
    {
      tab: 'policies',
      title: 'Policies & Workflows',
      badge: 'Corporate Standard',
      desc: 'Verify regulatory compliance frameworks. The system checks employees against background screenings, local contracts, training signoffs, and security briefings.',
      actionLabel: 'Simulate Audit Drill',
      highlight: 'View the active policy ledger and check real-time compliance ratios for all active personnel!',
    },
    {
      tab: 'automation',
      title: 'Automation Hub',
      badge: 'Exceptions Engine',
      desc: 'Automates exception routing (such as PTO carryovers or extra equipment requests) through Manager, Compliance, and Finance approvals.',
      actionLabel: 'Trigger PTO Exception Flow',
      highlight: 'Watch the step-by-step progress and approve/reject steps in real-time to simulate corporate exception resolution!',
    },
    {
      tab: 'doc-intel',
      title: 'Doc Intelligence',
      badge: 'Smart Contract Review',
      desc: 'Securely analyze local agreements (e.g. employee NDA, handbook revisions) for high-risk clauses or liability concerns.',
      actionLabel: 'Load Sample NDA Contract',
      highlight: 'Instantly highlights governing law, compliance risks, and critical operational liability terms.',
    },
    {
      tab: 'chat',
      title: 'Secure AI Assistant',
      badge: 'Isolated Processing',
      desc: 'Secure, client-loop assistant providing compliant drafting examples. Starter plan is restricted to 5 runs; Premium tiers unlock unlimited queries.',
      actionLabel: 'Upgrade Tier & Open Chat',
      highlight: 'Ask the assistant to draft local backup policies or employment agreements in private runtime.',
    },
    {
      tab: 'billing',
      title: 'Plans & Billing',
      badge: 'Custom enterprise SLA',
      desc: 'Manage company licensing. Includes Starter, Pro, Enterprise, and Bespoke Custom AI Deployment with an interactive sliding setup fee calculator.',
      actionLabel: 'Configure Bespoke Custom AI',
      highlight: 'Leverages the customized sliding £2,000 to £5,000 deployment setups to fit complex corporate SLAs!',
    },
    {
      tab: 'security',
      title: 'Security & Controls',
      badge: 'Data shredder & audit',
      desc: 'Inspect the cryptographic personnel auditing ledger. Perform 0-hop local latency diagnostics or execute full GDPR Article 17 "Right to be Forgotten" hard deletes.',
      actionLabel: 'Generate Audit Report',
      highlight: 'Real-time auditing trail tracks any record creation or data unmasking action immediately!',
    }
  ];

  const currentStep = tourSteps[activeStepIndex];

  // Quick Action triggers to pop fake data and guide tabs
  const handlePopulateData = (actionType: string) => {
    switch (actionType) {
      case 'roster':
        const demoRoster: Employee[] = [
          {
            id: 'emp-sf-1',
            firstName: 'Clark',
            lastName: 'Kent',
            email: 'c.kent@dailyplanet.org',
            phone: '555-0111',
            department: 'Marketing',
            role: 'Investigative Brand Lead',
            status: 'Active',
            startDate: '2024-02-14',
            salary: 92000,
            notes: 'Requires regular access to off-network databases. Maintains immaculate integrity in communications.'
          },
          {
            id: 'emp-sf-2',
            firstName: 'Tony',
            lastName: 'Stark',
            email: 't.stark@starkindustries.com',
            phone: '555-3000',
            department: 'Engineering',
            role: 'Principal Hardware Technologist',
            status: 'Active',
            startDate: '2019-05-02',
            salary: 350000,
            notes: 'Custom AI advocate. Configured local hardware enclaves in office suites. Incredible design output.'
          },
          {
            id: 'emp-sf-3',
            firstName: 'Bruce',
            lastName: 'Wayne',
            email: 'b.wayne@waynecorp.com',
            phone: '555-0911',
            department: 'HR & Legal',
            role: 'Senior Security auditor',
            status: 'Active',
            startDate: '2021-11-20',
            salary: 195000,
            notes: 'Expert in high-risk compliance checks, physical access badge provisioning and offline backups.'
          },
          {
            id: 'emp-sf-4',
            firstName: 'Hermione',
            lastName: 'Granger',
            email: 'h.granger@ministry.edu.gb',
            phone: '555-9344',
            department: 'HR & Legal',
            role: 'Ethics & Compliance Director',
            status: 'Active',
            startDate: '2023-09-01',
            salary: 145000,
            notes: 'Maintains rigorous checklists. Advocates for strict employee welfare policies and automated tracking.'
          },
          {
            id: 'emp-sf-5',
            firstName: 'Ellen',
            lastName: 'Ripley',
            email: 'e.ripley@weyland-yutani.corp',
            phone: '555-2179',
            department: 'Engineering',
            role: 'Crisis Response Officer',
            status: 'On Leave',
            startDate: '2025-08-10',
            salary: 115000,
            notes: 'On extended stress-related administrative leave following mission reports. Excellent risk reducer.'
          },
          {
            id: 'emp-sf-6',
            firstName: 'Peter',
            lastName: 'Parker',
            email: 'p.parker@bugle.nyc',
            phone: '555-0155',
            department: 'Marketing',
            role: 'Photojournalist Intern',
            status: 'Onboarding',
            startDate: '2026-06-12',
            salary: 45000,
            notes: 'Finishing Right-To-Work photo identification verifications. Adaptive learner.'
          }
        ];
        
        // Append or replace
        setEmployees(prev => {
          const filtered = prev.filter(e => !e.id.startsWith('emp-sf-'));
          return [...filtered, ...demoRoster];
        });
        setIsMasked(false); // Unmask so they can see the beautiful fictional names!
        addLog('Demo Sandbox Data Injected', 'Modification', 'Injected 6 compliance-ready fictional personnel roster records into local Sandbox store.');
        setActiveTab('roster');
        break;

      case 'screener':
        const demoResumes: ResumeAnalysis[] = [
          {
            id: 'res-sf-1',
            candidateName: 'Steve Rogers',
            email: 's.rogers@brooklyn.mil',
            phone: '555-1941',
            targetRole: 'Senior Leadership Specialist',
            rawText: 'Steve Rogers - Highly disciplined leader with over 80 years of strategic planning, crises mitigation, and inter-agency collaboration. Lead tactical engineer. Skills: Team Coordination, Compliance Safety, Crisis Management, Shield Handling, Public Speaking.',
            score: 95,
            matchedSkills: ['Team Coordination', 'Compliance Safety', 'Crisis Management'],
            missingSkills: ['Cloud Infrastructure', 'ISO Audit Training'],
            recommendations: ['Advance directly to Executive interview panel.', 'Enroll in local database handling seminars.'],
            analyzedAt: new Date().toISOString()
          },
          {
            id: 'res-sf-2',
            candidateName: 'Selina Kyle',
            email: 's.kyle@gotham-arts.net',
            phone: '555-0109',
            targetRole: 'Ethics Auditor & Risk Consultant',
            rawText: 'Selina Kyle - Master of stealth auditing, penetration testing, and identifying critical storage vulnerabilities. Extensive experience in physical asset access systems. Skills: Risk Mitigation, Security Analysis, Physical Badge Testing.',
            score: 72,
            matchedSkills: ['Risk Mitigation', 'Security Analysis'],
            missingSkills: ['Corporate Report Writing', 'Systematic Compliance Frameworks'],
            recommendations: ['Pair with a structured Ethics & Compliance generalist.', 'Perform physical security verification exercises.'],
            analyzedAt: new Date().toISOString()
          }
        ];
        setAnalyses(prev => {
          const filtered = prev.filter(r => !r.id.startsWith('res-sf-'));
          return [...filtered, ...demoResumes];
        });
        addLog('Demo Screener Resumes Injected', 'Modification', 'Uploaded steve_rogers_cv.pdf and selina_kyle_cv.txt candidates info securely to screener analysis database.');
        setActiveTab('screener');
        break;

      case 'interviews':
        const demoGuide: InterviewTemplate = {
          id: 'temp-sf-1',
          title: 'Off-Grid Systems Engineer Assessment',
          department: 'Engineering',
          seniority: 'Lead',
          questions: [
            {
              question: 'How do you design zero-external-dependency HR apps using browser-only encrypted keyvaults?',
              purpose: 'Validate strict privacy compliance sandboxing capability.',
              expectedAnswer: 'Must propose standard AES-GCM WebCrypto APIs, isolated browser sandbox storage, and strictly zero tracking telemetry.'
            },
            {
              question: 'In the event of network disruption, what state synchronisation schema guarantees 0% record collisions?',
              purpose: 'Check conflict-free replication database awareness.',
              expectedAnswer: 'Should mention operational transformations or CRDT nodes with monotonic sequence identifiers.'
            }
          ]
        };
        setTemplates(prev => {
          const filtered = prev.filter(t => t.id !== 'temp-sf-1');
          return [...filtered, demoGuide];
        });
        addLog('Demo Interview Template Injected', 'Modification', 'Injected Lead Off-Grid Systems Engineer structured interview template.');
        setActiveTab('interviews');
        break;

      case 'evaluations':
        // Inject a simulated review for Sarah Connor
        const demoReview: PerformanceReview = {
          id: 'rev-sf-1',
          employeeId: 'emp-101', // Sarah Connor
          reviewer: 'Marcus Aurelius',
          ratingWork: 5,
          ratingTeam: 4,
          ratingGrowth: 5,
          strengths: 'Peerless diligence in maintaining offline enclaves and server backups. Exquisite security compliance discipline.',
          improvements: 'Could share workload more evenly with newly onboarded specialists.',
          goals: 'Guide Ada Lovelace through advanced local cryptography and platform integrity workflows in Q3.',
          submittedAt: new Date().toISOString()
        };
        setReviews(prev => {
          const filtered = prev.filter(r => r.id !== 'rev-sf-1');
          return [...filtered, demoReview];
        });
        addLog('Demo Appraisal Injected', 'Modification', 'Injected perfect scoring audit evaluation record for Lead Systems Architect from Ethics Director.');
        setActiveTab('evaluations');
        break;

      case 'checklists':
        const extraChecklists: ChecklistItem[] = [
          {
            id: 'chk-sf-1',
            category: 'Compliance',
            task: '🌟 SIMULATED DEMO: Hardware keys calibration and local disk partitions mapping',
            completed: true,
            notes: 'Validated correct 256-bit encryption key mapping for Tony Stark profile.',
            completedAt: new Date().toISOString()
          },
          {
            id: 'chk-sf-2',
            category: 'Onboarding',
            task: '🌟 SIMULATED DEMO: Super-Admin identity cryptographic signature verification',
            completed: false,
            notes: 'Awaiting digital token generator issuance'
          }
        ];
        setChecklists(prev => {
          const filtered = prev.filter(c => !c.id.startsWith('chk-sf-'));
          return [...extraChecklists, ...prev];
        });
        addLog('Demo Onboarding Checklist Injected', 'Modification', 'Injected two advanced sandbox checklists tasks to prove compliance workflow tracking.');
        setActiveTab('checklists');
        break;

      case 'policies':
        addLog('Compliance Auditing Triggered', 'Security', 'Executed all active employees background screenings, certification checks, and legal document matches.');
        setActiveTab('policies');
        break;

      case 'automation':
        // Let user know they can trace approvals
        addLog('Automated Onboarding Alert Triggered', 'System', 'Generated exceptions trigger: Employee "Ada Lovelace" requests PTO rollover allowance for 14 active days due to emergency migration.');
        setActiveTab('automation');
        break;

      case 'billing':
        setActiveTier('CustomAI');
        addLog('Workspace Tier Change', 'Security', 'Demo Upgrade: Automatically subscribed sandbox workspace to "Bespoke Custom AI Deployment" with £25k monthly hosting + SLA setup coverage.');
        setActiveTab('billing');
        break;

      case 'security':
        addLog('Cryptographic Leak Drills', 'Security', 'Executed 0-hop disk compliance safety sweep. 0 records leaked. All in-memory structures wiped successfully.');
        setActiveTab('security');
        break;

      default:
        break;
    }
  };

  const handleResetDemoState = () => {
    localStorage.removeItem('secure_hr_employees');
    localStorage.removeItem('secure_hr_checklists');
    localStorage.removeItem('secure_hr_templates');
    localStorage.removeItem('secure_hr_reviews');
    localStorage.removeItem('secure_hr_analyses');
    localStorage.removeItem('secure_hr_subscription_tier');
    localStorage.removeItem('secure_hr_masked');
    
    // Clear and reload initial state
    window.location.reload();
  };

  const playStepAction = () => {
    handlePopulateData(currentStep.tab);
  };

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-xl overflow-hidden shadow-lg p-1.5" id="demo-guide-companion">
      
      {/* Companion Title Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-950/70 hover:bg-indigo-950/90 transition-all px-4 py-3 rounded-lg flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white animate-bounce-slow">
            <Sparkles className="w-4 h-4 text-indigo-100" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-white flex items-center gap-2">
              HR PLATFORM DEMO CONTROL DECK
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full">Interactive Companion</span>
            </h3>
            <p className="text-[10px] text-slate-300">Click to expand/collapse this helpful demo toolkit to see all features populated instantly.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              handleResetDemoState();
            }}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-350 font-bold px-2.5 py-1 rounded transition-all flex items-center gap-1 cursor-pointer"
            title="Wipes local storage and restarts standard baseline demo parameters."
          >
            <RotateCcw className="w-3 h-3 text-red-400" />
            Reset Demo State
          </button>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          
          {/* Fictional Sandbox Quick Actions Pad */}
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <h4 className="text-[10px] uppercase font-mono tracking-wide text-indigo-400 font-bold flex items-center gap-1.5 select-none mb-2.5">
              <Database className="w-3.5 h-3.5" />
              Instant Sandbox Data Injectors (Single-click Populate)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <button
                onClick={() => handlePopulateData('roster')}
                className="bg-slate-900 hover:bg-indigo-950/40 text-slate-200 hover:text-indigo-300 border border-slate-800 hover:border-indigo-900/60 p-2 rounded-lg text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  1. Roster Demo 🦸
                </div>
                <div className="text-[9px] text-slate-500 mt-1 select-none">Add superhero team & unmask profiles.</div>
              </button>

              <button
                onClick={() => handlePopulateData('screener')}
                className="bg-slate-900 hover:bg-indigo-950/40 text-slate-200 hover:text-indigo-300 border border-slate-800 hover:border-indigo-900/60 p-2 rounded-lg text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  2. Resume Ingest 📄
                </div>
                <div className="text-[9px] text-slate-500 mt-1 select-none">Ingest Rogers & Kyle CV parameters offline.</div>
              </button>

              <button
                onClick={() => handlePopulateData('evaluations')}
                className="bg-slate-900 hover:bg-indigo-950/40 text-slate-200 hover:text-indigo-300 border border-slate-800 hover:border-indigo-900/60 p-2 rounded-lg text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  3. Ingest Appraisals ⭐
                </div>
                <div className="text-[9px] text-slate-500 mt-1 select-none">Fills review scores for Connor.</div>
              </button>

              <button
                onClick={() => handlePopulateData('automation')}
                className="bg-slate-900 hover:bg-indigo-950/40 text-slate-200 hover:text-indigo-300 border border-slate-800 hover:border-indigo-900/60 p-2 rounded-lg text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  4. Exception Trigger ⚙️
                </div>
                <div className="text-[9px] text-slate-500 mt-1 select-none">Mock Ada Lovelace urgent request.</div>
              </button>

              <button
                onClick={() => handlePopulateData('billing')}
                className="bg-slate-900 hover:bg-indigo-950/40 text-slate-200 hover:text-indigo-300 border border-slate-800 hover:border-indigo-900/60 p-2 rounded-lg text-left transition-all cursor-pointer group col-span-2 sm:col-span-1"
              >
                <div className="text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-emerald-450 font-black">
                  5. Buy Bespoke AI 💎
                </div>
                <div className="text-[9px] text-slate-500 mt-1 select-none">Auto checkout £25k CustomAI setup.</div>
              </button>
            </div>
          </div>

          {/* Interactive Feature Tour Slider */}
          <div className="border border-indigo-950 rounded-lg overflow-hidden bg-slate-950/30">
            <div className="bg-indigo-950/30 px-3 py-2 border-b border-indigo-950/70 flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-350">
                ⭐ Feature Sub-Systems Guide Tour ({activeStepIndex + 1}/{tourSteps.length})
              </span>
              <div className="flex gap-1.5">
                {tourSteps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setActiveTab(tourSteps[idx].tab);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      activeStepIndex === idx ? 'bg-indigo-500 scale-115 shadow-sm' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Tour content left */}
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono border border-indigo-900/40">
                    {currentStep.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Section Submodule</span>
                </div>
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  {currentStep.title}
                  <HelpCircle className="w-4 h-4 text-slate-500 select-none cursor-help" title={currentStep.desc} />
                </h4>
                <p className="text-xs text-slate-350 leading-relaxed max-w-2xl">{currentStep.desc}</p>
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-805 text-[11px] text-indigo-200 mt-2 flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">💡 Highlighting:</span>
                  <span>{currentStep.highlight}</span>
                </div>
              </div>

              {/* Tour trigger controls right */}
              <div className="md:col-span-4 flex flex-col gap-2 bg-slate-900/40 p-3.5 rounded-lg border border-slate-850/60 justify-center">
                <div className="text-[9px] uppercase font-mono tracking-wider text-slate-500 text-center mb-1">Interactive Action Test</div>
                
                <button
                  onClick={playStepAction}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs py-2 rounded-lg transition-transform flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none"
                >
                  <Play className="w-3.5 h-3.5" />
                  {currentStep.actionLabel}
                </button>

                <div className="flex items-center justify-between gap-1.5 mt-2">
                  <button
                    disabled={activeStepIndex === 0}
                    onClick={() => {
                      const prevIdx = activeStepIndex - 1;
                      setActiveStepIndex(prevIdx);
                      setActiveTab(tourSteps[prevIdx].tab);
                    }}
                    className={`flex-1 text-[10px] border py-1.5 rounded transition-all font-bold select-none cursor-pointer ${
                      activeStepIndex === 0 
                      ? 'border-slate-800 text-slate-600' 
                      : 'border-slate-700 text-slate-400 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    ◀ Back
                  </button>
                  <button
                    disabled={activeStepIndex === tourSteps.length - 1}
                    onClick={() => {
                      const nextIdx = activeStepIndex + 1;
                      setActiveStepIndex(nextIdx);
                      setActiveTab(tourSteps[nextIdx].tab);
                    }}
                    className={`flex-1 text-[10px] border py-1.5 rounded transition-all font-bold select-none cursor-pointer ${
                      activeStepIndex === tourSteps.length - 1 
                      ? 'border-slate-800 text-slate-600' 
                      : 'border-slate-700 text-slate-450 bg-slate-900 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    Next ▶
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}

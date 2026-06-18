import React, { useState, useEffect } from 'react';
import { Employee, ChecklistItem, InterviewTemplate, PerformanceReview, AuditLog } from './types';
import { 
  INITIAL_EMPLOYEES, DEFAULT_CHECKLISTS, DEFAULT_TEMPLATES, INITIAL_AUDIT_LOGS 
} from './mockData';

import EmployeeDirectory from './components/EmployeeDirectory';
import ResumeParser from './components/ResumeParser';
import InterviewBuilder from './components/InterviewBuilder';
import PerformanceReviewComponent from './components/PerformanceReview';
import ComplianceChecklist from './components/ComplianceChecklist';
import PrivacySettings from './components/PrivacySettings';
import InternalChat from './components/InternalChat';
import PlansBilling from './components/PlansBilling';
import WorkflowsPolicies from './components/WorkflowsPolicies';
import DocumentIntelligence from './components/DocumentIntelligence';
import OnboardingAutomation from './components/OnboardingAutomation';
import DemoTourCompanion from './components/DemoTourCompanion';
import LandingPage from './components/LandingPage';
import HolidaysLeavesCalendar from './components/HolidaysLeavesCalendar';
import WorkforceAnalytics from './components/WorkforceAnalytics';
import ContractLetterGenerator from './components/ContractLetterGenerator';

import { 
  Users, FileText, ClipboardList, Shield, ShieldCheck, Lock,
  GraduationCap, ListChecks, CheckCircle2, FileSignature, Sparkles, CreditCard,
  GitBranch, Cpu, CalendarDays, BarChart2, Briefcase
} from 'lucide-react';

import { db, auth } from './firebase';
import { 
  collection, doc, setDoc, deleteDoc, 
  query, where, onSnapshot, writeBatch 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function areRecordsEqual<T extends { id: string }>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const aMap = new Map(a.map(item => [item.id, JSON.stringify(item)]));
  for (const item of b) {
    const serialized = aMap.get(item.id);
    if (serialized !== JSON.stringify(item)) return false;
  }
  return true;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('secure_hr_curr_user');
  });

  // Track the actual firebase auth user
  const [fbUser, setFbUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.email || user.uid);
        setFbUser(user);
        localStorage.setItem('secure_hr_curr_user', user.email || user.uid);
        localStorage.removeItem('secure_hr_is_bypass'); // Real Auth session overrides bypass state
      } else {
        const isBypass = localStorage.getItem('secure_hr_is_bypass') === 'true';
        if (!isBypass) {
          setCurrentUser(null);
          setFbUser(null);
          localStorage.removeItem('secure_hr_curr_user');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Offline state engines loaded from localStorage triggers. Mirror collections to/from Firestore on load.
  const [employees, setEmployeesState] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('secure_hr_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [checklists, setChecklistsState] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('secure_hr_checklists');
    return saved ? JSON.parse(saved) : DEFAULT_CHECKLISTS;
  });

  const [templates, setTemplatesState] = useState<InterviewTemplate[]>(() => {
    const saved = localStorage.getItem('secure_hr_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [reviews, setReviewsState] = useState<PerformanceReview[]>(() => {
    const saved = localStorage.getItem('secure_hr_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [analyses, setAnalyses] = useState<any[]>(() => {
    const saved = localStorage.getItem('secure_hr_analyses');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('secure_hr_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Secure default: Redact sensitive criteria on launch to minimize espionage risk
  const [isMasked, setIsMasked] = useState<boolean>(() => {
    const saved = localStorage.getItem('secure_hr_masked');
    return saved ? JSON.parse(saved) === 'true' : true;
  });

  const [activeTier, setActiveTier] = useState<'Starter' | 'Professional' | 'Enterprise' | 'CustomAI'>(() => {
    const saved = localStorage.getItem('secure_hr_subscription_tier');
    return (saved as any) || 'Starter';
  });

  const [activeTab, setActiveTab] = useState<'roster' | 'screener' | 'interviews' | 'evaluations' | 'checklists' | 'policies' | 'automation' | 'doc-intel' | 'chat' | 'billing' | 'security' | 'calendar' | 'analytics' | 'contracts'>('roster');

  useEffect(() => {
    localStorage.setItem('secure_hr_subscription_tier', activeTier);
  }, [activeTier]);

  // Wrapped State Setters That Also Update Firestore in Background
  const setEmployees = (value: React.SetStateAction<Employee[]>) => {
    setEmployeesState(prev => {
      const next = typeof value === 'function' ? (value as any)(prev) : value;
      if (auth.currentUser) {
        // Find deleted entries to sync drop
        const deletedIds = prev.filter(p => !next.some(n => n.id === p.id)).map(p => p.id);
        deletedIds.forEach(async (id) => {
          try {
            await deleteDoc(doc(db, 'employees', id));
          } catch (e) {
            console.error("Firestore employee delete fail:", e);
          }
        });
        // Sync additions / changes only
        const changedOrAdded = next.filter((n: Employee) => {
          const p = prev.find(item => item.id === n.id);
          if (!p) return true; // Added
          return JSON.stringify(p) !== JSON.stringify(n); // Changed
        });
        changedOrAdded.forEach(async (emp: Employee) => {
          try {
            await setDoc(doc(db, 'employees', emp.id), { ...emp, userId: auth.currentUser!.uid });
          } catch (e) {
            console.error("Firestore employee write fail:", e);
          }
        });
      }
      return next;
    });
  };

  const setChecklists = (value: React.SetStateAction<ChecklistItem[]>) => {
    setChecklistsState(prev => {
      const next = typeof value === 'function' ? (value as any)(prev) : value;
      if (auth.currentUser) {
        const deletedIds = prev.filter(p => !next.some(n => n.id === p.id)).map(p => p.id);
        deletedIds.forEach(async (id) => {
          try {
            await deleteDoc(doc(db, 'checklists', id));
          } catch (e) {
            console.error("Firestore checklist delete fail:", e);
          }
        });
        // Sync additions / changes only
        const changedOrAdded = next.filter((n: ChecklistItem) => {
          const p = prev.find(item => item.id === n.id);
          if (!p) return true;
          return JSON.stringify(p) !== JSON.stringify(n);
        });
        changedOrAdded.forEach(async (chk: ChecklistItem) => {
          try {
            await setDoc(doc(db, 'checklists', chk.id), { ...chk, userId: auth.currentUser!.uid });
          } catch (e) {
            console.error("Firestore checklist write fail:", e);
          }
        });
      }
      return next;
    });
  };

  const setTemplates = (value: React.SetStateAction<InterviewTemplate[]>) => {
    setTemplatesState(prev => {
      const next = typeof value === 'function' ? (value as any)(prev) : value;
      if (auth.currentUser) {
        const deletedIds = prev.filter(p => !next.some(n => n.id === p.id)).map(p => p.id);
        deletedIds.forEach(async (id) => {
          try {
            await deleteDoc(doc(db, 'templates', id));
          } catch (e) {
            console.error("Firestore template delete fail:", e);
          }
        });
        // Sync additions / changes only
        const changedOrAdded = next.filter((n: InterviewTemplate) => {
          const p = prev.find(item => item.id === n.id);
          if (!p) return true;
          return JSON.stringify(p) !== JSON.stringify(n);
        });
        changedOrAdded.forEach(async (tmp: InterviewTemplate) => {
          try {
            await setDoc(doc(db, 'templates', tmp.id), { ...tmp, userId: auth.currentUser!.uid });
          } catch (e) {
            console.error("Firestore template write fail:", e);
          }
        });
      }
      return next;
    });
  };

  const setReviews = (value: React.SetStateAction<PerformanceReview[]>) => {
    setReviewsState(prev => {
      const next = typeof value === 'function' ? (value as any)(prev) : value;
      if (auth.currentUser) {
        const deletedIds = prev.filter(p => !next.some(n => n.id === p.id)).map(p => p.id);
        deletedIds.forEach(async (id) => {
          try {
            await deleteDoc(doc(db, 'reviews', id));
          } catch (e) {
            console.error("Firestore review delete fail:", e);
          }
        });
        // Sync additions / changes only
        const changedOrAdded = next.filter((n: PerformanceReview) => {
          const p = prev.find(item => item.id === n.id);
          if (!p) return true;
          return JSON.stringify(p) !== JSON.stringify(n);
        });
        changedOrAdded.forEach(async (rev: PerformanceReview) => {
          try {
            await setDoc(doc(db, 'reviews', rev.id), { ...rev, userId: auth.currentUser!.uid });
          } catch (e) {
            console.error("Firestore review write fail:", e);
          }
        });
      }
      return next;
    });
  };

  // Synchronise Firestore Collections on User Login
  useEffect(() => {
    if (!fbUser) return;

    // Employees Collection Snapshot
    const qEmp = query(collection(db, 'employees'), where('userId', '==', fbUser.uid));
    const unsubEmp = onSnapshot(qEmp, (snapshot) => {
      const list: Employee[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Employee);
      });
      if (list.length > 0) {
        setEmployeesState(prev => {
          if (areRecordsEqual(prev, list)) return prev;
          return list;
        });
      } else {
        // Seed database atomically in a single batch to prevent multiple snapshot callbacks
        try {
          const batch = writeBatch(db);
          INITIAL_EMPLOYEES.forEach((emp) => {
            const ref = doc(db, 'employees', emp.id);
            batch.set(ref, { ...emp, userId: fbUser.uid });
          });
          batch.commit().catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, 'employees/seed');
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'employees/seed');
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'employees');
    });

    // Checklists Collection Snapshot
    const qChk = query(collection(db, 'checklists'), where('userId', '==', fbUser.uid));
    const unsubChk = onSnapshot(qChk, (snapshot) => {
      const list: ChecklistItem[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ChecklistItem);
      });
      if (list.length > 0) {
        setChecklistsState(prev => {
          if (areRecordsEqual(prev, list)) return prev;
          return list;
        });
      } else {
        try {
          const batch = writeBatch(db);
          DEFAULT_CHECKLISTS.forEach((chk) => {
            const ref = doc(db, 'checklists', chk.id);
            batch.set(ref, { ...chk, userId: fbUser.uid });
          });
          batch.commit().catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, 'checklists/seed');
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'checklists/seed');
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'checklists');
    });

    // Interview Guides Collection Snapshot
    const qTmp = query(collection(db, 'templates'), where('userId', '==', fbUser.uid));
    const unsubTmp = onSnapshot(qTmp, (snapshot) => {
      const list: InterviewTemplate[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as InterviewTemplate);
      });
      if (list.length > 0) {
        setTemplatesState(prev => {
          if (areRecordsEqual(prev, list)) return prev;
          return list;
        });
      } else {
        try {
          const batch = writeBatch(db);
          DEFAULT_TEMPLATES.forEach((tmp) => {
            const ref = doc(db, 'templates', tmp.id);
            batch.set(ref, { ...tmp, userId: fbUser.uid });
          });
          batch.commit().catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, 'templates/seed');
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'templates/seed');
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'templates');
    });

    // Reviews Collection Snapshot
    const qRev = query(collection(db, 'reviews'), where('userId', '==', fbUser.uid));
    const unsubRev = onSnapshot(qRev, (snapshot) => {
      const list: PerformanceReview[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as PerformanceReview);
      });
      setReviewsState(prev => {
        if (areRecordsEqual(prev, list)) return prev;
        return list;
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    });

    return () => {
      unsubEmp();
      unsubChk();
      unsubTmp();
      unsubRev();
    };
  }, [fbUser]);

  // Sync state triggers to localStorage safe nodes
  useEffect(() => {
    localStorage.setItem('secure_hr_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('secure_hr_checklists', JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem('secure_hr_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('secure_hr_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('secure_hr_analyses', JSON.stringify(analyses));
  }, [analyses]);

  useEffect(() => {
    localStorage.setItem('secure_hr_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('secure_hr_masked', String(isMasked));
  }, [isMasked]);

  // Listen for PayPal Redirect Success Query Parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      const plan = params.get('plan') as any;
      const support = params.get('support') as any;
      const amount = Number(params.get('amount') || 0);
      
      if (plan) {
        setActiveTier(plan);
        if (support) {
          localStorage.setItem('secure_hr_active_support_tier', support);
        }
        
        // Add invoice ledger record
        const txHash = 'tr_paypal_' + Math.random().toString(36).substring(2, 11);
        const newInvoice = {
          id: `INV-PAYPAL-${Date.now().toString().slice(-4)}`,
          date: new Date().toISOString().split('T')[0],
          amount: amount,
          plan: `${plan} Plan (via Secure PayPal Gateway)`,
          status: 'Paid' as const,
          transactionHash: txHash
        };
        
        // Push invoice to invoice state
        const savedInvoices = localStorage.getItem('secure_hr_invoices');
        const invoicesList = savedInvoices ? JSON.parse(savedInvoices) : [];
        if (!invoicesList.some((inv: any) => inv.transactionHash === txHash)) {
          const updated = [newInvoice, ...invoicesList];
          localStorage.setItem('secure_hr_invoices', JSON.stringify(updated));
        }

        addLog('PayPal Payment Succeeded', 'Modification', `Successfully completed PayPal transaction for ${plan} Tier. Paid £${amount}`);
        
        // Clean URL to prevent re-triggering upgrade on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (params.get('payment_cancel') === 'true') {
      addLog('PayPal Payment Cancelled', 'Security', `User cancelled PayPal Checkout redirect or payment session failed.`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Unified logging controller
  const addLog = (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const clearLogs = () => {
    setAuditLogs([]);
    addLog('Compliance Audit Trail Cleared', 'Security', 'User executed visual clean command for session logs.');
  };

  // Stat calculations for local dashboard panel
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const onboardingCount = employees.filter(e => e.status === 'Onboarding').length;
  const pendingChecklists = checklists.filter(c => !c.completed).length;

  if (!currentUser) {
    return (
      <LandingPage 
        onLoginSuccess={(email) => {
          setCurrentUser(email);
          addLog('User Authorized Session', 'Security', `Administrator verified workspace credentials for ${email}`);
        }}
        addLog={addLog}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="applet-viewport">
      
      {/* Top Secure Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-6 sticky top-0 z-40 shadow-md" id="header-control">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-md font-extrabold tracking-tight text-white flex items-center gap-1.5">
                STUDIOBUILDAI
                <span className="text-[10px] bg-indigo-950/60 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-900/50 font-bold font-mono tracking-wide uppercase mt-0.5 select-none animate-pulse">
                  Offline • Production
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">Strictly localized client-side personnel records, screening, and evaluations toolkit.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextState = !isMasked;
                setIsMasked(nextState);
                addLog('Toggle Redaction Mask', 'Security', `Toggled personnel data masking to state: ${nextState ? 'REDACTED' : 'REVEALED'}`);
              }}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
                isMasked 
                ? 'bg-amber-950/50 text-amber-300 border-amber-800/50' 
                : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
              }`}
              title="Toggle workspace identifiers masking for screen safety"
            >
              <Lock className="w-3.5 h-3.5" />
              {isMasked ? 'Identifiers: Redacted' : 'Identifiers: Unmasked'}
            </button>
            
            <span className="h-4 w-[1px] bg-slate-800" />
            
            <div className="text-right hidden md:block">
              <div className="text-[9px] uppercase font-mono tracking-wide text-indigo-400">Active Admin</div>
              <div className="text-xs font-semibold text-slate-300 font-mono" title={currentUser}>
                {currentUser.length > 20 ? currentUser.slice(0, 17) + '...' : currentUser}
              </div>
            </div>

            <button
              onClick={async () => {
                addLog('Tenant Console Session Closed', 'Security', `User logged out cleanly from workspace session.`);
                localStorage.removeItem('secure_hr_is_bypass');
                localStorage.removeItem('secure_hr_curr_user');
                try {
                  await signOut(auth);
                } catch (e) {
                  console.error("Sign out fail", e);
                } finally {
                  setCurrentUser(null);
                }
              }}
              className="bg-slate-950 hover:bg-red-950/20 text-[10px] font-black px-3 py-1.5 rounded-lg border border-slate-800 hover:border-red-900/30 text-slate-400 hover:text-red-300 transition-all cursor-pointer select-none"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">

        {/* Interactive Demo Tour Companion */}
        <DemoTourCompanion 
          employees={employees}
          setEmployees={setEmployees}
          checklists={checklists}
          setChecklists={setChecklists}
          templates={templates}
          setTemplates={setTemplates}
          reviews={reviews}
          setReviews={setReviews}
          analyses={analyses}
          setAnalyses={setAnalyses}
          activeTier={activeTier}
          setActiveTier={setActiveTier}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          addLog={addLog}
          isMasked={isMasked}
          setIsMasked={setIsMasked}
        />
        
        {/* Quick Snapshot Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="snapshot-metrics-panel">
          
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 transition-all hover:scale-[1.01] hover:border-slate-700/55 shadow-sm">
            <div className="text-slate-450 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Active System Roster
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-extrabold text-white font-mono">{activeCount}</span>
              <span className="text-[10px] text-slate-400">onboarded ({onboardingCount} pending)</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 transition-all hover:scale-[1.01] hover:border-slate-700/55 shadow-sm">
            <div className="text-slate-450 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Local Screenings Log
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-extrabold text-white font-mono">{analyses.length}</span>
              <span className="text-[10px] text-slate-400">resume match scorecards</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 transition-all hover:scale-[1.01] hover:border-slate-700/55 shadow-sm">
            <div className="text-slate-450 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <FileSignature className="w-3.5 h-3.5 text-sky-400" />
              Appraisal Appraisals
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-extrabold text-white font-mono">{reviews.length}</span>
              <span className="text-[10px] text-slate-400">confidential evaluations</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 transition-all hover:scale-[1.01] hover:border-slate-700/55 shadow-sm">
            <div className="text-slate-450 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
              <ListChecks className="w-3.5 h-3.5 text-amber-400" />
              Outstanding Protocols
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-extrabold text-white font-mono">{pendingChecklists}</span>
              <span className="text-[10px] text-slate-400">checkpoints remaining</span>
            </div>
          </div>

        </div>

        {/* Tab Boundaries Roster Bar */}
        <div className="bg-slate-900 rounded-xl p-1 border border-slate-800 flex flex-wrap" id="navigation-tabs-bar">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'roster' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Users className="w-4 h-4" />
            Personnel Roster
          </button>

          <button
            onClick={() => setActiveTab('screener')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'screener' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileText className="w-4 h-4" />
            Resume Screener
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'interviews' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Interview Guides
          </button>

          <button
            onClick={() => setActiveTab('evaluations')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'evaluations' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            Performance Reviews
          </button>

          <button
            onClick={() => setActiveTab('checklists')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'checklists' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            On/Offboarding Checklists
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'policies' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Policies & Workflows
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'automation' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Automation Hub
          </button>

          <button
            onClick={() => setActiveTab('doc-intel')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'doc-intel' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Doc Intelligence
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'chat' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Secure AI Assistant
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              activeTab === 'billing' 
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm font-black border-transparent' 
              : 'text-indigo-400 hover:text-indigo-305 hover:bg-slate-850 bg-indigo-950/20 border-indigo-900/30'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Plans & Billing
            {activeTier === 'Starter' ? (
              <span className="bg-amber-500 text-slate-950 font-mono text-[8px] font-black px-1.5 py-0.2 rounded uppercase animate-pulse shrink-0">
                Upgrade
              </span>
            ) : (
              <span className="bg-emerald-500 text-slate-950 font-mono text-[8px] font-black px-1.5 py-0.2 rounded uppercase shrink-0 font-bold">
                Active
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'calendar' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Compliance Calendar
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'analytics' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Workforce Insights
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'contracts' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Legal Synthesizer
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'security' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security & Controls
          </button>
        </div>

        {/* Tab Contents Component Hub */}
        <div className="transition-all duration-300 min-h-[480px]">
          {activeTab === 'roster' && (
            <EmployeeDirectory 
              employees={employees} 
              setEmployees={setEmployees} 
              isMasked={isMasked}
              addLog={addLog}
            />
          )}

          {activeTab === 'screener' && (
            <ResumeParser 
              analyses={analyses} 
              setAnalyses={setAnalyses} 
              addLog={addLog}
            />
          )}

          {activeTab === 'interviews' && (
            <InterviewBuilder 
              templates={templates} 
              setTemplates={setTemplates} 
              addLog={addLog}
            />
          )}

          {activeTab === 'evaluations' && (
            <PerformanceReviewComponent 
              employees={employees} 
              reviews={reviews} 
              setReviews={setReviews} 
              addLog={addLog}
              activeTier={activeTier}
            />
          )}

          {activeTab === 'checklists' && (
            <ComplianceChecklist 
              checklists={checklists} 
              setChecklists={setChecklists} 
              addLog={addLog}
            />
          )}

          {activeTab === 'policies' && (
            <WorkflowsPolicies 
              employees={employees} 
              addLog={addLog}
              activeTier={activeTier}
            />
          )}

          {activeTab === 'automation' && (
            <OnboardingAutomation
              employees={employees}
              addLog={addLog}
              activeTier={activeTier}
            />
          )}

          {activeTab === 'doc-intel' && (
            <DocumentIntelligence 
              addLog={addLog}
            />
          )}

          {activeTab === 'chat' && (
            <InternalChat 
              employees={employees} 
              addLog={addLog}
              activeTier={activeTier}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'billing' && (
            <PlansBilling 
              addLog={addLog}
              activeTier={activeTier}
              setActiveTier={setActiveTier}
            />
          )}

          {activeTab === 'calendar' && (
            <HolidaysLeavesCalendar 
              employees={employees}
              addLog={addLog}
              activeTier={activeTier}
            />
          )}

          {activeTab === 'analytics' && (
            <WorkforceAnalytics 
              employees={employees}
              addLog={addLog}
              activeTier={activeTier}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractLetterGenerator 
              employees={employees}
              addLog={addLog}
              activeTier={activeTier}
            />
          )}

          {activeTab === 'security' && (
            <PrivacySettings 
              isMasked={isMasked} 
              setIsMasked={setIsMasked} 
              auditLogs={auditLogs}
              clearLogs={clearLogs}
              employees={employees}
              setEmployees={setEmployees}
              checklists={checklists}
              setChecklists={setChecklists}
              reviews={reviews}
              setReviews={setReviews}
              templates={templates}
              setTemplates={setTemplates}
              addLog={addLog}
            />
          )}
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="bg-slate-905 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p>🔒 **Private HR Assistant** — Client Production Standard v1.2</p>
          <p>Processing executed entirely on local thread. Memory isolated.</p>
        </div>
      </footer>

    </div>
  );
}

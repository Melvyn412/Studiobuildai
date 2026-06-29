import React, { useState, useEffect } from 'react';
import { Employee, ChecklistItem, InterviewTemplate, PerformanceReview, AuditLog, Tenant, WhitelabelConfig } from './types';
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
import WhitelabelBranding from './components/WhitelabelBranding';

import { 
  Users, FileText, ClipboardList, Shield, ShieldCheck, Lock,
  GraduationCap, ListChecks, CheckCircle2, FileSignature, Sparkles, CreditCard,
  GitBranch, Cpu, CalendarDays, BarChart2, Briefcase, Globe, Plus, Terminal
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

  // Tenancy System
  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    return localStorage.getItem('secure_hr_active_tenant_id') || 'default';
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('secure_hr_tenants');
    return saved ? JSON.parse(saved) : [
      { id: 'default', name: 'StudioBuild Corp', subdomain: 'studiobuild', createdAt: new Date().toISOString() }
    ];
  });

  // Custom Whitelabel Configuration
  const [whitelabelConfig, setWhitelabelConfig] = useState<WhitelabelConfig>(() => {
    const saved = localStorage.getItem('secure_hr_whitelabel_config');
    return saved ? JSON.parse(saved) : {
      companyName: 'STUDIOBUILDAI',
      theme: 'indigo',
      customDomain: 'hr.studiobuild.ai',
      logoIcon: 'shield',
      isWhitelabelActive: false
    };
  });

  // Offline state engines loaded from localStorage triggers. Mirror collections to/from Firestore on load.
  const [employees, setEmployeesState] = useState<Employee[]>(() => {
    const savedActive = localStorage.getItem('secure_hr_active_tenant_id') || 'default';
    const saved = localStorage.getItem(`secure_hr_employees_${savedActive}`);
    if (saved) return JSON.parse(saved);
    return savedActive === 'default' ? INITIAL_EMPLOYEES : [];
  });

  const [checklists, setChecklistsState] = useState<ChecklistItem[]>(() => {
    const savedActive = localStorage.getItem('secure_hr_active_tenant_id') || 'default';
    const saved = localStorage.getItem(`secure_hr_checklists_${savedActive}`);
    if (saved) return JSON.parse(saved);
    return savedActive === 'default' ? DEFAULT_CHECKLISTS : [];
  });

  const [templates, setTemplatesState] = useState<InterviewTemplate[]>(() => {
    const savedActive = localStorage.getItem('secure_hr_active_tenant_id') || 'default';
    const saved = localStorage.getItem(`secure_hr_templates_${savedActive}`);
    if (saved) return JSON.parse(saved);
    return savedActive === 'default' ? DEFAULT_TEMPLATES : [];
  });

  const [reviews, setReviewsState] = useState<PerformanceReview[]>(() => {
    const savedActive = localStorage.getItem('secure_hr_active_tenant_id') || 'default';
    const saved = localStorage.getItem(`secure_hr_reviews_${savedActive}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [analyses, setAnalyses] = useState<any[]>(() => {
    const savedActive = localStorage.getItem('secure_hr_active_tenant_id') || 'default';
    const saved = localStorage.getItem(`secure_hr_analyses_${savedActive}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const savedActive = localStorage.getItem('secure_hr_active_tenant_id') || 'default';
    const saved = localStorage.getItem(`secure_hr_audit_logs_${savedActive}`);
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

  const [activeTab, setActiveTab] = useState<'roster' | 'screener' | 'interviews' | 'evaluations' | 'checklists' | 'policies' | 'automation' | 'doc-intel' | 'chat' | 'billing' | 'security' | 'calendar' | 'analytics' | 'contracts' | 'whitelabel'>('roster');

  useEffect(() => {
    localStorage.setItem('secure_hr_subscription_tier', activeTier);
  }, [activeTier]);

  // Load data when activeTenantId changes
  useEffect(() => {
    const savedEmp = localStorage.getItem(`secure_hr_employees_${activeTenantId}`);
    setEmployeesState(savedEmp ? JSON.parse(savedEmp) : (activeTenantId === 'default' ? INITIAL_EMPLOYEES : []));

    const savedChecklists = localStorage.getItem(`secure_hr_checklists_${activeTenantId}`);
    setChecklistsState(savedChecklists ? JSON.parse(savedChecklists) : (activeTenantId === 'default' ? DEFAULT_CHECKLISTS : []));

    const savedTemplates = localStorage.getItem(`secure_hr_templates_${activeTenantId}`);
    setTemplatesState(savedTemplates ? JSON.parse(savedTemplates) : (activeTenantId === 'default' ? DEFAULT_TEMPLATES : []));

    const savedReviews = localStorage.getItem(`secure_hr_reviews_${activeTenantId}`);
    setReviewsState(savedReviews ? JSON.parse(savedReviews) : []);

    const savedAnalyses = localStorage.getItem(`secure_hr_analyses_${activeTenantId}`);
    setAnalyses(savedAnalyses ? JSON.parse(savedAnalyses) : []);

    const savedLogs = localStorage.getItem(`secure_hr_audit_logs_${activeTenantId}`);
    setAuditLogs(savedLogs ? JSON.parse(savedLogs) : INITIAL_AUDIT_LOGS);
  }, [activeTenantId]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('secure_hr_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('secure_hr_active_tenant_id', activeTenantId);
  }, [activeTenantId]);

  useEffect(() => {
    localStorage.setItem('secure_hr_whitelabel_config', JSON.stringify(whitelabelConfig));
  }, [whitelabelConfig]);

  useEffect(() => {
    localStorage.setItem(`secure_hr_employees_${activeTenantId}`, JSON.stringify(employees));
  }, [employees, activeTenantId]);

  useEffect(() => {
    localStorage.setItem(`secure_hr_checklists_${activeTenantId}`, JSON.stringify(checklists));
  }, [checklists, activeTenantId]);

  useEffect(() => {
    localStorage.setItem(`secure_hr_templates_${activeTenantId}`, JSON.stringify(templates));
  }, [templates, activeTenantId]);

  useEffect(() => {
    localStorage.setItem(`secure_hr_reviews_${activeTenantId}`, JSON.stringify(reviews));
  }, [reviews, activeTenantId]);

  useEffect(() => {
    localStorage.setItem(`secure_hr_analyses_${activeTenantId}`, JSON.stringify(analyses));
  }, [analyses, activeTenantId]);

  useEffect(() => {
    localStorage.setItem(`secure_hr_audit_logs_${activeTenantId}`, JSON.stringify(auditLogs));
  }, [auditLogs, activeTenantId]);


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
            await setDoc(doc(db, 'employees', emp.id), { ...emp, tenantId: activeTenantId, userId: auth.currentUser!.uid });
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
            await setDoc(doc(db, 'checklists', chk.id), { ...chk, tenantId: activeTenantId, userId: auth.currentUser!.uid });
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
            await setDoc(doc(db, 'templates', tmp.id), { ...tmp, tenantId: activeTenantId, userId: auth.currentUser!.uid });
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
            await setDoc(doc(db, 'reviews', rev.id), { ...rev, tenantId: activeTenantId, userId: auth.currentUser!.uid });
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
      let hasDataForUser = false;
      snapshot.forEach((d) => {
        hasDataForUser = true;
        const emp = d.data() as Employee;
        if (emp.tenantId === activeTenantId || (!emp.tenantId && activeTenantId === 'default')) {
          list.push(emp);
        }
      });
      if (hasDataForUser) {
        setEmployeesState(prev => {
          if (areRecordsEqual(prev, list)) return prev;
          return list;
        });
      } else if (activeTenantId === 'default') {
        // Seed database atomically in a single batch to prevent multiple snapshot callbacks
        try {
          const batch = writeBatch(db);
          INITIAL_EMPLOYEES.forEach((emp) => {
            const ref = doc(db, 'employees', emp.id);
            batch.set(ref, { ...emp, tenantId: 'default', userId: fbUser.uid });
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
      let hasDataForUser = false;
      snapshot.forEach((d) => {
        hasDataForUser = true;
        const chk = d.data() as ChecklistItem;
        if (chk.tenantId === activeTenantId || (!chk.tenantId && activeTenantId === 'default')) {
          list.push(chk);
        }
      });
      if (hasDataForUser) {
        setChecklistsState(prev => {
          if (areRecordsEqual(prev, list)) return prev;
          return list;
        });
      } else if (activeTenantId === 'default') {
        try {
          const batch = writeBatch(db);
          DEFAULT_CHECKLISTS.forEach((chk) => {
            const ref = doc(db, 'checklists', chk.id);
            batch.set(ref, { ...chk, tenantId: 'default', userId: fbUser.uid });
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
      let hasDataForUser = false;
      snapshot.forEach((d) => {
        hasDataForUser = true;
        const tmp = d.data() as InterviewTemplate;
        if (tmp.tenantId === activeTenantId || (!tmp.tenantId && activeTenantId === 'default')) {
          list.push(tmp);
        }
      });
      if (hasDataForUser) {
        setTemplatesState(prev => {
          if (areRecordsEqual(prev, list)) return prev;
          return list;
        });
      } else if (activeTenantId === 'default') {
        try {
          const batch = writeBatch(db);
          DEFAULT_TEMPLATES.forEach((tmp) => {
            const ref = doc(db, 'templates', tmp.id);
            batch.set(ref, { ...tmp, tenantId: 'default', userId: fbUser.uid });
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
        const rev = d.data() as PerformanceReview;
        if (rev.tenantId === activeTenantId || (!rev.tenantId && activeTenantId === 'default')) {
          list.push(rev);
        }
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
  }, [fbUser, activeTenantId]);

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

  // Get dynamic branding configuration details
  const currentTheme = whitelabelConfig.isWhitelabelActive ? whitelabelConfig.theme : 'indigo';
  const currentCompanyName = whitelabelConfig.isWhitelabelActive ? whitelabelConfig.companyName : 'STUDIOBUILDAI';
  
  const getThemeClasses = (themeName: string) => {
    switch (themeName) {
      case 'emerald':
        return {
          bg: 'bg-emerald-600',
          bgHover: 'hover:bg-emerald-500',
          text: 'text-emerald-400',
          textHover: 'hover:text-emerald-300',
          border: 'border-emerald-500/20',
          borderFocus: 'focus:border-emerald-500',
          badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-900/50',
          badgeHover: 'hover:bg-emerald-950/80',
          shadow: 'shadow-emerald-500/10'
        };
      case 'rose':
        return {
          bg: 'bg-rose-600',
          bgHover: 'hover:bg-rose-500',
          text: 'text-rose-400',
          textHover: 'hover:text-rose-300',
          border: 'border-rose-500/20',
          borderFocus: 'focus:border-rose-500',
          badge: 'bg-rose-950/60 text-rose-300 border-rose-900/50',
          badgeHover: 'hover:bg-rose-950/80',
          shadow: 'shadow-rose-500/10'
        };
      case 'amber':
        return {
          bg: 'bg-amber-600',
          bgHover: 'hover:bg-amber-500',
          text: 'text-amber-400',
          textHover: 'hover:text-amber-300',
          border: 'border-amber-500/20',
          borderFocus: 'focus:border-amber-500',
          badge: 'bg-amber-950/60 text-amber-300 border-amber-900/50',
          badgeHover: 'hover:bg-amber-950/80',
          shadow: 'shadow-amber-500/10'
        };
      case 'violet':
        return {
          bg: 'bg-violet-600',
          bgHover: 'hover:bg-violet-500',
          text: 'text-violet-400',
          textHover: 'hover:text-violet-300',
          border: 'border-violet-500/20',
          borderFocus: 'focus:border-violet-500',
          badge: 'bg-violet-950/60 text-violet-300 border-violet-900/50',
          badgeHover: 'hover:bg-violet-950/80',
          shadow: 'shadow-violet-500/10'
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-600',
          bgHover: 'hover:bg-cyan-500',
          text: 'text-cyan-400',
          textHover: 'hover:text-cyan-300',
          border: 'border-cyan-500/20',
          borderFocus: 'focus:border-cyan-500',
          badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-900/50',
          badgeHover: 'hover:bg-cyan-950/80',
          shadow: 'shadow-cyan-500/10'
        };
      default: // indigo
        return {
          bg: 'bg-indigo-600',
          bgHover: 'hover:bg-indigo-500',
          text: 'text-indigo-400',
          textHover: 'hover:text-indigo-300',
          border: 'border-indigo-500/20',
          borderFocus: 'focus:border-indigo-500',
          badge: 'bg-indigo-950/60 text-indigo-300 border-indigo-900/50',
          badgeHover: 'hover:bg-indigo-950/80',
          shadow: 'shadow-indigo-500/10'
        };
    }
  };

  const activeClasses = getThemeClasses(currentTheme);

  const LogoIcon = () => {
    if (!whitelabelConfig.isWhitelabelActive) {
      return <ShieldCheck className="w-5 h-5 text-white" />;
    }
    switch (whitelabelConfig.logoIcon) {
      case 'globe': return <Globe className="w-5 h-5 text-white" />;
      case 'briefcase': return <Briefcase className="w-5 h-5 text-white" />;
      case 'cpu': return <Cpu className="w-5 h-5 text-white" />;
      case 'terminal': return <Terminal className="w-5 h-5 text-white" />;
      case 'users': return <Users className="w-5 h-5 text-white" />;
      default: return <Shield className="w-5 h-5 text-white" />;
    }
  };

  // Selector state
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceSubdomain, setNewWorkspaceSubdomain] = useState('');
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    const cleanSubdomain = newWorkspaceSubdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || newWorkspaceName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const newTenant: Tenant = {
      id: 'tenant_' + Date.now(),
      name: newWorkspaceName.trim(),
      subdomain: cleanSubdomain,
      createdAt: new Date().toISOString()
    };

    setTenants(prev => [...prev, newTenant]);
    setActiveTenantId(newTenant.id);
    setNewWorkspaceName('');
    setNewWorkspaceSubdomain('');
    setIsCreatingWorkspace(false);
    setShowWorkspaceSelector(false);
    addLog('Corporate Tenant Provisioned', 'Modification', `Successfully registered tenant workspace: "${newTenant.name}" (subdomain: ${newTenant.subdomain}.studiobuild.ai)`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="applet-viewport">
      
      {/* Top Secure Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-6 sticky top-0 z-40 shadow-md" id="header-control">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className={`${activeClasses.bg} p-2 rounded-lg text-white shadow-xs transition-colors duration-350`}>
                <LogoIcon />
              </div>
              <div>
                <h1 className="text-md font-extrabold tracking-tight text-white flex items-center gap-1.5 uppercase transition-all">
                  {currentCompanyName}
                  {whitelabelConfig.isWhitelabelActive && (
                    <span className="text-[8px] bg-emerald-950/60 text-emerald-300 px-1 rounded border border-emerald-900/40 font-bold uppercase select-none">
                      Whitelabel Active
                    </span>
                  )}
                </h1>
                <p className="text-[10px] text-slate-400">Strictly localized client-side personnel records, screening, and evaluations toolkit.</p>
              </div>
            </div>

            {/* Elegant Workspace Dropdown */}
            <div className="relative z-50">
              <button
                onClick={() => setShowWorkspaceSelector(!showWorkspaceSelector)}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-all cursor-pointer select-none"
              >
                <Globe className={`w-3.5 h-3.5 ${activeClasses.text}`} />
                <span>Workspace: <strong className="text-white">{activeTenant.name}</strong></span>
                <span className="text-slate-500 font-mono text-[9px]">({activeTenant.subdomain})</span>
                <span className="text-[9px] text-slate-400">▼</span>
              </button>

              {showWorkspaceSelector && (
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-2.5 space-y-2 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1.5">
                    Select Tenant Workspace
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {tenants.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTenantId(t.id);
                          setShowWorkspaceSelector(false);
                          addLog('Workspace Context Switched', 'System', `Switched context cleanly to workspace: "${t.name}"`);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                          activeTenantId === t.id
                          ? 'bg-slate-950 text-white border-l-2 border-indigo-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-950'
                        }`}
                      >
                        <span className="truncate pr-1">{t.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono">({t.subdomain})</span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-800/80 pt-2">
                    {isCreatingWorkspace ? (
                      <form onSubmit={handleCreateWorkspace} className="space-y-2 p-1">
                        <input
                          type="text"
                          required
                          placeholder="Company/Workspace Name"
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="subdomain (optional)"
                          value={newWorkspaceSubdomain}
                          onChange={(e) => setNewWorkspaceSubdomain(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                        />
                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="submit"
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1 rounded transition-all"
                          >
                            Create
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCreatingWorkspace(false)}
                            className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-bold py-1 rounded transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsCreatingWorkspace(true)}
                        className="w-full py-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800/50 text-indigo-400 hover:text-indigo-300 text-[10px] font-black tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Provision Tenant
                      </button>
                    )}
                  </div>
                </div>
              )}
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
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
              ? `${activeClasses.bg} text-white shadow-sm` 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security & Controls
          </button>

          <button
            onClick={() => setActiveTab('whitelabel')}
            className={`flex-1 min-w-[100px] text-center px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              activeTab === 'whitelabel' 
              ? `${activeClasses.bg} text-white shadow-sm border-transparent` 
              : 'text-indigo-400 hover:text-indigo-305 hover:bg-slate-850 bg-indigo-950/10 border-indigo-900/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Corporate Whitelabel
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

          {activeTab === 'whitelabel' && (
            <WhitelabelBranding 
              config={whitelabelConfig}
              setConfig={setWhitelabelConfig}
              activeTier={activeTier}
              addLog={addLog}
              onUpgradePrompt={() => {
                setActiveTab('billing');
                addLog('Upgrade Workflow Prompted', 'System', 'Redirected user to Plans & Billing tab for Corporate Whitelabel activation.');
              }}
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

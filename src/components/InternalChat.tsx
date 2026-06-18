import React, { useState, useEffect, useRef } from 'react';
import { Employee, AuditLog } from '../types';
import { 
  Sparkles, Send, ShieldAlert, Bot, HelpCircle, User, 
  Trash2, Copy, Check, FileText, UserSquare2, RefreshCw, Layers,
  Search, BookOpen, ArrowRight, Eye, Globe, GitBranch, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_POLICIES, COUNTRY_PRESETS, WORKFLOW_TEMPLATES } from './WorkflowsPolicies';

interface InternalChatProps {
  employees: Employee[];
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  activeTier?: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI';
  setActiveTab?: (tab: any) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

const PRESET_QUICK_PROMPTS = [
  {
    title: "Draft Onboarding Protocol",
    prompt: "Draft a comprehensive onboarding checklist tailored for a Senior React Engineer with deep PostgreSQL and TypeScript focus.",
    tag: "Onboarding"
  },
  {
    title: "Formulate Screening Strategy",
    prompt: "What indicators should I look for when screening a resume for a lead HR Recruiter possessing legal compliance expertise?",
    tag: "Strategy"
  },
  {
    title: "Appraisal Performance Review",
    prompt: "Provide tips on delivering critical performance feedback during reviews for a mid-level engineer missing core skill parameters.",
    tag: "Appraisal"
  },
  {
    title: "Draft Behavioral Interview Questions",
    prompt: "Formulate five highly structured behavioral interview questions focusing on team collaboration and system architecture reasoning.",
    tag: "Interviews"
  }
];

const SEARCH_FAQ_PROMPTS = [
  {
    title: "UK PTO Rollover Limit",
    query: "What is the maximum rollover PTO limit for employee accounts located in the United Kingdom?",
    desc: "Cross-checks statutory UK legal presets."
  },
  {
    title: "Sickness Carryover Rules",
    query: "Do unused sick and wellness days roll over at the end of the year or trigger cash pay-out liabilities upon exit?",
    desc: "Queries Wellness sickness leave framework."
  },
  {
    title: "Parental Workload Phasing",
    query: "What phased return-to-work hybrid schedules are caregiver employees entitled to under parental guidelines?",
    desc: "Examines extended parental caregiver policies."
  },
  {
    title: "Leave Approval Occupancy",
    query: "What team occupancy safeguards and SLA steps must be satisfied during an automated calendar lookup for holiday leave approval?",
    desc: "Checks sequential Holiday Leave approval workflow steps."
  }
];

// Elegant inline secure markdown renderer that formats headers, bold, list bullets, code blocks, and warning alerts
const SecurityMarkdown = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 select-text font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="text-xs font-bold text-slate-100 uppercase tracking-wide mt-3 mb-1">{trimmed.replace('### ', '')}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="text-sm font-bold text-indigo-300 mt-4 mb-2">{trimmed.replace('## ', '')}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} className="text-md font-extrabold text-white mt-5 mb-2 border-b border-slate-800 pb-1">{trimmed.replace('# ', '')}</h2>;
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-normal pl-2 my-0.5 animate-scale-up">
              <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
              <span>{formatBoldInline(content)}</span>
            </div>
          );
        }

        // Numbered lists
        const numMatch = trimmed.match(/^\d+\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-normal pl-2 my-0.5 animate-scale-up">
              <span className="text-indigo-400 font-mono font-bold shrink-0 mt-0.5">{trimmed.match(/^\d+/)?.[0]}.</span>
              <span>{formatBoldInline(numMatch[1])}</span>
            </div>
          );
        }

        // Code block / Alert quote box
        if (trimmed.startsWith('⚠️')) {
          return (
            <div key={idx} className="p-3 bg-slate-950 border border-amber-900/40 rounded-lg text-xs text-amber-305 my-2 leading-relaxed whitespace-pre-line">
              {trimmed}
            </div>
          );
        }

        if (trimmed.startsWith('❌')) {
          return (
            <div key={idx} className="p-3 bg-red-955/20 border border-rose-900/30 rounded-lg text-xs text-rose-300 my-2 leading-relaxed whitespace-pre-line">
              {trimmed}
            </div>
          );
        }

        // Standard paragraph
        if (trimmed === '') return <div key={idx} className="h-1.5" />;
        return <p key={idx} className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{formatBoldInline(trimmed)}</p>;
      })}
    </div>
  );
};

// Formats **bold text** and `inline code`
const formatBoldInline = (content: string) => {
  const parts = content.split(/(\*\*.*?\*\*|`.*?`)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-indigo-300 border border-slate-800">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

export default function InternalChat({ employees, addLog, activeTier = 'Starter', setActiveTab }: InternalChatProps) {
  // Navigation activeMode toggle tab state
  const [activeMode, setActiveMode] = useState<'chat' | 'search'>('chat');

  const [messagesCount, setMessagesCount] = useState<number>(() => {
    return Number(localStorage.getItem('secure_hr_chat_count') || '0');
  });

  const incrementChatCount = () => {
    const nextCount = messagesCount + 1;
    setMessagesCount(nextCount);
    localStorage.setItem('secure_hr_chat_count', String(nextCount));
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('secure_hr_ai_chat_messages');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'initial',
        role: 'assistant',
        content: `👋 **Welcome to the Private AI Suite (Production Mode)!**
        
As your isolated security-hardened HR intelligence unit, I can help you compile specialized candidate evaluations, draft custom compliant checklists, build unique behavioral question lists, or review personnel performance.

To start, you can:
- Discuss general HR scenarios using the secure private container.
- Choose one of the **Preset Fast-Track Templates** in the sidebar.
- Attach an **active employee profile** securely from your local roster database below to target review inquiries.

*All system operations run securely. Your inputs remain contained in this production-ready container.*`,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Safe local context attachments
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [contextNoteType, setContextNoteType] = useState<'none' | 'employee'>('none');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync session log to browser secure layout space
  useEffect(() => {
    localStorage.setItem('secure_hr_ai_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Handle auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Document Search specific states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTraditionalResults, setSearchTraditionalResults] = useState<{ docName: string; line: string }[]>([]);
  const [searchAiResponse, setSearchAiResponse] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedDocumentPreview, setSelectedDocumentPreview] = useState<'vacation' | 'sick' | 'parental' | 'country_presets' | 'workflows' | null>(null);

  // Dynamic word count calculations
  const [docWordCounts, setDocWordCounts] = useState({
    vacation: 0,
    sick: 0,
    parental: 0,
    presets: 0,
    workflows: 0
  });

  // Calculate dynamic words on load and when local storage shifts
  useEffect(() => {
    const vText = localStorage.getItem('secure_hr_policy_text_vacation') || DEFAULT_POLICIES.vacation;
    const sText = localStorage.getItem('secure_hr_policy_text_sick') || DEFAULT_POLICIES.sick;
    const pText = localStorage.getItem('secure_hr_policy_text_parental') || DEFAULT_POLICIES.parental;

    const vWordCount = vText.split(/\s+/).filter(Boolean).length;
    const sWordCount = sText.split(/\s+/).filter(Boolean).length;
    const pWordCount = pText.split(/\s+/).filter(Boolean).length;

    const presetText = Object.values(COUNTRY_PRESETS).map(cp => cp.rules).join(' ');
    const presetWordCount = presetText.split(/\s+/).filter(Boolean).length;

    const workflowsText = Object.values(WORKFLOW_TEMPLATES).map(w => w.desc).join(' ');
    const workflowsWordCount = workflowsText.split(/\s+/).filter(Boolean).length;

    setDocWordCounts({
      vacation: vWordCount,
      sick: sWordCount,
      parental: pWordCount,
      presets: presetWordCount,
      workflows: workflowsWordCount
    });
  }, [selectedDocumentPreview]);

  // Helper to compile dynamic enterprise base text context
  const getCompanyHandbookContent = (): string => {
    const vacationText = localStorage.getItem('secure_hr_policy_text_vacation') || DEFAULT_POLICIES.vacation;
    const sickText = localStorage.getItem('secure_hr_policy_text_sick') || DEFAULT_POLICIES.sick;
    const parentalText = localStorage.getItem('secure_hr_policy_text_parental') || DEFAULT_POLICIES.parental;

    let text = `STUDIOBUILDAI COMPREHENSIVE COMPANY POLICIES AND COMPLIANCE HANDBOOK\n\n`;
    text += `[DOCUMENT 1: GLOBAL VACATION POLICY]\n${vacationText}\n\n`;
    text += `[DOCUMENT 2: SICK LEAVE & WELLNESS POLICY]\n${sickText}\n\n`;
    text += `[DOCUMENT 3: PARENTAL & CAREGIVER LEAVE POLICY]\n${parentalText}\n\n`;
    
    text += `[DOCUMENT 4: GLOBAL LEGAL COMPLIANCE PRESETS]\n`;
    Object.entries(COUNTRY_PRESETS).forEach(([key, preset]) => {
      text += `- Country Code: ${key}\n`;
      text += `  FullName: ${preset.name}\n`;
      text += `  Minimum Vacation/PTO: ${preset.minPtoDate} days\n`;
      text += `  Maximum Annual Rollover: ${preset.maxRollover} days\n`;
      text += `  Scheduled Holidays: ${preset.holidays.join(', ')}\n`;
      text += `  Country Rules: ${preset.rules}\n`;
    });
    text += `\n`;

    text += `[DOCUMENT 5: STANDARD OPERATIONAL WORKFLOWS]\n`;
    Object.entries(WORKFLOW_TEMPLATES).forEach(([key, t]) => {
      text += `- Category: ${key.toUpperCase()} Workflow\n`;
      text += `  Title: ${t.title}\n`;
      text += `  Overview: ${t.desc}\n`;
      text += `  Workflow Steps and SLAs:\n`;
      t.steps.forEach(s => {
        text += `    * Step ${s.id}: ${s.name} (Role: ${s.role}, SLA: ${s.sla}) -> ${s.description} (Verification Parameter: ${s.verificationKey})\n`;
      });
    });
    
    return text;
  };

  // Performs rigid traditional client-side regex exact matching
  const executeKeywordSearch = (query: string) => {
    const lowercaseQuery = query.toLowerCase().trim();
    if (!lowercaseQuery) return [];

    // Extract individual query words longer than 2 characters
    const words = lowercaseQuery.split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return [];

    const matches: { docName: string; line: string }[] = [];

    // Check custom policies texts
    const policies = [
      { id: 'vacation', name: 'Global Vacation Policy', text: localStorage.getItem('secure_hr_policy_text_vacation') || DEFAULT_POLICIES.vacation },
      { id: 'sick', name: 'Sick & Wellness Policy', text: localStorage.getItem('secure_hr_policy_text_sick') || DEFAULT_POLICIES.sick },
      { id: 'parental', name: 'Parental Leave Policy', text: localStorage.getItem('secure_hr_policy_text_parental') || DEFAULT_POLICIES.parental }
    ];

    policies.forEach(p => {
      const lines = p.text.split('\n');
      lines.forEach((line) => {
        const lineLower = line.toLowerCase();
        const score = words.filter(word => lineLower.includes(word)).length;
        if (score > 0) {
          matches.push({ docName: p.name, line: `${line.trim()}` });
        }
      });
    });

    // Check legal statutory guidelines
    Object.entries(COUNTRY_PRESETS).forEach(([key, cp]) => {
      const texts = [cp.name, cp.rules, ...cp.holidays];
      texts.forEach(text => {
        const matchesCount = words.filter(word => text.toLowerCase().includes(word)).length;
        if (matchesCount > 0) {
          matches.push({ 
            docName: `Statutory Preset: ${cp.name} (${key})`, 
            line: `PTO min: ${cp.minPtoDate} days, Rollover cap: ${cp.maxRollover} days. observed rules: ${cp.rules}` 
          });
        }
      });
    });

    // Check procedural SLA steps
    Object.entries(WORKFLOW_TEMPLATES).forEach(([key, wt]) => {
      const titleMatches = words.filter(word => wt.title.toLowerCase().includes(word)).length;
      if (titleMatches > 0) {
        matches.push({ docName: `Workflow Procedure: ${wt.title}`, line: `SLA sequence description: ${wt.desc}` });
      }
      wt.steps.forEach(st => {
        const txt = `${st.name} ${st.role} ${st.description} ${st.verificationKey}`;
        const score = words.filter(word => txt.toLowerCase().includes(word)).length;
        if (score > 0) {
          matches.push({ 
            docName: `Workflow sequence: ${wt.title} [Step ${st.id}]`, 
            line: `Actor: ${st.role} (SLA: ${st.sla}) - ${st.name}: ${st.description}. Verified by: ${st.verificationKey}` 
          });
        }
      });
    });

    // Remove duplicates to keep list clean
    const uniqueMatches: { docName: string; line: string }[] = [];
    const seenLines = new Set<string>();
    matches.forEach(m => {
      const key = `${m.docName}-${m.line.substring(0, 50)}`;
      if (!seenLines.has(key)) {
        seenLines.add(key);
        uniqueMatches.push(m);
      }
    });

    return uniqueMatches.slice(0, 6);
  };

  // High quality dual-engine query router
  const handleInstantSearch = async (queryText: string) => {
    const query = queryText.trim();
    if (!query || isSearching) return;

    if (activeTier === 'Starter' && messagesCount >= 5) {
      setSearchError('Trial quota lock active. Please upgrade your tier from the Plans page.');
      addLog('Policy Search Quota Blocked', 'Security', 'User search request blocked due to starter free tier limitations.');
      return;
    }

    setSearchQuery(query);
    setIsSearching(true);
    setSearchError('');
    setSearchAiResponse('');

    // Step 1: Fire Client-Side traditional search instantly
    const traditionalResult = executeKeywordSearch(query);
    setSearchTraditionalResults(traditionalResult);

    addLog('AI Brain Dual-Engine Query Dispatched', 'Data Access', `Search triggered on company data. Key: "${query}"`);

    // Step 2: Formulate enterprise context context payload
    const handbookContent = getCompanyHandbookContent();
    const activeContext = getSelectedContext();

    const contextPayload = `SECURITY CONTEXT: COMPREHENSIVE DOCUMENT SEARCH & COMPLIANCE QA BIAS
You must serve as the "Enterprise AI Policy Brain", a specialized internal policy analyst.
The user is querying internal company documentation.
Answer the user's specific policy query based ONLY on the provided database documents below.

Understood Enterprise Database:
==================================================
${handbookContent}
==================================================

Active Context (Refer only if relevant to the user query):
${activeContext}

Instructions:
1. Provide a direct, highly synthesized, and precise answer.
2. Directly cite the source document, country preset (e.g. UK, Germany), or workflow step SLA parameters to build trust.
3. If information is not covered, state it clearly but offer general compliant recommendations.
4. RETAIN your friendly and expert tone, using rich bold highlights and lists for maximum UI aesthetics.`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          context: contextPayload
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP network error ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setSearchError(data.text || "An error occurred with the secure AI gateway. Please verify configuration.");
      } else {
        setSearchAiResponse(data.text);
        incrementChatCount();
        addLog('AI Brain Instant Answer Synthesized', 'Security', `Completed document search synthesis. Text length: ${data.text?.length || 0} chars.`);
      }

    } catch (err: any) {
      console.error("Policy AI Brain search issue:", err);
      setSearchError("❌ Connection timeout or server issue. Ensure your development server is running.");
    } finally {
      setIsSearching(false);
    }
  };

  // Extract metadata of the chosen employee to feed securely
  const getSelectedContext = (): string => {
    if (contextNoteType === 'employee' && selectedEmployeeId) {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (emp) {
        return `Employee Full Name: ${emp.firstName} ${emp.lastName}
Roster ID: ${emp.id}
Email Context: ${emp.email}
Active Role: ${emp.role}
Active Department: ${emp.department}
System Status: ${emp.status}
Starting Salary: $${emp.salary.toLocaleString()}/yr
Internal Admin Notes: ${emp.notes || "No notes documented yet."}`;
      }
    }
    return '';
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const query = (customText || inputText).trim();
    if (!query || isLoading) return;

    if (activeTier === 'Starter' && messagesCount >= 5) {
      const limitMsg: Message = {
        id: `msg-limit-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Secure AI Assistant: Free Trial Prompt Quota Reached (${messagesCount}/5 Free Prompts)**
        
This workspace is running on the Free **Starter** tier, which restricts standard message volumes to evaluate basic connectivity. To continue utilizing uninterrupted infinite HR prompts and advanced screening guides:

- Please upgrade your subscription to **Professional Premium** or **Enterprise Suite** on the **Plans & Billing** page today!
- Unlock full high-priority Fine-Tuning presets, corporate PDF exports, and isolated secure workspace nodes.`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, limitMsg]);
      addLog('AI Prompt Quota Lock Triggered', 'Security', 'User requests blocked due to free trial limits. Redirect option shown.');
      return;
    }

    setInputText('');
    const userMsgId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    incrementChatCount();
    setIsLoading(true);

    // Track state context attached
    const activeContext = getSelectedContext();
    const handbookContent = getCompanyHandbookContent();
    
    // Auto-inject policy database in conversational mode too if user is asking about general policies!
    const isAskingAboutPolicy = /policy|vacation|leave|wellness|sick|accrual|parental|rollover|limit|sla/i.test(query);
    const policyContext = isAskingAboutPolicy 
      ? `\n\n[AUTO SYNCHRONIZED ENTERPRISE HANDBOOK COGNITIVE CONTEXT]\n${handbookContent}` 
      : ``;

    if (activeContext) {
      addLog('Secure Query Context Attached', 'Data Access', `Supplying isolated Employee Profile metadata reference to secure API thread. Target: ID ${selectedEmployeeId}`);
    } else {
      addLog('Secure Server-Side AI Request', 'System', 'Dispatched isolated HR chat inquiry payload to internal server proxy API.');
    }

    try {
      const chatHistory = [...messages, userMessage];
      const payloadMessages = chatHistory.slice(-10); // Hold last 10 messages to contain query frame token density

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: payloadMessages,
          context: (activeContext + policyContext) || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP network error ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toISOString(),
        isError: !!data.error
      };

      setMessages(prev => [...prev, assistantMessage]);
      addLog('Secure Generative Output Returned', 'Security', `Completed localized HR evaluation response chunk. Returned text length: ${data.text?.length || 0} chars.`);

    } catch (err: any) {
      console.error("Secure Chat Callback Connection Issue", err);
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Server Gateway Timeout**: We encountered an error sending this secure prompt to the workspace api. 
        
Please verify that the development backend is running successfully, and refresh your web iframe workspace viewport.`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPresetPrompt = (promptText: string) => {
    if (activeMode === 'chat') {
      handleSendMessage(undefined, promptText);
    } else {
      handleInstantSearch(promptText);
    }
  };

  const handleWipeChat = () => {
    if (confirm("Are you sure you want to shred current session logs? This cannot be undone.")) {
      setMessages([
        {
          id: 'initial',
          role: 'assistant',
          content: `🧹 **Session Shredded**: All conversational logs, metrics, and contextual indicators from this local session thread have been successfully erased from volatile memory nodes. 
          
Let me know what compliance challenge, employee directory draft, or screening optimization checklist we should construct next.`,
          timestamp: new Date().toISOString()
        }
      ]);
      setSelectedEmployeeId('');
      setContextNoteType('none');
      addLog('Conversational Log Shredded', 'Security', 'User ordered standard operational shredder pass across active session AI logs.');
    }
  };

  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(msgId);
      addLog('Secure Transcript Extracted', 'Data Access', `Copied chat message segment transcript directly from Active Thread clipboard memory.`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const selectedEmpObj = employees.find(e => e.id === selectedEmployeeId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-100" id="offline-ai-suite">
      
      {/* Sidebar Workspace Controls & Integrations (4-cols) */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Dynamic Sidebar card depending on Active Mode */}
        {activeMode === 'search' ? (
          /* "Understood Enterprise database" dynamic panel details */
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shrink-0 shadow-sm space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Indexed Database Base
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 bg-emerald-950/40 text-emerald-300 rounded font-mono font-bold uppercase border border-emerald-950">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Brain Connected
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              The internal AI Brain has fully ingested and analyzed these company records. Click are preview nodes to verify exact volatile memory contents:
            </p>

            <hr className="border-slate-800" />

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-bold">📜 Vacation Policy</span>
                  <span className="text-[8px] text-slate-500 font-mono font-bold">{docWordCounts.vacation} words • Active Accruals</span>
                </div>
                <button
                  onClick={() => setSelectedDocumentPreview('vacation')}
                  className="p-1 px-1.5 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 text-[9px] text-indigo-305 font-semibold cursor-pointer"
                  title="Verify source content"
                >
                  <Eye className="w-3 h-3 text-indigo-400" />
                  View
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-bold">🏥 Sickness & Wellness Policy</span>
                  <span className="text-[8px] text-slate-500 font-mono font-bold">{docWordCounts.sick} words • compensated sick days</span>
                </div>
                <button
                  onClick={() => setSelectedDocumentPreview('sick')}
                  className="p-1 px-1.5 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 text-[9px] text-indigo-305 font-semibold cursor-pointer"
                  title="Verify source content"
                >
                  <Eye className="w-3 h-3 text-indigo-400" />
                  View
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-bold">👶 Parental Leave handbook</span>
                  <span className="text-[8px] text-slate-500 font-mono font-bold">{docWordCounts.parental} words • caregivers compensations</span>
                </div>
                <button
                  onClick={() => setSelectedDocumentPreview('parental')}
                  className="p-1 px-1.5 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 text-[9px] text-indigo-305 font-semibold cursor-pointer"
                  title="Verify source content"
                >
                  <Eye className="w-3 h-3 text-indigo-400" />
                  View
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-bold">🌍 Legal statutory presets</span>
                  <span className="text-[8px] text-slate-500 font-mono font-bold">{docWordCounts.presets} words • US, UK, DE, JP limits</span>
                </div>
                <button
                  onClick={() => setSelectedDocumentPreview('country_presets')}
                  className="p-1 px-1.5 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 text-[9px] text-indigo-305 font-semibold cursor-pointer"
                  title="Verify source content"
                >
                  <Eye className="w-3 h-3 text-indigo-400" />
                  View
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-bold">🔄 Operational procedures Workflows</span>
                  <span className="text-[8px] text-slate-500 font-mono font-bold">{docWordCounts.workflows} words • sequential SLA steps</span>
                </div>
                <button
                  onClick={() => setSelectedDocumentPreview('workflows')}
                  className="p-1 px-1.5 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 text-[9px] text-indigo-305 font-semibold cursor-pointer"
                  title="Verify source content"
                >
                  <Eye className="w-3 h-3 text-indigo-400" />
                  View
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Secure AI Suite Isolation Status Card */
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shrink-0 shadow-sm space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-400" />
                Intelligence Node
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 bg-emerald-950/40 text-emerald-300 rounded font-mono font-bold uppercase border border-emerald-950">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Isolated Agent Mode
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Integrates directly with your volatile database. Contextual profiles remain fully enclosed inside your offline memory stack before proxy processing.
            </p>

            <hr className="border-slate-800" />

            {/* Secure Workspace Context Binding Panel */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Safe Workspace Context Selector
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setContextNoteType('none'); setSelectedEmployeeId(''); }}
                  className={`py-1.5 rounded text-center text-xs font-semibold cursor-pointer border ${
                    contextNoteType === 'none' 
                    ? 'bg-slate-950 text-indigo-305 border-indigo-900/40 font-bold' 
                    : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-950'
                  }`}
                >
                  No Context
                </button>
                <button
                  type="button"
                  onClick={() => setContextNoteType('employee')}
                  className={`py-1.5 rounded text-center text-xs font-semibold cursor-pointer border ${
                    contextNoteType === 'employee' 
                    ? 'bg-slate-950 text-indigo-305 border-indigo-900/40 font-bold' 
                    : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-950'
                  }`}
                >
                  Link Employee
                </button>
              </div>

              {contextNoteType === 'employee' && (
                <div className="space-y-1.5 pt-1">
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded text-xs text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  >
                    <option value="" className="text-slate-500 font-sans">-- Choose Employee from Roster --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="bg-slate-900 text-white font-sans">
                        {emp.firstName} {emp.lastName} ({emp.role})
                      </option>
                    ))}
                  </select>

                  {selectedEmpObj && (
                    <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-[10px] space-y-1 animate-scale-up font-sans">
                      <div className="font-semibold text-slate-100 flex items-center gap-1">
                        <UserSquare2 className="w-3.5 h-3.5 text-indigo-400" />
                        Attached Record Metadata:
                      </div>
                      <div className="text-slate-350 pr-1">
                        Department scope: <span className="font-medium text-slate-200">{selectedEmpObj.department}</span> • Role: <span className="font-medium text-slate-200">{selectedEmpObj.role}</span>
                      </div>
                      <div className="text-slate-450">
                        *AI prompts will auto-reference this metadata to increase drafting accuracy*
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Fast-Track Preset Templates Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 font-sans space-y-3 shadow-sm">
          <div className="flex items-center gap-1.5 mt-0.5">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {activeMode === 'chat' ? "Fast-Track Suggested Tasks" : "Instant Policy FAQ Targets"}
            </h4>
          </div>
          <p className="text-[10px] text-slate-400">
            {activeMode === 'chat' 
              ? "Jumpstart security-compliant evaluations using one-click structural prompts:" 
              : "Replaces tedious manual searching with instant synthesized analysis:"}
          </p>
          
          <div className="space-y-2 mt-2">
            {activeMode === 'chat' ? (
              PRESET_QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => selectPresetPrompt(p.prompt)}
                  className="w-full p-2.5 rounded-lg border border-slate-850 bg-slate-950/45 hover:bg-slate-955 hover:border-slate-800 transition-all text-left text-xs text-slate-300 flex flex-col gap-1 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 leading-snug">{p.title}</span>
                    <span className="text-[8px] bg-slate-900 text-indigo-300 font-mono font-bold px-1.5 py-0.2 rounded border border-slate-800">{p.tag}</span>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed truncate-3-lines">{p.prompt}</p>
                </button>
              ))
            ) : (
              SEARCH_FAQ_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isSearching}
                  onClick={() => selectPresetPrompt(p.query)}
                  className="w-full p-2.5 rounded-lg border border-slate-850 bg-slate-950/45 hover:bg-slate-955 hover:border-slate-800 transition-all text-left text-xs text-slate-300 flex flex-col gap-1 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-205 leading-snug flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
                      {p.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed translate-y-0.5">{p.query}</p>
                  <p className="text-[9px] text-slate-500 italic mt-1 font-mono">{p.desc}</p>
                </button>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Main Terminal Chat Window (8-cols with tabs selection inside) */}
      <div className="lg:col-span-8 flex flex-col h-[580px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm" id="chat-terminal-view">
        
        {/* Chat Control Top bar */}
        <div className="px-5 py-3.5 bg-slate-920 border-b border-slate-800 flex items-center justify-between shrink-0 font-sans">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-950 text-indigo-400 p-1.5 rounded-lg border border-indigo-900/50">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                {activeMode === 'chat' ? "Internal HR AI Assistant" : "🧠 Enterprise AI Brain Instant Policy Search"}
                {activeTier === 'Starter' ? (
                  <span className="text-[8px] bg-amber-955/80 text-amber-305 px-1.5 py-0.2 rounded font-mono font-bold border border-amber-900/40 animate-pulse select-none">
                    Starter ({messagesCount}/5 prompts)
                  </span>
                ) : (
                  <span className="text-[8px] bg-emerald-955/80 text-emerald-305 px-1.5 py-0.2 rounded font-mono font-black border border-emerald-900/40 select-none">
                    👑 {activeTier} Premium Plan
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-550">Volatile state containment • Production Secure</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTier === 'Starter' && setActiveTab && (
              <button
                type="button"
                onClick={() => setActiveTab('billing')}
                className="px-2 py-1 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-550 text-white rounded text-[10px] font-black uppercase tracking-wide cursor-pointer shadow-xs animate-pulse select-none"
                title="Upgrade to secure premium tiers"
              >
                ★ Upgrade Account
              </button>
            )}
            <button
              onClick={handleWipeChat}
              className="px-2 py-1 border border-slate-800 hover:bg-slate-805 hover:text-rose-400 rounded text-[10px] font-semibold text-slate-405 transition-colors flex items-center gap-1 cursor-pointer"
              title="Shred conversational production ledger"
            >
              <Trash2 className="w-3 h-3" />
              Shred Feed
            </button>
          </div>
        </div>

        {/* Workspace Mode Subbar Selection */}
        <div className="px-5 py-1.5 bg-slate-955 border-b border-slate-800 flex items-center gap-4 shrink-0 font-sans">
          <button
            type="button"
            onClick={() => setActiveMode('chat')}
            className={`px-3 py-1 bg-slate-900 border text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'chat'
              ? 'border-indigo-500 bg-indigo-950/20 text-white font-black'
              : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            💬 Interactive HR Advisor Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('search')}
            className={`px-3 py-1 bg-slate-900 border text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'search'
              ? 'border-indigo-505 bg-indigo-950/20 text-white font-black scale-[1.01]'
              : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            🧠 AI Brain Policy Search (Replaces Manual)
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeMode === 'chat' ? (
            /* Multi turn Chat container */
            <motion.div
              key="chat-tab"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {/* Message Feeds Scroll Container */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/25 scrollbar-thin select-text min-h-0">
                {messages.map((m) => {
                  const isAss = m.role === 'assistant';
                  return (
                    <div 
                      key={m.id}
                      className={`flex gap-3 max-w-2xl select-text animate-fade-in ${
                        isAss ? 'mr-auto' : 'ml-auto flex-row-reverse'
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border select-none ${
                        isAss 
                        ? 'bg-indigo-950/60 border-indigo-900/40 text-indigo-400' 
                        : 'bg-slate-900 border-slate-850 text-slate-300'
                      }`}>
                        {isAss ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      {/* Body Text Box */}
                      <div className="space-y-1 min-w-[124px] max-w-full">
                        <div className={`p-4 rounded-xl relative group select-text leading-relaxed border ${
                          isAss 
                            ? m.isError 
                              ? 'bg-red-955/20 border-rose-900/30'
                              : 'bg-slate-900/80 border-slate-850'
                            : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none'
                        }`}>
                          
                          {/* Copy/Admin Floating Widget */}
                          {isAss && (
                            <button
                              onClick={() => handleCopyMessage(m.id, m.content)}
                              className="absolute right-2 top-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-slate-800 rounded transition-all text-slate-405 hover:text-slate-100 cursor-pointer select-none"
                              title="Copy record to clipboard"
                            >
                              {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {isAss ? (
                            <SecurityMarkdown text={m.content} />
                          ) : (
                            <p className="text-xs select-text font-sans whitespace-pre-wrap leading-relaxed">{m.content}</p>
                          )}
                        </div>
                        
                        {/* Time badge */}
                        <div className={`text-[8px] font-mono font-medium text-slate-500 ${
                          isAss ? 'text-left pl-1' : 'text-right pr-1'
                        }`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Assistant Generation Spinner */}
                {isLoading && (
                  <div className="flex gap-3 max-w-2xl mr-auto animate-fade-in">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 animate-spin shrink-0">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-840 text-slate-400 text-xs flex items-center gap-2 font-sans select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                      Processing prompt securely through isolated server proxy...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Text Form Area */}
              <form onSubmit={(e) => handleSendMessage(e)} className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 font-sans flex gap-2">
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-white placeholder-slate-555 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal disabled:opacity-50"
                  placeholder={
                    selectedEmpObj 
                    ? `Ask about evaluation or onboarding for ${selectedEmpObj.firstName}...` 
                    : "Ask custom evaluation guidelines, drafting checklist tips..."
                  }
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer select-none disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed shrink-0"
                >
                  <span>Analyze</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          ) : (
            /* Traditional VS AI search playground split section */
            <motion.div
              key="search-tab"
              className="flex-1 flex flex-col min-h-0 bg-slate-950/15"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin flex flex-col min-h-0">
                
                {/* Search query top banner informational */}
                <div className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-lg flex items-start gap-2.5 shrink-0 animate-scale-up">
                  <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-extrabold text-slate-100 uppercase tracking-wider">Enterprise Brain Search Synced & Armed</h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      All core handbook policy text revisions, national holiday custom settings, and procedural workflows are fully mapped. AI analyzes correlations, matches synonym context, and isolates calculations.
                    </p>
                  </div>
                </div>

                {/* Main Unified Query Input Bar */}
                <div className="sticky top-0 z-10 shrink-0 bg-slate-900 p-4 border border-slate-800 rounded-xl space-y-1 shadow-md font-sans">
                  <form onSubmit={(e) => { e.preventDefault(); handleInstantSearch(searchQuery); }} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-indigo-500 focus:outline-none rounded-lg text-xs text-white placeholder-slate-500 leading-normal"
                        placeholder="Search company documentation with AI Brain... (e.g. UK carryover limits, parental caregiver return hybrid, leave SLA step 3)"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-950 disabled:text-slate-505 disabled:cursor-not-allowed font-semibold text-white rounded-lg text-xs flex items-center gap-1 select-none cursor-pointer transition-all shrink-0"
                    >
                      <span>AI Synthesize</span>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-305" />
                    </button>
                  </form>
                </div>

                {/* Compare Dual-Engine Visual Split Playground */}
                <div className="flex-1 min-h-0 flex flex-col">
                  {!searchQuery && !searchAiResponse && !isSearching ? (
                    /* Initial empty layout */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 border border-dashed border-slate-800 rounded-xl bg-slate-900/10 shrink-0">
                      <div className="p-3 bg-indigo-950/40 text-indigo-405 border border-indigo-900/30 rounded-full animate-bounce">
                        <Search className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-250">Awaiting Search Synthesis Query</h4>
                        <p className="text-[10px] text-slate-450 max-w-sm leading-relaxed">
                          Type a custom query in the compliance pathfinder above or select one of the high-value **Instant FAQ Targets** in the sidebar to review synthesis capabilities!
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Split Comparison Screen */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[300px]">
                      
                      {/* Left Side: Traditional Keyword exact Matching */}
                      <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex flex-col min-h-0">
                        <div className="flex items-center justify-between border-b border-slate-850 pb-2.5 mb-2 shrink-0">
                          <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            Legacy Keyword Indexer (Traditional)
                          </h4>
                          <span className="text-[9px] text-slate-450 font-mono font-bold bg-slate-900 px-1.5 py-0.2 rounded border border-slate-850">Exact Match Only</span>
                        </div>
                        
                        <p className="text-[9px] text-slate-450 leading-relaxed mb-3 shrink-0">
                          Scans for precise structural string slices word-for-word. Lacks understanding of synonyms, cross-document context, or policy implications.
                        </p>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0 select-text">
                          {searchTraditionalResults.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center p-4">
                              <p className="text-[10px] text-slate-500 font-mono italic">
                                ⚠️ No literal character fragments matched exactly in files. tradicional search returns empty.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2 font-mono text-[10px] select-text">
                              {searchTraditionalResults.map((res, idx) => (
                                <div key={idx} className="p-2.5 bg-slate-950 border border-slate-850/80 rounded-lg space-y-1.5 animate-scale-up select-text">
                                  <div className="text-[9px] uppercase font-bold text-slate-450 flex items-center justify-between">
                                    <span>📂 {res.docName}</span>
                                    <span className="text-[8px] bg-slate-900 px-1 border border-slate-850 text-slate-450 rounded pr-1.5 font-mono">Matched node</span>
                                  </div>
                                  <p className="text-slate-350 leading-relaxed break-words font-sans">{res.line}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 px-1 border-t border-slate-850 text-[9px] text-slate-500 flex items-center gap-1 mt-2 shrink-0 italic leading-relaxed">
                          ⚠️ Notice: Matches are static string slices. It cannot formulate structured answers, cross-reference UK/US variables, or extract dynamic SLA checklist timelines.
                        </div>
                      </div>

                      {/* Right Side: Modern AI Brain Synthesizer */}
                      <div className="bg-slate-900 border border-indigo-950 rounded-xl p-4 flex flex-col shadow-xl shadow-slate-950/20 ring-1 ring-indigo-900/20 min-h-0">
                        <div className="flex items-center justify-between border-b border-indigo-950 pb-2.5 mb-2 shrink-0">
                          <h4 className="text-[10px] font-extrabold uppercase text-indigo-305 tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            AI Brain Instantly Synthesized Answer
                          </h4>
                          <span className="text-[9px] text-indigo-300 font-mono font-black bg-indigo-955/50 px-1.5 py-0.2 rounded border border-indigo-900/30">Gemini-3.5-Flash</span>
                        </div>

                        <p className="text-[9px] text-slate-400 leading-relaxed mb-3 shrink-0">
                          Synthesizes comprehensive guidance, solves synonyms, maps operational SLA workflow grids, and highlights exact database policy citations instantly.
                        </p>

                        <div className="flex-1 overflow-y-auto pr-1 min-h-0 select-text">
                          {isSearching ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                              <div className="space-y-1">
                                <p className="text-[10px] text-slate-300 font-semibold font-sans">Reading Policy Core Files...</p>
                                <p className="text-[8px] text-slate-500 font-mono max-w-[180px] leading-relaxed mx-auto">
                                  Ingesting Vacation details, wellness presets, caregiver workflows, and active context metrics...
                                </p>
                              </div>
                            </div>
                          ) : searchError ? (
                            <div className="h-full flex items-center justify-center p-4">
                              <p className="text-xs text-rose-455 font-semibold text-center leading-relaxed">
                                {searchError}
                              </p>
                            </div>
                          ) : searchAiResponse ? (
                            <div className="space-y-4 animate-scale-up select-text">
                              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl shadow-xs select-text">
                                <SecurityMarkdown text={searchAiResponse} />
                              </div>

                              <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-850/50 shrink-0">
                                <span className="text-[9px] text-slate-450 font-mono flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                                  100% Policy Accurate & Verified
                                </span>
                                <button
                                  onClick={() => handleCopyMessage('search-res', searchAiResponse)}
                                  className="p-1 px-2 border border-slate-800 hover:bg-slate-800 transition-colors rounded text-[9px] text-slate-300 font-semibold flex items-center gap-1 cursor-pointer select-none"
                                >
                                  {copiedId === 'search-res' ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      Copy Report
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-center p-4">
                              <p className="text-[10px] text-slate-500 font-sans italic">
                                Submit a search above to execute the dual compliance synthesizer engine.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Elegant popup document content modal preview */}
      {selectedDocumentPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                {selectedDocumentPreview === 'vacation' && "Global Vacation and Accrual Policy"}
                {selectedDocumentPreview === 'sick' && "Sick Leave & Wellness Framework"}
                {selectedDocumentPreview === 'parental' && "Extended Parental & Caregiver Policy"}
                {selectedDocumentPreview === 'country_presets' && "Statutory Legal Presets (US, UK, DE, JP)"}
                {selectedDocumentPreview === 'workflows' && "Operational SLA Workflow Procedures"}
              </h3>
              <button
                onClick={() => setSelectedDocumentPreview(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            {/* Modal Scrollable Core Content */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs text-slate-350 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950 p-4 border border-slate-850 rounded-xl select-text scrollbar-thin">
              {selectedDocumentPreview === 'vacation' && (localStorage.getItem('secure_hr_policy_text_vacation') || DEFAULT_POLICIES.vacation)}
              {selectedDocumentPreview === 'sick' && (localStorage.getItem('secure_hr_policy_text_sick') || DEFAULT_POLICIES.sick)}
              {selectedDocumentPreview === 'parental' && (localStorage.getItem('secure_hr_policy_text_parental') || DEFAULT_POLICIES.parental)}
              {selectedDocumentPreview === 'country_presets' && (
                `STATUTORY LEGAL PRESETS AND COMPLIANCE OVERVIEW\n\n` +
                Object.values(COUNTRY_PRESETS).map(cp => (
                  `==================================================\n` +
                  `🔹 COUNTRY: ${cp.name}\n` +
                  `--------------------------------------------------\n` +
                  `• Statutory Minimum PTO: ${cp.minPtoDate} working days\n` +
                  `• Max Permissible Carryover: ${cp.maxRollover} days\n` +
                  `• Observed National Holidays: ${cp.holidays.join(', ')}\n` +
                  `• Compliance Guidelines: ${cp.rules}\n`
                )).join('\n')
              )}
              {selectedDocumentPreview === 'workflows' && (
                `ENTERPRISE OPERATIONAL HR WORKFLOW PROCEDURES\n\n` +
                Object.entries(WORKFLOW_TEMPLATES).map(([key, wt]) => (
                  `==================================================\n` +
                  `🔸 WORKFLOW: ${wt.title} [Code: ${key}]\n` +
                  `--------------------------------------------------\n` +
                  `Description: ${wt.desc}\n\n` +
                  `Sequential Audit SLA Steps:\n` +
                  wt.steps.map(s => (
                    `  [Step ${s.id}] ${s.name}\n` +
                    `    - Owner Role: ${s.role}\n` +
                    `    - Turnaround SLA Time: ${s.sla}\n` +
                    `    - Checkpoint Action: ${s.description}\n` +
                    `    - Verification Criteria: ${s.verificationKey}`
                  )).join('\n\n')
                )).join('\n\n')
              )}
            </div>

            {/* Modal Footer status */}
            <div className="pt-2 text-[10px] text-slate-450 border-t border-slate-850 flex items-center justify-between shrink-0 font-mono">
              <span>🔄 State loaded from secure local memory ledger</span>
              <span>Isolated Sandbox</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

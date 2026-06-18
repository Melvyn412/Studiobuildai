import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, ShieldCheck, Mail, ClipboardCheck, Edit2, Download, Printer, 
  Settings, PenSquare, Lock, Copy, Check, CheckSquare, RefreshCw
} from 'lucide-react';

interface ContractLetterGeneratorProps {
  employees: Employee[];
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  activeTier?: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI';
}

type TemplateType = 'OfferLetter' | 'ExecContract' | 'NDA' | 'IPAssignment' | 'Sponsorship';

export default function ContractLetterGenerator({ employees, addLog, activeTier = 'Starter' }: ContractLetterGeneratorProps) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [templateType, setTemplateType] = useState<TemplateType>('OfferLetter');
  
  // Custom Agreement Options
  const [probationMonths, setProbationMonths] = useState<string>('3 Months');
  const [nonCompeteMonths, setNonCompeteMonths] = useState<string>('6 Months');
  const [workModel, setWorkModel] = useState<string>('Hybrid (3 Days Office, 2 Days Remote)');
  const [customSalary, setCustomSalary] = useState<string>('');
  
  // Custom clauses checklist
  const [includeDisputeClause, setIncludeDisputeClause] = useState<boolean>(true);
  const [includeIPClause, setIncludeIPClause] = useState<boolean>(true);
  
  // Interactive Editing States
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [isLockCompiled, setIsLockCompiled] = useState<boolean>(false);
  const [compiledText, setCompiledText] = useState<string>('');

  const hrSignatoryName = 'Victoria Sterling';
  const hrSignatoryTitle = 'Chief compliance Auditor / HR Lead';

  // Find selected employee
  const currentEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees]);

  // Generate Document Text dynamically based on options and current target
  const compileTemplate = () => {
    if (!currentEmp) return 'Ready to compile document. Please select a candidate profiles above.';
    
    const empName = `${currentEmp.firstName} ${currentEmp.lastName}`;
    const empRole = currentEmp.role;
    const empDept = currentEmp.department;
    const empSalary = customSalary || (currentEmp.salary ? `£${currentEmp.salary.toLocaleString()}` : "£80,000");
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const validityDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    switch (templateType) {
      case 'OfferLetter':
        return `========================================================================
SOVEREIGN SYSTEMS CORP — COMPLIANCE-APPROVED OFFER OF EMPLOYMENT
========================================================================

Date: ${dateStr}
Recipient: ${empName}
Delivery Channel: Secure TLS Encrypted Workspace Terminal

Dear ${currentEmp.firstName},

On behalf of Sovereign Systems Corp, I am delighted to extend this formal 
offer of employment for the position of "${empRole}" within the ${empDept} 
Department. 

In this capacity, you will report directly to the department lead and collaborate 
on advanced sovereign compliance and telemetry initiatives.

Agreement Sub-clauses and Core Packages:
----------------------------------------
1. INITIAL COMPENSATION: Your starting base gross salary is set at ${empSalary} per 
   annum, payable in equal monthly installments via compliant localized bank transfer.
   
2. WORKING ARRANGEMENTS: You will follow a ${workModel} format, subject to periodic 
   review based on operational demands.
   
3. PROBATIONARY TIMELINE: This role incorporates a standard probationary cycle of 
   ${probationMonths}. During this span, either party may terminate this agreement 
   upon two weeks' written notification.

${includeIPClause ? `4. SECURITY & INTELLECTUAL PROPERTY: All technical modules, workflows, and 
   source systems produced under this contract remain the exclusive proprietary 
   property of Sovereign Systems Corp.` : ''}

${includeDisputeClause ? `5. COMPLIANCE & ARBITRATION: This contract is governed by standard National 
   employment regulations. Any discrepancies shall be resolved exclusively through private 
   professional arbitration.` : ''}

To accept this offer, please sign and date this document before ${validityDate}. 
We are thrilled to welcome you to our high-performance workforce.

Warm regards,

${hrSignatoryName}
${hrSignatoryTitle}
Sovereign Systems Corp.

------------------------------------------------------------------------
[EXECUTION BLOCK]

I, ${empName}, accept this offer under all specified sub-clauses.

Signature: ${isSigned ? `/S/ KEY_SIG_MD5_COMPLIANCE_${empName.toUpperCase().replace(/ /g, '_')}_APPROVED` : 'PENDING CLIENT DIGITAL SIGNATURE'}
Timestamp: ${isSigned ? new Date().toISOString() : 'PENDING'}
`;

      case 'ExecContract':
        return `========================================================================
SOVEREIGN CORESYST CORP — EXECUTIVE SERVICE MASTER AGREEMENT
========================================================================

THIS AGREEMENT is made on this ${dateStr} between Sovereign Coresyst Corp 
(the "Company") and ${empName} (the "Executive").

WHEREAS the Company desires to retain the professional services of the Executive 
as "${empRole}" in the ${empDept} division, and the Executive has agreed to 
provide such services on the terms and conditions set forth herein.

NOW, THEREFORE, IT IS AGREED AS FOLLOWS:

1. POSITION AND REQUISITES: The Executive shall execute responsibilities congruent with 
   the role of ${empRole}. The Executive agrees to maintain pristine operational 
   discretion and protect core structural code repositories.

2. COMPENSATIVE REMUNERATION: 
   - Annual Base Compensation: ${empSalary} sterling, paid monthly in arrears.
   - Bonus structure: Eligible for standard 15% annual target parameter allocations.

3. CODES OF CONDUCT AND COMPETENCY:
   - Work Model Target: ${workModel}
   - Probation period: ${probationMonths}
   - Non-Compete Period: For a term of ${nonCompeteMonths} post separation, the Executive 
     shall not compete directly or indirectly with compliance tools built hereunder.

${includeIPClause ? `4. RIGID WORK PRODUCT ASSIGNMENT: The Executive irrevocably assigns all right, 
   title, and interest in system designs, code lines, or database structures generated 
   under this governance.` : ''}

${includeDisputeClause ? `5. ESCROW ARBITRATION: In case of professional conflict, both entities contract 
   to adhere to the rules of the International Arbitration Assembly.` : ''}

IN WITNESS WHEREOF, the entities have caused this instrument to be executed with 
extreme compliance safety.

COMPANY:                                EXECUTIVE:
${hrSignatoryName}                        ${empName}
${hrSignatoryTitle}                       
${isSigned ? '[CRYPTOGRAPHIC SIGN-LOCK]' : '[PENDING DIGITAL SIGNATURE]'}
`;

      case 'NDA':
        return `========================================================================
MUTUAL NON-DISCLOSURE AGREEMENT (RESTRICTED HR MASTER)
========================================================================

Effective Date: ${dateStr}
Disclosing Entity: Sovereign Systems Corp
Receiving Partner: ${empName} (${empRole}, ${empDept})

1. CONFIDENTIAL PORTALS: The Receiving Partner acknowledges that in onboarding with the Company, 
   they will have access to non-public proprietary personnel systems, payroll spreadsheets, 
   decryption parameters, and employee metadata (collectively, "Confidential Information").

2. STRICT RESTRAINT: The Receiving Partner covenants to hold all such information in trust and 
   exclusive secrecy. No compilation, replication, or extraction of records shall occur 
   outside designated isolated sandboxes.

3. TERM OF SAFEGUARD: This restriction remains fully bound for a span of ${nonCompeteMonths} 
   following complete separation of contract.

IN WITNESS WHEREOF, the Parties execute this master.

Sovereign Compliance Representative:        Partner:
${hrSignatoryName}                        ${empName}
${isSigned ? '[SIGNED & RE-KEYED]' : '[PENDING SECURITY TOKEN]'}
`;

      case 'IPAssignment':
        return `========================================================================
MASTER INTELLECTUAL PROPERTY & INVENTION ASSIGNMENT DEED
========================================================================

This deed coordinates creative safety between:
Sovereign Labs Corp (the "Company") and ${empName} (the "Engineer").

In consideration of engineering compensation of ${empSalary} per annum:

1. EXCLUSIVITY: All inventions, modifications, scripts, schema definitions, and 
   source lines engineered by the Partner during association are the 
   exclusive property of the Company.

2. MORAL WAIVER: The Engineer irrevocably waives any moral rights arising under 
   national intellectual covenants.

3. SURVIVAL: Term bounds survive indefinitely beyond employee retention cycles.

Executed as a Deed of Security.

For Company:                               For Engineer:
${hrSignatoryName}                        ${empName}
${isSigned ? '[EX-DEED DIGITALLY SIGNED]' : '[PENDING RECIPIENT ENDORSEMENT]'}
`;

      case 'Sponsorship':
        return `========================================================================
OFFICIAL CERTIFICATE OF UK / UN SPONSORSHIP SUPPORT MANDATE
========================================================================

Date of Filing: ${dateStr}
Ref ID: SOV-COS-2026-${currentEmp.id.toUpperCase().replace('EMP-', '')}

This file certifies that Sovereign Systems Corp is actively sponsoring skilled 
onboarding credentials for:

Name: ${empName}
Designated Role: ${empRole}
Hiring Department: ${empDept}
Salary Baseline: ${empSalary}

Standard Assurances:
--------------------
- The company maintains standard certified Tier 2 sponsorship status.
- Role matches high-skill, market-rate technical qualifications guidelines.
- Probation timeline: ${probationMonths}
- Operating Schedule format: ${workModel}

Verified under Executive Compliance:

Date Signed: ${isSigned ? dateStr : 'PENDING'}
HR Signatory Hash: ${isSigned ? 'MD5_SIG_0x9C3A2B' : 'UNASSIGNED'}
`;
    }
  };

  // Compile document state whenever options shift
  useEffect(() => {
    setCompiledText(compileTemplate());
  }, [selectedEmpId, templateType, probationMonths, nonCompeteMonths, workModel, customSalary, includeDisputeClause, includeIPClause, isSigned]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(compiledText);
    setIsCopied(true);
    addLog('Exported Contract Text', 'Data Access', `Exported full text draft of: ${templateType} for ${currentEmp?.firstName} ${currentEmp?.lastName}`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTriggerPrint = () => {
    addLog('Triggered Contract Print Sequence', 'Data Access', `Authorized native local printer query on compiled contract for ${currentEmp?.firstName} ${currentEmp?.lastName}`);
    window.print();
  };

  const handleApplySignature = () => {
    if (isSigned) {
      setIsSigned(false);
      addLog('Revoked Document Digital Signature', 'Modification', `De-authorized digital compliance signature block for ${currentEmp?.firstName} ${currentEmp?.lastName}`);
    } else {
      setIsSigned(true);
      addLog('Applied Cryptographic Digital Signature', 'Security', `Generated MD5-verified digital signature blocks for ${currentEmp?.firstName} ${currentEmp?.lastName}`);
    }
  };

  const handleLockDownloadSimulation = () => {
    setIsLockCompiled(true);
    addLog('Compiled Immutable Contract Bundle', 'Security', `Locked contract layout INV-2026-${templateType} to prevent subsequent unauthorized alterations.`);
    alert(`Document Locked & Archived! Fully compiled ${templateType} mock PDF successfully archived to local audit logs.`);
    setTimeout(() => setIsLockCompiled(false), 3000);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-8 animate-fade-in text-slate-100" id="contract-builder-workspace">
      
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-505/25 text-indigo-400 border border-indigo-900/50">
              Corporate Legal
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
              Direct Synthesis
            </span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-450 text-indigo-400" />
            Automated Offer Letter & Contract Synthesizer
          </h2>
          <p className="text-xs text-slate-400">
            Pull live records from local directories to instantly draft, configure, sign, and archive legally compliant HR work documents.
          </p>
        </div>
      </div>

      {/* Workspace Configuration Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Configuration Drawer (Span 5) */}
        <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800/85 space-y-5" id="contract-options-panel">
          
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <Settings className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 text-slate-400">
              Document Synthesis Params
            </h3>
          </div>

          {/* Recipient Target dropdown */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-300 block">Select Personnel Target Profile:</label>
            <select
              value={selectedEmpId}
              onChange={(e) => {
                setSelectedEmpId(e.target.value);
                setIsSigned(false);
                addLog('Contract Target Selected', 'Data Access', `Selected candidate ${e.target.value} as contract target.`);
              }}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded px-3 py-2 text-slate-300 outline-none cursor-pointer"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.department} — {emp.role})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">Pulls starting salary, department alignment, and role labels dynamically.</p>
          </div>

          {/* Template Style Select */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-300 block">Governance Template Layout:</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { type: 'OfferLetter', label: 'Employment Offer Letter' },
                { type: 'ExecContract', label: 'Executive Service Master' },
                { type: 'NDA', label: 'Mutual Non-Disclosure (NDA)' },
                { type: 'IPAssignment', label: 'Invention & IP Assignment' },
                { type: 'Sponsorship', label: 'Visa Sponsorship Mandate' }
              ].map((tmpl) => (
                <button
                  key={tmpl.type}
                  type="button"
                  onClick={() => {
                    setTemplateType(tmpl.type as TemplateType);
                    setIsSigned(false);
                    addLog('Loaded Legal Agreement Template', 'Data Access', `Initialized layout structure for: ${tmpl.label}`);
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    templateType === tmpl.type 
                    ? 'bg-indigo-950/45 border-indigo-500 text-white' 
                    : 'bg-slate-900 border-slate-850 hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  <span>{tmpl.label}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">v1.2</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contract Specific Rules */}
          <div className="border-t border-slate-850 pt-4 space-y-4 text-xs">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-450 text-slate-400 block">Additional Safeguards Checklist</span>

            <div className="grid grid-cols-2 gap-3">
              {/* Probation settings */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-400 block">Probationary Period:</label>
                <select
                  value={probationMonths}
                  onChange={(e) => setProbationMonths(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 outline-none text-xs cursor-pointer"
                >
                  <option value="None">None (Immediate Permanence)</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months (Extended Trial)</option>
                </select>
              </div>

              {/* Non-Compete setting */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-400 block">Post-Severance Non-Compete:</label>
                <select
                  value={nonCompeteMonths}
                  onChange={(e) => setNonCompeteMonths(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 outline-none text-xs cursor-pointer"
                >
                  <option value="None">None (Open Employment)</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months (Standard)</option>
                  <option value="12 Months">12 Months (Exec / Sensitive Key)</option>
                </select>
              </div>
            </div>

            {/* Workplace model selection */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-400 block">Corporate Work Format:</label>
              <select
                value={workModel}
                onChange={(e) => setWorkModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-305 text-slate-300 outline-none text-xs cursor-pointer"
              >
                <option value="100% On-Site (HQ Core Operations)">100% On-Site (HQ Presence Required)</option>
                <option value="Hybrid (3 Days Office, 2 Days Remote)">Hybrid (3 Days Office, 2 Days Remote)</option>
                <option value="Hybrid (1 Day Office, 4 Days Remote)">Hybrid (1 Day Office, 4 Days Remote)</option>
                <option value="100% Remote (Global Network Coordinates)">100% Remote (Isolated VPN Coordinates)</option>
              </select>
            </div>

            {/* Custom Salary Override */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-400 block">Salary Override (Optional):</label>
              <input
                type="text"
                placeholder={currentEmp ? `£${(currentEmp.salary || 80000).toLocaleString()} (Standard Account)` : 'e.g. £110,000'}
                value={customSalary}
                onChange={(e) => setCustomSalary(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-505 focus:border-indigo-500 rounded px-3 py-1.5 text-slate-300 outline-none text-xs"
              />
            </div>

            {/* Boolean Safeguards */}
            <div className="space-y-2.5 pt-1.5 bg-slate-900/40 p-3 rounded-lg border border-slate-850/60">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeIPClause}
                  onChange={(e) => setIncludeIPClause(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-[11px] font-semibold text-slate-350 text-slate-300">Exclude/Include Rigid Work IP Clauses</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeDisputeClause}
                  onChange={(e) => setIncludeDisputeClause(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-[11px] font-semibold text-slate-350 text-slate-300">Include Mandatory Private Arbitration Clause</span>
              </label>
            </div>

          </div>

        </div>

        {/* Right Column: High-fidelity document drafting viewport (Span 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4" id="document-preview-block">
          
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <PenSquare className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Interactive Contract Typewriter Preview
              </h3>
            </div>
            
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 italic">
              SSL Sealed Thread
            </span>
          </div>

          {/* Render box typewriter */}
          <div className="w-full bg-slate-900 p-6 rounded-lg border border-slate-855 border-slate-800 font-mono text-xs overflow-auto h-[480px] whitespace-pre-wrap select-text text-slate-300 relative shadow-inner">
            {compiledText}
            
            <AnimatePresence>
              {isSigned && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-6 bottom-40 bg-zinc-950/90 text-zinc-300 text-[10px] font-bold p-3 rounded-lg border-2 border-dashed border-emerald-500 flex flex-col gap-1 items-start shadow-xl rotate-[-2deg] select-none"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="uppercase text-[9px] text-emerald-400 font-extrabold tracking-wider">Sovereign Signed Matrix</span>
                  </div>
                  <span className="text-[8px] text-slate-400">SIGNER: {currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : 'RECIPIENT'}</span>
                  <span className="text-[8px] text-zinc-500 font-mono">HASH: 0x9B88E72DFF1C3A</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Tools Tray */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            
            {/* Direct Digital Sign button */}
            <button
              onClick={handleApplySignature}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSigned 
                ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 hover:bg-emerald-900/40' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 shadow-xs'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {isSigned ? 'Revoke Crypto-Signature' : '✒️ Digitally Sign Sandbox Contract'}
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopyToClipboard}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
            >
              {isCopied ? <ClipboardCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {isCopied ? 'Copied Text!' : 'Copy Document'}
            </button>

            {/* Print button */}
            <button
              onClick={handleTriggerPrint}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>

            {/* Archive download simulation */}
            <button
              onClick={handleLockDownloadSimulation}
              disabled={isLockCompiled}
              className="bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-750 text-slate-400 hover:text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
            >
              <Download className="w-4 h-4" />
              Archive Bundle
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { ResumeAnalysis } from '../types';
import { analyzeResumeLocally } from '../utils/hrHelpers';
import { 
  FileText, Shield, Sparkles, Upload, AlertCircle, CheckCircle, 
  Trash2, Mail, Phone, FileSignature, ArrowRight, ClipboardCopy, ListRestart
} from 'lucide-react';

interface ResumeParserProps {
  analyses: ResumeAnalysis[];
  setAnalyses: React.Dispatch<React.SetStateAction<ResumeAnalysis[]>>;
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
}

const TEMPLATE_RESUMES = {
  engineer: `Alan Turing
Email: turing@imitationgame.io
Phone: 555-1954
Target: Senior React Engineer

Objective: Senior Algorithmist with over 10 years experience constructing high density data engines.
Core Technical Stack: React ecosystem, TypeScript, JavaScript, NodeJS, Express, PostgreSQL, SQL databases, Git controls, REST APIs.
Experienced with system design and AWS cloud clusters.
Built custom local storage layers to minimize latency and guarantee 100% data fidelity.`,
  recruiter: `Penelope Cruz
Email: penelope.cruz@talent.org
Phone: 555-1212
Target: HR Talent generalist

Proven track record of success in corporate recruitment and onboarding.
Highly proficient in ATS systems, candidate sourcing, interviewer scheduling, and compliance.
Skilled in mediation, conflict resolution, union labor law guidelines, and planning corporate team building outings.`
};

export default function ResumeParser({ analyses, setAnalyses, addLog }: ResumeParserProps) {
  const [resumeText, setResumeText] = useState('');
  const [selectedDept, setSelectedDept] = useState('Engineering');
  const [targetRole, setTargetRole] = useState('Senior Full-stack Engineer');
  const [dragActive, setDragActive] = useState(false);
  const [currentResult, setCurrentResult] = useState<ResumeAnalysis | null>(null);

  const departments = ['Engineering', 'HR & Legal', 'Marketing', 'Product Management', 'Finance & Sales'];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setResumeText(event.target.result as string);
          addLog('File Drag-n-Dropped', 'Modification', `Read file payload of ${file.name} directly to screen`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setResumeText(event.target.result as string);
          addLog('File Uploaded Securely', 'Modification', `Imported local file: ${file.name}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteTemplate = (type: 'engineer' | 'recruiter') => {
    setResumeText(TEMPLATE_RESUMES[type]);
    if (type === 'engineer') {
      setSelectedDept('Engineering');
      setTargetRole('Senior React Engineer');
    } else {
      setSelectedDept('HR & Legal');
      setTargetRole('HR Recruiter & Talent Acquisition');
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    // Run local CPU parsing algorithm
    const result = analyzeResumeLocally(resumeText, selectedDept, targetRole);
    
    const newAnalysis: ResumeAnalysis = {
      id: `analysis-${Date.now()}`,
      candidateName: result.candidateName,
      email: result.email,
      phone: result.phone,
      targetRole,
      rawText: resumeText,
      score: result.score,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      recommendations: result.recommendations,
      analyzedAt: new Date().toISOString()
    };

    setAnalyses([newAnalysis, ...analyses]);
    setCurrentResult(newAnalysis);
    
    addLog(
      'Resume Processed Locally', 
      'Security', 
      `Extracted metrics for candidate "${newAnalysis.candidateName}" locally. Matched skills: ${newAnalysis.matchedSkills.length}. Score: ${newAnalysis.score}%`
    );
  };

  const handleDeleteAnalysis = (id: string, candidate: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Purge matching calculations for ${candidate}?`)) {
      setAnalyses(analyses.filter(a => a.id !== id));
      addLog('Analysis Record Purged', 'Modification', `Purged resume scorecard of candidate ${candidate}`);
      if (currentResult?.id === id) {
        setCurrentResult(null);
      }
    }
  };

  const loadOldResult = (res: ResumeAnalysis) => {
    setCurrentResult(res);
    setResumeText(res.rawText);
    setTargetRole(res.targetRole);
    addLog('Loaded Screen Scorecard', 'Data Access', `Loaded historic offline parse card for ${res.candidateName}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-100" id="resume-parser-container">
      {/* Upload & Paste Sheet (7-cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Offline Resume Parser
              </h2>
              <p className="text-xs text-slate-400">Strictly local CPU-based token matching. Zero servers, zero web API tracking.</p>
            </div>
            <div className="bg-emerald-950/40 text-emerald-300 border border-emerald-900/30 rounded px-2 py-0.5 text-[10px] font-mono font-medium flex items-center gap-1 shrink-0 select-none">
              <Shield className="w-3 h-3 text-emerald-400" />
              Production Isolated
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Target Department Scope</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept} className="bg-slate-900 text-white">{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Position / Job Title</label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Lead React Engineer"
                />
              </div>
            </div>

            {/* Drag & Paste Area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition-all ${
                dragActive ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <Upload className="w-7 h-7 text-slate-600 mb-1.5 shrink-0" />
              <p className="text-xs text-center text-slate-400 font-medium">
                Drag-and-drop resume text file, or paste content directly below
              </p>
              <label className="mt-2 inline-flex items-center bg-slate-950 hover:bg-slate-850 border border-slate-850 px-3 py-1 rounded text-[11px] font-semibold text-slate-300 cursor-pointer text-center select-none shadow-xs">
                Select File
                <input 
                  type="file" 
                  accept=".txt,.md,.json" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase font-semibold text-slate-400">Paste Plain Text Resume</label>
                <div className="flex gap-1.5">
                  <span className="text-[10px] text-slate-500">Load sample:</span>
                  <button 
                    type="button" 
                    onClick={() => handlePasteTemplate('engineer')}
                    className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    Engineer
                  </button>
                  <span className="text-[10px] text-slate-700">|</span>
                  <button 
                    type="button" 
                    onClick={() => handlePasteTemplate('recruiter')}
                    className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    HR Agent
                  </button>
                </div>
              </div>
              <textarea
                required
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste candidate resume credentials..."
                rows={10}
                className="w-full font-mono text-xs p-3 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed placeholder-slate-600"
                id="resume-paste-area"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => { setResumeText(''); setCurrentResult(null); }}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-800 hover:bg-slate-800 rounded text-xs font-semibold text-slate-300 cursor-pointer"
              >
                <ListRestart className="w-3.5 h-3.5" />
                Reset
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-100" />
                Analyze local match scorecard
              </button>
            </div>
          </form>
        </div>

        {/* History of Screenings */}
        {analyses.length > 0 && (
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Localized Screening History</h4>
            <div className="divide-y divide-slate-800 max-h-44 overflow-y-auto font-sans">
              {analyses.map(item => (
                <div 
                  key={item.id}
                  onClick={() => loadOldResult(item)}
                  className={`py-2 px-3 hover:bg-slate-800/40 rounded-lg transition-all cursor-pointer flex items-center justify-between text-xs ${
                    currentResult?.id === item.id ? 'bg-emerald-950/20 border border-emerald-900/30' : ''
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-200">{item.candidateName}</div>
                    <div className="text-[10px] text-slate-450">{item.targetRole} • {new Date(item.analyzedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-350" onClick={(e) => e.stopPropagation()}>
                    <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                      item.score >= 75 ? 'bg-green-950/50 text-green-300' :
                      item.score >= 50 ? 'bg-amber-950/50 text-amber-300' :
                      'bg-rose-955/50 text-rose-305'
                    }`}>
                      {item.score}%
                    </span>
                    <button
                      onClick={(e) => handleDeleteAnalysis(item.id, item.candidateName, e)}
                      className="text-slate-450 hover:text-rose-400 p-1 rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Parser Metrics Showcase (5-cols) */}
      <div className="lg:col-span-5 space-y-4">
        {currentResult ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 animate-scale-up shadow-sm animate-fade-in">
            <div>
              <span className="text-[10px] bg-emerald-950/30 text-emerald-300 font-mono border border-emerald-900/40 px-1.5 py-0.5 rounded uppercase font-bold">
                Offline Match Scorecard
              </span>
              <h3 className="font-bold text-white mt-2 text-base">{currentResult.candidateName}</h3>
              <p className="text-xs text-slate-350 leading-snug">{currentResult.targetRole}</p>
            </div>

            {/* Circular / Line Progress Metrics */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 flex items-center gap-4">
              <div className="relative shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#1f2937" strokeWidth="5" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke={currentResult.score >= 70 ? '#10B981' : currentResult.score >= 45 ? '#F59E0B' : '#EF4444'} strokeWidth="5" 
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - currentResult.score / 100)}
                  />
                </svg>
                <span className="absolute text-sm font-bold font-mono text-white">{currentResult.score}%</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Suitability Index</h4>
                <p className="text-[11px] text-slate-450 leading-normal mt-0.5">
                  Calculated purely via keyword matching and position-relevant taxonomies matching in-browser.
                </p>
              </div>
            </div>

            {/* Contact details parsed of candidate */}
            <div className="text-xs space-y-2 border-b border-slate-800 pb-3">
              <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Extracted Contact Metadata</h4>
              <div className="flex items-center gap-2 text-slate-350 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{currentResult.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-350 font-mono text-[11px]">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{currentResult.phone}</span>
              </div>
            </div>

            {/* Skills matched list */}
            <div>
              <h4 className="text-[10px] uppercase font-bold text-green-400 tracking-wider mb-1.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                Matched Skill tags ({currentResult.matchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {currentResult.matchedSkills.length === 0 ? (
                  <span className="text-[11px] text-slate-500">No matching preset skills identified.</span>
                ) : (
                  currentResult.matchedSkills.map(s => (
                    <span key={s} className="px-1.5 py-0.5 bg-green-950/30 text-green-305 text-[10px] font-medium rounded border border-green-900/40 font-mono">
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Skills missing list */}
            <div>
              <h4 className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Database Unmatched Skills ({currentResult.missingSkills.length})
              </h4>
              <div className="max-h-20 overflow-y-auto flex flex-wrap gap-1">
                {currentResult.missingSkills.length === 0 ? (
                  <span className="text-[11px] text-slate-400">Matches 100% of defined department taxonomy parameters!</span>
                ) : (
                  currentResult.missingSkills.slice(0, 15).map(s => (
                    <span key={s} className="px-1.5 py-0.5 bg-slate-950 text-slate-400 text-[10px] font-medium rounded border border-slate-800 font-mono">
                      {s}
                    </span>
                  ))
                )}
                {currentResult.missingSkills.length > 15 && (
                  <span className="text-[10px] text-slate-505 self-center">+{currentResult.missingSkills.length - 15} more...</span>
                )}
              </div>
            </div>

            {/* Recommendations stack */}
            <div className="pt-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-450 tracking-wider mb-1.5 flex items-center gap-1">
                <FileSignature className="w-3.5 h-3.5 text-indigo-400" />
                Actionable Evaluation Recommendations
              </h4>
              <ul className="space-y-1.5 list-none text-xs text-slate-350">
                {currentResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="leading-snug">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alert of production isolation */}
            <div className="p-2.5 bg-slate-950 border border-slate-850 rounded text-[10px] text-slate-400 leading-snug">
              ℹ️ **Compliance Guard:** You can freely copy this summary. These metrics exist strictly inside volatile active storage on this laptop thread. No reporting to corporate or remote tracking clusters is physically triggered.
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-64 shadow-sm">
            <Sparkles className="w-10 h-10 text-slate-700 mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">Awaiting local analysis</h4>
            <p className="text-xs max-w-xs mt-1 leading-normal">
              Paste details in the compiler or select a dummy template. Results will appear here instantly without telemetry loops.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

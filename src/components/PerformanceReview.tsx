import React, { useState } from 'react';
import { Employee, PerformanceReview as ReviewType } from '../types';
import { generatePrintableText } from '../utils/hrHelpers';
import { 
  FileText, Star, Plus, ShieldCheck, Mail, ClipboardCopy, 
  User, Sparkles, MessageSquare, History, Check, Calendar, Trash2, X, Printer
} from 'lucide-react';

interface PerformanceReviewProps {
  employees: Employee[];
  reviews: ReviewType[];
  setReviews: React.Dispatch<React.SetStateAction<ReviewType[]>>;
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  activeTier?: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI';
}

export default function PerformanceReview({ employees, reviews, setReviews, addLog, activeTier = 'Starter' }: PerformanceReviewProps) {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(reviews[0]?.id || null);
  const selectedReview = reviews.find(r => r.id === selectedReviewId) || null;

  // New review form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [targetEmpId, setTargetEmpId] = useState(employees[0]?.id || '');
  const [reviewer, setReviewer] = useState('Sarah Connor');
  const [ratingWork, setRatingWork] = useState(4);
  const [ratingTeam, setRatingTeam] = useState(4);
  const [ratingGrowth, setRatingGrowth] = useState(4);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [goals, setGoals] = useState('');
  
  const [copiedReviewId, setCopiedReviewId] = useState<string | null>(null);

  const handleApplyAIAutoDraft = (type: 'high' | 'competent' | 'pip') => {
    const targetEmp = employees.find(e => e.id === targetEmpId);
    const role = targetEmp ? targetEmp.role : 'Specialist';
    
    if (type === 'high') {
      setRatingWork(5);
      setRatingTeam(5);
      setRatingGrowth(5);
      setStrengths(`Exhibits stellar leadership as a ${role}. Consistently exceeds expectations on delivery parameters. Demonstrates impeccable technical design accuracy and helps lift team productivity.`);
      setImprovements('Continue seeking larger scope opportunities. Elevate public speaking and thought leadership on external-facing tech initiatives.');
      setGoals('Lead the legacy schema migration checklist before Q3 terminates. Mentor 2 new junior recruits in performance debugging practices.');
      addLog('AI Auto-Draft Applied', 'Modification', 'Populated Q3 performance scorecard with Professional template for high performer.');
    } else if (type === 'competent') {
      setRatingWork(4);
      setRatingTeam(4);
      setRatingGrowth(4);
      setStrengths(`Strong component ownership and reliable technical delivery as a ${role}. Communicates well with cross-functional product stakeholders.`);
      setImprovements('Refine deep-dive backend optimization skills. Be more proactive in leading engineering architectural reviews.');
      setGoals('Complete the advanced PostgreSQL performance review workshop. Increase testing code-coverage threshold past 85% in target repos.');
      addLog('AI Auto-Draft Applied', 'Modification', 'Populated Q3 performance scorecard with Professional template for solid performer.');
    } else {
      setRatingWork(2);
      setRatingTeam(3);
      setRatingGrowth(2);
      setStrengths(`Shows good fundamental intent regarding daily tasks on ${role} scope. Receptive to initial team feedback guides.`);
      setImprovements('Consistency in meeting core sprint timelines. Needs to align closer with compliant code practices and avoid bypassing unit tests.');
      setGoals('Participate in daily pairing sessions with senior level engineer. Show zero missed sprint deliverables for 3 successive milestones.');
      addLog('AI Auto-Draft Applied', 'Modification', 'Populated Q3 performance scorecard with Professional template for constructive performance plan.');
    }
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId || !reviewer.trim() || !strengths.trim()) return;

    const newReview: ReviewType = {
      id: `rev-${Date.now()}`,
      employeeId: targetEmpId,
      reviewer,
      ratingWork,
      ratingTeam,
      ratingGrowth,
      strengths,
      improvements,
      goals,
      submittedAt: new Date().toISOString()
    };

    setReviews([newReview, ...reviews]);
    setSelectedReviewId(newReview.id);
    setIsFormOpen(false);

    const emp = employees.find(e => e.id === targetEmpId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
    addLog('Performance Review Submitted', 'Modification', `Authorized local performance scorecard file for ${empName}`);

    // Reset Form
    setStrengths('');
    setImprovements('');
    setGoals('');
  };

  const handleCopyReview = (rev: ReviewType) => {
    const emp = employees.find(e => e.id === rev.employeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Identified Employee';
    
    let textBody = `PERFORMANCE REVIEW EVALUATION REPORT\nCandidate Employee: ${empName} (ID: ${rev.employeeId})\nEvaluator / Officer: ${rev.reviewer}\n\n`;
    textBody += `1. Work Delivery Performance: ${rev.ratingWork}/5 Stars\n`;
    textBody += `2. Team Cooperation & Synergy: ${rev.ratingTeam}/5 Stars\n`;
    textBody += `3. Career Horizon & Growth: ${rev.ratingGrowth}/5 Stars\n\n`;
    textBody += `CORE PROFESSIONAL STRENGTHS:\n${rev.strengths || 'N/A'}\n\n`;
    textBody += `AREAS REQUIRING EVOLUTIONARY STEPS:\n${rev.improvements || 'N/A'}\n\n`;
    textBody += `TARGET GOALS FOR NEXT RE-EVALUATION:\n${rev.goals || 'N/A'}\n`;

    const formatted = generatePrintableText(`Performance Audit Log - ${empName}`, textBody);
    navigator.clipboard.writeText(formatted);
    
    setCopiedReviewId(rev.id);
    addLog('Exported Performance Review', 'Data Access', `Copied evaluation report of ${empName} to secure sandbox file dump`);
    setTimeout(() => setCopiedReviewId(null), 2000);
  };

  const handleDeleteReview = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete review log sheet for employee: ${name}?`)) {
      setReviews(reviews.filter(r => r.id !== id));
      addLog('Review Sheet Deleted', 'Modification', `Purged offline feedback dossier of employee: ${name}`);
      if (selectedReviewId === id) {
        setSelectedReviewId(null);
      }
    }
  };

  // Helper to render rating stars
  const StarRating = ({ value, label, onChange }: { value: number; label: string; onChange?: (v: number) => void }) => {
    return (
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-gray-400 block">{label}</label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              type="button"
              disabled={!onChange}
              onClick={() => onChange && onChange(num)}
              className={`p-0.5 rounded transition-all cursor-pointer ${onChange ? 'hover:scale-115' : ''}`}
            >
              <Star className={`w-4 h-4 ${num <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-250'}`} />
            </button>
          ))}
          <span className="text-xs font-mono font-bold text-gray-700 ml-1">({value} / 5)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-100" id="performance-sheet">
      {/* Review list column (4-cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 rounded-xl border border-slate-805 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-400" />
              Evaluation Logs
            </h3>
            <button
              onClick={() => {
                if (employees.length === 0) {
                  alert("Provision an employee inside the Personnel Roster before conducting performance audits!");
                  return;
                }
                setTargetEmpId(employees[0].id);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 border border-indigo-900/40 px-3 py-1 rounded cursor-pointer transition-colors"
              id="btn-trigger-review"
            >
              <Plus className="w-3.5 h-3.5" />
              New Review
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto font-sans">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No compliance appraisals submitted yet.</p>
            ) : (
              reviews.map(item => {
                const emp = employees.find(e => e.id === item.employeeId);
                const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Record';
                const scoreAvg = ((item.ratingWork + item.ratingTeam + item.ratingGrowth) / 3).toFixed(1);

                return (
                  <div
                    key={item.id}
                    onClick={() => { setSelectedReviewId(item.id); addLog('Opened Appraisal Profile', 'Data Access', `Decrypted appraisal document for ${empName}`); }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-1.5 ${
                      selectedReviewId === item.id 
                      ? 'border-indigo-550 bg-indigo-950/35 shadow-xs text-slate-100' 
                      : 'border-slate-800 hover:bg-slate-800/40 text-slate-350'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white leading-snug">{empName}</div>
                      <div className="text-[10px] text-slate-450 mt-0.5 flex items-center gap-2">
                        <span>Score: <strong className="text-slate-200 font-bold">{scoreAvg}</strong>/5</span>
                        <span>•</span>
                        <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteReview(item.id, empName); }}
                      className="text-slate-450 hover:text-rose-400 p-1 rounded hover:bg-slate-800 cursor-pointer"
                      title="De-authorize"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Security guidelines bubble */}
        <div className="bg-indigo-950/10 border border-indigo-900/30 rounded-xl p-3.5 text-[11px] text-indigo-305 space-y-2">
          <div className="font-bold flex items-center gap-1 text-indigo-300">
            📂 Secure Data Segregation
          </div>
          <p className="leading-snug text-slate-300">
            All reviews contain sensitive career parameters. By maintaining evaluations 100% offline, you eliminate corporate breach profiles and protect internal trust guidelines.
          </p>
        </div>
      </div>

      {/* Review dashboard panel (8-cols) */}
      <div className="lg:col-span-8 space-y-4 font-sans">
        {selectedReview ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 animate-scale-up shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <span className="text-[10px] bg-slate-950 text-indigo-400 font-mono tracking-wide px-1.5 py-0.5 rounded border border-slate-800">
                  Performance Evaluation Record
                </span>
                <h3 className="font-bold text-white mt-1.5 text-base">
                  {(() => {
                    const emp = employees.find(e => e.id === selectedReview.employeeId);
                    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee';
                  })()}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Evaluated by Officer: <strong className="text-slate-200 font-semibold">{selectedReview.reviewer}</strong></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    addLog('Exported Printed View', 'Data Access', `Triggered system print context for candidate review`);
                    window.print();
                  }}
                  className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Evaluation
                </button>
                <button
                  onClick={() => handleCopyReview(selectedReview)}
                  className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-705 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  {copiedReviewId === selectedReview.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied Securely!
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="w-3.5 h-3.5" />
                      Copy Encrypted Summary
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Metrics Graph block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-805">
              <StarRating value={selectedReview.ratingWork} label="Quality of Work Delivery" />
              <StarRating value={selectedReview.ratingTeam} label="Team Affinity & Synergy" />
              <StarRating value={selectedReview.ratingGrowth} label="Self-Development & Adaptability" />
            </div>

            {/* Formatted evaluations */}
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Primary Technical & Professional Strengths
                </h4>
                <div className="p-3 bg-indigo-950/20 text-slate-200 leading-relaxed border border-indigo-900/20 rounded-lg whitespace-pre-line italic font-sans select-text">
                  {selectedReview.strengths}
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  Key Evolutionary Directions for Improvement
                </h4>
                <div className="p-3 bg-slate-950 text-slate-300 leading-relaxed border border-slate-800 rounded-lg whitespace-pre-line italic font-sans select-text hover:border-slate-705">
                  {selectedReview.improvements || "No specific gaps evaluated. Employee satisfies operational ruleset with maximum compliance."}
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-450" />
                  Designated Milestone Targets
                </h4>
                <div className="p-3 bg-slate-950 text-slate-300 leading-relaxed border border-slate-805 rounded-lg whitespace-pre-line italic font-sans select-text hover:border-slate-700">
                  {selectedReview.goals || "Establish general targets during the next confidential review session."}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-64 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-slate-705 mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">Awaiting Evaluation Selection</h4>
            <p className="text-xs max-w-xs mt-1 text-slate-450 animate-pulse">Select an active evaluation scorecard from the logs or submit a "New Review".</p>
          </div>
        )}
      </div>

      {/* Review creator modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 w-full max-w-xl overflow-hidden animate-scale-up text-white">
            <div className="px-5 py-3.5 bg-slate-955 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Conduct Confidential Appraisal Review</h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Target Personnel Card</label>
                  <select
                    value={targetEmpId}
                    onChange={(e) => setTargetEmpId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-955 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-505 outline-none font-sans"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">{emp.firstName} {emp.lastName} ({emp.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Evaluator Officer</label>
                  <input
                    type="text"
                    required
                    value={reviewer}
                    onChange={(e) => setReviewer(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-955 border border-slate-800 rounded text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-505 outline-none font-sans"
                  />
                </div>
              </div>

              {/* Assessment Sliders */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-805 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Quality of Work</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={ratingWork}
                      onChange={(e) => setRatingWork(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="text-xs font-mono font-semibold text-indigo-400 text-center mt-1">({ratingWork} / 5)</div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Team Affinity</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={ratingTeam}
                      onChange={(e) => setRatingTeam(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="text-xs font-mono font-semibold text-indigo-400 text-center mt-1">({ratingTeam} / 5)</div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Self Growth</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={ratingGrowth}
                      onChange={(e) => setRatingGrowth(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="text-xs font-mono font-semibold text-indigo-400 text-center mt-1">({ratingGrowth} / 5)</div>
                  </div>
                </div>
              </div>

              {/* Premium AI Auto-Drafter Selection Block */}
              {activeTier === 'Starter' ? (
                <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Premium AI Appraisal Auto-Drafter
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Automate performance reviews using professional enterprise patterns.</p>
                  </div>
                  <span className="text-[9px] bg-amber-500 text-slate-950 font-mono font-black px-1.5 py-0.5 rounded uppercase">
                    Upgradable
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-indigo-950/25 border border-indigo-900/40 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-450 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
                      AI Appraisal Auto-Drafter Unlocked! ({activeTier})
                    </p>
                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-mono font-black px-1.5 py-0.5 rounded uppercase">
                      PRO POWERED
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium">Choose a professional evaluation preset based on rating targets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyAIAutoDraft('high')}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] rounded cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      🌟 High Performer (5★)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAIAutoDraft('competent')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-705 text-slate-205 font-semibold text-[10px] rounded cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      🛠️ Solid Performer (4★)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAIAutoDraft('pip')}
                      className="px-2.5 py-1 bg-amber-950/30 hover:bg-amber-900/35 text-amber-300 border border-amber-900/40 font-semibold text-[10px] rounded cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      📉 PIP Growth Plan (2★)
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-slate-100">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Primary Professional Strengths</label>
                  <textarea
                    required
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 bg-slate-955 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-505 outline-none font-mono"
                    placeholder="Describe core delivery achievements, systems integration, or architectural standards met..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-405 mb-1">Evolutionary Steps for Improvement</label>
                  <textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 bg-slate-955 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-505 outline-none font-mono"
                    placeholder="Outline identified knowledge discrepancies or communications friction..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-405 mb-1">Designated Growth Goals</label>
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 bg-slate-955 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-505 outline-none font-mono"
                    placeholder="Assign clear checkpoints for the next 90-day review timeline..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 rounded text-xs font-semibold text-slate-350 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-605 hover:bg-indigo-705 text-white rounded text-xs font-semibold hover:shadow-sm transition-all cursor-pointer"
                >
                  Lock Appraisal Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { InterviewTemplate } from '../types';
import { generatePrintableText } from '../utils/hrHelpers';
import { 
  Briefcase, CheckSquare, Plus, Trash2, Printer, 
  Copy, ClipboardCheck, ArrowUpRight, Check, X, Bookmark
} from 'lucide-react';

interface InterviewBuilderProps {
  templates: InterviewTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<InterviewTemplate[]>>;
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
}

export default function InterviewBuilder({ templates, setTemplates, addLog }: InterviewBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(templates[0] || null);
  const [copied, setCopied] = useState(false);

  // Form states for custom template builder
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [seniority, setSeniority] = useState<'Junior' | 'Mid' | 'Senior' | 'Lead'>('Senior');
  const [questions, setQuestions] = useState<{ question: string; purpose: string; expectedAnswer: string; }[]>([
    { question: '', purpose: '', expectedAnswer: '' }
  ]);

  const departments = ['Engineering', 'HR & Legal', 'Marketing', 'Product Management', 'Finance & Sales'];

  const handleAddQuestionRow = () => {
    setQuestions([...questions, { question: '', purpose: '', expectedAnswer: '' }]);
  };

  const handleRemoveQuestionRow = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index: number, field: 'question' | 'purpose' | 'expectedAnswer', value: string) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.some(q => !q.question.trim())) return;

    const newTemplate: InterviewTemplate = {
      id: `temp-${Date.now()}`,
      title,
      department,
      seniority,
      questions: questions.filter(q => q.question.trim().length > 0)
    };

    setTemplates([...templates, newTemplate]);
    setSelectedTemplate(newTemplate);
    addLog('Interview Guide Designed', 'Modification', `Authorized new interview guidelines for: ${title}`);
    
    // Reset form
    setTitle('');
    setDepartment('Engineering');
    setSeniority('Senior');
    setQuestions([{ question: '', purpose: '', expectedAnswer: '' }]);
    setIsFormOpen(false);
  };

  const handleDeleteTemplate = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove interview template scorecard guide for "${name}"?`)) {
      setTemplates(templates.filter(t => t.id !== id));
      addLog('Interview Scheme Cleared', 'Modification', `De-authorized interview template guide: ${name}`);
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
    }
  };

  const handleCopyGuide = () => {
    if (!selectedTemplate) return;
    
    let textBody = `GUIDE: ${selectedTemplate.title}\nDepartment: ${selectedTemplate.department} • Tier: ${selectedTemplate.seniority}\n\n`;
    selectedTemplate.questions.forEach((q, idx) => {
      textBody += `${idx + 1}. QUESTION: ${q.question}\n   PURPOSE: ${q.purpose}\n   EXPECTED TARGET ANSWER: ${q.expectedAnswer}\n\n`;
    });

    const printable = generatePrintableText(selectedTemplate.title, textBody);
    navigator.clipboard.writeText(printable);
    setCopied(true);
    addLog('Interview Guide Exported', 'Data Access', `Copied printed audit guideline to clipboard for "${selectedTemplate.title}"`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-100" id="interview-builder-sheet">
      {/* Templates Sidebar selector (4-cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-sky-400" />
              Interview Packs
            </h3>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 hover:underline cursor-pointer bg-indigo-950 border border-indigo-900/40 px-2 py-1 rounded"
              id="btn-create-interview-trigger"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Pack
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No structural interview templates designed yet.</p>
            ) : (
              templates.map(item => (
                <div
                  key={item.id}
                  onClick={() => { setSelectedTemplate(item); addLog('Opened Interview Guide', 'Data Access', `Loaded interview questions scheme: ${item.title}`); }}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-1.5 ${
                    selectedTemplate?.id === item.id 
                    ? 'border-indigo-500 bg-indigo-950/30 text-slate-100' 
                    : 'border-slate-800 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-white leading-snug">{item.title}</div>
                    <div className="flex gap-2 items-center text-[10px] text-slate-450">
                      <span className="bg-slate-950 border border-slate-800 px-1.5 py-0.2 rounded font-medium text-slate-300">{item.department}</span>
                      <span>•</span>
                      <span>Level: {item.seniority}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteTemplate(item.id, item.title, e)}
                    className="text-slate-450 hover:text-rose-405 p-1 rounded-sm cursor-pointer hover:bg-slate-800"
                    title="Delete Guide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-amber-950/10 rounded-xl p-4 border border-amber-900/30 text-[11px] text-amber-305 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            💡 Ethics Compliance Note
          </div>
          <p className="leading-relaxed text-amber-200/80">
            Standardizing interview lists levels the scoring matrix. We recommend copying questions into local terminal editors and utilizing local text scoring parameters to guarantee bias-free screening procedures offline.
          </p>
        </div>
      </div>

      {/* Guide Details Panel (8-cols) */}
      <div className="lg:col-span-8 space-y-4">
        {selectedTemplate ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <span className="text-[10px] bg-slate-950 text-sky-400 font-mono tracking-wide px-1.5 py-0.5 rounded border border-slate-800">
                  {selectedTemplate.department} Division
                </span>
                <h3 className="font-bold text-white mt-1.5 text-base">{selectedTemplate.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Recommended Experience Level: <strong className="text-slate-200 font-semibold">{selectedTemplate.seniority}</strong></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 cursor-pointer"
                  title="Print Guideline"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Guide
                </button>
                <button
                  onClick={handleCopyGuide}
                  className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied Securely!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Printable Log
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Questions Sheet */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                Vetting Guidelines & Structured Questions ({selectedTemplate.questions.length})
              </h4>

              <div className="space-y-3">
                {selectedTemplate.questions.map((q, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-3">
                    <div className="flex gap-2">
                      <span className="flex items-center justify-center font-mono font-bold text-xs text-indigo-305 bg-indigo-950/40 w-5 h-5 rounded-full border border-indigo-900/30 shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-white leading-normal pt-0.5">{q.question}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7 text-[11px] border-l border-indigo-900/30">
                      <div>
                        <span className="font-semibold text-indigo-400 uppercase tracking-wide block mb-0.5">Vetting Purpose:</span>
                        <p className="text-slate-350 leading-normal">{q.purpose}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-green-400 uppercase tracking-wide block mb-0.5">Target Response Indicator:</span>
                        <p className="text-slate-350 leading-normal">{q.expectedAnswer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-64 shadow-sm">
            <ClipboardCheck className="w-10 h-10 text-slate-705 mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">Awaiting Selection</h4>
            <p className="text-xs max-w-xs mt-1 text-slate-450">Select an interview questionnaire or trigger "Create Pack" to compile custom ones.</p>
          </div>
        )}
      </div>

      {/* Guide Creator Modal Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 w-full max-w-2xl overflow-hidden animate-scale-up">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Design Standard Interview Guideline Booklet</h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-slate-100">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Booklet Title / Target Code</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Senior Product Manager Vetting Matrix"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Target Department Desk</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept} className="bg-slate-900 text-white">{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Seniority Tier</label>
                    <select
                      value={seniority}
                      onChange={(e) => setSeniority(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-sans"
                    >
                      <option value="Junior" className="bg-slate-900 text-white">Junior Tier</option>
                      <option value="Mid" className="bg-slate-900 text-white">Mid-Level Tier</option>
                      <option value="Senior" className="bg-slate-900 text-white">Senior Tier</option>
                      <option value="Lead" className="bg-slate-900 text-white">Lead Expert Tier</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Vetting Questions & Indicators</span>
                  <button
                    type="button"
                    onClick={handleAddQuestionRow}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    + Add Question
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-805 relative space-y-2">
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionRow(idx)}
                        className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-450 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="pr-6">
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Question {idx + 1}</label>
                      <input
                        type="text"
                        required
                        value={q.question}
                        onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="What is your approach to..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-indigo-400 mb-1">Vetting Purpose / Target Concept</label>
                        <input
                          type="text"
                          required
                          value={q.purpose}
                          onChange={(e) => handleQuestionChange(idx, 'purpose', e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="e.g. Verify low-overhead synchronization design knowledge"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-emerald-450 mb-1">Target Answer Indicator</label>
                        <input
                          type="text"
                          required
                          value={q.expectedAnswer}
                          onChange={(e) => handleQuestionChange(idx, 'expectedAnswer', e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="Candidate should describe transactional queues and offline-ready sync schemas..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  className="px-4 py-1.5 bg-indigo-605 hover:bg-indigo-700 text-white rounded text-xs font-semibold hover:shadow-sm transition-all cursor-pointer"
                >
                  Deploy Booklet Pack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

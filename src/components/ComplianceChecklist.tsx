import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { 
  ClipboardCheck, Clock, Bookmark, Plus, Trash2, 
  Settings, CheckSquare, Square, FileEdit, Award, X
} from 'lucide-react';

interface ComplianceChecklistProps {
  checklists: ChecklistItem[];
  setChecklists: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
}

export default function ComplianceChecklist({ checklists, setChecklists, addLog }: ComplianceChecklistProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Onboarding' | 'Offboarding' | 'Compliance'>('All');
  
  // Custom item states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState<'Onboarding' | 'Offboarding' | 'Compliance'>('Onboarding');
  const [notes, setNotes] = useState('');

  const filteredItems = checklists.filter(item => {
    return selectedCategory === 'All' || item.category === selectedCategory;
  });

  const handleToggleComplete = (id: string, task: string, oldState: boolean) => {
    const updated = checklists.map(item => {
      if (item.id === id) {
        return {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date().toISOString() : undefined
        };
      }
      return item;
    });

    setChecklists(updated);
    addLog(
      oldState ? 'Compliance Task Unchecked' : 'Compliance Task Completed', 
      'Modification', 
      `Toggled compliance target checklist item: "${task}" to ${!oldState ? 'COMPLETED' : 'PENDING'}`
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      category,
      task: taskName,
      completed: false,
      notes: notes.trim() || undefined
    };

    setChecklists([...checklists, newItem]);
    setIsFormOpen(false);
    setTaskName('');
    setNotes('');

    addLog('Compliance Target Drafted', 'Modification', `Registered procedural task in group [${category}]: "${taskName}"`);
  };

  const handleDeleteTask = (id: string, name: string) => {
    if (confirm(`Remove this procedural checkpoint: "${name}"?`)) {
      setChecklists(checklists.filter(c => c.id !== id));
      addLog('Compliance Target Removed', 'Modification', `De-registered compliance check: "${name}"`);
    }
  };

  const categories: ('All' | 'Onboarding' | 'Offboarding' | 'Compliance')[] = ['All', 'Onboarding', 'Offboarding', 'Compliance'];

  // Completion stats calculation
  const totalInCat = filteredItems.length;
  const completedInCat = filteredItems.filter(i => i.completed).length;
  const percentage = totalInCat > 0 ? Math.round((completedInCat / totalInCat) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-100" id="compliance-checklist-container">
      {/* Selector and overview statistics (4-cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-4 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-emerald-455" />
              Category Filter
            </h3>
            <p className="text-[11px] text-slate-400">Choose custom HR checklists to monitor or track.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                  selectedCategory === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-950 border border-slate-805 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{cat === 'All' ? 'All Procedures' : cat}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  selectedCategory === cat ? 'bg-indigo-500 text-indigo-100' : 'bg-slate-800 text-slate-400 border border-slate-700/40'
                }`}>
                  {cat === 'All' 
                    ? checklists.length 
                    : checklists.filter(i => i.category === cat).length
                  }
                </span>
              </button>
            ))}
          </div>

          <hr className="border-slate-800" />

          {/* Stats Bar */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procedural Completion Index</h4>
            <div className="flex justify-between text-xs font-semibold text-slate-200">
              <span>{selectedCategory} Progress</span>
              <span className="font-mono text-indigo-400">{completedInCat} / {totalInCat} ({percentage}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-955 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-900/40 text-indigo-300 text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
          id="btn-add-procedural-task"
        >
          <Plus className="w-4 h-4" />
          Add Custom Procedural Step
        </button>

        <div className="bg-emerald-950/10 rounded-xl p-4 border border-emerald-900/30 text-[11px] text-emerald-305 space-y-1.5 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5">
            🔑 Audit Safety Lock
          </div>
          <p className="text-emerald-200/80">
            Checking procedural requirements offline creates local cryptographic validation metrics. These tasks are fully secure and cannot be altered by remote trackers or data scrapers.
          </p>
        </div>
      </div>

      {/* Checklist items view (8-cols) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-slate-900 rounded-xl border border-slate-805 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] bg-slate-950 text-indigo-400 font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-800">
                Procedural Guide
              </span>
              <h3 className="font-bold text-white mt-1 text-base">
                {selectedCategory === 'All' ? 'Full HR Checklist Procedures' : `${selectedCategory} Protocols`}
              </h3>
            </div>
          </div>

          <div className="space-y-2.5 font-sans">
            {filteredItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center font-sans">
                No active guidelines present in this compliance bracket. Click "Add Custom Step" to begin.
              </p>
            ) : (
              filteredItems.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleToggleComplete(item.id, item.task, item.completed)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 select-none ${
                    item.completed 
                    ? 'bg-slate-955/40 border-slate-850 text-slate-450' 
                    : 'bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700 hover:shadow-2xs'
                  }`}
                >
                  <button type="button" className="p-0.5 mt-0.5 shrink-0">
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400 fill-indigo-950/30" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <p className={`font-semibold leading-normal ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {item.task}
                    </p>
                    
                    <div className="flex flex-wrap gap-2.5 items-center text-[10px] text-slate-450">
                      <span className="bg-slate-900 px-1.5 py-0.1 border border-slate-800 rounded uppercase text-slate-350 font-medium">
                        {item.category}
                      </span>
                      
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span className="italic">Note: "{item.notes}"</span>
                        </>
                      )}

                      {item.completedAt && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-indigo-400 font-mono">
                            <Clock className="w-3 h-3" />
                            Completed: {new Date(item.completedAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(item.id, item.task); }}
                    className="text-slate-450 hover:text-rose-400 p-1 rounded-sm cursor-pointer hover:bg-slate-800 mt-1 shrink-0"
                    title="Purge requirement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal task creator */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-803 w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Register Standard Compliance Requirement</h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-250 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Requirement Task Description</label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-650 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Conduct local credentials background check"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Target Action Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none font-sans"
                >
                  <option value="Onboarding" className="bg-slate-900 text-white">Onboarding Procedure</option>
                  <option value="Offboarding" className="bg-slate-900 text-white">Offboarding Procedure</option>
                  <option value="Compliance" className="bg-slate-900 text-white">Legal & Safety Compliance Review</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Vetting Context / Internal Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-505 outline-none font-sans"
                  placeholder="e.g. Identity documents must be verified and processed purely on-premises."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2.5 border-t border-slate-800">
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
                  Deploy procedural target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

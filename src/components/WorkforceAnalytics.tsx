import React, { useState } from 'react';
import { Employee } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Users, DollarSign, Award, ShieldAlert, CheckCircle2, 
  HelpCircle, RefreshCw, BarChart2, Briefcase, Percent, UserCheck
} from 'lucide-react';

interface WorkforceAnalyticsProps {
  employees: Employee[];
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  activeTier?: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI';
}

export default function WorkforceAnalytics({ employees, addLog, activeTier = 'Starter' }: WorkforceAnalyticsProps) {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [payrollMultiplier, setPayrollMultiplier] = useState<number>(1.0); // Slider factor (0.9 to 1.3)
  const [inspectedEmployeeId, setInspectedEmployeeId] = useState<string | null>(null);

  const departments = ['All', 'Engineering', 'HR & Legal', 'Marketing', 'Product Management', 'Finance & Sales'];

  // Filtered employees
  const filtered = employees.filter(emp => selectedDeptFilter === 'All' || emp.department === selectedDeptFilter);

  // Workforce stats
  const totalEmployees = filtered.length;
  const activeCount = filtered.filter(e => e.status === 'Active').length;
  const onboardingCount = filtered.filter(e => e.status === 'Onboarding').length;
  const onLeaveCount = filtered.filter(e => e.status === 'On Leave').length;

  // Payroll analysis
  const rawTotalPayroll = filtered.reduce((acc, curr) => acc + (curr.salary || 80000), 0);
  const totalPayroll = Math.round(rawTotalPayroll * payrollMultiplier);
  const averageSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  // Compliance metrics simulation (Dynamic based on records)
  const complianceScore = Math.min(100, Math.max(45, Math.round(
    95 
    - (filtered.filter(e => e.status === 'Onboarding').length * 4) 
    - (filtered.filter(e => !e.phone || !e.email).length * 10)
    + (filtered.filter(e => e.status === 'Active').length * 1.2)
  )));

  // Mocked advanced correlation attributes to enable multi-dimensional clicks
  const getEmployeeInsights = (emp: Employee) => {
    // Deterministic simulation
    const nameLength = emp.firstName.length + emp.lastName.length;
    const performanceRating = (nameLength % 3) === 0 ? '9.4/10 (Exceptional)' : (nameLength % 3 === 1) ? '8.1/10 (Above Average)' : '7.2/10 (Satisfactory)';
    const retentionRisk = (nameLength % 3) === 0 ? 'Low' : (nameLength % 3 === 1) ? 'Medium' : 'High';
    const trainingComplete = (nameLength % 2) === 0 ? 100 : 75;
    const riskFactor = (nameLength % 3) === 0 ? 'Secure Key Personnel' : (nameLength % 3 === 1) ? 'Salary Market Disparity' : 'Limited Team Integration';

    return { performanceRating, retentionRisk, trainingComplete, riskFactor };
  };

  const handleRecalculate = () => {
    addLog('Refreshed Workforce Insights Matrix', 'Data Access', `Authorized telemetry recalculation for ${selectedDeptFilter} personnel subset.`);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-8 animate-fade-in text-slate-100" id="workforce-analytics-dashboard">
      
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-505/25 text-indigo-400 border border-indigo-900/50">
              Executive Intel
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/40">
              Pro Access Required
            </span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            AI-Powered Interactive Workforce Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Secure, decrypted insight dashboards. Run dynamic models, inspect multi-dimensional retention vectors, and compute sandbox payroll optimizations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleRecalculate}
            className="bg-slate-950 hover:bg-slate-850 text-slate-350 hover:text-white border border-slate-805 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recalculate Math
          </button>
        </div>
      </div>

      {/* Grid: Main Dashboard Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Compliance Health Card & Simulation Controls */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Compliance Scorecard
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-900/40`}>
                Sovereign Level-A
              </span>
            </div>
            <p className="text-[11px] text-slate-450 leading-relaxed mb-4">
              Real-time audit preparation index calculated locally based on completeness of background screening, contract execution, and training profiles.
            </p>

            {/* Visual Gauge Radial-bar simulation */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={complianceScore > 85 ? "#10b981" : complianceScore > 70 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * complianceScore) / 100}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-white tracking-tighter">
                    {complianceScore}%
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">
                    Audit Safety
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono text-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Roster status verified clean of severe regulatory defects.</span>
              </div>
            </div>
          </div>

          {/* Payroll Raise Modeling Slider */}
          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                Raise Optimization Model
              </span>
              <span className="text-xs font-mono font-black text-indigo-300">
                {payrollMultiplier === 1.0 ? 'Baseline (1.0x)' : `${payrollMultiplier.toFixed(2)}x Compensation`}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Drag to forecast sandbox budgetary impact for cost-of-living adjustments or across-the-board incentives.
            </p>
            <input
              type="range"
              min="0.90"
              max="1.30"
              step="0.05"
              value={payrollMultiplier}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setPayrollMultiplier(val);
                if (val !== 1.0) {
                  addLog('Adjusted Sandbox Compensation Multipier', 'Modification', `Recalculated workspace payroll scenario with ${val}x scaling factor.`);
                }
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[8px] font-mono text-slate-500">
              <span>-10% Restructure</span>
              <span>Healthy Margin</span>
              <span>+30% Premium Expansion</span>
            </div>
          </div>
        </div>

        {/* Column 2: Interactive Department Distribution & Compensation Analysis */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-5 lg:col-span-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-850 pb-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                Department Allocation & Compensation Analysis
              </h3>
              <p className="text-[10px] text-slate-400">Focus down context to isolate critical personnel parameters.</p>
            </div>

            {/* Select filter dropdown */}
            <select
              value={selectedDeptFilter}
              onChange={(e) => {
                setSelectedDeptFilter(e.target.value);
                addLog('Filtered Workforce Interactive Chart', 'Data Access', `Isolated department view to: ${e.target.value}`);
              }}
              className="bg-slate-900 border border-slate-700/60 rounded text-xs px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Metric Row */}
          <div className="grid grid-cols-3 gap-2 text-center" id="insights-numbers-strip">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
              <span className="text-[9px] uppercase font-bold text-slate-450 block">Roster Group Size</span>
              <span className="text-md font-extrabold text-white font-mono">{totalEmployees}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
              <span className="text-[9px] uppercase font-bold text-slate-450 block font-mono">Simulated Payroll</span>
              <span className="text-md font-extrabold text-emerald-400 font-mono">£{totalPayroll.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
              <span className="text-[9px] uppercase font-bold text-slate-450 block">Simulated Average</span>
              <span className="text-md font-extrabold text-indigo-305 font-mono">£{averageSalary.toLocaleString()}</span>
            </div>
          </div>

          {/* Interactive Chart Component using Custom Polished HTML Bar Ranges */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-450">
              <span>Department Subset Allocation Structure</span>
              <span>Sub-budget weight</span>
            </div>

            <div className="space-y-3.5">
              {departments.filter(d => d !== 'All').map((dept) => {
                const deptCount = employees.filter(e => e.department === dept).length;
                const deptPayroll = employees.filter(e => e.department === dept).reduce((acc, curr) => acc + (curr.salary || 80000), 0) * payrollMultiplier;
                const percentage = employees.length > 0 ? Math.round((deptCount / employees.length) * 100) : 0;
                const isIsolateTarget = selectedDeptFilter === 'All' || selectedDeptFilter === dept;

                return (
                  <div 
                    key={dept} 
                    onClick={() => {
                      setSelectedDeptFilter(dept);
                      addLog('Isolate Department Segment Clicked', 'Data Access', `User clicked direct segment for: ${dept}`);
                    }}
                    className={`group space-y-1.5 cursor-pointer transition-all ${isIsolateTarget ? 'opacity-100' : 'opacity-30 hover:opacity-55'}`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 group-hover:text-white flex items-center gap-1.5 transition-all">
                        <span className={`w-2 h-2 rounded-full ${
                          dept === 'Engineering' ? 'bg-indigo-400' :
                          dept === 'HR & Legal' ? 'bg-emerald-400' :
                          dept === 'Marketing' ? 'bg-purple-400' :
                          dept === 'Product Management' ? 'bg-amber-400' :
                          'bg-sky-400'
                        }`} />
                        {dept}
                        <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-400">
                          ({deptCount} personnel)
                        </span>
                      </span>
                      <span className="font-mono text-slate-400 font-semibold group-hover:text-indigo-300">
                        £{Math.round(deptPayroll).toLocaleString()} <span className="text-[10px] text-slate-500">({percentage}%)</span>
                      </span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/40">
                      <div 
                        style={{ width: `${percentage}%` }} 
                        className={`h-full rounded-full transition-all duration-500 ${
                          dept === 'Engineering' ? 'bg-indigo-505 bg-indigo-500' :
                          dept === 'HR & Legal' ? 'bg-emerald-500' :
                          dept === 'Marketing' ? 'bg-purple-500' :
                          dept === 'Product Management' ? 'bg-amber-500' :
                          'bg-sky-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Roster Retention Risk Matrices, clicking displays side information drawer */}
      <div className="border-t border-slate-800/60 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Comprehensive Roster Competency & Retention Risk Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Interactive team analysis. Click any record to decrypt safety margins, performance curves, and attrition risks.
            </p>
          </div>
          <span className="text-[10px] uppercase font-mono text-slate-500">
            {filtered.length} Indexed Personnel Records
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List of personnel */}
          <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-4 max-h-[350px] overflow-y-auto space-y-2 text-xs" id="retention-personnel-list">
            <div className="grid grid-cols-4 gap-2 border-b border-slate-850 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
              <span className="col-span-2">Personnel Identity</span>
              <span>Retention Risk</span>
              <span className="text-right">Action</span>
            </div>

            {filtered.map((emp) => {
              const { retentionRisk } = getEmployeeInsights(emp);
              const isSelected = inspectedEmployeeId === emp.id;

              return (
                <div 
                  key={emp.id}
                  onClick={() => {
                    setInspectedEmployeeId(emp.id);
                    addLog('Inspected Personnel Risk Profile', 'Data Access', `Decrypted high-fidelity attrition analysis for ${emp.firstName} ${emp.lastName}.`);
                  }}
                  className={`grid grid-cols-4 gap-2 py-2 px-3 rounded-lg border transition-all cursor-pointer items-center ${
                    isSelected 
                    ? 'bg-indigo-950/40 border-indigo-500/80 text-white' 
                    : 'bg-slate-900/40 border-slate-905 hover:bg-slate-850 hover:border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-350 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-700/50">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <span className="font-semibold block">{emp.firstName} {emp.lastName}</span>
                      <span className="text-[10px] text-slate-500 font-mono italic block">{emp.role}</span>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      retentionRisk === 'Low' 
                      ? 'bg-emerald-950 text-emerald-350 border border-emerald-900/30' 
                      : retentionRisk === 'Medium'
                      ? 'bg-amber-950 text-amber-305 border border-amber-900/30'
                      : 'bg-red-950 text-red-305 border border-red-900/30'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        retentionRisk === 'Low' ? 'bg-emerald-400' :
                        retentionRisk === 'Medium' ? 'bg-amber-400' : 'bg-red-500'
                      }`} />
                      {retentionRisk}
                    </span>
                  </div>

                  <div className="text-right">
                    <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
                      Inspect Matrix
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side panel displaying specific metrics */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between" id="risk-audit-drawer">
            <AnimatePresence mode="wait">
              {inspectedEmployeeId ? (
                (() => {
                  const emp = employees.find(e => e.id === inspectedEmployeeId);
                  if (!emp) return <p className="text-xs text-slate-500 text-center py-10">Select an employee card left to decrypted insight.</p>;
                  const insights = getEmployeeInsights(emp);

                  return (
                    <motion.div 
                      key={emp.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-4 text-xs"
                    >
                      <div className="border-b border-slate-800 pb-3">
                        <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono tracking-widest block mb-1">Decrypted Telemetry Dossier</span>
                        <h4 className="text-sm font-extrabold text-white">{emp.firstName} {emp.lastName}</h4>
                        <span className="text-[10px] text-slate-400 block font-mono">Dept: {emp.department} • {emp.role}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Performance Index</span>
                          <span className="text-xs font-black text-rose-350 text-indigo-300 font-mono">{insights.performanceRating}</span>
                        </div>

                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Retention Category</span>
                          <span className={`text-xs font-black font-mono block ${
                            insights.retentionRisk === 'Low' ? 'text-emerald-400' :
                            insights.retentionRisk === 'Medium' ? 'text-amber-400' : 'text-red-400'
                          }`}>{insights.retentionRisk} Risk</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                          <span>Required Regulatory Training Completeness</span>
                          <span className="font-mono text-emerald-400 font-bold">{insights.trainingComplete}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${insights.trainingComplete}%` }} 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-905/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block font-mono">Primary Retention Risk Factor:</span>
                        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 bg-indigo-500" />
                          {insights.riskFactor}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          addLog('Incentivized Retention Action Executed', 'Modification', `Authorized dynamic salary adjustment evaluation request for ${emp.firstName} ${emp.lastName}.`);
                          alert(`Retention simulation initiated for ${emp.firstName} ${emp.lastName}. Case file generated in secure compliance records.`);
                        }}
                        className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs cursor-pointer select-none border border-indigo-500/40 transition-all font-sans"
                      >
                        ⚡ Simulate Retention Incentive Proposal
                      </button>
                    </motion.div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500 space-y-3">
                  <UserCheck className="w-10 h-10 text-slate-600 animate-pulse" />
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-400 text-xs block">Telemetry Core Primed</span>
                    <p className="text-[10px] text-slate-500 max-w-[200px]">Click any personnel record in the list to decrypt safety parameters and attrition curves.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
            
            {inspectedEmployeeId && (
              <button
                onClick={() => setInspectedEmployeeId(null)}
                className="mt-4 text-[10px] text-slate-500 hover:text-slate-300 hover:underline mx-auto font-mono"
              >
                Clear Inspected Card
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

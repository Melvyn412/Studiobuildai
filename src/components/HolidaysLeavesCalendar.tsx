import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, 
  Clock, ShieldCheck, AlertCircle, Info, MapPin, Sparkles, User, HelpCircle,
  TrendingUp, CalendarDays, FileCheck, CheckCircle
} from 'lucide-react';

interface HolidaysLeavesCalendarProps {
  employees: Employee[];
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  activeTier?: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI';
}

export interface ApprovedLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  type: 'Vacation' | 'Sickness' | 'Parental' | 'Study' | 'Compassionate';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  notes: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  createdAt: string;
}

interface HolidayEvent {
  date: string; // YYYY-MM-DD
  name: string;
  countries: string[]; // US, UK, DE, JP
}

// 2026 Structured National Holidays
const CORE_HOLIDAYS_2026: HolidayEvent[] = [
  { date: '2026-01-01', name: "New Year's Day", countries: ['US', 'UK', 'DE', 'JP'] },
  { date: '2026-01-12', name: 'Coming of Age Day', countries: ['JP'] },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day', countries: ['US'] },
  { date: '2026-02-11', name: 'National Foundation Day', countries: ['JP'] },
  { date: '2026-02-16', name: "Presidents' Day", countries: ['US'] },
  { date: '2026-04-03', name: 'Good Friday', countries: ['UK', 'DE'] },
  { date: '2026-04-06', name: 'Easter Monday', countries: ['UK', 'DE'] },
  { date: '2026-04-29', name: 'Showa Day', countries: ['JP'] },
  { date: '2026-05-01', name: 'Labor Day', countries: ['DE'] },
  { date: '2026-05-03', name: 'Constitution Memorial Day', countries: ['JP'] },
  { date: '2026-05-04', name: 'Early May Bank Holiday / Greenery Day', countries: ['UK', 'JP'] },
  { date: '2026-05-05', name: "Children's Day", countries: ['JP'] },
  { date: '2026-05-14', name: 'Ascension Day', countries: ['DE'] },
  { date: '2026-05-25', name: 'Spring Bank Holiday / Whit Monday', countries: ['UK', 'DE', 'US'] }, 
  { date: '2026-06-19', name: 'Juneteenth National independence', countries: ['US'] },
  { date: '2026-07-04', name: 'Independence Day', countries: ['US'] },
  { date: '2026-07-20', name: 'Marine Day', countries: ['JP'] },
  { date: '2026-08-11', name: 'Mountain Day', countries: ['JP'] },
  { date: '2026-08-31', name: 'Summer Bank Holiday', countries: ['UK'] },
  { date: '2026-09-07', name: 'Labor Day', countries: ['US'] },
  { date: '2026-09-21', name: 'Respect for the Aged Day', countries: ['JP'] },
  { date: '2026-10-03', name: 'Day of German Unity', countries: ['DE'] },
  { date: '2026-10-12', name: 'Columbus Day', countries: ['US'] },
  { date: '2026-11-11', name: 'Veterans Day', countries: ['US'] },
  { date: '2026-11-23', name: 'Labor Thanksgiving Day', countries: ['JP'] },
  { date: '2026-11-26', name: 'Thanksgiving Day', countries: ['US'] },
  { date: '2026-12-25', name: 'Christmas Day', countries: ['US', 'UK', 'DE'] },
  { date: '2026-12-26', name: 'Boxing Day / Second Christmas Day', countries: ['UK', 'DE'] },
  { date: '2026-12-28', name: 'Boxing Day (Substitute Bank Holiday)', countries: ['UK'] }
];

// Initial seeded leaves
const SEEDED_LEAVES: ApprovedLeave[] = [
  {
    id: 'leave-001',
    employeeId: 'emp-sarah',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    role: 'Lead Fullstack Developer',
    type: 'Vacation',
    startDate: '2026-06-15',
    endDate: '2026-06-22',
    notes: 'Approved family holiday to the Mediterranean Coast.',
    status: 'Approved',
    createdAt: '2026-06-01'
  },
  {
    id: 'leave-002',
    employeeId: 'emp-marcus',
    employeeName: 'Marcus Vance',
    department: 'Compliance',
    role: 'Chief Compliance Auditor',
    type: 'Study',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    notes: 'Regulatory certification exams attendance logs synced.',
    status: 'Approved',
    createdAt: '2026-06-03'
  },
  {
    id: 'leave-003',
    employeeId: 'emp-winston',
    employeeName: 'Winston Churchill',
    department: 'Operations',
    role: 'Operations Coordinator',
    type: 'Sickness',
    startDate: '2026-06-24',
    endDate: '2026-06-26',
    notes: 'Post-op recovery period, approved by HR standard.',
    status: 'Approved',
    createdAt: '2026-06-10'
  },
  {
    id: 'leave-004',
    employeeId: 'emp-ada',
    employeeName: 'Ada Lovelace',
    department: 'Product',
    role: 'Core Systems Architect',
    type: 'Parental',
    startDate: '2026-07-06',
    endDate: '2026-07-17',
    notes: 'Approved primary caregiver transition cycle.',
    status: 'Approved',
    createdAt: '2026-06-12'
  }
];

export default function HolidaysLeavesCalendar({ employees, addLog, activeTier = 'Starter' }: HolidaysLeavesCalendarProps) {
  // Navigation Calendar States (Defaulting to system date timeline June 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // 0-indexed, so 5 = June
  const [selectedDay, setSelectedDay] = useState<string>('2026-06-16'); // YYYY-MM-DD
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL');

  // List of approved leaves state
  const [leaves, setLeaves] = useState<ApprovedLeave[]>(() => {
    const saved = localStorage.getItem('secure_hr_approved_leaves');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SEEDED_LEAVES;
      }
    }
    return SEEDED_LEAVES;
  });

  // Save changes to localStorage whenever leaves list is updated
  useEffect(() => {
    localStorage.setItem('secure_hr_approved_leaves', JSON.stringify(leaves));
  }, [leaves]);

  // Request form state
  const [newLeaveEmployeeId, setNewLeaveEmployeeId] = useState<string>('');
  const [newLeaveType, setNewLeaveType] = useState<'Vacation' | 'Sickness' | 'Parental' | 'Study' | 'Compassionate'>('Vacation');
  const [newLeaveStart, setNewLeaveStart] = useState<string>('2026-06-16');
  const [newLeaveEnd, setNewLeaveEnd] = useState<string>('2026-06-19');
  const [newLeaveNotes, setNewLeaveNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');

  // Default the employee select field to first employee if available
  useEffect(() => {
    if (employees.length > 0 && !newLeaveEmployeeId) {
      setNewLeaveEmployeeId(employees[0].id);
    }
  }, [employees, newLeaveEmployeeId]);

  // Calendar Engine Helper calculations
  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Switch month functions
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleResetToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(5); // June
    setSelectedDay('2026-06-16');
  };

  // Helper to format date key: returns YYYY-MM-DD representing absolute timezone-safe values
  const dateKey = (dayNum: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // Filter and gather calendar events for a specific day key
  const getHolidaysForDate = (dateStr: string) => {
    return CORE_HOLIDAYS_2026.filter(h => {
      if (h.date !== dateStr) return false;
      if (selectedCountryFilter === 'ALL') return true;
      return h.countries.includes(selectedCountryFilter);
    });
  };

  const getLeavesForDate = (dateStr: string) => {
    return leaves.filter(l => {
      const activeDate = new Date(dateStr);
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      // Clean up time bounds for precision
      activeDate.setHours(0,0,0,0);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      return activeDate >= start && activeDate <= end && l.status === 'Approved';
    });
  };

  // Submit leaves request form
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const targetEmp = employees.find(emp => emp.id === newLeaveEmployeeId);
    if (!targetEmp) {
      setFormError('Please select a valid team employee profile.');
      return;
    }

    if (!newLeaveStart || !newLeaveEnd) {
      setFormError('Both start date and end date must be registered.');
      return;
    }

    const start = new Date(newLeaveStart);
    const end = new Date(newLeaveEnd);

    if (end < start) {
      setFormError('Requested end date cannot fall prior to start date.');
      return;
    }

    // Days calculation including leap boundaries
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays > 30) {
      setFormError('Holiday leave requests are strictly capped to 30 continuous days.');
      return;
    }

    // Safety checks
    const hasOverlap = leaves.some(l => {
      if (l.employeeId !== newLeaveEmployeeId) return false;
      const lStart = new Date(l.startDate);
      const lEnd = new Date(l.endDate);
      return (start <= lEnd && end >= lStart);
    });

    if (hasOverlap) {
      setFormError(`${targetEmp.firstName} already has an overlapping approved leave during this time query.`);
      return;
    }

    // Compile new leave struct
    const request: ApprovedLeave = {
      id: `leave-${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: `${targetEmp.firstName} ${targetEmp.lastName}`,
      department: targetEmp.department,
      role: targetEmp.role,
      type: newLeaveType,
      startDate: newLeaveStart,
      endDate: newLeaveEnd,
      notes: newLeaveNotes || 'Standard employee leave authorized via corporate dashboard.',
      status: 'Approved',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLeaves(prev => [request, ...prev]);
    setNewLeaveNotes('');
    setFormSuccess(`Leave successfully authorized for ${targetEmp.firstName} (${diffDays} Days).`);
    addLog(
      'Leave Logged & Authored',
      'Modification',
      `Authorized ${newLeaveType} leave for ${targetEmp.firstName} ${targetEmp.lastName} from ${newLeaveStart} to ${newLeaveEnd} (${diffDays} days).`
    );

    // Fade out success notification automatically
    setTimeout(() => setFormSuccess(''), 5000);
  };

  // Delete leave from repository
  const handleDeleteLeave = (id: string, name: string) => {
    if (confirm(`Revoke and delete scheduled leave for ${name}?`)) {
      setLeaves(prev => prev.filter(l => l.id !== id));
      addLog(
        'Leave Revoked & Deleted',
        'Modification',
        `De-registered approved leaves ledger entry for employee profile: ${name}`
      );
    }
  };

  // Statistics indicators
  const totalApprovedLeavesCount = leaves.length;
  const currentMonthLeavesCount = leaves.filter(l => {
    const startM = new Date(l.startDate).getMonth();
    const endM = new Date(l.endDate).getMonth();
    return startM === currentMonth || endM === currentMonth;
  }).length;

  const currentCountryHolidaysCount = CORE_HOLIDAYS_2026.filter(h => {
    const hm = new Date(h.date).getMonth();
    if (hm !== currentMonth) return false;
    if (selectedCountryFilter === 'ALL') return true;
    return h.countries.includes(selectedCountryFilter);
  }).length;

  // Render style lookups based on leave category type
  const getLeaveColorClass = (type: string) => {
    switch (type) {
      case 'Vacation':
        return 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500';
      case 'Sickness':
        return 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-500';
      case 'Parental':
        return 'bg-purple-500/10 text-purple-300 border-l-2 border-purple-500';
      case 'Study':
        return 'bg-blue-500/10 text-blue-300 border-l-2 border-blue-500';
      case 'Compassionate':
        return 'bg-rose-500/10 text-rose-300 border-l-2 border-rose-500';
      default:
        return 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500';
    }
  };

  const getLeaveBulletClass = (type: string) => {
    switch (type) {
      case 'Vacation': return 'bg-emerald-400';
      case 'Sickness': return 'bg-amber-400';
      case 'Parental': return 'bg-purple-400';
      case 'Study': return 'bg-blue-400';
      case 'Compassionate': return 'bg-rose-400';
      default: return 'bg-indigo-400';
    }
  };

  // Day cell construction helper
  const renderDaysGridCells = () => {
    const cells = [];
    
    // 1. Padding from previous month
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYearVal, prevMonthIdx);

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const pmDay = daysInPrevMonth - i;
      const pmMonthStr = String(prevMonthIdx + 1).padStart(2, '0');
      const pmKey = `${prevYearVal}-${pmMonthStr}-${String(pmDay).padStart(2, '0')}`;
      
      cells.push(
        <div 
          key={`prev-pad-${pmDay}`} 
          onClick={() => setSelectedDay(pmKey)}
          className={`min-h-[85px] bg-slate-950/10 border border-slate-900/40 p-2 text-slate-600 transition-all cursor-pointer opacity-40 hover:bg-slate-900/30 font-sans`}
        >
          <span className="text-[10px] font-mono leading-none">{pmDay}</span>
        </div>
      );
    }

    // 2. Real days for this current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayKey = dateKey(d);
      const isSelected = selectedDay === dayKey;
      const isToday = dayKey === '2026-06-16'; // System standard context date
      const dHolidays = getHolidaysForDate(dayKey);
      const dLeaves = getLeavesForDate(dayKey);

      cells.push(
        <div
          key={`day-real-${d}`}
          id={`calendar-cell-${dayKey}`}
          onClick={() => setSelectedDay(dayKey)}
          className={`min-h-[90px] border border-slate-850 p-1.5 transition-all cursor-pointer relative font-sans flex flex-col justify-between ${
            isSelected 
              ? 'bg-slate-850 ring-1 ring-indigo-500/80 border-slate-700' 
              : 'bg-slate-900 hover:bg-slate-850/60'
          } ${isToday ? 'bg-indigo-950/20 border-indigo-900/40' : ''}`}
        >
          {/* Day header info */}
          <div className="flex justify-between items-start">
            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
              isToday 
                ? 'bg-indigo-550 text-white animate-pulse' 
                : 'text-slate-350'
            }`}>
              {d}
            </span>
            
            {/* Short indicator flag icons */}
            <div className="flex gap-0.5">
              {dHolidays.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-550 animate-pulse" title="Company Holiday" />
              )}
              {dLeaves.length > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full ${getLeaveBulletClass(dLeaves[0].type)}`} title="Approved Leave active" />
              )}
            </div>
          </div>

          {/* Quick Preview Lines within Cell */}
          <div className="mt-1 space-y-1 overflow-hidden pointer-events-none select-none">
            {dHolidays.slice(0, 1).map((h, hIdx) => (
              <div 
                key={`cell-hol-${hIdx}`} 
                className="text-[8px] bg-rose-950/45 text-rose-300 px-1 rounded truncate leading-tight border border-rose-900/30 text-center font-semibold font-mono"
              >
                🎉 {h.name}
              </div>
            ))}
            
            {/* Visual Leaves capsules */}
            {dLeaves.slice(0, 2).map((l, lIdx) => (
              <div 
                key={`cell-lv-${lIdx}`} 
                className={`text-[8px] px-1 rounded truncate leading-tight font-sans py-0.2 select-none flex items-center gap-0.5 ${getLeaveColorClass(l.type)}`}
              >
                <div className={`w-1 h-1 rounded-full ${getLeaveBulletClass(l.type)}`} />
                <span className="font-semibold truncate">{l.employeeName.split(' ')[0]}</span>
              </div>
            ))}

            {/* Overrun label indicator if more events exist */}
            {dLeaves.length > 2 && (
              <div className="text-[7px] text-slate-500 text-right leading-none pr-1">
                +{dLeaves.length - 2} more on leave
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. Padding from next month
    const totalRenderedGridSize = cells.length;
    const paddingNeededNextMonth = 42 - totalRenderedGridSize;
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYearVal = currentMonth === 11 ? currentYear + 1 : currentYear;

    for (let n = 1; n <= paddingNeededNextMonth; n++) {
      const nmMonthStr = String(nextMonthIdx + 1).padStart(2, '0');
      const nmKey = `${nextYearVal}-${nmMonthStr}-${String(n).padStart(2, '0')}`;
      
      cells.push(
        <div 
          key={`next-pad-${n}`} 
          onClick={() => setSelectedDay(nmKey)}
          className={`min-h-[85px] bg-slate-950/10 border border-slate-900/40 p-2 text-slate-600 transition-all cursor-pointer opacity-40 hover:bg-slate-900/30 font-sans`}
        >
          <span className="text-[10px] font-mono leading-none">{n}</span>
        </div>
      );
    }

    return cells;
  };

  // Parse dates details for selected calendar day
  const activeDayHolidays = CORE_HOLIDAYS_2026.filter(h => h.date === selectedDay);
  const activeDayLeaves = leaves.filter(l => {
    const query = new Date(selectedDay);
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    query.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    return query >= start && query <= end;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="visual-calendar-wrapper">
      
      {/* Visual Counters bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-xs select-none">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Company Holidays</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-rose-450 font-mono">{currentCountryHolidaysCount}</span>
              <span className="text-[10px] text-slate-500 font-medium">this month</span>
            </div>
          </div>
          <div className="bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">
            <CalendarIcon className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-xs select-none">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Approved Off Leaves</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-400 font-mono">{currentMonthLeavesCount}</span>
              <span className="text-[10px] text-slate-500 font-medium">active standard cycles</span>
            </div>
          </div>
          <div className="bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/30">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-xs select-none">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Roster Staff Capacity Limit</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-400 font-mono">92%</span>
              <span className="text-[10px] text-slate-500 font-medium">optimal deployment buffer</span>
            </div>
          </div>
          <div className="bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Calendar Core (8-Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-4">
            
            {/* Calendar Controls & filters headers */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 flex items-center gap-2">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-black font-mono text-slate-200 select-none min-w-[110px] text-center">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                  <button 
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={handleResetToToday}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-lg text-xs font-bold transition-colors cursor-pointer select-none"
                >
                  Today
                </button>
              </div>

              {/* Geographic statutory presets toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wide select-none">Statutory region:</span>
                <select
                  value={selectedCountryFilter}
                  onChange={(e) => setSelectedCountryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-805 text-[10px] text-white px-2 py-1 rounded outline-none cursor-pointer focus:border-indigo-500 font-bold"
                >
                  <option value="ALL">Show All Regions</option>
                  <option value="US">🇺🇸 United States (US)</option>
                  <option value="UK">🇬🇧 United Kingdom (UK)</option>
                  <option value="DE">🇩🇪 Germany (DE)</option>
                  <option value="JP">🇯🇵 Japan (JP)</option>
                </select>
              </div>
            </div>

            {/* Days criteria grid labels list */}
            <div>
              <div className="grid grid-cols-7 gap-1 text-center mb-1 select-none">
                {DAYS_OF_WEEK.map((day, dIdx) => (
                  <span 
                    key={`dow-${dIdx}`} 
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      day === 'Sun' || day === 'Sat' ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* The Calendar Days cells matrix */}
              <div className="grid grid-cols-7 gap-1">
                {renderDaysGridCells()}
              </div>
            </div>

            {/* Style Legend block details */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-wrap items-center gap-4 text-[10px] select-none text-slate-400">
              <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wide inline-block mr-1">Legend Keys:</span>
              
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-950/50 border border-rose-900/50 rounded flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                </span>
                <span>National Holidays</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Vacations PTO (Paid)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Sick & Medical</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Caregiver / Parental</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Study / Training Leave</span>
              </div>

              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                <span className="text-white text-[9px] font-mono leading-none bg-indigo-500 px-1 py-0.2 rounded font-black">Today</span>
                <span>Current HR Context</span>
              </div>
            </div>

          </div>

          {/* Table / List of upcoming leaves list repository */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                Active & Approved Leave Registry Ledger
              </h3>
              <span className="text-[9px] font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-300 border border-slate-850 select-none">
                {leaves.length} Approved Entries
              </span>
            </div>

            {leaves.length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center py-6">No approved company leaves currently registered on index.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 font-mono py-1">
                      <th className="pb-2 font-semibold">Employee</th>
                      <th className="pb-2 font-semibold">Department & Role</th>
                      <th className="pb-2 font-semibold">Leave Type</th>
                      <th className="pb-2 font-semibold">Duration Scheduled</th>
                      <th className="pb-2 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {leaves.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-850/20 text-slate-300 transition-colors">
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            <span className="font-bold text-white text-xs">{l.employeeName}</span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <div className="text-[11px]">
                            <span className="block text-slate-200">{l.role}</span>
                            <span className="block text-[9px] text-slate-500 font-mono uppercase">{l.department}</span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase ${
                            l.type === 'Vacation' ? 'bg-emerald-950/40 text-emerald-350 border border-emerald-900/40' :
                            l.type === 'Sickness' ? 'bg-amber-950/40 text-amber-350 border border-amber-900/40' :
                            l.type === 'Parental' ? 'bg-purple-950/40 text-purple-350 border border-purple-900/40' :
                            l.type === 'Study' ? 'bg-blue-950/40 text-blue-350 border border-blue-900/40' :
                            'bg-rose-950/40 text-rose-350 border border-rose-900/40'
                          }`}>
                            {l.type}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="text-[11px] font-mono leading-relaxed">
                            <span>{l.startDate} to {l.endDate}</span>
                            <span className="block text-[9px] text-slate-500">
                              Began: {l.createdAt}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleDeleteLeave(l.id, l.employeeName)}
                            className="p-1 bg-slate-950 hover:bg-rose-950/50 hover:text-rose-400 border border-slate-850 hover:border-rose-900/40 text-slate-450 rounded transition-all cursor-pointer"
                            title="Revoke Time-off"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Interaction Form & Details side panels (4-Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active selected date analyzer panel */}
          <div className="bg-slate-900 rounded-xl border border-slate-850 p-4 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[9px] text-slate-500 font-mono block uppercase tracking-widest leading-none">Inspection date</span>
              <span className="text-sm font-extrabold text-white font-mono">{selectedDay}</span>
              <span className="text-[10px] text-emerald-400 font-medium block mt-1">
                {selectedDay === '2026-06-16' ? '📍 Active system timeline state context' : 'Interactive calendar inspect'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Holidays list block */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5 select-none">Company Holidays (on date):</span>
                {activeDayHolidays.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No standard public holidays on this calendar index day.</p>
                ) : (
                  <div className="space-y-1">
                    {activeDayHolidays.map((h, idx) => (
                      <div key={idx} className="bg-rose-950/20 border border-rose-900/30 p-2 rounded flex flex-col gap-1 text-[11px] leading-tight text-rose-300">
                        <span className="font-extrabold">🎉 {h.name}</span>
                        <div className="flex gap-1">
                          {h.countries.map(c => (
                            <span key={c} className="text-[8px] bg-slate-950 text-slate-400 px-1 py-0.2 rounded font-mono font-bold uppercase">{c}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leaves list block */}
              <div>
                <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block mb-1.5 select-none font-sans">Emp. Approved Leave (on date):</span>
                {activeDayLeaves.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No active roster personnel requested time off on this day.</p>
                ) : (
                  <div className="space-y-2">
                    {activeDayLeaves.map((l) => (
                      <div key={l.id} className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-200 text-xs">{l.employeeName}</span>
                          <span className={`text-[8px] font-mono px-1 rounded uppercase ${
                            l.type === 'Vacation' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' :
                            l.type === 'Sickness' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' :
                            'bg-indigo-950 text-indigo-400 border border-indigo-900/30'
                          }`}>
                            {l.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          <span className="block">{l.role}</span>
                          <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{l.startDate} to {l.endDate}</span>
                        </div>
                        {l.notes && (
                          <div className="text-[9px] text-slate-455 bg-slate-900/80 p-1.5 rounded p-1 border-l border-indigo-650 italic mt-1 leading-normal">
                            "{l.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roster validation occupancy advice */}
              <div className="bg-indigo-950/15 p-2.5 rounded border border-indigo-900/20 text-[10px] text-indigo-350 leading-relaxed space-y-1">
                <div className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold">Staffing overlap monitor</span>
                </div>
                <p>
                  Current Compliance rosters require &gt; 70% threshold active presence. Overlaps are simulated to protect workflow service level agreements.
                </p>
              </div>

            </div>

          </div>

          {/* Form to log/request leave directly */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-3 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 pb-2 border-b border-slate-850">
              <Plus className="w-4 h-4 text-emerald-450" />
              Schedule Leave Authorization
            </h3>
            
            <form onSubmit={handleAddLeave} className="space-y-3">
              
              {/* Choose employee from loaded state */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Select Employee</label>
                <select
                  required
                  value={newLeaveEmployeeId}
                  onChange={(e) => setNewLeaveEmployeeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-855 text-xs text-white px-3 py-2 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.department} - {emp.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Choose category leave status */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Leave Type</label>
                  <select
                    value={newLeaveType}
                    onChange={(e) => setNewLeaveType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-855 text-xs text-white px-2.5 py-1.8 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Vacation">Beach Holiday / Vacation</option>
                    <option value="Sickness">Sickness & Wellness</option>
                    <option value="Parental">Caregiver / Parental</option>
                    <option value="Study">Professional Study</option>
                    <option value="Compassionate">Compassionate</option>
                  </select>
                </div>

                {/* Sub-duration constraints info */}
                <div className="bg-slate-950 p-2 rounded border border-slate-850 flex items-center justify-between select-none">
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase font-bold leading-normal">Accrual Match</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">100% compliant</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>

              </div>

              {/* Start Date & End Date selection */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Start Date</label>
                  <input
                    required
                    type="date"
                    value={newLeaveStart}
                    onChange={(e) => setNewLeaveStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-855 text-xs text-slate-200 px-3 py-1.5 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">End Date</label>
                  <input
                    required
                    type="date"
                    value={newLeaveEnd}
                    onChange={(e) => setNewLeaveEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-855 text-xs text-slate-200 px-3 py-1.5 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Comment and notes area */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Approval Comments / Purpose</label>
                <textarea
                  placeholder="Insert authorization details e.g. cover details or priority contact rules..."
                  value={newLeaveNotes}
                  onChange={(e) => setNewLeaveNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-855 text-xs text-white p-2 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-14"
                />
              </div>

              {/* Action Notifications feed feedback */}
              <AnimatePresence mode="wait">
                {formError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2 border border-rose-900/30 bg-rose-950/20 text-rose-400 text-[10px] rounded leading-relaxed flex items-start gap-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </motion.div>
                )}

                {formSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2 border border-emerald-900/30 bg-emerald-950/20 text-emerald-300 text-[10px] rounded leading-relaxed flex items-start gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{formSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wide rounded transition-colors select-none cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule Employee Leave Block
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

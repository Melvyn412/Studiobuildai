import React, { useState } from 'react';
import { Employee } from '../types';
import { maskSensitiveValue } from '../utils/hrHelpers';
import { 
  Users, Search, UserPlus, Filter, Trash2, Edit3, 
  MapPin, Phone, Mail, Award, DollarSign, Calendar, Eye, EyeOff, X, CheckSquare
} from 'lucide-react';

interface EmployeeDirectoryProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  isMasked: boolean;
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
}

export default function EmployeeDirectory({ employees, setEmployees, isMasked, addLog }: EmployeeDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Create / Edit state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editableEmp, setEditableEmp] = useState<Partial<Employee> | null>(null);

  const departments = ['All', 'Engineering', 'HR & Legal', 'Marketing', 'Product Management', 'Finance & Sales'];
  const statuses = ['All', 'Active', 'Onboarding', 'Terminated', 'On Leave'];

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenEdit = (emp: Employee) => {
    setEditableEmp(emp);
    setIsFormOpen(true);
    addLog('Edit Employee Dialog Opened', 'Modification', `Preparing updates for ${emp.firstName} ${emp.lastName}`);
  };

  const handleOpenCreate = () => {
    setEditableEmp({
      id: `emp-${Date.now()}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      role: '',
      status: 'Onboarding',
      startDate: new Date().toISOString().split('T')[0],
      salary: 80000,
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableEmp || !editableEmp.firstName || !editableEmp.lastName) return;

    const fullEmp = editableEmp as Employee;
    const exists = employees.some(e => e.id === fullEmp.id);
    
    if (exists) {
      setEmployees(employees.map(e => e.id === fullEmp.id ? fullEmp : e));
      addLog('Employee Updated', 'Modification', `Updated record for ${fullEmp.firstName} ${fullEmp.lastName} (${fullEmp.role})`);
    } else {
      setEmployees([...employees, fullEmp]);
      addLog('Employee Created', 'Modification', `Added initial offline profile for ${fullEmp.firstName} ${fullEmp.lastName}`);
    }
    
    setIsFormOpen(false);
    setEditableEmp(null);
    if (selectedEmployee?.id === fullEmp.id) {
      setSelectedEmployee(fullEmp);
    }
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete ${name}'s offline personnel record? This cannot be undone.`)) {
      setEmployees(employees.filter(e => e.id !== id));
      addLog('Employee Card Purged', 'Modification', `Purged sensitive storage file for ${name}`);
      if (selectedEmployee?.id === id) {
        setSelectedEmployee(null);
      }
    }
  };

  const viewDetails = (emp: Employee) => {
    setSelectedEmployee(emp);
    addLog('Viewed Employee Records', 'Data Access', `Decrypted database credentials and loaded profile details of ${emp.firstName} ${emp.lastName}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-slate-100" id="emp-directory-container">
      {/* Search and List Column (2-cols span) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Offline Personnel Roster
              </h2>
              <p className="text-xs text-slate-400">Manage all employee state files purely inside this isolated context.</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
              id="btn-add-employee"
            >
              <UserPlus className="w-4 h-4" />
              Add Record
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, role, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                id="search-input-employee"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-350 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept} className="bg-slate-900 text-white">{dept === 'All' ? 'All Departments' : dept}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-350 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {statuses.map(st => (
                  <option key={st} value={st} className="bg-slate-900 text-white">{st === 'All' ? 'All Statuses' : st}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* List of records */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Base Salary</th>
                  <th className="px-5 py-3.5 text-center">Security Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500">
                      No hardware profile matched the current filter conditions.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr 
                      key={emp.id}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${selectedEmployee?.id === emp.id ? 'bg-indigo-950/20' : ''}`}
                      onClick={() => viewDetails(emp)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white">{emp.firstName} {emp.lastName}</div>
                        <div className="text-slate-450 text-[11px]">{emp.role}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800">
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-400">
                        {maskSensitiveValue(emp.salary, 'salary', isMasked)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          emp.status === 'Active' ? 'bg-green-950/40 text-green-300 border border-green-800/40' : 
                          emp.status === 'Onboarding' ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40' :
                          emp.status === 'On Leave' ? 'bg-sky-950/40 text-sky-300 border border-sky-800/40' :
                          'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1 text-slate-400 hover:text-indigo-400 rounded-sm hover:bg-slate-800 cursor-pointer transition-colors"
                          title="Edit Personal credentials"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id, `${emp.firstName} ${emp.lastName}`)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-sm hover:bg-slate-800 cursor-pointer transition-colors"
                          title="Safeguard purge profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Profiler Showcase Desk (1-col) */}
      <div className="space-y-4">
        {selectedEmployee ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 sticky top-4 animate-fade-in shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded">
                  Internal ID: {selectedEmployee.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h3>
                <p className="text-xs text-indigo-400 font-medium">{selectedEmployee.role}</p>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <hr className="border-slate-800" />

            {/* Profile Fields block */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Award className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-450 uppercase font-mono">Department</div>
                  <div className="font-medium text-slate-200">{selectedEmployee.department}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-450 uppercase font-mono flex items-center gap-1.5">
                    Email Address
                    {isMasked ? <EyeOff className="w-3 h-3 text-indigo-400" /> : <Eye className="w-3 h-3 text-slate-500" />}
                  </div>
                  <div className="font-mono text-slate-200">{maskSensitiveValue(selectedEmployee.email, 'email', isMasked)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-450 uppercase font-mono">Mobile Node</div>
                  <div className="font-mono text-slate-200">{maskSensitiveValue(selectedEmployee.phone, 'phone', isMasked)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-450 uppercase font-mono">Annual Salary</div>
                  <div className="font-semibold font-mono text-green-300 bg-green-950/30 px-2 py-0.5 rounded border border-green-900/30">
                    {maskSensitiveValue(selectedEmployee.salary, 'salary', isMasked)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-455 uppercase font-mono">Onboarded / Date Hired</div>
                  <div className="text-slate-250">{selectedEmployee.startDate}</div>
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            <div>
              <div className="text-[10px] uppercase font-mono text-slate-450 mb-1">Administrative Notes (Locked Local Session Only)</div>
              <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-850 text-xs text-slate-350 leading-relaxed italic">
                {selectedEmployee.notes || "No offline records associated with this employee card yet."}
              </div>
            </div>

            <div className="bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/30 text-[11px] text-indigo-300 leading-snug flex items-start gap-1.5">
              <span>🔒</span>
              <p>This profile is stored securely in production secure client thread storage. Data is never exposed or submitted over TCP/IP web channels.</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center text-slate-500 flex flex-col items-center justify-center h-44 shadow-sm">
            <Users className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-xs">Select an employee record from the roster to view their operational parameters.</p>
          </div>
        )}
      </div>

      {/* Roster Record Form Dialog */}
      {isFormOpen && editableEmp && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 w-full max-w-lg overflow-hidden animate-scale-up text-slate-100">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                {employees.some(e => e.id === editableEmp.id) ? 'Modify System Credentials' : 'Provision Offline Employee card'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editableEmp.firstName || ''}
                    onChange={(e) => setEditableEmp({...editableEmp, firstName: e.target.value})}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editableEmp.lastName || ''}
                    onChange={(e) => setEditableEmp({...editableEmp, lastName: e.target.value})}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Email Node Address</label>
                  <input
                    type="email"
                    required
                    value={editableEmp.email || ''}
                    onChange={(e) => setEditableEmp({...editableEmp, email: e.target.value})}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    required
                    value={editableEmp.phone || ''}
                    onChange={(e) => setEditableEmp({...editableEmp, phone: e.target.value})}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 555-0199"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Department Desk</label>
                  <select
                    value={editableEmp.department || 'Engineering'}
                    onChange={(e) => setEditableEmp({...editableEmp, department: e.target.value})}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Engineering" className="bg-slate-900 text-white">Engineering</option>
                    <option value="HR & Legal" className="bg-slate-900 text-white">HR & Legal</option>
                    <option value="Marketing" className="bg-slate-900 text-white">Marketing</option>
                    <option value="Product Management" className="bg-slate-900 text-white">Product Management</option>
                    <option value="Finance & Sales" className="bg-slate-900 text-white">Finance & Sales</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Functional Role Title</label>
                  <input
                    type="text"
                    required
                    value={editableEmp.role || ''}
                    onChange={(e) => setEditableEmp({...editableEmp, role: e.target.value})}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Lead Systems Integrator"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Operational Status</label>
                  <select
                    value={editableEmp.status || 'Onboarding'}
                    onChange={(e) => setEditableEmp({...editableEmp, status: e.target.value as any})}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Onboarding" className="bg-slate-900 text-white">Onboarding</option>
                    <option value="Active" className="bg-slate-900 text-white">Active</option>
                    <option value="On Leave" className="bg-slate-900 text-white">On Leave</option>
                    <option value="Terminated" className="bg-slate-900 text-white">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Base Salary (USD/yr)</label>
                  <input
                    type="number"
                    required
                    value={editableEmp.salary || 80000}
                    onChange={(e) => setEditableEmp({...editableEmp, salary: Number(e.target.value)})}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Credential Start Date</label>
                <input
                  type="date"
                  value={editableEmp.startDate || ''}
                  onChange={(e) => setEditableEmp({...editableEmp, startDate: e.target.value})}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Administrative Offline Bio / Notes</label>
                <textarea
                  value={editableEmp.notes || ''}
                  onChange={(e) => setEditableEmp({...editableEmp, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Record credentials feedback, isolation clearances, or background notes..."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 border border-slate-850 hover:bg-slate-800 rounded text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold hover:shadow-xs transition-all cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

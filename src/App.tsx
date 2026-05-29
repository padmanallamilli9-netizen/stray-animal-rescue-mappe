import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Info, ShieldCheck, HeartPulse, Clock, HelpCircle, Activity, Globe, MapPin, CheckCircle2, Edit, Check, X, Briefcase, Trash2 } from 'lucide-react';
import { RescueReport, Shelter, RescueStatus, Severity } from './types';
import { INITIAL_REPORTS, INITIAL_SHELTERS } from './initialData';
import ReportForm from './components/ReportForm';
import RescueDashboard from './components/RescueDashboard';
import MapHub from './components/MapHub';
import ToastContainer, { ToastMessage } from './components/Toast';

export default function App() {
  const [reports, setReports] = useState<RescueReport[]>([]);
  const [shelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('2026-05-29 02:58 UTC');

  // Local coordinator state management with persistence
  const [coordinatorName, setCoordinatorName] = useState<string>(() => {
    return localStorage.getItem('stray_rescue_coordinator_name') || 'padmanallamilli5@gmail.com';
  });
  const [isEditingCoordinator, setIsEditingCoordinator] = useState<boolean>(false);
  const [tempCoordinatorName, setTempCoordinatorName] = useState<string>('');

  // Counter tracking exact physical operations made by the coordinator
  const [operationsCount, setOperationsCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('stray_rescue_ops_count') || '0', 10);
  });

  // Toggle state to control display of Sandbox Sample Feed vs Clean Work Ledger
  const [useSandbox, setUseSandbox] = useState<boolean>(() => {
    const saved = localStorage.getItem('stray_rescue_use_sandbox');
    return saved === null ? true : saved === 'true';
  });

  // Increment operations counter Helper
  const recordOperation = () => {
    setOperationsCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('stray_rescue_ops_count', next.toString());
      return next;
    });
  };

  // Synchronize dynamic system time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const utcString = now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
      setCurrentTime(utcString);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load from LocalStorage or seed defaults if nothing exists
  useEffect(() => {
    const saved = localStorage.getItem('stray_rescue_reports_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as RescueReport[];
        setReports(parsed);
        if (parsed.length > 0) {
          setSelectedLocation(parsed[0].location);
          setSelectedReportId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse local storage rescue ledger, falling back to initial data.', e);
        setReports(INITIAL_REPORTS);
        setSelectedLocation(INITIAL_REPORTS[0].location);
        setSelectedReportId(INITIAL_REPORTS[0].id);
      }
    } else {
      setReports(INITIAL_REPORTS);
      setSelectedLocation(INITIAL_REPORTS[0].location);
      setSelectedReportId(INITIAL_REPORTS[0].id);
    }
  }, []);

  // Save to LocalStorage whenever reports change
  const saveReports = (updated: RescueReport[]) => {
    setReports(updated);
    localStorage.setItem('stray_rescue_reports_db', JSON.stringify(updated));
  };

  // Add toast helper
  const addToast = (type: 'urgency' | 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setToasts((prev) => [newToast, ...prev]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handle new reports
  const handleAddNewReport = (newRecord: Omit<RescueReport, 'id' | 'timestamp' | 'status'>) => {
    const now = new Date();
    const stamp = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC';

    const completeReport: RescueReport = {
      ...newRecord,
      id: `rep-${Date.now()}`,
      timestamp: stamp,
      status: 'reported'
    };

    const updated = [completeReport, ...reports];
    saveReports(updated);
    setSelectedLocation(completeReport.location);
    setSelectedReportId(completeReport.id);
    recordOperation();
    
    addToast(
      'success',
      'Report Submitted',
      `🐾 ${completeReport.animalType} reported successfully at ${completeReport.location}. First-response dispatch ready.`
    );
  };

  // Handle updating status
  const handleUpdateStatus = (id: string, status: RescueStatus, notes?: string) => {
    const updated = reports.map((rep) => {
      if (rep.id === id) {
        return {
          ...rep,
          status,
          ...(notes ? { notes } : {})
        };
      }
      return rep;
    });

    saveReports(updated);
    recordOperation();

    const targetReport = reports.find((r) => r.id === id);
    if (targetReport) {
      const verbMap = {
        reported: 'received',
        dispatched: 'mobilized',
        recovering: 'transferred to shelter',
        resolved: 'marked completely safe'
      };
      
      addToast(
        'info',
        'Status Sequence Updated',
        `🐾 ${targetReport.animalType} (Incident #${id.replace('rep-', '')}) is now ${verbMap[status]}.`
      );
    }
  };

  // Handle delete
  const handleDeleteReport = (id: string) => {
    const target = reports.find(r => r.id === id);
    const updated = reports.filter((rep) => rep.id !== id);
    saveReports(updated);
    recordOperation();
    
    if (target) {
      addToast(
        'warning',
        'Ledger Entry Removed',
        `Animal incident reporting for ${target.animalType} (ID #${id.replace('rep-', '')}) permanently purged.`
      );
    }
  };

  // Handle Edit details of a report
  const handleEditReport = (id: string, updatedFields: Partial<RescueReport>) => {
    const updated = reports.map((rep) => {
      if (rep.id === id) {
        return {
          ...rep,
          ...updatedFields
        };
      }
      return rep;
    });
    saveReports(updated);
    recordOperation();

    addToast(
      'success',
      'Report Details Adjusted',
      `Incident #${id.replace('rep-', '')} details have been updated successfully.`
    );
  };

  // Handle direct alert trigger
  const handleAlertRescue = (report: RescueReport) => {
    // Equivalent to original user function alertRescue, but using an elegant toast flow instead of screen-freezing window.alert
    addToast(
      'urgency',
      '🚨 RESCUE MOBILIZATION',
      `Squad dispatched immediately for target: [${report.animalType}] injured at [${report.location}]. Contact reporter at: ${report.contact}`
    );

    recordOperation();

    // Update status to dispatched if it matches reported
    if (report.status === 'reported') {
      handleUpdateStatus(report.id, 'dispatched', 'Emergency Mobilization Broadcast sent. Local volunteers deploying.');
    }
  };

  // Calculate statistics metrics base on sandbox settings
  const visibleReports = useSandbox
    ? reports
    : reports.filter((r) => r.id !== 'rep-1' && r.id !== 'rep-2' && r.id !== 'rep-3' && r.id !== 'rep-4');

  const totalIncidents = visibleReports.length;
  const criticalCount = visibleReports.filter((r) => r.severity === 'critical' && r.status !== 'resolved').length;
  const activeDispatches = visibleReports.filter((r) => r.status === 'dispatched').length;
  const rescuedSafe = visibleReports.filter((r) => r.status === 'resolved' || r.status === 'recovering').length;

  const handleSaveCoordinator = () => {
    if (!tempCoordinatorName.trim()) {
      addToast('warning', 'Invalid Input', 'Coordinator contact detail cannot be empty.');
      return;
    }
    setCoordinatorName(tempCoordinatorName.trim());
    localStorage.setItem('stray_rescue_coordinator_name', tempCoordinatorName.trim());
    setIsEditingCoordinator(false);
    recordOperation();
    addToast('success', 'Coordinator Profile Edited', `Coordinator has been updated to: ${tempCoordinatorName.trim()}`);
  };

  const handleResetOperationsCount = () => {
    setOperationsCount(0);
    localStorage.setItem('stray_rescue_ops_count', '0');
    addToast('info', 'Live Ops Cleared', 'Live operations counter reset to 0.');
  };

  const handlePurgeAllReports = () => {
    saveReports([]);
    recordOperation();
    addToast('warning', 'Incident Ledger Purged', 'All custom and sandbox reports deleted completely. Stats reset to 0.');
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col font-sans transition-colors duration-300">
      
      {/* Dynamic Toast Layer */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Modern High-contrast Header */}
      <header className="bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#16a34a_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transform rotate-3">
              <span className="text-3xl">🐾</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl header-style">
                Rescue Mapper <span className="text-emerald-400">Stray Hub</span>
              </h1>
              <p className="text-slate-400 text-xs mt-1 font-medium flex items-center gap-1.5 leading-none">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Local Rescue Coordination • Real-Time Neighborhood GIS Ledger</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Editable Local Coordinator Block */}
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 px-4 py-2 rounded-xl text-left min-w-[200px] relative transition-all group">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">Local Coordinator</span>
              
              {!isEditingCoordinator ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-200 select-all truncate max-w-[160px]" title={coordinatorName}>
                    {coordinatorName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempCoordinatorName(coordinatorName);
                      setIsEditingCoordinator(true);
                    }}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Edit Coordinator Name/Email"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={tempCoordinatorName}
                    onChange={(e) => setTempCoordinatorName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-200 px-1.5 py-0.5 rounded w-full focus:outline-none focus:border-emerald-500"
                    placeholder="E.g. Squad Leader Alan"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveCoordinator();
                      if (e.key === 'Escape') setIsEditingCoordinator(false);
                    }}
                  />
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveCoordinator}
                      className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCoordinator(false)}
                      className="p-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 px-4 py-2 rounded-xl text-left">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-extrabold flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 animate-pulse" />
                <span>System Time Feed</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-200">{currentTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Core Application Metrics Overview Panel */}
      <section className="bg-pink-100 border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-pink-200 pb-4">
            <div>
              <h3 className="text-xs font-extrabold text-pink-800 uppercase tracking-wider">Metrics Monitoring Grid</h3>
              <p className="text-[11px] text-pink-700 mt-0.5 font-bold">Accurate GIS stats updating dynamically as you dispatch coordinates.</p>
            </div>
            
            {/* Interactive Sandbox Mode vs Work Mode controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Reset live actions */}
              <button
                type="button"
                onClick={handleResetOperationsCount}
                className="px-2.5 py-1 text-[10px] font-bold text-pink-700 hover:text-pink-950 bg-pink-200/50 hover:bg-pink-200 rounded-lg transition-colors border border-pink-300"
                title="Reset session counter back to 0"
              >
                Reset Live Tracker Count
              </button>

              {/* Reset database */}
              <button
                type="button"
                onClick={handlePurgeAllReports}
                className="px-2.5 py-1 text-[10px] font-bold text-rose-700 hover:text-white bg-rose-200/50 hover:bg-rose-600 rounded-lg transition-colors flex items-center gap-1 border border-rose-300"
                title="Wipe database reports entirely to go completely clear"
              >
                <Trash2 className="w-3 h-3" />
                Wipe All Reports
              </button>

              <div className="h-4 w-px bg-pink-200 hidden sm:block"></div>

              {/* iOS style switcher */}
              <div className="flex items-center gap-2 bg-pink-200/40 border border-pink-300/60 px-3 py-1 rounded-xl text-xs">
                <span className="font-bold text-pink-700 text-[10.5px]">Simulation Demo Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = !useSandbox;
                    setUseSandbox(newVal);
                    localStorage.setItem('stray_rescue_use_sandbox', newVal.toString());
                    addToast(
                      'info',
                      'Workspace Mode Changed',
                      newVal 
                        ? 'Demonstration default cases loaded. Proximity algorithms ready.' 
                        : 'Custom production workspace active. Showing purely your registered records.'
                    );
                    recordOperation();
                  }}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                    useSandbox ? 'bg-emerald-600' : 'bg-pink-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      useSandbox ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Stat Item 1 */}
            <div className="bg-pink-700 p-4 rounded-2xl border border-pink-800 flex items-center gap-3.5 group hover:bg-pink-800 shadow-md shadow-pink-900/10 transition-all">
              <div className="p-3 bg-white/10 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] text-pink-200 uppercase font-extrabold tracking-wider block">Urgent Emergencies</span>
                <span className="text-xl font-black text-white block mt-0.5">
                  {criticalCount} <span className="text-xs font-semibold text-pink-200">cases</span>
                </span>
              </div>
            </div>

            {/* Stat Item 2 */}
            <div className="bg-pink-700 p-4 rounded-2xl border border-pink-800 flex items-center gap-3.5 group hover:bg-pink-800 shadow-md shadow-pink-900/10 transition-all">
              <div className="p-3 bg-white/10 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <Activity className="w-5 h-5 animate-pulse text-white" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <span className="text-[10px] text-pink-200 uppercase font-extrabold tracking-wider block">Active Dispatches</span>
                <span className="text-xl font-black text-white block mt-0.5">
                  {activeDispatches} <span className="text-xs font-semibold text-pink-200">units</span>
                </span>
              </div>
            </div>

            {/* Stat Item 3 */}
            <div className="bg-pink-700 p-4 rounded-2xl border border-pink-800 flex items-center gap-3.5 group hover:bg-pink-800 shadow-md shadow-pink-900/10 transition-all">
              <div className="p-3 bg-white/10 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] text-pink-200 uppercase font-extrabold tracking-wider block">Rescued & Safe</span>
                <span className="text-xl font-black text-white block mt-0.5">
                  {rescuedSafe} <span className="text-xs font-semibold text-pink-200">/ {totalIncidents} solved</span>
                </span>
              </div>
            </div>

            {/* Stat Item 4 */}
            <div className="bg-pink-700 p-4 rounded-2xl border border-pink-800 flex items-center gap-3.5 group hover:bg-pink-800 shadow-md shadow-pink-900/10 transition-all">
              <div className="p-3 bg-white/10 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] text-pink-200 uppercase font-extrabold tracking-wider block">Coordinator Live Operations</span>
                <span className="text-xl font-black text-white block mt-0.5">
                  {operationsCount} <span className="text-xs font-semibold text-pink-200">tasks run</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Single-View Work Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side - Span 4 */}
          <section className="lg:col-span-4" id="form-dock">
            <ReportForm onSubmit={handleAddNewReport} />
            
            {/* Helpful Guide note layout */}
            <div className="mt-5 p-4 bg-pink-850 border border-pink-700/60 rounded-xl flex gap-3 text-xs text-white shadow-sm">
              <Info className="w-5 h-5 text-pink-200 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-white">Coordinator Quick Guideline</h4>
                <p className="mt-1 font-bold leading-relaxed text-pink-100">
                  When receiving injured reports, verify visual status before mobilizing dispatch units. High priority alerts instantly highlight the team map coordinates.
                </p>
              </div>
            </div>
          </section>

          {/* Active Incidents Dashboard - Span 4 */}
          <section className="lg:col-span-4" id="dashboard-dock">
            <RescueDashboard
              reports={visibleReports}
              onUpdateStatus={handleUpdateStatus}
              onEditReport={handleEditReport}
              onSelectLocation={(loc) => {
                setSelectedLocation(loc);
                addToast('info', 'Focal Map Focus Changed', `Viewing Map Location: [${loc}]`);
              }}
              onAlertRescue={handleAlertRescue}
              onDeleteReport={handleDeleteReport}
              selectedReportId={selectedReportId}
              onSelectReport={(id) => {
                setSelectedReportId(id);
                const findRep = reports.find((r) => r.id === id);
                if (findRep) {
                  setSelectedLocation(findRep.location);
                }
              }}
            />
          </section>

          {/* Map Viewer Portal - Span 4 */}
          <section className="lg:col-span-4 h-full" id="map-dock">
            <div className="sticky top-6">
              <MapHub
                shelters={shelters}
                selectedLocation={selectedLocation}
                onSelectCoordinate={(newCoordinate) => {
                  setSelectedLocation(newCoordinate);
                  setSelectedReportId(null);
                }}
              />
            </div>
          </section>

        </div>

      </main>

      {/* System Footer Bar */}
      <footer className="bg-pink-100 border-t border-pink-200 py-6 text-center text-xs text-pink-705 font-bold">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Stray Animal Rescue Mapper. Secured municipal portal ledger.</p>
          <div className="flex gap-4">
            <span className="hover:text-pink-900 cursor-pointer">Protocol Rules</span>
            <span>•</span>
            <span className="hover:text-pink-900 cursor-pointer">Vet Partners</span>
            <span>•</span>
            <span className="hover:text-pink-900 cursor-pointer">Dispatches Live</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

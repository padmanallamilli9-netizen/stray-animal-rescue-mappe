import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldAlert, Sparkles, AlertTriangle, CheckCircle, Clock, HeartHandshake, Eye, MessageSquare, Trash2, Phone, Edit, Save } from 'lucide-react';
import { RescueReport, Severity, RescueStatus } from '../types';

interface RescueDashboardProps {
  reports: RescueReport[];
  onUpdateStatus: (id: string, status: RescueStatus, notes?: string) => void;
  onEditReport: (id: string, updatedFields: Partial<RescueReport>) => void;
  onSelectLocation: (location: string) => void;
  onAlertRescue: (report: RescueReport) => void;
  onDeleteReport: (id: string) => void;
  selectedReportId: string | null;
  onSelectReport: (id: string) => void;
}

export default function RescueDashboard({
  reports,
  onUpdateStatus,
  onEditReport,
  onSelectLocation,
  onAlertRescue,
  onDeleteReport,
  selectedReportId,
  onSelectReport
}: RescueDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeResolutionId, setActiveResolutionId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Editing state for individual report card override
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editAnimalType, setEditAnimalType] = useState('');
  const [editProblem, setEditProblem] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editSeverity, setEditSeverity] = useState<Severity>('moderate');

  const startEditing = (report: RescueReport) => {
    setEditingReportId(report.id);
    setEditAnimalType(report.animalType);
    setEditProblem(report.problem);
    setEditLocation(report.location);
    setEditContact(report.contact);
    setEditSeverity(report.severity);
  };

  const cancelEditing = () => {
    setEditingReportId(null);
  };

  const saveEditingDetails = (id: string) => {
    if (!editAnimalType.trim() || !editProblem.trim() || !editLocation.trim() || !editContact.trim()) {
      alert('All report fields must be filled correctly.');
      return;
    }

    onEditReport(id, {
      animalType: editAnimalType.trim(),
      problem: editProblem.trim(),
      location: editLocation.trim(),
      contact: editContact.trim(),
      severity: editSeverity
    });

    setEditingReportId(null);
  };

  // Filtering function
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.animalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.problem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-rose-50 text-rose-700 border border-rose-100 animate-pulse-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Critical Injury
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Moderate Concern
          </span>
        );
      case 'stable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Stable / Rest
          </span>
        );
    }
  };

  const getStatusDisplay = (status: RescueStatus) => {
    switch (status) {
      case 'reported':
        return {
          text: 'Report Received',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case 'dispatched':
        return {
          text: 'Rescuers Dispatched',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse-subtle',
          icon: <Sparkles className="w-3.5 h-3.5" />
        };
      case 'recovering':
        return {
          text: 'Under Care / Shelter',
          color: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <HeartHandshake className="w-3.5 h-3.5" />
        };
      case 'resolved':
        return {
          text: 'Rescue Safe & Solved',
          color: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: <CheckCircle className="w-3.5 h-3.5" />
        };
    }
  };

  const handleResolveSubmit = (id: string) => {
    onUpdateStatus(id, 'resolved', resolutionNote || 'Successfully rescued and transferred safely.');
    setResolutionNote('');
    setActiveResolutionId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Advanced Filtration */}
      <div className="bg-pink-800 p-5 rounded-2xl border border-pink-700 shadow-md space-y-4 text-white">
        <div id="filter-header" className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📋 Rescue Dashboard</span>
            <span className="px-2.5 py-0.5 bg-pink-900/50 text-pink-100 rounded-full text-xs font-bold">
              {filteredReports.length} {filteredReports.length === 1 ? 'Report' : 'Reports'}
            </span>
          </h2>
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-300">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="dash-search-input"
            type="text"
            placeholder="Search by animal, neighborhood, or injuries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-pink-900/40 border border-pink-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-pink-300/70 font-bold text-sm transition-all focus:bg-pink-900/85 text-white"
          />
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Severity Filter Selector */}
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-pink-200 uppercase tracking-wider mb-1.5">
              Urgency Level
            </label>
            <div className="flex gap-1 bg-pink-900/50 p-1 rounded-xl border border-pink-700/50">
              {['all', 'critical', 'moderate', 'stable'].map((level) => (
                <button
                  key={level}
                  id={`filter-sev-${level}`}
                  onClick={() => setSeverityFilter(level)}
                  className={`flex-1 py-1 px-2 text-xs font-bold rounded-lg capitalize transition-all ${
                    severityFilter === level
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-pink-200 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter Selector */}
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-pink-200 uppercase tracking-wider mb-1.5">
              Rescue Pipeline
            </label>
            <div className="flex gap-1 bg-pink-900/50 p-1 rounded-xl border border-pink-700/50">
              {['all', 'reported', 'dispatched', 'recovering', 'resolved'].map((st) => (
                <button
                  key={st}
                  id={`filter-status-${st}`}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg capitalize transition-all truncate ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-pink-200 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All' : st === 'recovering' ? 'Care' : st === 'resolved' ? 'Solved' : st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Stack */}
      <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
        {filteredReports.length === 0 ? (
          <div className="bg-pink-800 border border-pink-750 text-white rounded-2xl p-12 text-center shadow-md">
            <div className="w-16 h-16 bg-pink-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-300 border border-dashed border-pink-700">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Rescue Cases Match Filters</h3>
            <p className="text-xs text-pink-200 mt-1 max-w-xs mx-auto font-medium">Try broadening your search search queries or submitting a new live location report.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report) => {
              const statusInfo = getStatusDisplay(report.status);
              const isSelected = selectedReportId === report.id;

              return (
                <motion.div
                  key={report.id}
                  id={`report-card-${report.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  onClick={() => onSelectReport(report.id)}
                  className={`group relative bg-pink-800 text-white border rounded-2xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-emerald-400 border-pink-500 shadow-lg'
                      : 'border-pink-700 hover:border-pink-600 hover:shadow-lg'
                  }`}
                >
                  {/* Quick-locator header */}
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
                    {getSeverityBadge(report.severity)}
                  </div>

                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    {editingReportId !== report.id ? (
                      <button
                        type="button"
                        id={`btn-edit-trigger-${report.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(report.id);
                          startEditing(report);
                        }}
                        className="p-1.5 bg-pink-900/90 hover:bg-emerald-600 text-pink-100 hover:text-white rounded-md transition-colors shadow"
                        title="Edit Report Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        id={`btn-edit-cancel-${report.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditing();
                        }}
                        className="p-1.5 bg-pink-905 hover:bg-pink-900 border border-pink-700 text-pink-100 rounded-md transition-colors text-[10px] font-bold shadow"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      id={`btn-delete-${report.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you certain you wish to purge this report from the master rescue ledger?')) {
                          onDeleteReport(report.id);
                        }
                      }}
                      className="p-1.5 bg-pink-900/90 hover:bg-rose-600 text-pink-200 hover:text-white rounded-md transition-colors shadow"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Animal Image */}
                  <div className="h-48 w-full overflow-hidden bg-pink-950 relative">
                    <img
                      src={report.imageUrl}
                      alt={report.animalType}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-950 via-black/10 to-transparent flex items-end p-5">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs mb-1.5 inline-block">
                          {report.animalType}
                        </span>
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 header-style">
                          🐾 Incident #{report.id.replace('rep-', '')}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Body Info & Editor Toggle */}
                  {editingReportId === report.id ? (
                    <div className="p-5 space-y-4 bg-pink-900/40 border-t border-pink-700" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-pink-300 tracking-wider">✏️ Edit Case Specs</h4>
                        <span className="text-[10px] text-pink-300 font-mono font-bold">Incident #{report.id.replace('rep-', '')}</span>
                      </div>
                      
                      {/* Edit Animal Type */}
                      <div>
                        <label className="block text-[10px] font-bold text-pink-200 uppercase tracking-wider mb-1">
                          Animal Type
                        </label>
                        <input
                          type="text"
                          value={editAnimalType}
                          onChange={(e) => setEditAnimalType(e.target.value)}
                          className="w-full px-3 py-2 bg-pink-900 border border-pink-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-white"
                          placeholder="e.g. Stray Cat, Injured Dog"
                        />
                      </div>

                      {/* Edit Severity */}
                      <div>
                        <label className="block text-[10px] font-bold text-pink-200 uppercase tracking-wider mb-1">
                          Urgency Severity Level
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['stable', 'moderate', 'critical'] as Severity[]).map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setEditSeverity(level)}
                              className={`py-1 px-1.5 text-[10px] font-black rounded-lg border text-center transition-all capitalize select-none ${
                                editSeverity === level
                                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                                  : 'bg-pink-900/60 border-pink-700 text-pink-200 hover:bg-pink-900'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Edit Problem Description */}
                      <div>
                        <label className="block text-[10px] font-bold text-pink-200 uppercase tracking-wider mb-1">
                          Reported Injury / Problem Detail
                        </label>
                        <textarea
                          value={editProblem}
                          onChange={(e) => setEditProblem(e.target.value)}
                          className="w-full px-3 py-2 bg-pink-900 border border-pink-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 h-16 resize-none transition-colors text-white"
                          placeholder="What is wrong with the stray animal?"
                        />
                      </div>

                      {/* Edit Location */}
                      <div>
                        <label className="block text-[10px] font-bold text-pink-200 uppercase tracking-wider mb-1">
                          Map Location / Address
                        </label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full px-3 py-2 bg-pink-900 border border-pink-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-white"
                          placeholder="Where was it spotted?"
                        />
                      </div>

                      {/* Edit Contact */}
                      <div>
                        <label className="block text-[10px] font-bold text-pink-200 uppercase tracking-wider mb-1">
                          Reporter Name & Contact Info
                        </label>
                        <input
                          type="text"
                          value={editContact}
                          onChange={(e) => setEditContact(e.target.value)}
                          className="w-full px-3 py-2 bg-pink-900 border border-pink-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-white"
                          placeholder="Name / Phone"
                        />
                      </div>

                      {/* Controls */}
                      <div className="flex gap-2 pt-2 border-t border-pink-700">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditing();
                          }}
                          className="flex-1 py-1.5 px-3 text-[10px] font-extrabold rounded-lg bg-pink-900 text-pink-200 hover:bg-pink-950 transition-colors text-center"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEditingDetails(report.id);
                          }}
                          className="flex-1 py-1.5 px-3 text-[10px] font-extrabold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 shadow-sm border-0"
                        >
                          <Save className="w-3 h-3" />
                          Save Adjustments
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between border-b border-pink-700/50 pb-3">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span>{statusInfo.text}</span>
                        </div>
                        <span className="text-[10px] text-pink-300 font-mono font-medium">
                          {report.timestamp}
                        </span>
                      </div>

                      {/* Problem Description */}
                      <div>
                        <p className="text-xs text-pink-300 uppercase font-bold tracking-wider mb-1">
                          Reported Problem
                        </p>
                        <p className="text-sm font-semibold text-white leading-relaxed">
                          {report.problem}
                        </p>
                      </div>

                      {/* Location clicker */}
                      <button
                        type="button"
                        id={`btn-loc-${report.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLocation(report.location);
                        }}
                        className="w-full flex items-center gap-2 p-2 bg-pink-900/40 hover:bg-pink-900/60 border border-pink-700 rounded-xl text-left transition-colors"
                      >
                        <MapPinIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-pink-300 uppercase font-bold tracking-wider leading-none">
                            Coordinates / Spot
                          </p>
                          <p className="font-bold text-xs text-white truncate mt-0.5">
                            {report.location}
                          </p>
                        </div>
                      </button>

                      {/* Contact indicator */}
                      <div className="flex items-center gap-1 text-xs font-bold text-pink-200">
                        <Phone className="w-3.5 h-3.5 text-pink-300" />
                        <span>Reporter: {report.contact}</span>
                      </div>

                      {/* Dispatched notes if available */}
                      {report.notes && (
                        <div className="flex gap-2 p-3 bg-emerald-950/45 border border-emerald-800 rounded-xl text-xs text-emerald-200">
                          <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Dispatch Update Note:</p>
                            <p className="mt-0.5 font-medium">{report.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Action buttons drawer */}
                      <div className="pt-3 border-t border-pink-700/50 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Alert Team Button - equivalent to users alert function */}
                        <button
                          type="button"
                          id={`btn-alert-${report.id}`}
                          onClick={() => onAlertRescue(report)}
                          className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/15 transition-colors flex items-center justify-center gap-1.5 border-0"
                        >
                          🚑 Emergency Dispatch Alarm
                        </button>

                        {/* Quick stage controls */}
                        <div className="w-full grid grid-cols-3 gap-1.5 mt-1">
                          {report.status === 'reported' && (
                            <button
                              type="button"
                              id={`btn-dispatch-${report.id}`}
                              onClick={() => onUpdateStatus(report.id, 'dispatched', 'Squad mobilized, in route to local venue.')}
                              className="w-full text-center py-2 px-1 text-[10px] font-black bg-pink-950 text-white rounded-lg hover:bg-black transition-colors"
                            >
                              Set Dispatch
                            </button>
                          )}
                          {report.status === 'dispatched' && (
                            <button
                              type="button"
                              id={`btn-recovering-${report.id}`}
                              onClick={() => onUpdateStatus(report.id, 'recovering', 'Transferred inside clinic for medical testing.')}
                              className="w-full text-center py-2 px-1 text-[10px] font-black bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                            >
                              Shelter / Care
                            </button>
                          )}
                          {report.status !== 'resolved' && (
                            <button
                              type="button"
                              id={`btn-resolve-trigger-${report.id}`}
                              onClick={() => {
                                setActiveResolutionId(activeResolutionId === report.id ? null : report.id);
                                setResolutionNote('');
                              }}
                              className="col-start-3 text-center py-2 px-1 text-[10px] font-black bg-pink-900 hover:bg-pink-950 text-pink-150 rounded-lg transition-colors"
                            >
                              {activeResolutionId === report.id ? 'Cancel' : 'Solve Case'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Resolution Note Form Drawer inline */}
                      {activeResolutionId === report.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-pink-900 p-3 rounded-xl border border-pink-700 space-y-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="block text-[10px] font-black text-pink-105 uppercase">
                            Case Resolution Summary
                          </label>
                          <textarea
                            placeholder="State how the animal was saved..."
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            className="w-full text-xs p-2 bg-pink-950 border border-pink-750 text-white rounded-md focus:ring-1 focus:ring-emerald-500 h-16 resize-none placeholder:text-pink-300"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              id="btn-cancel-res"
                              onClick={() => setActiveResolutionId(null)}
                              className="px-2 py-1 text-[10px] font-extrabold text-pink-200 hover:text-white hover:bg-pink-950 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              id="btn-save-res"
                              onClick={() => handleResolveSubmit(report.id)}
                              className="px-2.5 py-1 text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm border-0"
                            >
                              Resolve Incident
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Inline helper because layout is using MapPin SVG React hook
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

import React, { useState, useRef } from 'react';
import { Camera, MapPin, Phone, AlertCircle, Sparkles, Upload, X } from 'lucide-react';
import { Severity, RescueReport } from '../types';

interface ReportFormProps {
  onSubmit: (report: Omit<RescueReport, 'id' | 'timestamp' | 'status'>) => void;
}

export default function ReportForm({ onSubmit }: ReportFormProps) {
  const [animalType, setAnimalType] = useState('');
  const [problem, setProblem] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [severity, setSeverity] = useState<Severity>('moderate');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_ANIMAL_TYPES = ['Dog', 'Cat', 'Cow', 'Bird', 'Rabbit', 'Squirrel'];
  const PRESET_LOCATIONS = [
    'Downtown Public Library Plaza',
    'Industrial Valley Warehouse 12',
    'Greenfield Riverside Park',
    'Sunset Boulevard Transit Hub'
  ];

  // Handle Image Upload / Drag and Drop
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are permitted.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      alert('Please upload an image of the animal to help rescue coordinators identify it.');
      return;
    }

    onSubmit({
      animalType: animalType.trim(),
      problem: problem.trim(),
      severity,
      imageUrl: imagePreview,
      location: location.trim(),
      contact: contact.trim()
    });

    // Reset Form State
    setAnimalType('');
    setProblem('');
    setLocation('');
    setContact('');
    setSeverity('moderate');
    setImagePreview(null);
  };

  return (
    <div id="report-form-card" className="bg-pink-800 rounded-2xl shadow-md border border-pink-700 p-6 sm:p-8 transition-shadow hover:shadow-lg text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-pink-900/50 text-pink-200 rounded-xl">
          <AlertCircle className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Report Injured Animal</h2>
          <p className="text-xs text-pink-200 font-semibold">Coordinate a swift dispatch response unit.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Animal Type */}
        <div>
          <label id="lbl-animal-type" className="block text-sm font-black text-pink-100 mb-2">
            Animal Type <span className="text-pink-300 font-bold">*</span>
          </label>
          <input
            id="input-animal-type"
            type="text"
            value={animalType}
            onChange={(e) => setAnimalType(e.target.value)}
            placeholder="e.g. Dog, Cat, Horse, Osprey"
            className="w-full px-4 py-3 bg-pink-900/40 border border-pink-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-pink-300/70 font-bold text-sm transition-all focus:bg-pink-900/80 text-white"
            required
          />
          {/* Presets */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESET_ANIMAL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                id={`preset-type-${type}`}
                onClick={() => setAnimalType(type)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  animalType.toLowerCase() === type.toLowerCase()
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-pink-900/50 text-pink-200 hover:bg-pink-900'
                }`}
              >
                + {type}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <label id="lbl-severity" className="block text-sm font-black text-pink-100 mb-2">
            Urgency / Severity Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['stable', 'moderate', 'critical'] as Severity[]).map((level) => {
              const styles = {
                stable: {
                  bg: 'bg-pink-900/30 border-pink-700 text-pink-200 hover:bg-pink-900/50',
                  active: 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                },
                moderate: {
                  bg: 'bg-pink-900/30 border-pink-700 text-pink-200 hover:bg-pink-900/50',
                  active: 'bg-amber-600 border-amber-500 text-white shadow-md'
                },
                critical: {
                  bg: 'bg-pink-900/30 border-pink-700 text-pink-200 hover:bg-pink-900/50',
                  active: 'bg-rose-600 border-rose-500 text-white shadow-md animate-pulse'
                }
              }[level];

              return (
                <button
                  key={level}
                  type="button"
                  id={`btn-severity-${level}`}
                  onClick={() => setSeverity(level)}
                  className={`py-2 px-3 text-xs font-black rounded-xl border text-center transition-all capitalize select-none ${
                    severity === level ? styles.active : styles.bg
                  }`}
                >
                  {level === 'critical' ? '🚨 ' : level === 'moderate' ? '⚠️ ' : '✅ '}
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Problem Description */}
        <div>
          <label id="lbl-problem" className="block text-sm font-black text-pink-100 mb-2">
            Injury & Problem Details <span className="text-pink-300 font-bold">*</span>
          </label>
          <textarea
            id="input-problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Specify wounds, limping behavior, traps, dehydration levels..."
            className="w-full px-4 py-3 bg-pink-900/40 border border-pink-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-pink-300/70 font-bold text-sm transition-all focus:bg-pink-900/80 text-white resize-none h-24"
            required
          />
        </div>

        {/* Image Upload Area */}
        <div>
          <label id="lbl-image" className="block text-sm font-black text-pink-100 mb-2">
            Upload Animal Photo <span className="text-pink-300 font-bold">*</span>
          </label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!imagePreview ? (
            <div
              id="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-400 bg-pink-900/60 scale-[0.99]'
                  : 'border-pink-600 hover:border-pink-500 bg-pink-900/35'
              }`}
            >
              <Upload className="w-8 h-8 text-pink-300 mx-auto mb-2" />
              <p className="text-xs font-black text-pink-100">Drag & drop photo here or click to browse</p>
              <p className="text-[10px] text-pink-300 mt-1 font-semibold">JPEG, PNG, HEIC up to 8MB</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-pink-700 bg-pink-900 group">
              <img
                src={imagePreview}
                alt="Upload Preview"
                className="w-full h-36 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  id="btn-remove-image"
                  onClick={() => setImagePreview(null)}
                  className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-transform transform hover:scale-110 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white rounded-md">
                Photo Captured Successfully
              </div>
            </div>
          )}
        </div>

        {/* Location Spotter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label id="lbl-location" className="block text-sm font-black text-pink-100">
              Precise Location / Landmark <span className="text-pink-300 font-bold">*</span>
            </label>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-300">
              <MapPin className="w-4 h-4" />
            </span>
            <input
              id="input-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Address, intersection, or GPS coordinates..."
              className="w-full pl-10 pr-4 py-3 bg-pink-900/40 border border-pink-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-pink-300/70 font-bold text-sm transition-all focus:bg-pink-900/80 text-white"
              required
            />
          </div>
          {/* Presets */}
          <div className="mt-2 flex flex-wrap gap-1">
            {PRESET_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                id={`preset-loc-${loc.slice(0, 10)}`}
                onClick={() => setLocation(loc)}
                className="px-2 py-0.5 text-[10px] bg-pink-900/50 hover:bg-pink-900 text-pink-200 font-extrabold rounded-md transition-all truncate max-w-[140px]"
              >
                📍 {loc.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <label id="lbl-contact" className="block text-sm font-black text-pink-100 mb-2">
            Reporter Live Contact Info <span className="text-pink-300 font-bold">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-300">
              <Phone className="w-4 h-4" />
            </span>
            <input
              id="input-contact"
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. +1 (555) 000-0000"
              className="w-full pl-10 pr-4 py-3 bg-pink-900/40 border border-pink-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-pink-300/70 font-bold text-sm transition-all focus:bg-pink-900/80 text-white"
              required
            />
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          id="btn-submit-report"
          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/10 transition-transform active:scale-95 hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base border-0"
        >
          <Sparkles className="w-5 h-5" />
          Submit Animal Report
        </button>
      </form>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from '../../shared/components/Layout';
import { Subject, Attendance } from '../../core/types';
import { storage } from '../../services/storage';
import { Info, X, Settings2 } from 'lucide-react';

export default function AttendanceScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const s = storage.get<Subject[]>('SUBJECTS', []);
    const a = storage.get<Attendance[]>('ATTENDANCE', []);
    setSubjects(s);
    setAttendance(a);
    
    // Initialize attendance for new subjects
    if (s.length > 0) {
      const missing = s.filter(sub => !a.find(att => att.subjectId === sub.id));
      if (missing.length > 0) {
        const newAtt = [
          ...a, 
          ...missing.map(m => ({ 
            id: Math.random().toString(36).substring(2, 9),
            subjectId: m.id, 
            totalClasses: 0, 
            attendedClasses: 0 
          }))
        ];
        setAttendance(newAtt);
        storage.set('ATTENDANCE', newAtt);
      }
    }
  }, []);

  const updateAttendance = (subjectId: string, type: 'present' | 'absent') => {
    const updated = attendance.map(a => {
      if (a.subjectId === subjectId) {
        return {
          ...a,
          totalClasses: a.totalClasses + 1,
          attendedClasses: type === 'present' ? a.attendedClasses + 1 : a.attendedClasses
        };
      }
      return a;
    });
    setAttendance(updated);
    storage.set('ATTENDANCE', updated);
  };

  const toggleTracking = (subjectId: string) => {
    const updated = subjects.map(s => s.id === subjectId ? { ...s, isTracked: !s.isTracked } : s);
    setSubjects(updated);
    storage.set('SUBJECTS', updated);
  };

  const calculatePercent = (att: Attendance) => {
    if (att.totalClasses === 0) return 0;
    return Math.round((att.attendedClasses / att.totalClasses) * 100);
  };

  const trackedSubjects = subjects.filter(s => s.isTracked !== false);

  return (
    <Layout 
      title="Attendance" 
      showBackButton
      onAdd={() => setShowSettings(true)}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="bg-indigo-50 px-4 py-2 rounded-2xl flex items-center gap-2 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
          <Info size={14} />
          Min 75% Required
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
        >
          <Settings2 size={16} />
          Settings
        </button>
      </div>

      {trackedSubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p>No subjects selected for tracking.</p>
          <button 
            onClick={() => setShowSettings(true)}
            className="mt-4 text-indigo-600 font-bold"
          >
            Configure Tracking
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trackedSubjects.map(s => {
            const att = attendance.find(a => a.subjectId === s.id) || { totalClasses: 0, attendedClasses: 0, subjectId: s.id };
            const percent = calculatePercent(att);
            const isLow = percent < 75 && att.totalClasses > 0;

            return (
              <div key={s.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{s.name}</h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-1">
                      {att.attendedClasses} / {att.totalClasses} classes attended
                    </p>
                  </div>
                  <div className={`font-bold text-sm ${isLow ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {percent}%
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                  <div 
                    className={`h-full transition-all duration-700 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {isLow && (
                  <div className="mt-2 bg-rose-50 p-2 rounded-xl mb-4 border border-rose-100/50">
                    <p className="text-[10px] text-rose-600 font-bold text-center">⚠️ Warning: Attendance below 75%</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => updateAttendance(s.id, 'present')}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold py-3 rounded-2xl transition-all uppercase tracking-widest"
                  >
                    MARK PRESENT
                  </button>
                  <button 
                    onClick={() => updateAttendance(s.id, 'absent')}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 text-[10px] font-bold py-3 rounded-2xl transition-all uppercase tracking-widest"
                  >
                    ABSENT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Track Attendance</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {subjects.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-sm italic">Add subjects in Timetable first</p>
              ) : (
                subjects.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => toggleTracking(s.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      s.isTracked !== false ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <span className={`text-sm font-bold ${s.isTracked !== false ? 'text-indigo-700' : 'text-slate-500'}`}>
                      {s.name}
                    </span>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${s.isTracked !== false ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${s.isTracked !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 mt-6 active:scale-95 transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

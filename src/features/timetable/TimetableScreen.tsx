/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../shared/components/Layout';
import SubjectCard from '../../shared/components/SubjectCard';
import { Subject, Attendance } from '../../core/types';
import { storage } from '../../services/storage';
import { X, Sparkles, Loader2, Upload, Clock, MapPin } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function TimetableScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [reviewSubjects, setReviewSubjects] = useState<Subject[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newName, setNewName] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newDay, setNewDay] = useState('Monday');
  const [newRoom, setNewRoom] = useState('');
  const [newTeacher, setNewTeacher] = useState('');
  const [newPeriod, setNewPeriod] = useState('');

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  useEffect(() => {
    setSubjects(storage.get('SUBJECTS', []));
  }, []);

  const handleAdd = () => {
    if (!newName) return;
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      startTime: newStartTime,
      endTime: newEndTime,
      room: newRoom,
      teacher: newTeacher,
      period: newPeriod,
      day: newDay,
      isTracked: true, // Default to tracked
    };
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    storage.set('SUBJECTS', updated);
    setShowAdd(false);
    setNewName('');
    setNewStartTime('');
    setNewEndTime('');
    setNewRoom('');
    setNewTeacher('');
    setNewPeriod('');
    setNewDay('Monday');
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    storage.set('SUBJECTS', updated);
    
    // Also cleanup attendance
    const att = storage.get<Attendance[]>('ATTENDANCE', []);
    storage.set('ATTENDANCE', att.filter(a => a.subjectId !== id));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Data,
                },
              },
              {
                text: "Extract the college timetable from this image. Return a list of subjects with their names, start times, end times, day of the week, and room/location if mentioned. Only extract clearly visible information.",
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The name of the subject" },
                startTime: { type: Type.STRING, description: "The start time (e.g. 10:00 AM)" },
                endTime: { type: Type.STRING, description: "The end time (e.g. 11:00 AM)" },
                day: { type: Type.STRING, description: "The day of week (e.g. Monday)" },
                room: { type: Type.STRING, description: "The room or location (e.g. Room 302)" },
                teacher: { type: Type.STRING, description: "The name of the teacher/professor" },
                period: { type: Type.STRING, description: "The period number (e.g. 1st, 2nd)" },
              },
              required: ["name"],
            },
          },
        },
      });

      const detectedSubjectsRaw = JSON.parse(response.text);
      const newSubjects: Subject[] = detectedSubjectsRaw.map((s: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: s.name,
        startTime: s.startTime || '',
        endTime: s.endTime || '',
        room: s.room || '',
        teacher: s.teacher || '',
        period: s.period || '',
        day: s.day || 'Monday',
        isTracked: true,
      }));

      if (newSubjects.length > 0) {
        setReviewSubjects(newSubjects);
      }
    } catch (error) {
      console.error("AI Scan failed:", error);
      alert("Failed to scan timetable. Please try again or add manually.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDetectedSubjects = () => {
    if (!reviewSubjects) return;
    const updated = [...subjects, ...reviewSubjects];
    setSubjects(updated);
    storage.set('SUBJECTS', updated);
    setReviewSubjects(null);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Layout 
      title="Timetable" 
      showBackButton 
      onAdd={() => setShowAdd(true)}
    >
      <div className="mb-6 flex gap-2 bg-slate-100/50 p-1 rounded-2xl w-fit mx-auto">
        <button 
          onClick={() => setViewMode('grid')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
        >
          Grid View
        </button>
        <button 
          onClick={() => setViewMode('list')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
        >
          Day List
        </button>
      </div>

      <div className="mb-8 flex gap-3">
        <button 
          onClick={() => setShowAdd(true)}
          className="flex-1 bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex items-center justify-center gap-2 text-slate-700 font-bold active:scale-95 transition-all text-sm"
        >
          <X className="rotate-45 text-indigo-600" size={18} strokeWidth={3} />
          Manual Add
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex-1 bg-indigo-50 border border-indigo-100 p-5 rounded-[28px] shadow-sm flex items-center justify-center gap-2 text-indigo-700 font-bold active:scale-95 transition-all text-sm disabled:opacity-50"
        >
          {isScanning ? <Loader2 className="animate-spin" size={18} strokeWidth={3} /> : <Sparkles className="text-indigo-600" size={18} strokeWidth={2.5} />}
          {isScanning ? 'Scanning...' : 'AI Scan Pic'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>

      {subjects.length === 0 && !isScanning ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
             <Upload size={32} />
          </div>
          <p className="font-bold text-slate-500 text-lg tracking-tight">Empty Schedule</p>
          <p className="text-xs mt-1 font-medium opacity-70">Upload a photo to populate your classes!</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="overflow-x-auto pb-10 -mx-4 px-4 custom-scrollbar">
          <div className="min-w-[600px] border-2 border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-xl shadow-slate-100/50">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-r border-slate-100">Day / Period</th>
                  {['I', 'II', 'III', 'IV', 'V', 'VI'].map(p => (
                    <th key={p} className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center border-r border-slate-100 last:border-r-0">
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <tr key={day} className="border-b border-slate-50 last:border-0 group hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 text-xs font-black text-slate-800 bg-slate-50/50 border-r border-slate-100 group-hover:bg-indigo-50/50">
                      {day}
                    </td>
                    {['I', 'II', 'III', 'IV', 'V', 'VI'].map(p => {
                      const subject = subjects.find(s => s.day === day && (s.period === p || (s.period?.includes('-') && s.period?.split('-')[0] <= p && s.period?.split('-')[1] >= p)));
                      return (
                        <td key={p} className="p-2 border-r border-slate-50 last:border-r-0 min-h-[80px]">
                          {subject ? (
                            <div className="h-full bg-white border border-indigo-100 p-2.5 rounded-xl shadow-sm flex flex-col justify-center">
                              <p className="text-[11px] font-black text-indigo-700 leading-tight mb-1">{subject.name}</p>
                              <div className="flex items-center gap-1 opacity-60">
                                <MapPin size={8} className="text-slate-400" />
                                <span className="text-[8px] font-bold text-slate-500">{subject.room}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-2 w-full bg-slate-50/50 rounded-full" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Scroll horizontally to see all periods →
          </p>
        </div>
      ) : (
        <div className="space-y-8 pb-10">
          {days.map(day => {
            const daySubjects = subjects.filter(s => s.day === day);
            if (daySubjects.length === 0) return null;
            return (
              <div key={day} className="animate-in fade-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-3 mb-4 ml-1">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{day}</h3>
                  <div className="h-[1px] flex-1 bg-slate-100"></div>
                  <span className="text-[10px] font-bold text-slate-400">{daySubjects.length} Periods</span>
                </div>
                <div className="space-y-2">
                  {daySubjects.sort((a, b) => {
                    const timeA = a.startTime ? a.startTime.match(/(\d+)/)?.[0] || '0' : '0';
                    const timeB = b.startTime ? b.startTime.match(/(\d+)/)?.[0] || '0' : '0';
                    return parseInt(timeA) - parseInt(timeB);
                  }).map(s => (
                    <SubjectCard 
                      key={s.id} 
                      subject={s} 
                      onDelete={() => deleteSubject(s.id)} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">New Subject</h2>
              <button 
                onClick={() => setShowAdd(false)} 
                className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pt-1 pr-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Period No.</label>
                  <input 
                    type="text" 
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    placeholder="e.g. 1st"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Day</label>
                  <select 
                    value={newDay}
                    onChange={e => setNewDay(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none appearance-none transition-all"
                  >
                    {days.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Subject Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g. Mathematics"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Teacher / Prof</label>
                <input 
                  type="text" 
                  value={newTeacher}
                  onChange={e => setNewTeacher(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g. Dr. Smith"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Room / Location</label>
                <input 
                  type="text" 
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g. Room 302"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Start Time</label>
                  <input 
                    type="text" 
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    placeholder="10:00 AM"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">End Time</label>
                  <input 
                    type="text" 
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    placeholder="11:00 AM"
                  />
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 mt-4 active:scale-95 transition-all"
              >
                Save Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Scan Review Modal */}
      {reviewSubjects && (
        <div className="fixed inset-0 bg-black/60 z-[160] flex items-end sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 m-auto shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Review Schedule</h2>
            <p className="text-slate-500 text-xs mb-8 font-medium italic">We've extracted these periods. Verify and edit if needed.</p>
            
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 mb-8 custom-scrollbar">
              {reviewSubjects.map((rs, index) => (
                <div key={index} className="p-6 bg-slate-50 rounded-[32px] relative border-2 border-slate-100 space-y-4">
                   <button 
                    onClick={() => {
                      setReviewSubjects(reviewSubjects.filter((_, i) => i !== index));
                    }}
                    className="absolute top-4 right-4 p-2 bg-white text-slate-300 hover:text-rose-500 rounded-full shadow-sm transition-all"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-1/3">
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Period</label>
                        <input 
                          className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                          value={rs.period}
                          placeholder="1st"
                          onChange={e => {
                            const updated = [...reviewSubjects];
                            updated[index].period = e.target.value;
                            setReviewSubjects(updated);
                          }}
                        />
                      </div>
                      <div className="w-2/3">
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Subject Name</label>
                        <input 
                          className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                          value={rs.name}
                          onChange={e => {
                            const updated = [...reviewSubjects];
                            updated[index].name = e.target.value;
                            setReviewSubjects(updated);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Day</label>
                        <select 
                          className="w-full bg-white border border-slate-100 rounded-lg p-2 text-[10px] font-bold text-slate-600 outline-none appearance-none focus:border-indigo-500"
                          value={rs.day}
                          onChange={e => {
                            const updated = [...reviewSubjects];
                            updated[index].day = e.target.value;
                            setReviewSubjects(updated);
                          }}
                        >
                          {days.map(d => <option key={d} value={d}>{d.slice(0,3)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Start</label>
                        <input 
                          className="w-full bg-white border border-slate-100 rounded-lg p-2 text-[10px] font-bold text-slate-600 outline-none focus:border-indigo-500"
                          value={rs.startTime}
                          placeholder="Time"
                          onChange={e => {
                            const updated = [...reviewSubjects];
                            updated[index].startTime = e.target.value;
                            setReviewSubjects(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">End</label>
                        <input 
                          className="w-full bg-white border border-slate-100 rounded-lg p-2 text-[10px] font-bold text-slate-600 outline-none focus:border-indigo-500"
                          value={rs.endTime}
                          placeholder="Time"
                          onChange={e => {
                            const updated = [...reviewSubjects];
                            updated[index].endTime = e.target.value;
                            setReviewSubjects(updated);
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                       <div className="flex-1">
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Teacher</label>
                        <input 
                          className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                          value={rs.teacher}
                          placeholder="Dr. Name"
                          onChange={e => {
                            const updated = [...reviewSubjects];
                            updated[index].teacher = e.target.value;
                            setReviewSubjects(updated);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Room</label>
                        <input 
                          className="w-full bg-white border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                          value={rs.room}
                          placeholder="301"
                          onChange={e => {
                            const updated = [...reviewSubjects];
                            updated[index].room = e.target.value;
                            setReviewSubjects(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setReviewSubjects(null)}
                className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDetectedSubjects}
                className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              >
                Confirm All
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

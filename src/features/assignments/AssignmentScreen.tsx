/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from '../../shared/components/Layout';
import AssignmentCard from '../../shared/components/AssignmentCard';
import { Assignment, Subject } from '../../core/types';
import { storage } from '../../services/storage';
import { X, Calendar } from 'lucide-react';

export default function AssignmentScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setAssignments(storage.get('ASSIGNMENTS', []));
    setSubjects(storage.get('SUBJECTS', []));
  }, []);

  const handleAdd = () => {
    if (!title || !subjectId || !deadline) return;
    const newAssignment: Assignment = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      subjectId,
      deadline,
      isCompleted: false
    };
    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    storage.set('ASSIGNMENTS', updated);
    setShowAdd(false);
    setTitle('');
    setSubjectId('');
  };

  const toggleComplete = (id: string) => {
    const updated = assignments.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a);
    setAssignments(updated);
    storage.set('ASSIGNMENTS', updated);
  };

  return (
    <Layout title="Assignments" showBackButton onAdd={() => setShowAdd(true)}>
      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p>No assignments yet.</p>
          <button 
            onClick={() => setShowAdd(true)}
            className="mt-4 text-indigo-600 font-bold"
          >
            + Add First Assignment
          </button>
        </div>
      ) : (
        assignments
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          .map(a => (
            <AssignmentCard 
              key={a.id} 
              assignment={a} 
              subjectName={subjects.find(s => s.id === a.subjectId)?.name || 'Unknown'} 
              onToggle={() => toggleComplete(a.id)}
            />
          ))
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">New Assignment</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Final Project Report"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject</label>
                <select 
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Deadline Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={handleAdd}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 mt-4 active:scale-95 transition-transform"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

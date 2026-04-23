/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../shared/components/Layout';
import { Note, Subject } from '../../core/types';
import { storage } from '../../services/storage';
import { X, Trash2, FileText, Paperclip, Image as ImageIcon, Upload, GraduationCap } from 'lucide-react';

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNotes(storage.get('NOTES', []));
    setSubjects(storage.get('SUBJECTS', []));
  }, []);

  const handleAdd = () => {
    if (!title || !description) return;
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      subjectId: selectedSubjectId || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    storage.set('NOTES', updated);
    resetForm();
  };

  const resetForm = () => {
    setShowAdd(false);
    setTitle('');
    setDescription('');
    setSelectedSubjectId('');
    setAttachments([]);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    storage.set('NOTES', updated);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: string[] = [...attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newAttachments.push(base64);
    }

    setAttachments(newAttachments);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getSubjectName = (id?: string) => {
    if (!id) return null;
    return subjects.find(s => s.id === id)?.name;
  };

  return (
    <Layout title="Notes" showBackButton onAdd={() => setShowAdd(true)}>
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p>No notes written yet.</p>
          <button 
            onClick={() => setShowAdd(true)}
            className="mt-4 text-indigo-600 font-bold"
          >
            + Create First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notes.map(n => (
            <div key={n.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col group relative">
              <div className="flex justify-between items-start mb-1 pr-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-tight">{n.title}</h3>
                  {n.subjectId && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] bg-indigo-50 text-indigo-600 w-fit px-2 py-0.5 rounded-full font-bold uppercase">
                      <GraduationCap size={10} />
                      <span>{getSubjectName(n.subjectId)}</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => deleteNote(n.id)}
                  className="absolute top-5 right-5 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-slate-600 text-[13px] mt-2 leading-relaxed whitespace-pre-wrap">{n.description}</p>
              
              {n.attachments && n.attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {n.attachments.map((att, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                      {att.startsWith('data:image') ? (
                        <img src={att} alt="attachment" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <FileText size={20} className="text-slate-300" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <FileText size={12} />
                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-6 pb-2 border-b border-slate-50">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">New Note</h2>
              <button 
                onClick={resetForm} 
                className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-5 custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Subject (Optional)</label>
                <select 
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none appearance-none transition-all"
                >
                  <option value="">General / None</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g. Physics Formulas"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Content</label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none"
                  placeholder="Type your notes here..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Attachments</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((att, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-2xl overflow-hidden group border-2 border-slate-100">
                      {att.startsWith('data:image') ? (
                        <img src={att} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-white flex items-center justify-center">
                          <FileText size={24} className="text-slate-300" />
                        </div>
                      )}
                      <button 
                        onClick={() => removeAttachment(index)}
                        className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 shadow-lg transform scale-90"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    <Upload size={24} />
                    <span className="text-[10px] mt-1 font-bold">ADD</span>
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  onChange={handleFileChange} 
                />
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="p-6 pt-2 border-t border-slate-50">
              <button 
                onClick={handleAdd}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

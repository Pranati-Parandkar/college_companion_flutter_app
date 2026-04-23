/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Calendar as CalendarIcon, Trash2, MapPin, User, Hash } from 'lucide-react';
import { Subject } from '../../core/types';

interface SubjectCardProps {
  subject: Subject;
  onClick?: () => void;
  onDelete?: () => void;
  key?: React.Key;
}

export default function SubjectCard({ subject, onClick, onDelete }: SubjectCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-4 active:scale-[0.98] transition-all cursor-pointer relative group overflow-hidden"
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>

      <div className="flex justify-between items-start pl-2 pr-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
             {subject.period && (
               <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg uppercase tracking-tighter">
                 Period {subject.period}
               </span>
             )}
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               {subject.day}
             </span>
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{subject.name}</h3>
          {subject.teacher && (
            <div className="flex items-center gap-1.5 mt-1 text-slate-500">
              <User size={12} strokeWidth={2.5} />
              <span className="text-xs font-bold">{subject.teacher}</span>
            </div>
          )}
        </div>
        
        {onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-5 right-5 p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 pl-2">
        {(subject.startTime || subject.endTime) && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500">
              <Clock size={16} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timeline</p>
              <p className="text-xs font-bold text-slate-700">{subject.startTime || '--:--'} - {subject.endTime || '--:--'}</p>
            </div>
          </div>
        )}
        {subject.room && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500">
              <MapPin size={16} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p>
              <p className="text-xs font-bold text-slate-700">{subject.room}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

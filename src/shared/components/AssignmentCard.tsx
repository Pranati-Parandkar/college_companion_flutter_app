/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Assignment } from '../../core/types';
import { isPast, parseISO, format } from 'date-fns';

interface AssignmentCardProps {
  assignment: Assignment;
  subjectName: string;
  onToggle?: () => void;
  key?: React.Key;
}

export default function AssignmentCard({ assignment, subjectName, onToggle }: AssignmentCardProps) {
  const isOverdue = !assignment.isCompleted && isPast(parseISO(assignment.deadline));
  const deadlineDate = parseISO(assignment.deadline);

  return (
    <div className={`p-5 rounded-3xl shadow-sm border mb-4 transition-colors ${
      assignment.isCompleted ? 'bg-slate-50 border-slate-200' : 
      isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-sm font-bold ${assignment.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {assignment.title}
          </h3>
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-1">{subjectName}</p>
        </div>
        <button onClick={onToggle} className={`p-2 rounded-full ${assignment.isCompleted ? 'text-emerald-500' : 'text-slate-300'}`}>
          {assignment.isCompleted ? <CheckCircle2 size={24} /> : <div className="w-6 h-6 border-2 border-slate-200 rounded-full" />}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Calendar size={16} />
          <span>Due: {format(deadlineDate, 'MMM dd, yyyy')}</span>
        </div>
        {!assignment.isCompleted && isOverdue && (
          <div className="flex items-center gap-1 text-rose-50 text-xs bg-rose-500 px-2 py-0.5 rounded-full">
            <AlertCircle size={12} />
            <span>Overdue</span>
          </div>
        )}
      </div>
    </div>
  );
}

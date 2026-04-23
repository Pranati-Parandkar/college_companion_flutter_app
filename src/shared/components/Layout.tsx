/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  showBackButton?: boolean;
}

export default function Layout({ title, children, onAdd, showBackButton = false }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)]">
      {/* AppBar */}
      <header className="bg-white border-b border-slate-100 p-4 shrink-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton ? (
            <button onClick={() => navigate(-1)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
          ) : (
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">CC</div>
          )}
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
        </div>
        {onAdd && (
          <button 
            onClick={onAdd}
            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
          >
            <Plus size={20} />
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="p-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

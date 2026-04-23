/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckSquare, ClipboardList, BookText, User, LogOut, LogIn, X, Loader2, Clock, MapPin } from 'lucide-react';
import Layout from '../../shared/components/Layout';
import { storage } from '../../services/storage';
import { StudentInfo, Subject } from '../../core/types';
import { DEFAULT_STUDENT, INITIAL_TIMETABLE } from '../../core/constants/academic_data';
import { useAuth } from '../../core/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user, loginWithGoogle, signupWithEmail, loginWithEmail, logout } = useAuth();
  const [student, setStudent] = useState<StudentInfo>(DEFAULT_STUDENT);
  const [nextSubject, setNextSubject] = useState<Subject | null>(null);
  const [minsUntil, setMinsUntil] = useState<number | null>(null);
  
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Seed data if empty
    const savedStudent = storage.get('STUDENT', null);
    if (!savedStudent) {
      storage.set('STUDENT', DEFAULT_STUDENT);
    } else {
      setStudent(savedStudent);
    }

    const savedSubjects = storage.get<Subject[]>('SUBJECTS', []);
    const subjects = savedSubjects.length > 0 ? savedSubjects : INITIAL_TIMETABLE;
    if (savedSubjects.length === 0) {
      storage.set('SUBJECTS', INITIAL_TIMETABLE);
    }

    // Sync from Firestore if available
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const updatedStudent = { 
            ...DEFAULT_STUDENT, 
            name: data.name, 
            studentId: data.studentId 
          };
          setStudent(updatedStudent);
          storage.set('STUDENT', updatedStudent);
        }
      }
    };
    fetchUserData();

    const updateNextSubject = () => {
      // Get IST Time
      const now = new Date();
      const istDate = new Intl.DateTimeFormat('en-US', { 
        timeZone: "Asia/Kolkata", 
        year: 'numeric', month: 'numeric', day: 'numeric', 
        hour: 'numeric', minute: 'numeric', hour12: false 
      }).format(now);
      
      const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: "Asia/Kolkata" }).format(now);
      
      // Manual parse because new Date(istDate) can be finicky in some envs
      const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const currentTimeScale = istTime.getHours() * 60 + istTime.getMinutes();

      const parseTime = (timeStr?: string) => {
        if (!timeStr) return -1;
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return -1;
        let [_, hours, minutes, period] = match;
        let h = parseInt(hours);
        let m = parseInt(minutes);
        if (period.toUpperCase() === 'PM' && h < 12) h += 12;
        if (period.toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + m;
      };

      const todaySubjects = subjects.filter(s => s.day === currentDay);
      const future = todaySubjects
        .filter(s => parseTime(s.startTime) > currentTimeScale)
        .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

      const next = future[0] || null;
      setNextSubject(next);

      if (next) {
        const diff = parseTime(next.startTime) - currentTimeScale;
        setMinsUntil(diff);
      } else {
        setMinsUntil(null);
      }
    };

    updateNextSubject();
    const interval = setInterval(updateNextSubject, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleAuth = async () => {
    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, name, rollNo);
      }
      setShowAuthModal(false);
    } catch (error: any) {
      alert(error.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = [
    { title: 'Timetable', icon: <Calendar size={24} />, path: '/timetable', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { title: 'Attendance', icon: <ClipboardList size={24} />, path: '/attendance', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { title: 'Assignments', icon: <CheckSquare size={24} />, path: '/assignments', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
    { title: 'Notes', icon: <BookText size={24} />, path: '/notes', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  ];

  return (
    <Layout title="College Companion">
      <div className="bg-indigo-600 mb-8 px-6 py-8 text-white rounded-[40px] shadow-xl shadow-indigo-200/50 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-400 rounded-full flex items-center justify-center text-xl font-bold border-2 border-indigo-300">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold truncate max-w-[180px]">{student.name}</h2>
              <div className="flex flex-col gap-0.5">
                <p className="text-indigo-100/80 text-[10px] font-bold uppercase tracking-widest">{student.studentId || 'Not Set'}</p>
                {student.branch && (
                  <p className="text-white text-xs font-black uppercase tracking-tight">
                    {student.branch} • {student.semester}
                  </p>
                )}
                {student.academicYear && (
                  <p className="text-indigo-200/60 text-[9px] font-bold uppercase tracking-widest">
                    AY {student.academicYear} • {student.semesterType} Semester
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {!user ? (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-white/10 hover:bg-white/20 p-2 px-3 rounded-xl transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                <LogIn size={14} />
                Access App
              </button>
            ) : (
              <button 
                onClick={logout}
                className="bg-rose-500/20 hover:bg-rose-500/30 p-2 px-3 rounded-xl transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                <LogOut size={14} />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {authMode === 'login' ? 'Welcome Back' : 'Join Companion'}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-2">
                <button 
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${authMode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Signup
                </button>
              </div>

              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Roll Number</label>
                    <input 
                      type="text" 
                      value={rollNo}
                      onChange={e => setRollNo(e.target.value)}
                      placeholder="e.g. 2024-0812"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <button 
                onClick={handleAuth}
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 mt-6 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center px-4"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-bold text-slate-300 bg-white px-2">Or continue with</div>
              </div>

              <button 
                onClick={loginWithGoogle}
                className="w-full bg-white border-2 border-slate-100 text-slate-700 font-black py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" referrerPolicy="no-referrer" />
                Google Account
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Academic Hub</p>
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 active:scale-95 transition-all flex flex-col items-center justify-center gap-3 text-slate-700 font-bold hover:bg-slate-50"
            >
              <div className={`w-12 h-12 ${item.iconBg} ${item.iconColor} rounded-2xl flex items-center justify-center shadow-inner`}>
                {item.icon}
              </div>
              <span className="text-sm">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Up Next</p>
            {minsUntil !== null && minsUntil <= 60 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black animate-pulse">
                <div className="w-1.5 h-1.5 bg-rose-600 rounded-full"></div>
                STARTING IN {minsUntil} MINS
              </span>
            )}
          </div>
          
          {nextSubject ? (
            <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">{nextSubject.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                      {nextSubject.day}
                    </span>
                  </div>
                </div>
                {minsUntil !== null && minsUntil > 60 && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In about</p>
                    <p className="text-sm font-black text-slate-600">{Math.floor(minsUntil / 60)}h {minsUntil % 60}m</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                    <p className="text-xs font-bold text-slate-700">{nextSubject.startTime} - {nextSubject.endTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                    <p className="text-xs font-bold text-slate-700">{nextSubject.room || 'TBA'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[32px] flex flex-col items-center text-center">
              <p className="text-sm font-bold text-slate-500">No more classes today</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">You're all done for the day!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

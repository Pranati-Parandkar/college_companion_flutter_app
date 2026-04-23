import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './features/home/HomeScreen';
import TimetableScreen from './features/timetable/TimetableScreen';
import AttendanceScreen from './features/attendance/AttendanceScreen';
import AssignmentScreen from './features/assignments/AssignmentScreen';
import NotesScreen from './features/notes/NotesScreen';
import { AuthProvider } from './core/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-slate-50 min-h-screen max-w-md mx-auto shadow-2xl overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/timetable" element={<TimetableScreen />} />
            <Route path="/attendance" element={<AttendanceScreen />} />
            <Route path="/assignments" element={<AssignmentScreen />} />
            <Route path="/notes" element={<NotesScreen />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}


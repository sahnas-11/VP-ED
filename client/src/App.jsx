import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { CalendarView } from './pages/CalendarView';
import { TermOverview } from './pages/TermOverview';
import { MembersList } from './pages/MembersList';
import { CCTracker } from './pages/CCTracker';
import { CLTracker } from './pages/CLTracker';
import { BackupPoolPage } from './pages/BackupPoolPage';
import { MentorMenteePage } from './pages/MentorMenteePage';
import { MeetingPlannerPage } from './pages/MeetingPlannerPage';
import { ReliabilityPage } from './pages/ReliabilityPage';
import { RoleGuidesPage } from './pages/RoleGuidesPage';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9FB]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pastel-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FB] dark:bg-darkpink-bg transition-colors">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/term-overview" element={<TermOverview />} />
            <Route path="/members" element={<MembersList />} />
            <Route path="/cc-tracker" element={<CCTracker />} />
            <Route path="/cl-tracker" element={<CLTracker />} />
            <Route path="/backup-pool" element={<BackupPoolPage />} />
            <Route path="/mentors" element={<MentorMenteePage />} />
            <Route path="/meeting-planner" element={<MeetingPlannerPage />} />
            <Route path="/reliability" element={<ReliabilityPage />} />
            <Route path="/guides" element={<RoleGuidesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

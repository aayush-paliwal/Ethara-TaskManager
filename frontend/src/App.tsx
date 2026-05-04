import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';

import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import MyTasks from '@/pages/MyTasks';
import Projects from '@/pages/Projects';
import Dashboard from '@/pages/Dashboard';
import KanbanBoard from '@/pages/KanbanBoard';

import { Toaster } from '@/components/ui/sonner';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const isLoading = useAuthStore(state => state.isLoading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="ethara-theme">
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<KanbanBoard />} />
            <Route path="tasks" element={<MyTasks />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="bottom-right" richColors />
      <ModeToggle />
    </ThemeProvider>
  );
}

export default App;

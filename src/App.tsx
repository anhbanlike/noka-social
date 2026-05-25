import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Authentication Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';

// Workspace / Panel Pages
import Dashboard from './pages/Dashboard';
import Platforms from './pages/Platforms';
import Passwords from './pages/Passwords';
import Account from './pages/Account';
import Telegram from './pages/Telegram';
import Admin from './pages/Admin';
import { AdminGuard } from './components/layout/AdminGuard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Sonner overlay toasts with customizable light/dark themes */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            backdropFilter: 'blur(16px)',
          },
        }}
        id="noka-sonner-layer"
      />

      <Routes>
        {/* Core authentication routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Panel layouts wrapping children */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/platforms" element={<Platforms />} />
        <Route path="/passwords" element={<Passwords />} />
        <Route path="/account" element={<Account />} />
        <Route path="/telegram" element={<Telegram />} />
        <Route 
          path="/admin" 
          element={
            <AdminGuard>
              <Admin />
            </AdminGuard>
          } 
        />

        {/* Default catch-all pathway redirects */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

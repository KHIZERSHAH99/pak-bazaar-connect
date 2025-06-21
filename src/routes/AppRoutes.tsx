
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import AlibabaInspiredHome from '@/components/home/AlibabaInspiredHome';
import FixedLoginForm from '@/components/auth/FixedLoginForm';
import FixedSignupForm from '@/components/auth/FixedSignupForm';
import Dashboard from '@/pages/Dashboard';
import FixedAdminDashboard from '@/components/admin/FixedAdminDashboard';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<AlibabaInspiredHome />} />
      <Route path="/login" element={<FixedLoginForm />} />
      <Route path="/signup" element={<FixedSignupForm />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/dashboard/admin" element={<Layout><FixedAdminDashboard /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      
      {/* Dashboard Sub-routes */}
      <Route path="/dashboard/*" element={<Layout><Dashboard /></Layout>} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

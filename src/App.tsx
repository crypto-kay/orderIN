import { motion } from 'framer-motion';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintsPage from './pages/ComplaintsPage';
import KDSPage from './pages/KDSPage';
import LoginPage from './pages/LoginPage';
import MenuManagement from './pages/MenuManagement';
import OrdersManagement from './pages/OrdersManagement';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { useAuthStore } from './stores/authStore';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/*" element={<LoginPage />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-background"
      >
        <MainLayout>
          <Routes>
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/menu" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <MenuManagement />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <OrdersManagement />
                </ProtectedRoute>
              } />
              <Route path="/kitchen" element={
                <ProtectedRoute allowedRoles={['kitchen']}>
                  <KDSPage />
                </ProtectedRoute>
              } />
              <Route path="/complaints" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <ComplaintsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/" element={
                <main className="p-6">
                  <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {/* Dashboard widgets will go here */}
                      <div className="col-span-full">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                          <h2 className="mb-4 text-xl font-semibold">
                            Welcome to Café Management
                          </h2>
                          <p className="text-gray-600">
                            This is your dashboard. Select a module from the sidebar to get started.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              } />
            </Routes>
        </MainLayout>
      </motion.div>
    </Router>
  );
};

export default App;

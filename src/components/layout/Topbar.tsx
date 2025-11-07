import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import RoleSwitcher from '../dev/RoleSwitcher';

const Topbar: React.FC = () => {
  const { user } = useAuthStore();

  // Only render in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <header className="border-b border-secondary-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-slab text-secondary-900">
          OrderIN
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-secondary-600">
            Welcome, {user?.username}
          </span>
          <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800">
            {user?.role}
          </span>
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
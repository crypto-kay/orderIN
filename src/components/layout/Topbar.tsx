import { Menu } from 'lucide-react';
import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import RoleSwitcher from '../dev/RoleSwitcher';

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore();

  // Only render in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <header className="border-b border-secondary-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-2xl font-semibold font-slab text-secondary-900">
            OrderIN
          </h1>
        </div>
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
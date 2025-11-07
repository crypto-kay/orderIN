import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar with mobile menu button */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              Café Management
            </h1>
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:block">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Sidebar - rendered as portal overlay */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
};

export default MainLayout;
import {
  LayoutDashboard,
  Menu,
  MessageSquare,
  Monitor,
  Settings,
  Shield,
  ShoppingCart,
  Utensils,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  // Desktop collapse state
  const [collapsed, setCollapsed] = useState(false);
  // Mobile overlay state
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/menu', label: 'Menu', icon: Utensils },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/kitchen', label: 'Kitchen Display', icon: Monitor },
    { path: '/admin', label: 'Admin', icon: Shield },
    { path: '/complaints', label: 'Complaints', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">OrderIN</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
      
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 p-4 transition-all duration-150`}>
        <div className="space-y-2">
          {/* Desktop toggle button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex mb-4 p-2 rounded-md hover:bg-gray-100 w-full justify-center"
            aria-label="Toggle sidebar"
            aria-expanded={!collapsed}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </aside>
      
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
};

export default Sidebar;
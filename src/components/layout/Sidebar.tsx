import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Settings,
  Shield,
  ShoppingCart,
  Table,
  Utensils,
  X
} from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  width?: string;
  ariaLabel?: string;
};

export default function Sidebar({ isOpen, onClose, width, ariaLabel }: SidebarProps) {
  // Create portal root (ensure it exists)
  useEffect(() => {
    let el = document.getElementById('sidebar-portal-root');
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('id', 'sidebar-portal-root');
      document.body.appendChild(el);
    }
    return () => {
      if (el) {
        document.body.removeChild(el);
      }
    };
  }, []);

  const { user } = useAuthStore();

  const handleClose = () => {
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'kitchen'] },
    { path: '/menu', label: 'Menu', icon: Utensils, roles: ['admin', 'staff'] },
    { path: '/orders', label: 'Orders', icon: ShoppingCart, roles: ['admin', 'staff'] },
    { path: '/tables', label: 'Tables', icon: Table, roles: ['admin', 'staff'] },
    { path: '/kitchen', label: 'Kitchen Display', icon: Monitor, roles: ['kitchen'] },
    { path: '/admin', label: 'Admin', icon: Shield, roles: ['admin'] },
    { path: '/complaints', label: 'Complaints', icon: MessageSquare, roles: ['admin', 'staff'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return createPortal(
    <div
      aria-hidden={!isOpen}
      aria-label={ariaLabel}
      className={`fixed inset-0 z-50 pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}
      style={{ width }}
    >
      <div className="flex h-full">
        {/* Sidebar Panel */}
        <aside
          className={`fixed top-0 left-0 h-full w-${width || 'w-80'} bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">OrderIN</h2>
            <button
              onClick={handleClose}
              aria-label="Close sidebar"
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${isOpen ? 'ml-80' : ''} transition-all duration-300`}>
        </main>
      </div>
    </div>,
    document.body
  );
};
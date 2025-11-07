import {
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Settings,
  Shield,
  ShoppingCart,
  Utensils,
  X
} from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  width?: string; // tailwind width e.g. "w-80"
  ariaLabel?: string;
};

export default function Sidebar({
  isOpen,
  onClose,
  width = 'w-80',
  ariaLabel = 'Sidebar',
}: SidebarProps) {
  // Create portal root (ensure it exists)
  useEffect(() => {
    let el = document.getElementById('sidebar-portal-root');
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('id', 'sidebar-portal-root');
      document.body.appendChild(el);
    }
    return () => {};
  }, []);

  // lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = { overflow: document.body.style.overflow };
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev.overflow;
      };
    }
  }, [isOpen]);

  if (typeof document === 'undefined') return null;
  const portalRoot = document.getElementById('sidebar-portal-root');
  if (!portalRoot) return null;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/menu', label: 'Menu', icon: Utensils },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/kitchen', label: 'Kitchen Display', icon: Monitor },
    { path: '/admin', label: 'Admin', icon: Shield },
    { path: '/complaints', label: 'Complaints', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return createPortal(
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`pointer-events-${isOpen ? 'auto' : 'none'} fixed inset-0 transition-opacity duration-300 ${isOpen ? 'opacity-50 bg-black' : 'opacity-0'}`}
      />

      {/* Sidebar panel */}
      <aside
        role="dialog"
        aria-label={ariaLabel}
        className={`fixed top-0 left-0 bottom-0 z-60 transform transition-transform duration-300 ${width} bg-white shadow-xl pointer-events-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full overflow-y-auto">
          {/* Close button */}
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">OrderIN</h2>
            <button
              aria-label="Close sidebar"
              onClick={onClose}
              className="inline-flex items-center px-2 py-1 rounded hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
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
                  onClick={onClose}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>,
    portalRoot
  );
}
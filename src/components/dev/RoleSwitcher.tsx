import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

// TODO: remove this component in production builds
const RoleSwitcher: React.FC = () => {
  const { user } = useAuthStore();
  const [currentRole, setCurrentRole] = useState(user?.role || 'Admin');
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setCurrentRole(newRole);
    
    // Update user in store if possible
    // In a real app, this would also update the backend
    // For now, we'll just update localStorage and reload
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    authData.user = { ...authData.user, role: newRole };
    localStorage.setItem('auth', JSON.stringify(authData));
    
    // Reload to apply role change
    window.location.reload();
  };
  
  // Only render in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Role:</span>
      <select
        value={currentRole}
        onChange={handleRoleChange}
        className="bg-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="Admin">Admin</option>
        <option value="Staff">Staff</option>
        <option value="Kitchen">Kitchen</option>
      </select>
    </div>
  );
};

export default RoleSwitcher;
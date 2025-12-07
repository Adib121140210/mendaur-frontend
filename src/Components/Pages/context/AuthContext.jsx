import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [roleData, setRoleData] = useState(null); // Full role object from backend
  const [permissions, setPermissions] = useState([]); // Array of permission strings
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedRoleData = localStorage.getItem('roleData');
    const storedPermissions = localStorage.getItem('permissions');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setRole(storedRole || 'nasabah');
        if (storedRoleData) {
          setRoleData(JSON.parse(storedRoleData));
        }
        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions));
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('roleData');
        localStorage.removeItem('permissions');
      }
    }
    setLoading(false);
  }, []);

  const login = (loginResponse) => {
    // Handle both old format and new backend format
    const userData = loginResponse.user || loginResponse;
    const token = loginResponse.token;
    
    // Extract role information
    const roleName = userData.role?.nama_role || userData.role || 'nasabah';
    const roleObj = userData.role || null;
    const userPermissions = userData.role?.permissions || [];
    
    // Store in state
    setUser(userData);
    setRole(roleName);
    setRoleData(roleObj);
    setPermissions(userPermissions);
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    localStorage.setItem('role', roleName);
    localStorage.setItem('roleData', JSON.stringify(roleObj));
    localStorage.setItem('permissions', JSON.stringify(userPermissions));
    localStorage.setItem('id_user', userData.id); // For backward compatibility
    
    console.log('✅ Login successful:', {
      userId: userData.id,
      role: roleName,
      permissions: userPermissions.length,
      isAdmin: roleName === 'admin' || roleName === 'superadmin'
    });
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setRoleData(null);
    setPermissions([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('roleData');
    localStorage.removeItem('permissions');
    localStorage.removeItem('id_user');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  // ✅ Check if user has specific permission
  const hasPermission = (permission) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.includes(permission);
  };

  // ✅ Check if user has ANY of the provided permissions
  const hasAnyPermission = (permissionsArray) => {
    if (!Array.isArray(permissions) || !Array.isArray(permissionsArray)) return false;
    return permissionsArray.some(p => permissions.includes(p));
  };

  // ✅ Check if user has ALL of the provided permissions
  const hasAllPermissions = (permissionsArray) => {
    if (!Array.isArray(permissions) || !Array.isArray(permissionsArray)) return false;
    return permissionsArray.every(p => permissions.includes(p));
  };

  // ✅ Check if user is admin or superadmin
  const isAdmin = role === 'admin' || role === 'superadmin';

  // ✅ Check if user is superadmin
  const isSuperAdmin = role === 'superadmin';

  // ✅ Check if user is regular nasabah
  const isNasabah = role === 'nasabah';

  const value = {
    // State
    user,
    role,
    roleData,
    permissions,
    
    // Methods
    login,
    logout,
    updateUser,
    
    // Checks
    isAuthenticated: !!user,
    isAdmin,
    isSuperAdmin,
    isNasabah,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

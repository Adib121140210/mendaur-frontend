import React from 'react';
import { useAuth } from './Pages/context/AuthContext';

/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions
 * 
 * Props:
 *   - permission: String | String[] - Required permission(s)
 *   - require: 'all' | 'any' - Match all permissions or any one
 *   - fallback: ReactNode - What to show if no permission
 *   - children: ReactNode - Content to render if authorized
 * 
 * Examples:
 *   
 *   // Single permission - requires approve_deposit
 *   <PermissionGuard permission="approve_deposit">
 *     <button>Approve Deposit</button>
 *   </PermissionGuard>
 *   
 *   // Multiple permissions - requires ANY of these
 *   <PermissionGuard 
 *     permission={['approve_deposit', 'approve_redemption']}
 *     require="any"
 *   >
 *     <div>Approval Features</div>
 *   </PermissionGuard>
 *   
 *   // Multiple permissions - requires ALL of these
 *   <PermissionGuard 
 *     permission={['view_all_users', 'manual_poin_adjust']}
 *     require="all"
 *   >
 *     <div>Admin Panel</div>
 *   </PermissionGuard>
 *   
 *   // With fallback
 *   <PermissionGuard 
 *     permission="view_admin_dashboard"
 *     fallback={<p>You don't have access to this feature</p>}
 *   >
 *     <AdminDashboard />
 *   </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  require = 'any',
  fallback = null,
  children
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  // Single permission string
  if (typeof permission === 'string') {
    if (!hasPermission(permission)) {
      return fallback;
    }
    return children;
  }

  // Multiple permissions array
  if (Array.isArray(permission)) {
    let authorized = false;

    if (require === 'all') {
      authorized = hasAllPermissions(permission);
    } else {
      // Default to 'any'
      authorized = hasAnyPermission(permission);
    }

    if (!authorized) {
      return fallback;
    }
    return children;
  }

  // Invalid permission prop

  return fallback;
}

/**
 * RoleGuard Component
 * 
 * Conditionally renders children based on user role
 * 
 * Props:
 *   - role: String | String[] - Required role(s)
 *   - fallback: ReactNode - What to show if no role match
 *   - children: ReactNode - Content to render if authorized
 * 
 * Examples:
 *   
 *   // Single role
 *   <RoleGuard role="admin">
 *     <AdminPanel />
 *   </RoleGuard>
 *   
 *   // Multiple roles (matches any)
 *   <RoleGuard role={['admin', 'superadmin']}>
 *     <AdminFeatures />
 *   </RoleGuard>
 */
export function RoleGuard({
  role,
  fallback = null,
  children
}) {
  const { role: userRole } = useAuth();

  if (typeof role === 'string') {
    if (userRole !== role) {
      return fallback;
    }
    return children;
  }

  if (Array.isArray(role)) {
    if (!role.includes(userRole)) {
      return fallback;
    }
    return children;
  }


  return fallback;
}

/**
 * AdminGuard Component
 * 
 * Convenience component for admin/superadmin check
 * Same as: <RoleGuard role={['admin', 'superadmin']}>
 * 
 * Props:
 *   - fallback: ReactNode - What to show if not admin
 *   - children: ReactNode - Content to render if admin
 */
export function AdminGuard({
  fallback = null,
  children
}) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return fallback;
  }
  return children;
}

/**
 * SuperAdminGuard Component
 * 
 * Convenience component for superadmin check
 * 
 * Props:
 *   - fallback: ReactNode - What to show if not superadmin
 *   - children: ReactNode - Content to render if superadmin
 */
export function SuperAdminGuard({
  fallback = null,
  children
}) {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return fallback;
  }
  return children;
}

export default PermissionGuard;

/**
 * Role-Based Access Control (RBAC) & Ownership Protection Middleware
 */

/**
 * Middleware factory to authorize specific roles (e.g. 'ADMIN', 'CUSTOMER')
 * Usage: authorizeRoles('ADMIN') or authorizeRoles('ADMIN', 'CUSTOMER')
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${allowedRoles.join(' or ')}.`,
      });
    }

    next();
  };
}

/**
 * Ownership verification utility
 * Admins can access all records; Customers can only access their own records.
 */
export function verifyOwnership(resourceOwnerId, user) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return String(resourceOwnerId) === String(user.id);
}

/**
 * Middleware to check resource ownership by URL param (e.g. :userId)
 */
export function enforceUserOwnership(paramName = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const targetUserId = req.params[paramName];
    if (!verifyOwnership(targetUserId, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view or manage your own resources.',
      });
    }

    next();
  };
}

import ApiError from '../utils/ApiError.js';
import { ROLE_HIERARCHY } from '../utils/constants.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }
    next();
  };
};

export const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    const userPermissions = req.user.permissions || [];
    const hasAll = permissions.every((p) => userPermissions.includes(p));
    if (!hasAll) {
      throw ApiError.forbidden('Insufficient permissions');
    }
    next();
  };
};

export const requireRoleLevel = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 99;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 99;
    if (userLevel > requiredLevel) {
      throw ApiError.forbidden('Insufficient role level');
    }
    next();
  };
};

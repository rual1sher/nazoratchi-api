export const ErrorMessages = {
  // ==================== NOT FOUND ====================
  notFound: {
    modelNotFound: (model: string) => `${model} not found`,
    workerInCompanyNotFound: "The worker's company was not found",
  },

  // ==================== FORBIDDEN (права) ====================
  forbidden: {
    adminOnly: 'Admin rights required',
    managerOrAdmin: 'Manager or admin rights required',
    accessDenied: 'Access denied',
    accessSufficient: 'Access is insufficient',
    noCompanyId: 'Company ID is required in headers',
  },

  // ==================== BAD REQUEST ====================
  badRequest: {
    invalid: (t: string) => `${t} is invalid`,

    requiredToken: 'Token is required',

    userOrUserIdNotFound: 'User or user_id not found',
    samePhone: 'User with this phone already exists',
    cannotCreateJobWithCompanyId:
      'If you are not an administrator, you cannot create a job with a company ID (company_id)',
  },

  // ==================== UNAUTHORIZED ====================
  unauthorized: {
    invalidToken: 'Invalid token',
    noAuthorization: 'The user is not authorized',
  },

  // ==================== CONFLICT ====================
  conflict: {
    alreadyExists: (entity: string) => `${entity} already exists`,
  },
};

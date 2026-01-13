/**
 * Demo Authentication Configuration
 * ===================================
 * This file contains demo login credentials for CodeCanyon reviewers.
 * These demo users allow testing without database dependency.
 *
 * DO NOT use these credentials in production environments.
 */

// Demo user credentials and data
export const DEMO_USERS = {
  'admin@example.com': {
    password: 'Afsana@975',
    user: {
      id: 1001,
      email: 'admin@example.com',
      full_name: 'Demo Admin',
      role: 'admin',
      student_id: null,
      counselor_id: null
    },
    permissions: [
      { permission_name: 'Dashboard', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Students', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Inquiry', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Leads', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Applications', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Payments', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Reports', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Settings', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Users', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Counselors', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Staff', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 },
      { permission_name: 'Processors', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 1 }
    ]
  },
  'rehan@example.com': {
    password: '123',
    user: {
      id: 1002,
      email: 'rehan@example.com',
      full_name: 'Rehan (Demo Counselor)',
      role: 'counselor',
      student_id: null,
      counselor_id: 101
    },
    permissions: [
      { permission_name: 'Dashboard', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Students', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Inquiry', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Leads', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Applications', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Payments', view_permission: 1, add_permission: 0, edit_permission: 0, delete_permission: 0 },
      { permission_name: 'Reports', view_permission: 1, add_permission: 0, edit_permission: 0, delete_permission: 0 }
    ]
  },
  'jonny@example.com': {
    password: '123456',
    user: {
      id: 1003,
      email: 'jonny@example.com',
      full_name: 'Jonny (Demo Staff)',
      role: 'staff',
      student_id: null,
      counselor_id: null
    },
    permissions: [
      { permission_name: 'Dashboard', view_permission: 1, add_permission: 0, edit_permission: 0, delete_permission: 0 },
      { permission_name: 'Students', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Inquiry', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Leads', view_permission: 1, add_permission: 1, edit_permission: 0, delete_permission: 0 },
      { permission_name: 'Applications', view_permission: 1, add_permission: 0, edit_permission: 0, delete_permission: 0 },
      { permission_name: 'Payments', view_permission: 1, add_permission: 0, edit_permission: 0, delete_permission: 0 }
    ]
  },
  'junny14@example.com': {
    password: '123456',
    user: {
      id: 1004,
      email: 'junny14@example.com',
      full_name: 'Junny (Demo Student)',
      role: 'student',
      student_id: 201,
      counselor_id: null
    },
    permissions: [
      { permission_name: 'Dashboard', view_permission: 1, add_permission: 0, edit_permission: 0, delete_permission: 0 },
      { permission_name: 'Applications', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Documents', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Payments', view_permission: 1, add_permission: 0, edit_permission: 0, delete_permission: 0 }
    ]
  },
  'nalini@example.com': {
    password: 'nalini@123',
    user: {
      id: 1005,
      email: 'nalini@example.com',
      full_name: 'Nalini (Demo Processor)',
      role: 'processors',
      student_id: null,
      counselor_id: null
    },
    permissions: [
      { permission_name: 'Dashboard', view_permission: 1, add_permission: 0, edit_permission: 0, delete_permission: 0 },
      { permission_name: 'Applications', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Documents', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 },
      { permission_name: 'Visa Processing', view_permission: 1, add_permission: 1, edit_permission: 1, delete_permission: 0 }
    ]
  }
};

// Demo token prefix for identification
export const DEMO_TOKEN_PREFIX = 'demo_token_';

/**
 * Check if the provided credentials match a demo user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object|null} Demo user data if credentials match, null otherwise
 */
export const getDemoUser = (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();
  const demoUser = DEMO_USERS[normalizedEmail];

  if (demoUser && demoUser.password === password) {
    return demoUser;
  }
  return null;
};

/**
 * Generate a demo token for the given role
 * @param {string} role - User role
 * @returns {string} Demo token
 */
export const generateDemoToken = (role) => {
  return `${DEMO_TOKEN_PREFIX}${role}_${Date.now()}`;
};

/**
 * Check if a token is a demo token
 * @param {string} token - Auth token
 * @returns {boolean} True if token is a demo token
 */
export const isDemoToken = (token) => {
  return token && token.startsWith(DEMO_TOKEN_PREFIX);
};

/**
 * Get the dashboard path based on user role
 * @param {string} role - User role
 * @returns {string} Dashboard path
 */
export const getDashboardPath = (role) => {
  const dashboardPaths = {
    admin: '/dashboard',
    student: '/dashboardvisa',
    counselor: '/councelor',
    staff: '/staffDashboard',
    processors: '/processorsDashboard',
    masteradmin: '/masterDashboard'
  };
  return dashboardPaths[role] || '/dashboard';
};

# Roles & Permissions Guide

## Overview

EduCRM React Admin Dashboard supports multiple user roles with different access levels and permissions. The role-based access control (RBAC) is implemented on the frontend, but **must be enforced on your backend API** for security.

## Available Roles

### 1. Admin
- Full access to all features
- User management
- System configuration
- Reports and analytics
- All CRUD operations

### 2. Counselor
- Student management
- Lead management
- Application tracking
- Task management
- Communication features
- Limited reporting

### 3. Staff
- Lead and inquiry management
- Basic student operations
- Task completion
- Communication features

### 4. Student
- View own profile
- Track applications
- View assigned tasks
- Communication with counselors
- Document uploads

### 5. Processor
- Visa processing
- Document verification
- Application status updates
- Student documentation

### 6. Master Admin
- Multi-branch management
- Global settings
- All admin capabilities
- Branch-level reporting

## Permission Implementation

### Frontend Permission Check

The template includes a permission utility in:

```
src/auth/permissionUtils.js
```

Example usage:

```javascript
import { hasPermission } from "../auth/permissionUtils";

// Check permission
if (hasPermission("manage_students")) {
  // Show student management features
}
```

### Route Protection

Protected routes are implemented using:

```
src/routes/ProtectedRoute.js
```

Example:

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Role-Based UI Rendering

### Conditional Rendering

```javascript
const role = localStorage.getItem("role");

{role === "admin" && (
  <AdminDashboard />
)}

{role === "counselor" && (
  <CounselorDashboard />
)}

{role === "student" && (
  <StudentDashboard />
)}
```

### Sidebar Menu Filtering

The sidebar automatically filters menu items based on user role. Each menu item can have role restrictions:

```javascript
const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: ["admin", "counselor", "staff"]
  },
  {
    label: "User Management",
    path: "/users",
    roles: ["admin"]
  }
];
```

## Permission Matrix

| Feature | Admin | Counselor | Staff | Student | Processor |
|---------|-------|-----------|-------|---------|-----------|
| Dashboard | Full | Limited | Limited | Own | Limited |
| Students | CRUD | Read/Update | Read | Own | Read |
| Leads | CRUD | CRUD | CRUD | - | - |
| Applications | CRUD | CRUD | Read | Own | Update |
| Tasks | CRUD | CRUD | Read/Update | Read | - |
| Reports | Full | Limited | - | - | - |
| Settings | Full | - | - | - | - |
| Visa Process | Full | View | - | Own | Full |

## Backend Implementation (Required)

**Important:** Frontend permission checks are for UI purposes only. Your backend MUST:

1. Validate user role on every API request
2. Check permissions before data operations
3. Return only authorized data
4. Implement middleware for route protection

Example backend middleware (Express.js):

```javascript
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  };
};

// Usage
app.get("/admin/users", checkRole(["admin"]), getUsers);
```

## Customizing Permissions

### Adding New Roles

1. Update the role constants
2. Add role checks in components
3. Update sidebar menu configuration
4. Implement backend role validation

### Modifying Permissions

1. Update `permissionUtils.js`
2. Modify component permission checks
3. Update backend authorization

## Storage

User role is stored in localStorage after login:

```javascript
localStorage.setItem("role", response.data.role);
localStorage.setItem("authToken", response.data.token);
localStorage.setItem("user_id", response.data.user_id);
```

## Security Best Practices

1. **Never trust frontend-only validation**
2. **Always validate on the backend**
3. **Use JWT tokens with role claims**
4. **Implement token expiration**
5. **Log permission violations**
6. **Regular security audits**

# Folder Structure Guide

## Root Package Structure

```
EduCRM-React-Admin/
|
+-- documentation/          # Documentation files
|   +-- introduction.md
|   +-- installation.md
|   +-- environment-setup.md
|   +-- firebase-setup.md
|   +-- api-integration.md
|   +-- roles-permissions.md
|   +-- folder-structure.md
|   +-- faq.md
|
+-- source/                 # Main React application
|   +-- public/
|   +-- src/
|   +-- package.json
|   +-- vite.config.js
|   +-- ...
|
+-- demo/                   # Demo links
|   +-- live-demo-link.txt
|
+-- screenshots/            # Screenshot images
|
+-- README.txt              # Quick start guide
+-- CHANGELOG.txt           # Version history
+-- LICENSE.txt             # License information
+-- .gitignore
```

## Source Folder Structure

```
source/
|
+-- public/                 # Static assets
|   +-- vite.svg
|
+-- src/                    # Source code
|   |
|   +-- assets/             # Images, icons, logos
|   |   +-- logo.jpeg
|   |   +-- bmulogo.webp
|   |   +-- ...
|   |
|   +-- auth/               # Authentication components
|   |   +-- ForgotPassword.jsx
|   |   +-- Home.jsx
|   |   +-- InquiryForm.jsx
|   |   +-- Login.jsx
|   |   +-- PaymentFormModal.jsx
|   |   +-- ResetPassword.jsx
|   |   +-- Signup.jsx
|   |   +-- hasuserpermission.js
|   |   +-- permissionUtils.js
|   |
|   +-- components/         # Feature components
|   |   |
|   |   +-- AdmissionTracking/
|   |   |   +-- Admission.jsx
|   |   |   +-- AdmissionDecisions.jsx
|   |   |   +-- ApplicationTracker.jsx
|   |   |   +-- ...
|   |   |
|   |   +-- ChatBot/
|   |   +-- ChatSection/
|   |   +-- CommunicationFollowupManagement/
|   |   +-- CounselorDetails/
|   |   +-- CourseUniversityDatabase/
|   |   +-- Dashboard/
|   |   +-- GlobalTableScrollbar/
|   |   +-- LeadInquiryManagement/
|   |   +-- MasterAdmin/
|   |   +-- PaymentInvoiceManagement/
|   |   +-- ProcessorStudentDetails/
|   |   +-- Processors/
|   |   +-- Profile/
|   |   +-- ReportingAnalytics/
|   |   +-- StudentDecision/
|   |   +-- TaskCalendarManagement/
|   |   +-- UniversityForms/
|   |   +-- UserRolesAccessControl/
|   |
|   +-- context/            # React Context providers
|   |   +-- LeadContext.jsx
|   |
|   +-- demo/               # Demo components
|   |   +-- Inquirydemo.jsx
|   |   +-- InquryTabledemo.jsx
|   |   +-- StudentInqueryForm.jsx
|   |
|   +-- layout/             # Layout components
|   |   +-- Navbar.jsx
|   |   +-- Navbar.css
|   |   +-- Sidebar.jsx
|   |   +-- Sidebar.css
|   |
|   +-- profile/            # User profile components
|   |   +-- ChangePassword.jsx
|   |   +-- EditProfileModal.jsx
|   |   +-- MyProfile.jsx
|   |
|   +-- routes/             # Route protection
|   |   +-- ProtectedRoute.js
|   |
|   +-- services/           # API and services
|   |   +-- axiosInterceptor.js
|   |   +-- firebase.js
|   |   +-- FirebaseNotification.js
|   |
|   +-- App.jsx             # Main App component
|   +-- App.css             # App styles
|   +-- Config.js           # Configuration
|   +-- index.css           # Global styles
|   +-- main.jsx            # Entry point
|   +-- TawkMessenger.js    # Chat widget
|
+-- index.html              # HTML entry point
+-- package.json            # Dependencies
+-- package-lock.json       # Lock file
+-- vite.config.js          # Vite configuration
+-- eslint.config.js        # ESLint configuration
+-- .env.example            # Environment template
+-- .gitignore              # Git ignore rules
```

## Component Categories

### Authentication (`src/auth/`)
Components for user authentication and authorization.

### Layout (`src/layout/`)
Main layout components including navigation and sidebar.

### Routes (`src/routes/`)
Route protection and navigation guards.

### Services (`src/services/`)
API clients, interceptors, and third-party service integrations.

### Context (`src/context/`)
React Context providers for global state management.

### Profile (`src/profile/`)
User profile management components.

### Components (`src/components/`)
Feature-specific components organized by module.

## Key Files

| File | Purpose |
|------|---------|
| `main.jsx` | Application entry point |
| `App.jsx` | Main application component with routing |
| `Config.js` | API configuration |
| `index.css` | Global styles |
| `vite.config.js` | Vite build configuration |

## Naming Conventions

- **Components**: PascalCase (e.g., `StudentProfile.jsx`)
- **Utilities**: camelCase (e.g., `permissionUtils.js`)
- **CSS Modules**: Same name as component (e.g., `Lead.css`)
- **Folders**: PascalCase for components, lowercase for utilities

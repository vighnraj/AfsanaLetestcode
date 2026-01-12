# EduCRM React Admin Dashboard

A comprehensive, production-ready React admin dashboard template designed for educational institutions, universities, and student counseling agencies.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap)
![License](https://img.shields.io/badge/License-Commercial-green)

---

## Important Notice

**This is a FRONTEND-ONLY template.**

The backend API is NOT included and must be developed separately. This template provides:
- Complete React frontend application
- UI components and pages
- API integration layer (ready to connect)
- Authentication flow (frontend only)

You are responsible for implementing your own backend server with the required API endpoints.

---

## Features

### Dashboard & Analytics
- Multi-role dashboards (Admin, Counselor, Staff, Student, Processor)
- Interactive charts and statistics
- Real-time notifications

### Student Management
- Student profiles and details
- Application tracking
- Document management
- Visa processing workflow

### Lead & Inquiry Management
- Lead capture and listing
- Inquiry management
- Follow-up scheduling
- Status tracking

### Communication
- Real-time chat system
- Automated reminders
- Push notifications (Firebase)
- ChatBot integration

### User Management
- Role-based access control
- Permission management
- Multi-role support

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI Framework |
| Vite | 6.0 | Build Tool |
| React Router | 7.1 | Routing |
| Bootstrap | 5.3 | CSS Framework |
| Material UI | 7.0 | UI Components |
| Axios | 1.9 | HTTP Client |
| Socket.io | 4.8 | Real-time Communication |
| Firebase | 11.10 | Auth & Notifications |
| Chart.js | 4.4 | Charts & Graphs |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+ or yarn

### Installation

```bash
# Navigate to source directory
cd source

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your API configuration
# (See docs/ENV_SETUP.md for details)

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

---

## Project Structure

```
EduCRM-React-Admin/
├── source/                 # Main React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── auth/          # Authentication pages
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── layout/        # Layout components
│   │   ├── routes/        # Route definitions
│   │   ├── services/      # API & services
│   │   ├── App.jsx        # Main app component
│   │   ├── Config.js      # App configuration
│   │   └── main.jsx       # Entry point
│   ├── .env.example       # Environment template
│   ├── package.json       # Dependencies
│   └── vite.config.js     # Vite configuration
├── docs/                   # Documentation
├── screenshots/            # Preview images
├── LICENSE                 # License file
├── CHANGELOG.md           # Version history
└── README.md              # This file
```

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Required: Your backend API URL
VITE_API_BASE_URL=https://your-api.com/api/

# Required: Socket.io server URL
VITE_SOCKET_URL=https://your-api.com

# Optional: Firebase configuration
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... (see .env.example for full list)
```

### Backend Requirements

Your backend API must implement endpoints for:
- Authentication (login, register, password reset)
- User management
- Student CRUD operations
- Lead/Inquiry management
- Chat/messaging
- Notifications

See `docs/API_INTEGRATION.md` for complete endpoint specifications.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](docs/INSTALLATION.md) | Detailed setup instructions |
| [Environment Setup](docs/ENV_SETUP.md) | Configuration guide |
| [API Integration](docs/API_INTEGRATION.md) | Backend API requirements |
| [Screenshots](docs/SCREENSHOTS.md) | Feature previews |

---

## User Roles

| Role | Description |
|------|-------------|
| Admin | Full system access |
| Counselor | Student counseling & leads |
| Staff | General operations |
| Student | Self-service portal |
| Processor | Visa & document processing |
| Master Admin | Multi-branch management |

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

This project is licensed under a Commercial License. See [LICENSE](LICENSE) for details.

**Key Points:**
- Single end product per license
- Frontend code only (backend not included)
- Redistribution prohibited
- Modification allowed for personal/client use

---

## Support

For support inquiries:
1. Review the documentation in the `docs/` folder
2. Check the FAQ section
3. Contact through the marketplace support system

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Copyright 2025. All Rights Reserved.**

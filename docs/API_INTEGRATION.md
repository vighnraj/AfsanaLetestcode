# API Integration Guide

This document describes how to integrate your backend API with the EduCRM React Admin Dashboard.

---

## Overview

This frontend template expects a RESTful API backend. All API calls are made through a centralized Axios client located at `src/services/axiosInterceptor.js`.

**Key Features:**
- Automatic JWT token attachment to requests
- 401 error handling with auto-logout
- Session idle timeout management
- Base URL from environment variables

---

## Configuration

Set your API URL in the `.env` file:

```env
VITE_API_BASE_URL=https://your-api.com/api/
VITE_SOCKET_URL=https://your-api.com
```

---

## Authentication

### Login Flow

The frontend expects these API responses for authentication:

**POST `/auth/login`**

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "admin",
    "student_id": null,
    "counselor_id": null
  }
}
```

### Token Handling

- JWT tokens are stored in `localStorage` as `authToken`
- Tokens are automatically attached to all API requests via Authorization header
- On 401 responses, users are automatically logged out

### Google Sign-In (Optional)

If using Firebase Google Sign-In:

**POST `/auth/student/google-signup`**

Request:
```json
{
  "token": "firebase-id-token"
}
```

---

## Expected API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/student/google-signup` | Google sign-in |
| POST | `/auth/forgot-password` | Password reset request |
| POST | `/auth/reset-password` | Reset password with token |

### Users & Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/permission?role_name={role}` | Get role permissions |
| GET | `/permissions?user_id={id}` | Get user permissions |
| GET | `/userdetails?userId={id}` | Get user details |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | List all students |
| GET | `/students/{id}` | Get student details |
| POST | `/students` | Create student |
| PUT | `/students/{id}` | Update student |
| DELETE | `/students/{id}` | Delete student |

### Leads & Inquiries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | List all leads |
| GET | `/leads/{id}` | Get lead details |
| POST | `/leads` | Create lead |
| PUT | `/leads/{id}` | Update lead |
| GET | `/inquiries` | List inquiries |

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applications` | List applications |
| GET | `/applications/{id}` | Get application details |
| POST | `/applications` | Create application |
| PUT | `/applications/{id}` | Update application status |

### Chat & Messaging

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats/getChatList/{userId}` | Get user's chat list |
| GET | `/getAssignedStudents?counselor_id={id}` | Get counselor's students |
| GET | `/getAssignedcounselor?student_id={id}` | Get student's counselor |

---

## Socket.io Events

For real-time features, implement these socket events:

### Connection
```javascript
// Client joins with user ID
socket.emit("join", userId);
socket.emit("registerUser", userId);
```

### Chat Events
```javascript
// Get chat messages
socket.emit("get_messages", { sender_id, receiver_id });
socket.emit("getChatHistory", { chatId, limit, offset });

// Send message
socket.emit("send_message", {
  message: "Hello",
  sender_id: 1,
  receiver_id: 2,
  type: "text"
});

// Receive messages
socket.on("messages", (messages) => {});
socket.on("new_message", (message) => {});
socket.on("receiveMessage", (message) => {});
socket.on("chatHistory", ({ messages }) => {});
```

### Notification Events
```javascript
// Get dashboard notifications
socket.emit("getDashboardData", {
  student_id,
  counselor_id,
  processor_id,
  staff_id
});

// Receive notifications
socket.on("dashboardDataResponse", (data) => {});
socket.on("dashboardUpdated", (data) => {});
```

---

## CORS Configuration

Your backend must allow CORS from the frontend domain:

```javascript
// Express.js example
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.com'],
  credentials: true
}));
```

---

## Error Handling

The frontend expects error responses in this format:

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (triggers auto-logout)
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## Using the API Client

Import and use the centralized API client:

```javascript
import api from './services/axiosInterceptor';

// GET request
const response = await api.get('/students');

// POST request
const data = await api.post('/students', {
  full_name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
await api.put('/students/1', { full_name: 'Jane Doe' });

// DELETE request
await api.delete('/students/1');
```

---

## Backend Technology Recommendations

This frontend works with any backend that implements the required REST API. Recommended technologies:

- **Node.js** with Express.js
- **Python** with Django/FastAPI
- **PHP** with Laravel
- **Java** with Spring Boot
- **Go** with Gin

The backend is NOT included in this package and must be developed separately.

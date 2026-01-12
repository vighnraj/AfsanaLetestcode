# API Integration Guide

## Important Notice

**This is a FRONTEND-ONLY template.** You are responsible for creating and maintaining your own backend API. This guide explains how to integrate your API with this template.

## API Client Configuration

The template uses Axios for API calls. The configuration is located in:

```
src/services/axiosInterceptor.js
```

## Setting Up Your API Base URL

1. Update your `.env` file:

```env
VITE_API_BASE_URL=https://your-api-url.com/api
```

2. The Config.js file uses this variable:

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-api-url.com/api";
export default BASE_URL;
```

## Axios Interceptor

The template includes an Axios interceptor that:
- Adds authentication token to requests
- Handles response errors globally
- Manages token refresh (if implemented)

### Example Interceptor Setup

```javascript
import axios from "axios";
import BASE_URL from "../Config";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Expected API Endpoints

Your backend should implement the following API endpoints (examples):

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/logout` | User logout |

### Users/Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Leads/Inquiries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | Get all leads |
| POST | `/leads` | Create lead |
| PUT | `/leads/:id` | Update lead |
| GET | `/inquiries` | Get all inquiries |
| POST | `/inquiries` | Create inquiry |

### Admissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applications` | Get applications |
| POST | `/applications` | Create application |
| PUT | `/applications/:id/status` | Update status |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |

## Response Format

Your API should return consistent response formats:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Authentication Flow

1. User submits login credentials
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. Token sent with each API request via interceptor
5. Backend validates token on protected routes

## Making API Calls

Example of making API calls in components:

```javascript
import api from "../services/axiosInterceptor";

// GET request
const fetchData = async () => {
  try {
    const response = await api.get("/endpoint");
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

// POST request
const createItem = async (data) => {
  try {
    const response = await api.post("/endpoint", data);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
```

## CORS Configuration

Ensure your backend allows requests from your frontend domain:

```javascript
// Express.js example
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'],
  credentials: true
}));
```

## Error Handling

The template handles common errors:
- 401: Redirects to login
- 403: Shows forbidden message
- 404: Shows not found
- 500: Shows server error

Customize error handling in the Axios interceptor as needed.

# 🔗 Shared Architecture Design — Nexus E-commerce

This document outlines shared architecture standards and configurations between the Frontend (Vite/React) and Backend (Express.js) for Nexus E-commerce.

## 1. API Communication Protocol

All communication between the frontend and backend occurs via RESTful APIs using JSON.

### Base URLs
| Environment | Frontend URL | Backend API URL |
|---|---|---|
| Local | `http://localhost:5173` | `http://localhost:5000/api` |
| Production | `<frontend_domain>` | `<backend_domain>/api` |

## 2. Authentication & Authorization

- **Method:** JWT (JSON Web Tokens).
- **Flow:**
  1. User authenticates via `/api/auth/login`.
  2. Server responds with a JWT token.
  3. Frontend stores the token (e.g., in localStorage or memory).
  4. Subsequent requests to protected routes include the token in the `Authorization` header: `Bearer <token>`.

## 3. Standard Response Format

All backend API responses follow a consistent structure.

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Product Name"
  },
  "message": "Operation successful."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Resource not found",
  "stack": "..." // Only in development mode
}
```

## 4. Environment Variables

Both environments use `.env` files for configuration.
- **Backend:** `PORT`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`.
- **Frontend:** `VITE_API_URL` (Variables prefixed with `VITE_` are exposed to the browser).

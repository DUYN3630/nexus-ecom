# 🧪 Testing Strategy — Nexus E-commerce

This project uses modern testing tools to ensure the quality and stability of the application.

## 1. Backend Testing

- **Framework:** Vitest / Jest (depending on configuration)
- **Scope:** 
  - API endpoint testing (Supertest).
  - Unit testing for complex services and utilities.
  - Integration testing for Mongoose models (using in-memory MongoDB).

## 2. Frontend Testing

- **Framework:** Vitest + React Testing Library
- **Scope:**
  - Component rendering and state changes.
  - User interaction simulation (clicks, form submissions).
  - Mocking API calls using MSW (Mock Service Worker).

## 3. Running Tests

To run frontend tests:
```bash
npm run test
```

To run backend tests:
```bash
cd server
npm run test
```

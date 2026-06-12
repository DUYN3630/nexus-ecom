# 🎨 Frontend Architecture (Vite + React) — Nexus E-commerce

## Architecture: Feature-Based Structure

```text
src/
├── api/                      # Axios instances and API utility functions
├── components/               # Shared/Reusable components (UI elements)
├── config/                   # Global configuration settings
├── constants/                # Application-wide constants
├── contexts/                 # React Context providers (Auth, Theme, etc.)
├── features/                 # Feature-specific modules (Products, Cart, Admin)
├── hooks/                    # Global custom hooks
├── layouts/                  # Layout components (Main, Auth, Admin)
├── pages/                    # Page components that map to routes
├── store/                    # State management (Redux or Zustand)
├── styles/                   # Global CSS and Tailwind configurations
└── utils/                    # Helper and formatting functions
```

---

## Configurations & Conventions

### 1. API Integration Pattern
API calls are centralized in the `api/` directory or within feature-specific files. Axios is configured with base URLs and interceptors to automatically attach JWT tokens.

### 2. State Management Strategy
- **Server State:** Handled directly via custom hooks or React Query (if applicable).
- **Client State:** Handled via Context API or Redux/Zustand depending on complexity.
- **Form State:** Managed with controlled components or libraries like React Hook Form.

### 3. Naming Convention

| Item | Convention | Example |
|---|---|---|
| Component file | PascalCase.jsx | `ProductCard.jsx` |
| Hook file | camelCase.js | `useAuth.js` |
| Utility file | camelCase.js | `formatCurrency.js` |
| CSS | .css or Tailwind | `index.css` |

### 4. Routing Structure
React Router handles navigation.
- Public routes: `/`, `/products`, `/product/:id`, `/login`, `/register`.
- Protected routes: `/profile`, `/cart`, `/checkout`, `/it-hub/appointment`.
- Admin routes: `/admin/dashboard`, `/admin/products`, `/admin/users`.

---

## Design System

The project uses **Tailwind CSS** for styling, which allows utility-first classes directly in JSX.

### Core Philosophy
- Consistent spacing and typography.
- Mobile-first responsive design.
- Clean and modern e-commerce interface with an integrated IT Hub section.

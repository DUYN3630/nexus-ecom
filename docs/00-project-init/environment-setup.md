# 🛠️ Environment Setup — Nexus E-commerce

This document provides instructions for setting up the development environment for the Nexus E-commerce project, a MERN stack application with Vite and Google Gemini API integration.

## 1. Prerequisites

### 1.1 Node.js 20 LTS+
- **Purpose:** Runtime environment for both Backend (Express) and Frontend (Vite/React).
- **Download:** [nodejs.org](https://nodejs.org/)
- **Verification:** `node -v` (must be v20 or higher).

### 1.2 MongoDB
- **Purpose:** Main database of the system.
- **Setup:** Use MongoDB Atlas (Cloud) or install MongoDB Community Server locally.
- **Verification:** Ensure your connection string is valid.

### 1.3 Git
- **Purpose:** Source code management.
- **Download:** [git-scm.com](https://git-scm.com/)

---

## 2. Development Tools (IDE & Tools)

- **VS Code** (Recommended):
  - Extensions: *ESLint, Prettier, Tailwind CSS IntelliSense*.
- **MongoDB Compass**: For managing the local or remote database visually.
- **Postman** or **Insomnia**: For testing API endpoints.

---

## 3. Local Setup

### Step 1: Clone the repository
```bash
git clone https://github.com/your-repo/nexus-ecom.git
cd nexus-ecom
```

### Step 2: Configure Backend (Express)
```bash
cd server
npm install
cp .env.example .env
```
*Open the `.env` file and update the connection details:*
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nexus_ecom?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret
```

### Step 3: Configure Frontend (Vite/React)
```bash
# From the root directory (nexus-ecom)
npm install
cp .env.example .env
```
*Open the `.env` file in the root and update:*
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Running the Application

You can run the application either using standard npm commands or Docker Compose.

### Option A: Using NPM (Terminal)

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# or npm run start:backend (if configured in server/package.json)
```

**Terminal 2 (Frontend):**
```bash
# From the root directory
npm run dev
```

### Option B: Using Docker Compose
If you have Docker and Docker Compose installed:
```bash
# From the root directory
docker-compose up -d
```
This will build and start both the frontend and backend containers.

---

## 5. Troubleshooting

### Error: "MongoServerError: bad auth"
- **Cause:** Incorrect MongoDB credentials in the `.env` file.
- **Fix:** Double-check your `MONGODB_URI` password and username, ensuring no special characters are unescaped.

### Error: "Gemini API key not valid"
- **Cause:** Missing or invalid `GEMINI_API_KEY`.
- **Fix:** Get a valid API key from Google AI Studio and place it in `server/.env`.

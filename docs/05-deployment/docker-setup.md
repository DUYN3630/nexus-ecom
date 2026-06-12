# 🚢 Docker Setup — Nexus E-commerce

This project includes a `docker-compose.yml` file to quickly spin up both the frontend and backend services in isolated containers.

## 1. Prerequisites

- Docker installed
- Docker Compose installed

## 2. Environment Configuration

Ensure you have `.env` files created in both the root directory and the `server` directory.

**Root `.env` (Frontend):**
```env
VITE_API_URL=http://localhost:5000/api
```

**`server/.env` (Backend):**
```env
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
GEMINI_API_KEY=<your-gemini-api-key>
```

## 3. Running the Application

To build the images and start the containers, run the following command in the root directory:

```bash
docker-compose up -d --build
```

- The frontend will be accessible at `http://localhost:5173`
- The backend API will be accessible at `http://localhost:5000/api`

## 4. Stopping the Application

To stop and remove the containers, run:

```bash
docker-compose down
```

# 🚀 Deployment Strategy — Nexus E-commerce

The platform is designed to be easily deployable using modern cloud infrastructure.

## Backend Deployment
- **Platform:** Render, Heroku, or AWS EC2.
- **Database:** MongoDB Atlas (Cloud).
- **Environment:** Node.js environment with configured `.env` variables.

## Frontend Deployment
- **Platform:** Vercel or Netlify.
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## Docker Deployment (Alternative)
The project includes a `docker-compose.yml` for containerized deployment, making it easy to spin up the entire stack on any server with Docker installed.

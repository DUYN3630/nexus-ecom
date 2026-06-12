# ⚙️ Backend Operations Manual — Nexus E-commerce

## 1. Starting the Server

In development mode:
```bash
cd server
npm run dev
```

In production mode:
```bash
cd server
npm start
```

## 2. Environment Variables

Create a `.env` file in the `server` directory with the following variables:
- `PORT=5000`
- `MONGODB_URI=<your-mongodb-connection-string>`
- `JWT_SECRET=<your-secret-key>`
- `GEMINI_API_KEY=<your-google-gemini-api-key>`

## 3. Database Management

- **Database:** MongoDB
- **GUI Tool:** MongoDB Compass is recommended for local viewing and management.
- **Seeding:** (If scripts are provided) run `npm run seed` to populate initial products and users.

## 4. Troubleshooting
- If MongoDB fails to connect, check your IP whitelist in MongoDB Atlas or ensure the local MongoDB service is running.
- Ensure `GEMINI_API_KEY` is valid if AI features are failing.

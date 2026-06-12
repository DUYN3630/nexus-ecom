# 🏗️ Backend Architecture (Express.js) — Nexus E-commerce

## 1. Directory Structure

The backend is built with Express.js and organized following an MVC (Model-View-Controller) and Service pattern for better separation of concerns.

```text
server/
├── index.js                 # Entry point
├── config/                  # Configuration files (DB connection, AI prompts)
├── controllers/             # Request handlers (logic for endpoints)
├── middleware/              # Express middlewares (auth, error handling)
├── models/                  # Mongoose schemas and models
├── routes/                  # Express route definitions
├── services/                # Business logic and external service integrations
├── scripts/                 # Utility scripts (seeders, etc.)
└── utils/                   # Helper functions
```

## 2. Request Lifecycle

1. **Client** sends Request.
2. **Middleware** handles logging, parsing, and authentication verification (JWT).
3. **Router** directs the request to the appropriate Controller.
4. **Controller** extracts data and calls the corresponding Service.
5. **Service** performs business logic and interacts with the Database via **Mongoose Models**.
6. **Controller** formats the response and sends it back to the client.

## 3. Naming Convention

| Object | Rule | Example |
|---|---|---|
| Folder | lowercase | `controllers/` |
| File | camelCase | `authController.js` |
| Model | PascalCase | `User.js`, `Product.js` |
| Controller/Service | camelCase | `userController.js` |

## 4. Key Technologies & Integrations

- **Database:** MongoDB via Mongoose.
- **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing.
- **AI Integration:** Google Gemini API for the IT Hub AI Assistant, configured via `config/aiPrompt.js` and managed in `services/`.
- **Validation:** Explicit schema validation using Mongoose.

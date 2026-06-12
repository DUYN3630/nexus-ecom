# 🐞 Backend Error Log — Nexus E-commerce

This file is used to track and document common backend errors encountered during development and their respective solutions.

## Error: `MongoServerError: bad auth`
- **Context:** Occurs when trying to connect to MongoDB.
- **Solution:** Verify the `MONGODB_URI` in the `server/.env` file. Ensure the username and password are correct and that any special characters are URL-encoded.

## Error: `[GoogleGenerativeAI Error]: API key not valid`
- **Context:** Occurs when the AI Hub features are used.
- **Solution:** Check the `GEMINI_API_KEY` in `server/.env`. Ensure you have generated a valid key from Google AI Studio.

## Error: `TokenExpiredError: jwt expired`
- **Context:** Occurs when a user tries to access a protected route with an old token.
- **Solution:** The frontend should handle this by redirecting the user to the login page or attempting to refresh the token if a refresh mechanism is implemented.

# ⚙️ CI/CD Pipeline — Nexus E-commerce

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

## CI Workflow

The CI pipeline runs on every push and pull request to the `main` branch. It performs the following tasks:

1.  **Checkout Code:** Clones the repository.
2.  **Setup Node.js:** Installs the required Node.js version.
3.  **Install Dependencies:** Runs `npm install` for both frontend and backend.
4.  **Linting:** Runs ESLint to check for code quality issues.
5.  **Testing:** Runs automated tests (if configured).
6.  **Build:** Builds the Vite frontend.

## CD Workflow

Currently, deployment is recommended via Vercel (for frontend) and Render/Heroku (for backend), which can automatically trigger deployments on pushes to the `main` branch without requiring explicit GitHub Actions definitions.

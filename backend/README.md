# Ethara TaskManager - Backend API

This is the backend service for the **Ethara TaskManager** full-stack Team Task Management application. It is built with Node.js, Express, TypeScript, and Prisma, providing a robust REST API for managing users, projects, tasks, and analytics.

## Technologies Used

- **Node.js & Express**: Core backend framework for handling HTTP requests.
- **TypeScript**: Superset of JavaScript adding static types for enhanced developer experience and code reliability.
- **Prisma**: Next-generation ORM for Node.js and TypeScript, used for seamless database interactions.
- **PostgreSQL**: Relational database used to store application data.
- **Zod**: TypeScript-first schema declaration and validation library.
- **JSON Web Tokens (JWT) & bcrypt**: For secure user authentication and password hashing.
- **cookie-parser**: For handling HTTP-only cookies securely.

## Prerequisites

Before running the application, make sure you have the following installed:
- Node.js (v18 or higher recommended)
- PostgreSQL database

## Environment Setup

1. Create a `.env` file in the root of the `backend` directory.
2. Add the following environment variables:

```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/ethara_db?schema=public"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# JWT Secret for authentication
JWT_SECRET="your_super_secret_jwt_key_here"

# Environment
NODE_ENV="development"
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup (Prisma):**
   Push the schema to your database to create the tables, and generate the Prisma Client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Run the Development Server:**
   Starts the server with nodemon for hot-reloading:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000/api`.

## Available Scripts

- `npm run dev`: Starts the development server using `nodemon` and `ts-node`.
- `npm run build`: Generates the Prisma client and compiles the TypeScript code into the `dist/` directory.
- `npm run start`: Runs the compiled JavaScript application from the `dist/` directory (used in production).

## API Structure

The API is structured around several core entities:
- **`/api/auth`**: Endpoints for user registration, login, logout, and session verification.
- **`/api/projects`**: Endpoints for creating projects, fetching created/joined projects, and managing project members.
- **`/api/tasks`**: Endpoints for creating, updating (e.g. status/assignee), and fetching tasks globally or per-project.
- **`/api/dashboard`**: Endpoints for retrieving aggregated metrics and statistics for the user dashboard.

All protected routes require a valid JWT token stored in an HTTP-only cookie, verified via the `authMiddleware`.

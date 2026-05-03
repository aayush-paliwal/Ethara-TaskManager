# Team Task Manager

A full-stack Team Task Management Web Application built to evaluate core full-stack development skills. This application allows teams to create projects, assign tasks, and track their progress through a collaborative Kanban-style board.

## Tech Stack

*   **Frontend**: React (Vite), TypeScript, Tailwind CSS v4, Shadcn UI, Framer Motion, Zustand.
*   **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
*   **Authentication**: Secure JWT via HTTP-only Cookies.

## Features

1.  **User Authentication**: Secure Signup and Login using JWTs stored in HTTP-only cookies.
2.  **Project Management**: Create projects (as Admin) and add team members by their email.
3.  **Task Management**: Create tasks, assign priorities (Low/Medium/High), set due dates, and update statuses (To Do / In Progress / Done) on a Kanban board.
4.  **Role-Based Access**: Admins have full access to projects; Members can only update the status of tasks assigned to them.
5.  **Dashboard**: Personal analytics showing total tasks, overdue tasks, and task distribution across all active projects.

## Local Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL installed and running locally.

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory with the following contents:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager?schema=public"
   JWT_SECRET="your_super_secret_jwt_key_here"
   FRONTEND_URL="http://localhost:5173"
   NODE_ENV="development"
   ```
   *(Be sure to replace the `DATABASE_URL` credentials with your actual Postgres setup)*
4. Run Prisma migrations to set up your database schema:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:5173` in your browser.

---

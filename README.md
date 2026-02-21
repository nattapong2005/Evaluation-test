# Employee Evaluation System (ระบบประเมินบุคลากร)

A modern, full-stack web application designed for managing and conducting employee evaluations. The system features a role-based architecture supporting Administrators, Evaluators, and Evaluatees, alongside a beautiful, responsive user interface.

## 🚀 Features

### 👤 Role-Based Access Control
- **Administrator (ADMIN)**: Full access to the system overview, user management, and evaluation lifecycle.
- **Evaluator (EVALUATOR)**: Can view assigned evaluatees and submit performance evaluations.
- **Evaluatee (EVALUATEE)**: Can view their own evaluation results and pending assignments.

### 📊 Admin Dashboard
- **Statistics Overview**: Real-time summary cards showing total users, total evaluations, active evaluations, and total assignments.
- **Interactive Visualizations**: 
  - Bar charts displaying assignments and topics per evaluation.
  - Pie charts showcasing user role distributions.
- **Evaluation Management**: Create new evaluation forms, define topics, and set measurable indicators with specific weights and scoring types (1-4 Scale, Yes/No).
- **User & Assignment Management**: Add, edit, remove users, and assign evaluators to evaluatees seamlessly.

### 🎨 Modern UI/UX
- Responsive sidebar navigation layout integrated comprehensively.
- Clean and intuitive design using modern aesthetics (subtle shadows, clean typography).
- Toast notifications and interactive confirmations (using SweetAlert2).

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Alerts**: [SweetAlert2](https://sweetalert2.github.io/)
- **Session**: JS-Cookie for JWT session management

### Backend
- **API Framework**: Node.js with [Express](https://expressjs.com/)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database**: Relational DB configured via Prisma

## 📂 Project Structure

- `/frontend` - Next.js frontend application 
  - `/app/dashboard` - Core application views featuring separated role-based routing (`/admin`, `/evaluator`, `/evaluatee`).
  - `/components` - Reusable UI components including the new `Sidebar`.
- `/backend` - Express API server including Controllers, Routes, and Prisma schema definitions.

## 💻 Running the Application Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Setup Backend
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure your `.env` file with your `DATABASE_URL` and `JWT_SECRET`.
4. Run Prisma database migrations: `npx prisma migrate dev`
5. Start the API server: `npm run dev`

### 2. Setup Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Next.js development server: `npm run dev`

### 3. Access the Application
Open your browser and navigate to `http://localhost:3000`. 
(Ensure the backend is running concurrently on its designated port, usually 5000 or 8080).

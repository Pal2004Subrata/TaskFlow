# 🚀 TaskFlow

TaskFlow is a modern, beautifully designed task management and team collaboration platform built with the MERN stack. It allows teams to organize their work in collaborative workspaces, manage tasks with a Kanban-style board, chat in real-time, and stay on top of deadlines with an integrated notification system.

## ✨ Features

### 🏢 Workspaces & Collaboration
- **Create Workspaces**: Organize your projects into isolated workspaces.
- **Invite Members**: Invite your team members using their email addresses (Workspace Admins only).
- **Team Chat**: Real-time workspace chat featuring WhatsApp-style message replies and `@` user mentions.

### 📋 Task Management (Kanban)
- **Visual Board**: Manage tasks across "To Do", "In Progress", and "Done" columns.
- **Granular Permissions**: Only the Task Creator or the Assignee can edit a task. Assignees are restricted to only updating the task's status.
- **Details**: Set priorities (Low, Medium, High), assign users, and set due dates.

### 🔔 Notifications & Reminders
- **Smart Notifications**: Get notified instantly when you are mentioned in a chat or assigned to a new task.
- **Deadline Reminders**: An automated backend cron-job checks for tasks due within 24 hours and sends you a reminder.
- **Notification Center**: A clean, animated dropdown bell icon in the navigation bar to mark notifications as read or clear them all at once.

### 🎨 Premium UI/UX
- Built with **Tailwind CSS** and **Framer Motion** for smooth, micro-animated interactions.
- Beautiful glassmorphism effects, custom scrollbars, and modern typography.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Framer Motion (Animations)
- React Query (Data Fetching & Caching)
- React Router DOM
- React Hook Form & Zod (Validation)
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- MongoDB (Mongoose)
- JWT (JSON Web Tokens) for Authentication
- Node-cron (Background task scheduler)
- Express Rate Limit (Security)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/Pal2004Subrata/TaskFlow.git
cd TaskFlow
```

### 2. Setup the Backend
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Open the App
Navigate to `http://localhost:5173` in your browser to start using TaskFlow!

---

## 🔒 Security & Permissions
- Rate limiting is enabled on authentication routes to prevent brute-force attacks.
- Passwords are securely hashed before saving to the database.
- Strict API-level authorization ensures users can only access workspaces they are members of, and can only edit tasks they have permission to modify.

---

## 📄 License
This project is open-source and available under the MIT License.

# CD-STAR – Centralized Digital Platform for Student Activity Records

CD-STAR is a role-based MERN application that lets students upload achievements, teachers verify them, and admins manage users and institutional data. It ships with a JWT-secured Express API, a Vite + Tailwind dashboard UI, and a simple Context API state layer.

## Project structure

```
MERNproject
├── client/             # React + Vite frontend
├── server/             # Express + MongoDB backend
├── package.json        # root scripts (dev, client, server)
└── README.md
```

## Backend (server/)

- **Tech**: Express, Mongoose, JWT, Multer, bcrypt, CORS, Morgan.
- **Models**: `User`, `Activity`, `Academics`, `Attendance`.
- **Auth**: `/api/auth/register`, `/api/auth/login` with JWT + role middleware.
- **Student APIs**: list/add activities, fetch profile (academics + attendance).
- **Teacher APIs**: list pending activities, approve/reject submissions.
- **Admin APIs**: list/add/delete users.
- **Uploads**: Multer stores PDF/image certificates under `server/uploads/`.

Create a `server/.env` file (or export the variables) using `server/env.example`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cdstar
JWT_SECRET=supersecretkey
```

Run the backend:

```
cd server
npm install
npm run dev
```

## Frontend (client/)

- **Tech**: React (Vite), Tailwind CSS, React Router, Axios, Context API.
- **Features**:
  - Student dashboard, upload form, activity list with filters, profile view.
  - Teacher overview + pending approvals with approve/reject actions.
  - Admin overview + user management (add/delete).
  - Protected routes via `<ProtectedRoute>` and shared `<DashboardLayout>`.
  - Axios instance with base URL + auth header, global auth context with persistence.

Configure optional `.env` in `client/` if API URL differs:

```
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:

```
cd client
npm install       # already run during scaffolding, run again if needed
npm run dev
```

## Root scripts

From the repository root you can run everything at once:

```
npm install                 # installs root-only tools (concurrently)
npm run dev                 # runs client + server together
npm run client              # frontend only
npm run server              # backend only
```

## API summary

| Role     | Method & Route                          | Description                          |
| -------- | --------------------------------------- | ------------------------------------ |
| Auth     | `POST /api/auth/register`               | Register a new user (default student)|
|          | `POST /api/auth/login`                  | Login and get JWT                    |
| Student  | `GET /api/student/activities`           | List own activities (with filters)   |
|          | `POST /api/student/activity/add`        | Upload new activity + certificate    |
|          | `GET /api/student/profile`              | Profile + academics + attendance     |
| Teacher  | `GET /api/teacher/activities/pending`   | Pending activities to verify         |
|          | `PUT /api/teacher/activity/approve/:id` | Approve activity                     |
|          | `PUT /api/teacher/activity/reject/:id`  | Reject activity                      |
| Admin    | `GET /api/admin/users`                  | List users (optional `?role=` filter)|
|          | `POST /api/admin/user/add`              | Create user (student/teacher/admin)  |
|          | `DELETE /api/admin/user/delete/:id`     | Remove user                          |

## Development tips

- Tailwind is pre-configured; use the utility classes defined in `client/src/index.css`.
- Axios automatically injects the JWT token stored by the AuthContext.
- Uploaded files are served from `http://SERVER/uploads/...`; the frontend normalizes the URL.
- Extend models & routes as needed (e.g., add charts or analytics on the admin dashboard).

Happy building! 🎓


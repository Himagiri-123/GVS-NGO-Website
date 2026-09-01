# GVS NGO Website (Grameena Vikas Sangam)

A full-stack website built for GVS, an NGO working on education, skill development, and community welfare initiatives. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Public site: home, initiatives, gallery, success stories, news ticker, donate, contact, join us
- Admin dashboard: manage staff, students, initiatives, reports, accounts, bank details, volunteers, success stories, homepage content
- Staff dashboard for computer teachers / VVK instructors
- Role-based authentication (JWT) with admin and staff roles
- Single-session login lock (prevents the same account being logged in from two places at once)
- Image uploads via Cloudinary
- Email notifications (Nodemailer)

## Tech Stack

- **Frontend:** React, React Router, SweetAlert2
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Cloudinary, Nodemailer

## Project Structure

```
GVS-NGO-Website/
├── backend/
│   ├── config/        # DB connection, Cloudinary config
│   ├── controllers/    # Route logic
│   ├── middlewares/    # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/           # API routes
│   └── server.js         # Entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/    # Reusable UI + admin manager components
        ├── pages/          # Page-level components
        └── config/api.js   # Centralized API URL config
```

## Getting Started (Local Setup)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your own values
npm start
```

Backend runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # REACT_APP_API_URL=http://localhost:5000
npm start
```

Frontend runs on `http://localhost:3000`.

### 3. Create the first admin account

```bash
cd backend
node seedAdmin.js
```

This creates an admin login using the email/password set in `seedAdmin.js`. **Change the password immediately after logging in.**

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list of required variables. Never commit real `.env` files — they're already excluded via `.gitignore`.

## Deployment

- **Frontend:** deployed on Vercel
- **Backend:** deployed on Render — **live at https://gvs-ngo-website.onrender.com**
- **Database:** MongoDB Atlas

When deploying, set `REACT_APP_API_URL` on the frontend host (Vercel → Project → Settings → Environment Variables) to your live backend URL, and add all backend `.env` values as environment variables on Render.

> **Note on Render's free tier:** the backend "sleeps" after ~15 minutes of no traffic. The first request after that can take 30-50 seconds to wake it up (later requests are fast). This is normal for Render's free tier, not a bug — a paid tier removes this delay if it ever becomes a problem.

## License

Built for Grameena Vikas Sangam (GVS) NGO, Srikakulam.

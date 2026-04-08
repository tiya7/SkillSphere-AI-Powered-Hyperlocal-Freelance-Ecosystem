# SkillSphere — Intelligent Hyperlocal Freelance Ecosystem

Full-stack MERN platform connecting clients with freelancers.  
Built for the **Nayoda Full Stack Development Internship** — Project review: **08 April 2026**

---

## Project Structure

```
skillsphere/
├── client/               # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/         ProtectedRoute, PublicOnlyRoute
│       │   ├── dashboard/    StatsCard, ActivityFeed, QuickActions
│       │   ├── layout/       DashboardLayout, Sidebar, Topbar
│       │   └── profile/      AvatarUpload
│       ├── hooks/            useAuth
│       ├── pages/            Login, Register, Dashboard, Profile, AuthHelpers
│       ├── store/            Redux Toolkit store + slices
│       ├── styles/           global.css design system
│       └── utils/            axios api instance
└── server/               # Node/Express backend
    ├── config/           db.js, cloudinary.js
    ├── controllers/      authController, profileController
    ├── middleware/        auth (JWT + RBAC), error handler
    ├── models/           User, Freelancer, Client
    ├── routes/           /api/auth, /api/profile
    └── utils/            jwt helpers, email (nodemailer)
```

---

## Week-by-Week Build Plan

| Week | Backend | Frontend | Status |
|------|---------|----------|--------|
| **1** | Auth system, RBAC, Profile APIs | Login/Register, Dashboard, Profile pages | ✅ **Done** |
| **2** | Gig APIs, Proposal system, Search APIs | Gig marketplace UI, Proposal submission | 🔜 Next |
| **3** | Socket.IO chat, Reviews, Notifications | Messaging interface, Review UI | 🔜 |
| **4** | Payment integration, Admin APIs | Payment UI, Admin dashboard | 🔜 |

---

## Quick Start

### 1. Clone / extract the project

```bash
cd skillsphere
```

### 2. Set up environment variables

**Server:**
```bash
cd server
cp .env.example .env
# Edit .env — fill in MONGO_URI, JWT_SECRET, Google OAuth, Cloudinary, Email
```

**Client:**
```bash
cd client
cp .env.example .env
# Edit .env — add your REACT_APP_GOOGLE_CLIENT_ID
```

### 3. Install dependencies

```bash
# From project root
npm run install:all
```

### 4. Run in development

```bash
# From project root — starts both server (5000) and client (3000)
npm run dev
```

Or run individually:
```bash
npm run dev:server    # Express on :5000
npm run dev:client    # React on :3000
```

---

## API Endpoints (Week 1)

### Auth  `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register (client or freelancer) |
| POST | `/login` | Login with email + password |
| POST | `/google` | Google OAuth sign-in |
| GET  | `/verify-email/:token` | Verify email address |
| POST | `/resend-verification` | Resend verification email |
| POST | `/forgot-password` | Request password reset email |
| PUT  | `/reset-password/:token` | Reset password with token |
| POST | `/refresh-token` | Refresh access token (cookie) |
| POST | `/logout` | Clear session |
| GET  | `/me` | Get current user (protected) |
| POST | `/2fa/setup` | Get 2FA QR code (protected) |
| POST | `/2fa/enable` | Enable 2FA after OTP verify (protected) |
| POST | `/2fa/disable` | Disable 2FA (protected) |
| POST | `/2fa/verify-login` | Complete 2FA login |

### Profile  `/api/profile`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/me` | Get full profile (protected) |
| PUT  | `/update` | Update name, bio, location, phone |
| POST | `/avatar` | Upload avatar image (Cloudinary) |
| PUT  | `/change-password` | Change password |
| PUT  | `/freelancer` | Update freelancer profile (freelancer only) |
| POST | `/resume` | Upload resume PDF (freelancer only) |
| PUT  | `/client` | Update client profile (client only) |
| GET  | `/freelancer/:id` | Get public freelancer profile |

---

## MongoDB Collections (Week 1)

- **Users** — base auth for all roles (client/freelancer/admin)
- **Freelancers** — skills, portfolio, certifications, work experience, rates
- **Clients** — company info, preferences, spend history

---

## Tech Stack

**Frontend:** React 18, Redux Toolkit, React Router v6, React Hook Form, Axios, Socket.IO client, Recharts, Lucide icons, React Hot Toast  
**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, Socket.IO, JWT, bcryptjs  
**Integrations:** Google OAuth, Cloudinary (files), Nodemailer (email), Razorpay/Stripe (Week 4)  
**Auth:** JWT access tokens + httpOnly refresh token cookies, Google OAuth, 2FA (TOTP via otplib)

---

## Key Features Implemented (Week 1)

- ✅ Multi-role auth: Client, Freelancer, Admin
- ✅ JWT authentication with refresh token rotation
- ✅ Google OAuth2 login
- ✅ Email verification system
- ✅ Password reset with secure tokens
- ✅ Two-Factor Authentication (TOTP / QR code)
- ✅ Role-Based Access Control (RBAC) middleware
- ✅ Rate limiting on all auth endpoints
- ✅ Freelancer professional profiles (skills, portfolio, certifications, experience)
- ✅ Client profiles (company info, preferences)
- ✅ Cloudinary avatar & resume upload
- ✅ Role-specific dashboards (client vs freelancer)
- ✅ Responsive sidebar layout with mobile support
- ✅ Design system with CSS variables

# 🗂️ ComplaintDesk — Full-Stack Complaint Management System

A complete, production-ready complaint management system built as a **single Next.js project** (frontend + backend in one). No separate servers needed — just one command to run everything.

---

## ⚡ Tech Stack (Capstone Guide Compliant)

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** |
| UI Components | **shadcn/ui** |
| Forms | **React Hook Form + Zod** |
| State | **Zustand** (with localStorage persistence) |
| HTTP Client | **Axios** |
| Database | **MongoDB Atlas** (Mongoose ODM) |
| Auth | **JWT** (jsonwebtoken + bcryptjs) |
| Logging | **Winston** |
| Package Manager | **npm** |
| Hosting | **Vercel** (ready) |

---

## 📁 Project Structure

```
complaintdesk/
├── src/
│   ├── app/
│   │   ├── api/                        ← Backend API Routes
│   │   │   ├── auth/
│   │   │   │   ├── signup/route.ts     ← POST /api/auth/signup
│   │   │   │   └── login/route.ts      ← POST /api/auth/login
│   │   │   └── complaints/
│   │   │       ├── route.ts            ← GET + POST /api/complaints
│   │   │       ├── all/route.ts        ← GET /api/complaints/all (admin)
│   │   │       └── [id]/route.ts       ← PUT /api/complaints/:id (admin)
│   │   ├── auth/
│   │   │   ├── login/page.tsx          ← Login page
│   │   │   └── signup/page.tsx         ← Signup page
│   │   ├── dashboard/page.tsx          ← User dashboard
│   │   ├── submit/page.tsx             ← Submit complaint
│   │   ├── admin/page.tsx              ← Admin dashboard
│   │   ├── layout.tsx                  ← Root layout
│   │   ├── page.tsx                    ← Root redirect
│   │   └── globals.css                 ← Global styles
│   ├── components/
│   │   ├── ui/                         ← shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── badge.tsx
│   │   ├── Navbar.tsx                  ← Top navigation
│   │   └── StatusBadge.tsx             ← Color-coded status pill
│   ├── lib/
│   │   ├── db.ts                       ← MongoDB connection (cached)
│   │   ├── auth.ts                     ← JWT sign/verify helpers
│   │   ├── axios.ts                    ← Axios instance
│   │   ├── validators.ts               ← Zod schemas (shared)
│   │   ├── logger.ts                   ← Winston logger
│   │   └── utils.ts                    ← shadcn/ui cn() helper
│   ├── models/
│   │   ├── User.ts                     ← Mongoose User model
│   │   └── Complaint.ts                ← Mongoose Complaint model
│   ├── store/
│   │   └── authStore.ts                ← Zustand auth state
│   └── types/
│       └── index.ts                    ← All TypeScript types
├── .env.local                          ← Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Setup — Run in 3 Steps

### Step 1 — Extract the ZIP

Extract `complaintdesk.zip` anywhere on your computer. You will get a folder called `complaintdesk`.

---

### Step 2 — Set up Environment Variables

Inside the `complaintdesk` folder, find the file called `.env.local`.

It already contains your MongoDB connection. **No changes needed** — it's pre-configured:

```env
MONGODB_URI=mongodb+srv://admin:admin@projectfs.3nytdhj.mongodb.net/complaint_system?retryWrites=true&w=majority&appName=Projectfs
JWT_SECRET=complaintdesk_super_secret_jwt_key_2025
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ Make sure MongoDB Atlas Network Access allows `0.0.0.0/0` (see troubleshooting below)

---

### Step 3 — Install & Run

Open a terminal inside the `complaintdesk` folder and run:

```bash
# Install all dependencies
npm install

# Start the development server
npm run dev
```

Open your browser → **http://localhost:3000**

That's it! ✅ **One terminal, one command, everything runs.**

---

## 🧪 How to Use the App

### As a User
1. Go to `http://localhost:3000/auth/signup`
2. Sign up with your email, password, select **"User"**
3. Submit complaints from the dashboard
4. Track your complaint status in real time

### As an Admin
1. Go to `http://localhost:3000/auth/signup`
2. Sign up and select **"Admin"** from the dropdown
3. View **all complaints** from all users
4. Update complaint status using the dropdown (Pending → In Progress → Resolved)

---

## 📡 API Endpoints

All endpoints are Next.js API Routes — no separate backend server needed.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register new account | Public |
| `POST` | `/api/auth/login` | Login & get JWT token | Public |
| `POST` | `/api/complaints` | Submit a complaint | User |
| `GET` | `/api/complaints` | Get my complaints | User |
| `GET` | `/api/complaints/all` | Get ALL complaints | Admin |
| `PUT` | `/api/complaints/:id` | Update status | Admin |

---

## 🔐 Authentication Flow

```
User enters email + password
       ↓
Next.js API Route validates with Zod
       ↓
Mongoose checks MongoDB Atlas
       ↓
bcryptjs compares password hash
       ↓
JWT token signed and returned
       ↓
Zustand stores token in localStorage
       ↓
Axios auto-attaches token to all future requests
```

---

## 🗄️ Database Schema

### User Collection
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `email` | String | Unique, required |
| `password` | String | bcrypt hashed, never returned |
| `role` | Enum | `"user"` or `"admin"` |
| `createdAt` | Date | Auto timestamp |

### Complaint Collection
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `userId` | ObjectId | Reference to User |
| `title` | String | Max 100 chars |
| `description` | String | Max 1000 chars |
| `status` | Enum | `Pending` / `In Progress` / `Resolved` |
| `createdAt` | Date | Auto timestamp |

---

## 🚨 Troubleshooting

### ❌ "Failed to connect to MongoDB"
**Fix:** Go to MongoDB Atlas → Network Access → Add IP `0.0.0.0/0`

```
https://cloud.mongodb.com
→ Network Access
→ + ADD IP ADDRESS
→ ALLOW ACCESS FROM ANYWHERE (0.0.0.0/0)
→ Confirm
```

### ❌ "Module not found" errors
**Fix:** You may have missed `npm install`
```bash
npm install
```

### ❌ Page shows but login/signup fails
**Fix:** Check browser console (F12) for error details. Most likely MongoDB Atlas IP issue (see above).

### ❌ `.env.local` file not found
**Fix:** The file might be hidden. Enable "Show hidden files" in your file explorer, or manually create `.env.local` with these contents:
```env
MONGODB_URI=mongodb+srv://admin:admin@projectfs.3nytdhj.mongodb.net/complaint_system?retryWrites=true&w=majority&appName=Projectfs
JWT_SECRET=complaintdesk_super_secret_jwt_key_2025
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ☁️ Deploy to Vercel (Free)

1. Push your code to GitHub
2. Go to **https://vercel.com** → Import project
3. Add these environment variables in Vercel dashboard:
   - `MONGODB_URI` → your Atlas connection string
   - `JWT_SECRET` → your secret key
4. Click **Deploy**

Done! Your app is live. 🎉

---

## 🔮 Future Scope

- 📧 Email notifications when complaint status changes
- 📱 React Native mobile app
- 📊 Admin analytics dashboard with charts
- ⚡ Redis caching for fast queries
- 📎 File attachment support for complaints
- 🔔 Real-time push notifications

---

**Built with ❤️ using Next.js 14, TypeScript, MongoDB, shadcn/ui, Zustand, Axios, Zod & Winston**

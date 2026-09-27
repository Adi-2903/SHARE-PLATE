# 🍽️ SharePlate — Smart Near-Expiry Food Rescue & Redistribution Platform

> A full-stack MERN web application connecting restaurants, hostels, and cafeterias with NGOs and volunteers to rescue near-expiry food before it's wasted.

---

## 📸 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | **React JS** + **Vite**             |
| Styling   | **Tailwind CSS v4**                 |
| Routing   | **React Router DOM v7**             |
| HTTP      | **Axios**                           |
| Backend   | **Node.js** + **Express.js**        |
| Database  | **MongoDB** + **Mongoose**          |
| Auth      | **JWT** + **bcryptjs**              |
| State     | **React Context API**               |
| Alerts    | **react-hot-toast**                 |
| Icons     | **lucide-react**                    |

---

## 🔄 Core Rescue Pipeline

```
Food Donation Created
       ↓
System Checks Expiry Time  →  < 4h = 🔴 URGENT  |  4–8h = 🟡 MODERATE  |  > 8h = 🟢 SAFE
       ↓
Nearby NGOs Ranked by Proximity + Capacity
       ↓
Urgent Food Gets Higher Priority Notification
       ↓
NGO Claims Donation  →  Volunteer Pickup Assigned
       ↓
Admin Tracks All Rescued Food Statistics
```

---

## 👥 Role-Based Access

| Role      | Portal Route  | Capabilities                              |
|-----------|---------------|-------------------------------------------|
| 🏪 Donor  | `/donate`     | Create donations, view history            |
| 🏥 NGO    | `/ngo`        | Claim donations, track pickups            |
| 🚴 Volunteer | `/volunteer` | Accept pickups, earn badges, leaderboard |
| 🛡️ Admin  | `/admin`      | Full analytics, user & donation mgmt      |

---

## 📁 Project Structure

```
Innovative project/
├── src/                        ← React Frontend
│   ├── api/
│   │   └── axios.js            ← Axios API client with JWT interceptor
│   ├── context/
│   │   └── AuthContext.jsx     ← Auth state (login/register/logout)
│   ├── components/
│   │   └── Navbar.jsx          ← Responsive navbar (role-based links)
│   ├── pages/
│   │   ├── Home.jsx            ← Landing page (animated, live feed)
│   │   ├── Login.jsx           ← JWT login with role-based redirect
│   │   ├── Register.jsx        ← Registration with role selection
│   │   ├── DonatePage.jsx      ← Donor form → POST /api/donations
│   │   ├── DonationsBoard.jsx  ← Public board with filter + claim
│   │   ├── NGODashboard.jsx    ← NGO claim dashboard
│   │   ├── VolunteerDashboard.jsx ← Volunteer pickups + badges
│   │   └── AdminDashboard.jsx  ← Full admin analytics + tables
│   ├── App.jsx                 ← Router + Protected routes
│   ├── main.jsx                ← React DOM entry
│   └── index.css               ← Tailwind + custom animations
│
├── server/                     ← Express Backend
│   ├── models/
│   │   ├── User.js             ← User schema (roles, bcrypt hash)
│   │   └── Donation.js         ← Donation schema (auto priority)
│   ├── controllers/
│   │   ├── authController.js   ← register, login, getMe
│   │   └── donationController.js ← CRUD + claim + assign + deliver
│   ├── routes/
│   │   ├── auth.js             ← /api/auth
│   │   ├── donations.js        ← /api/donations
│   │   ├── ngos.js             ← /api/ngos
│   │   ├── volunteers.js       ← /api/volunteers
│   │   └── admin.js            ← /api/admin (protected)
│   ├── middleware/
│   │   └── authMiddleware.js   ← JWT protect + role authorize
│   ├── index.js                ← Express server entry
│   ├── .env                    ← MongoDB URI + JWT secret
│   └── package.json
│
├── vite.config.js              ← Vite + Tailwind + API proxy
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

---

### 1. Clone / Open Project
```bash
cd "FULL Stack/Innovative project"
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
```

### 4. Configure Environment
Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/shareplate
JWT_SECRET=shareplate_super_secret_key_2026
PORT=5000
```
> For MongoDB Atlas, replace MONGO_URI with your Atlas connection string.

### 5. Run Backend
```bash
cd server
npm run dev        # Uses nodemon for hot-reload
```
Server starts at: **http://localhost:5000**

### 6. Run Frontend (separate terminal)
```bash
# In project root
npm run dev
```
Frontend starts at: **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint                        | Access       | Description                  |
|--------|---------------------------------|--------------|------------------------------|
| POST   | `/api/auth/register`            | Public       | Register user                |
| POST   | `/api/auth/login`               | Public       | Login, returns JWT           |
| GET    | `/api/auth/me`                  | Protected    | Get current user             |
| GET    | `/api/donations`                | Public       | List all donations           |
| GET    | `/api/donations/stats`          | Public       | Platform stats               |
| POST   | `/api/donations`                | Donor/Admin  | Create donation              |
| PATCH  | `/api/donations/:id/claim`      | NGO/Admin    | Claim donation               |
| PATCH  | `/api/donations/:id/assign`     | NGO/Admin    | Assign volunteer             |
| PATCH  | `/api/donations/:id/deliver`    | Vol/Admin    | Mark delivered               |
| GET    | `/api/ngos/my-claims`           | NGO          | NGO's claimed donations      |
| GET    | `/api/volunteers/my-pickups`    | Volunteer    | Volunteer's pickups          |
| GET    | `/api/admin/stats`              | Admin        | Full platform statistics     |
| GET    | `/api/admin/users`              | Admin        | All registered users         |
| DELETE | `/api/admin/donations/:id`      | Admin        | Delete a donation            |

---

## ✨ Key Features

- ⚡ **Smart Urgency System** — auto-flags donations expiring < 4h as URGENT
- 📍 **Priority NGO Ranking** — sorted by urgency, proximity
- ⏱️ **Live Countdown Timers** — real-time expiry tracking
- 🔐 **JWT Role-Based Auth** — donor / NGO / volunteer / admin
- 📊 **Admin Analytics** — charts, tables, user management
- 🏅 **Volunteer Gamification** — badges, city leaderboard, impact stats
- 🌙 **Dark Theme UI** — Tailwind CSS glassmorphism aesthetic
- 📱 **Fully Responsive** — mobile, tablet and desktop

---

## 🌍 GitHub Deployment

```bash
git init
git add .
git commit -m "🍽️ SharePlate - Full Stack Food Rescue Platform"
git remote add origin https://github.com/YOUR_USERNAME/shareplate.git
git push -u origin main
```

---

## 👨‍💻 Author

**Full Stack Innovative Project** — SharePlate  
Built with the MERN Stack (MongoDB, Express, React, Node.js)  
© 2026

<div align="center">

# ⚡ Shortly — Distributed URL Shortener

<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=nginx&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
<img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />

<br/>
<br/>

**A production-grade, distributed URL shortener with real-time analytics,
QR code generation, user authentication, and a powerful admin panel.**

<br/>

### 🌐 [Live Demo](https://usrl-shortener-frontend.vercel.app/) &nbsp;&nbsp;|&nbsp;&nbsp; 📡 [API Health](https://url-shortener-75cy.onrender.com/api/health) &nbsp;&nbsp;|&nbsp;&nbsp; 📖 [API Docs](#-api-reference)

<br/>



</div>



## ✨ Features

### 🔗 URL Management
- ⚡ **Instant URL shortening** — No login required for basic use
- 🎯 **Custom aliases** — Choose your own short code (e.g. `shortly.app/my-link`)
- ⏳ **Expiration dates** — Set auto-expiry on any link
- ✏️ **Full CRUD** — Edit destination, title, status anytime
- 🔄 **Toggle active/inactive** — Pause links without deleting
- 📋 **One-click copy** — Copy short URL instantly

### 📊 Analytics & Tracking
- 📈 **Click tracking** — Every redirect is tracked in real-time
- 📅 **Clicks over time** — Visual bar chart (7 / 14 / 30 / 60 / 90 days)
- 🖥️ **Device breakdown** — Desktop, Mobile, Tablet
- 🌐 **Browser stats** — Chrome, Firefox, Safari, Edge, etc.
- 💻 **OS breakdown** — Windows, macOS, Linux, iOS, Android
- 🔗 **Referrer tracking** — See where traffic comes from
- 👥 **Unique visitors** — Distinct IP tracking
- 📊 **Dashboard overview** — Total URLs, clicks today/7d/30d

### 📱 QR Code Generation
- 🖼️ **PNG format** — High quality, downloadable
- 🔷 **SVG format** — Scalable vector for print
- 📥 **Direct download** — One click save
- 🎨 **Custom colors** — Choose dark/light colors
- 📐 **Custom size** — Set width in pixels

### 🔐 Authentication & Security
- 🔑 **JWT authentication** — Stateless, scalable
- 🔒 **bcrypt password hashing** — 12 salt rounds
- 🛡️ **Rate limiting** — Per route (auth, create, redirect, global)
- 🔐 **Role-based access** — USER and ADMIN roles
- 🚫 **Reserved word blocking** — Prevents alias conflicts
- 🔄 **Auto token refresh** — 401 interceptor

### 🛡️ Admin Panel
- 📊 **System stats** — Real-time platform metrics
- 👥 **User management** — List, search, view details
- 🚫 **Ban / Unban users** — Instant account control
- 👑 **Role management** — Promote/demote users
- 🗑️ **Delete users** — Cascade delete all data
- 🔗 **URL management** — View and manage all URLs
- 🔄 **Toggle any URL** — Activate/deactivate globally
- 🏆 **Leaderboards** — Top URLs and top users

### ⚡ Performance & Reliability
- 🚀 **Redis caching** — Sub-millisecond redirects for hot URLs
- 🔄 **Cache invalidation** — Smart cache refresh on updates
- ♻️ **Cache warming** — Top 50 URLs pre-cached on startup
- 📦 **Background scheduler** — Automated maintenance jobs
- 🗑️ **Auto cleanup** — Expired URLs deactivated hourly
- 📈 **Stat aggregation** — Click stats logged every 5 minutes

---


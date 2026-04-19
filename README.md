# 🔗 Shortly — Distributed URL Shortener

A production-grade URL shortener with analytics, QR codes, and admin panel.

![Tech Stack](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)

## Features

- ✅ URL shortening with custom aliases
- ✅ Link expiration dates
- ✅ Click tracking (device, browser, OS, referrer)
- ✅ Analytics dashboard with charts
- ✅ QR code generation (PNG/SVG/download)
- ✅ User authentication (JWT)
- ✅ Admin panel (manage users, URLs, system stats)
- ✅ Rate limiting (per-route)
- ✅ Redis caching for fast redirects
- ✅ Background job scheduler
- ✅ NGINX reverse proxy ready
- ✅ Docker production deployment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, ShadCN/UI |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 16, Prisma ORM |
| Cache | Redis 7 |
| Auth | JWT + bcrypt |
| State | Zustand |
| Proxy | NGINX |
| Deploy | Docker Compose |

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- Docker Desktop

### 1. Clone & Start Services
```bash
git clone <repo-url>
cd url-shortener
docker-compose up -d   # Starts PostgreSQL + Redis
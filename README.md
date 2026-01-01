# Twin Commerce Monorepo

A modern e-commerce platform with separated frontend and backend.

## 🏗️ Architecture

- **Frontend**: Next.js 16 (React 19) - Port 3001
- **Backend**: NestJS - Port 3000
- **Database**: MySQL with TypeORM
- **Auth**: Better-auth

## 📁 Structure

```
├── frontend/    # Next.js UI application
├── backend/     # NestJS API server
└── MIGRATION.md # Detailed migration documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or pnpm

### 1. Database Setup
Create a MySQL database:
```sql
CREATE DATABASE twin_commerce;
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run start:dev
```

Backend will run on **http://localhost:3000**

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Ensure NEXT_PUBLIC_API_URL points to backend
npm run dev
```

Frontend will run on **http://localhost:3001**

## 🔑 Environment Variables

### Backend `.env`
```env
DATABASE_URL="mysql://user:password@localhost:3306/twin_commerce"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### Frontend `.env`
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

## 📚 Documentation

- **[MIGRATION.md](./MIGRATION.md)** - Detailed migration guide from Next.js API routes to NestJS
- **API Endpoints**: See backend controllers in `backend/src/*/`
- **Components**: See `frontend/components/`

## 🛠️ Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TailwindCSS 4
- React Query (TanStack Query)
- Better-auth React client
- Axios

### Backend
- NestJS
- TypeORM
- Better-auth
- MySQL2
- Multer (file uploads)

## 📝 Available Scripts

### Backend
- `npm run start:dev` - Development mode with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Run production build

### Frontend
- `npm run dev` - Development mode (port 3001)
- `npm run build` - Build for production
- `npm run start` - Run production build

## 🔐 Authentication

Uses **better-auth** for authentication:
- Email/Password signup and login
- Google OAuth
- Session management
- Password reset

## 📦 Features

- ✅ User authentication (email/password + Google)
- ✅ User profile management
- ✅ Avatar upload and management
- ✅ File serving with security checks
- ✅ Session-based authentication
- ✅ CORS-enabled API

## 🤝 Contributing

This is a migrated monorepo. See [MIGRATION.md](./MIGRATION.md) for architecture details.

## 📄 License

Private project

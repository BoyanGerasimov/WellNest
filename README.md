# WellNest

Full-stack fitness and nutrition tracking application built with React, Node.js, Express, and PostgreSQL.

## 🎯 Project Overview

WellNest is a comprehensive fitness tracking platform that includes:
- Workout tracking and progress visualization
- Nutrition logging with calorie tracking
- AI-powered workout and nutrition suggestions
- Community features (forums, chat)
- Achievement system and gamification
- AI Chat Coach for personalized fitness advice
- Predictive analytics for goal forecasting
- Recipe scanner using computer vision

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma
- **Authentication**: JWT + OAuth (Google, GitHub)

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router

### External APIs & Services
- **Nutrition Data**: Nutritionix API
- **AI Chat Coach**: OpenAI API
- **Recipe Scanner**: Google Cloud Vision API
- **OAuth Providers**: Google OAuth, GitHub OAuth

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Supabase account ([Sign up here](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WellNest
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   
   # Update .env with your Supabase DATABASE_URL
   # Generate Prisma Client
   npm run prisma:generate
   ```

3. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   ```

4. **Run Development Servers**

   Backend (from `backend/` directory):
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

   Frontend (from `frontend/` directory):
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`

## 📁 Project Structure

```
WellNest/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── context/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── docs/
│   └── (phase guides)
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT expiration time
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_ENV` - Environment (development/production)

See `.env.example` files in each directory for complete configuration.

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:5000/health
```

### Database Connection Test
```bash
curl http://localhost:5000/api/test-db
```

## 📝 Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep your `JWT_SECRET` secure and use a strong random string
- Use environment variables for all sensitive configuration
- Enable CORS only for trusted domains in production

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details
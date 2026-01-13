# WellNest

Full-stack fitness and nutrition tracking application built with React, Node.js, Express, and PostgreSQL.

## 🌐 Live Application

**WellNest is currently deployed and accessible at:** [https://well-nest-inky.vercel.app/](https://well-nest-inky.vercel.app/)

The application is fully functional and ready to use. You can register a new account or sign in with Google/GitHub OAuth to start tracking your fitness and nutrition journey.

## 🎯 Project Overview

WellNest is a comprehensive fitness tracking platform that provides users with tools to monitor and improve their health and wellness. The application includes:

### ✅ Currently Implemented Features

- **User Authentication & Profiles**
  - JWT-based authentication with secure password hashing
  - OAuth integration (Google and GitHub)
  - User profile management with customizable preferences
  - Onboarding survey for personalized calorie goals

- **Workout Tracking**
  - Create, edit, and delete workout sessions
  - Track exercises with sets, reps, and weights
  - Automatic calorie burn calculations
  - Workout history and progress visualization

- **Nutrition Logging**
  - Log meals with detailed food items
  - Integration with USDA FoodData Central API for accurate nutritional data
  - Track calories, protein, carbs, and fats
  - Meal categorization (breakfast, lunch, dinner, snack)
  - Daily and weekly nutrition summaries

- **Dashboard & Analytics**
  - Comprehensive dashboard with key metrics
  - Visual progress charts and statistics
  - Net calories calculation (intake vs. burned)
  - Health score tracking
  - 30-day progress overview

- **AI Features**
  - AI Chat Coach powered by OpenAI for personalized fitness advice
  - AI-powered workout and nutrition suggestions
  - Contextual recommendations based on user goals

- **Community Features**
  - Forum for discussions and sharing experiences
  - Create, edit, and comment on forum posts
  - Like posts and engage with the community
  - Categorized discussions (workout, nutrition, motivation, etc.)

- **Achievements & Gamification**
  - Achievement system with unlockable badges
  - Points and milestones tracking
  - Progress rewards and motivation

- **Performance Optimizations**
  - Code splitting and lazy loading for faster page loads
  - API response caching with sessionStorage
  - Component preloading for improved navigation
  - Responsive design optimized for mobile and desktop

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (hosted on Railway)
- **ORM**: Prisma
- **Authentication**: JWT + OAuth (Google, GitHub)

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router

### External APIs & Services
- **Nutrition Data**: [USDA FoodData Central API](https://fdc.nal.usda.gov/) - For accurate food database and nutritional information
- **AI Chat Coach**: [OpenAI API](https://openai.com/api) - For personalized fitness and nutrition advice
- **OAuth Providers**: Google OAuth, GitHub OAuth - For secure social authentication

### Deployment
- **Frontend**: [Vercel](https://vercel.com) - [Live Site](https://well-nest-inky.vercel.app/)
- **Backend**: [Railway](https://railway.app) - RESTful API server
- **Database**: [Railway](https://railway.app) - PostgreSQL database with Prisma ORM

## 🚀 Getting Started

> **Note:** The application is already deployed and available at [https://well-nest-inky.vercel.app/](https://well-nest-inky.vercel.app/). The following instructions are for local development setup.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- PostgreSQL database (local or hosted on Railway)
- USDA FoodData Central API key ([Get free API key](https://fdc.nal.usda.gov/api-key-signup.html))

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
   
   # Update .env with your PostgreSQL DATABASE_URL (Railway or local)
   # Add USDA_API_KEY for nutrition data (optional but recommended)
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
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string (Railway or local)
- `DIRECT_URL` - Direct PostgreSQL connection string (for migrations)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT expiration time
- `FRONTEND_URL` - Frontend URL for CORS
- `USDA_API_KEY` - USDA FoodData Central API key (optional, but recommended for higher rate limits)
- `OPENAI_API_KEY` - OpenAI API key for AI Chat Coach
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret

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
- `npm run dev` - Start development server (runs on `http://localhost:5173`)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🚢 Deployment

The application is currently deployed:

- **Frontend**: Deployed on Vercel at [https://well-nest-inky.vercel.app/](https://well-nest-inky.vercel.app/)
- **Backend**: Deployed on Railway (or similar platform)
- **Database**: Hosted on Supabase

The production environment uses environment variables for all sensitive configuration, including API keys, database connections, and OAuth credentials.

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep your `JWT_SECRET` secure and use a strong random string
- Use environment variables for all sensitive configuration
- Enable CORS only for trusted domains in production

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

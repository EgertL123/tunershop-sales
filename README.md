# Tunershop Sales Management System

A web application specifically made for an ingame company named Tunershop where affiliated users can manage their sales. Project features authentication via Discord and realtime updates to tables.

## Features

- **Realtime Sales Tracking** - Track vehicle sales with instant updates across all connected users
- **Employee Management** - Manage employee profiles
- **Automated Salary Calculation** - Calculate salaries based on vehicle price and employee rank
- **Discord Authentication** - Secure login via Discord OAuth
- **Role-Based Access Control** - Different permissions for CEO, accountant and regular employees
- **Stock Management** - Track vehicle stock for S and A class vehicles
- **Special Orders** - Manage custom vehicle orders separately from regular sales
- **Statistics Dashboard** - Realtime analytics and performance metrics
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Real-time**: WebSocket subscriptions
- **Notifications**: React Hot Toast
- **Routing**: React Router v7

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/egertl123/tunershop-sales.git
cd tunershop-sales
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DISCORD_GUILD_ID=your_discord_guild_id
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── screens/          # Page components (Dashboard, Admin, Salaries, etc.)
├── components/       # Reusable UI components
├── layouts/          # Layout wrappers
├── hooks/            # Custom React hooks
├── services/         # Business logic (Supabase, Toast notifications)
├── App.tsx           # Main app with routing
└── main.tsx          # Entry point
```

## Key Pages

- **Dashboard** (`/dashboard`) - Main sales table with realtime updates
- **Discounts** (`/discounts`) - Discounts for company employees that have a cooperation agreement with Tunershop 
- **Admin** (`/admin`) - User management and permissions
- **Salaries** (`/salaries`) - Weekly salary calculations
- **Statistics** (`/statistics`) - Analytics and performance metrics
- **Stock** (`/stock`) - Vehicle stock management
- **Special Orders** (`/special-orders`) - Special order tracking
- **Profile** (`/profile`) - User profile

## Security

- Row Level Security (RLS) policies on all database tables
- Discord OAuth 2.0 authentication
- Bearer token authorization
- Guild membership verification

## Deployment

The app is configured for GitHub Pages deployment:

```bash
npm run build
npm run deploy
```

Custom domain setup via CNAME file.

## Support

For questions or issues, please contact @EgertL123 on GitHub.


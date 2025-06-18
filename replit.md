# Material Trader - Multiplayer Crafting Game

## Overview

Material Trader is a real-time multiplayer crafting and trading game built with a React frontend and Node.js backend. Players can click to collect materials, craft items, trade with other players, and participate in a dynamic marketplace. The game features real-time communication through WebSockets and a comprehensive database schema for persistent game state.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSockets for multiplayer interactions
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: React hooks with custom game state management

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Page components
├── server/                 # Node.js backend
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Database operations
│   ├── routes.ts          # API routes and WebSocket handling
│   └── vite.ts            # Development server setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── migrations/            # Database migrations
```

## Key Components

### Frontend Components
- **GamePage**: Main game interface with join screen and game layout
- **GameHeader**: Displays player info, money, and session details
- **GameMainPanel**: Core gameplay with clicker, crafting, and market tabs
- **PlayerSidebar**: Shows online players and recent activities
- **ChatSidebar**: Real-time chat and trade offer management
- **TradeModal**: Direct trading interface between players
- **NotificationSystem**: In-game notifications for discoveries and trades

### Backend Services
- **WebSocket Server**: Handles real-time multiplayer communication
- **Storage Layer**: Abstracted database operations with TypeScript interfaces
- **Session Management**: Game room creation and player state tracking
- **Market System**: Item listing, purchasing, and trade offer management

### Database Schema
- **users**: Player accounts with username, avatar, and online status
- **gameSessions**: Game rooms with configurable player limits
- **playerStates**: Individual player progress, materials, and discoveries
- **marketListings**: Items for sale with seller information and pricing
- **tradeOffers**: Direct trade proposals between players
- **chatMessages**: Real-time chat history per session
- **gameActivities**: Activity feed for player actions

## Data Flow

### Game Session Flow
1. Player joins with username → User created/retrieved
2. Session created/joined → Player state initialized
3. WebSocket connection established → Real-time sync begins
4. Game actions broadcast → All session players receive updates

### Trading Flow
1. Player lists item on market → Market listing created
2. Other players view listings → Real-time market updates
3. Purchase initiated → Money transferred, item delivered
4. Direct trades via trade offers → Negotiated item exchanges

### Crafting System
1. Player clicks to collect basic materials (hydrogen, carbon, oxygen)
2. Materials unlock based on player level and discoveries
3. Item crafting combines materials using predefined recipes
4. Successful crafts unlock new items and increase discovery count

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **ws**: WebSocket server implementation
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI component primitives
- **wouter**: Lightweight React routing

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Build**: `npm run build` (Vite + esbuild)
- **Production**: `npm run start` (compiled JavaScript)
- **Development**: `npm run dev` (tsx with hot reload)
- **Port**: 5000 (mapped to external port 80)

### Database Setup
- PostgreSQL 16 with Drizzle migrations
- Environment variable: `DATABASE_URL` (auto-provisioned)
- Schema push: `npm run db:push`

### Build Process
1. Vite builds React frontend to `dist/public`
2. esbuild compiles server TypeScript to `dist/index.js`
3. Static files served from compiled output
4. Production runs compiled JavaScript with NODE_ENV=production

## Changelog

```
Changelog:
- June 17, 2025: Initial setup - Created multiplayer trading game architecture
- June 17, 2025: Completed multiplayer conversion - Full real-time WebSocket implementation with chat, marketplace, and direct trading
- June 17, 2025: Created single-file version - Complete standalone React component with all multiplayer features
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
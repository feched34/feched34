# Voice Chat Application

## Overview

This is a real-time voice chat application built with React, Express, and LiveKit. The application allows users to join voice rooms, communicate with other participants, and manage their audio settings. It features a modern UI built with shadcn/ui components and uses PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React hooks with custom voice chat hook
- **UI Framework**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for development and production builds
- **Real-time Communication**: LiveKit client SDK for WebRTC voice chat

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Real-time Updates**: WebSocket server for participant state synchronization
- **Voice Infrastructure**: LiveKit server integration for voice communication
- **Session Management**: In-memory storage with interface for future database integration

### Data Storage Solutions
- **Database**: PostgreSQL (configured but using memory storage currently)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database schema management
- **Current Storage**: Memory-based storage implementation with database interface

## Key Components

### Voice Chat Service (`client/src/lib/livekit.ts`)
Manages LiveKit integration for real-time voice communication:
- Connection management to LiveKit rooms
- Audio track publishing and subscription
- Participant event handling
- Mute/unmute functionality

### Voice Chat Hook (`client/src/hooks/use-voice-chat.ts`)
Custom React hook that orchestrates voice chat functionality:
- WebSocket connection for real-time participant updates
- LiveKit service integration
- State management for connection status, participants, and mute state
- Duration tracking for active sessions

### Storage Layer (`server/storage.ts`)
Abstracted storage interface with memory implementation:
- Participant CRUD operations
- Room-based participant queries
- Connection and mute state management
- Ready for database integration

### Database Schema (`shared/schema.ts`)
Drizzle schema defining the data model:
- Participants table with room association
- Connection and mute state tracking
- Timestamp tracking for join events
- Zod validation schemas for type safety

## Data Flow

1. **User Joins Room**: Client submits nickname and room name
2. **Token Generation**: Server creates LiveKit access token with room permissions
3. **Participant Registration**: Server stores participant in storage and broadcasts update
4. **Voice Connection**: Client connects to LiveKit using generated token
5. **Real-time Updates**: WebSocket broadcasts participant state changes
6. **Audio Management**: LiveKit handles audio publishing/subscribing and mute controls

## External Dependencies

### LiveKit Integration
- **Purpose**: WebRTC infrastructure for voice communication
- **Configuration**: API key, secret, and WebSocket URL via environment variables
- **Features**: Room management, audio publishing, participant tracking

### UI Components
- **shadcn/ui**: Modern React component library built on Radix UI
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for UI elements

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and enhanced developer experience
- **Drizzle**: Type-safe database toolkit
- **React Query**: Server state management and caching

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20
- **Database**: PostgreSQL 16 module
- **Hot Reload**: Vite development server with HMR
- **Port Configuration**: Server on port 5000, external port 80

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Autoscale deployment target on Replit
- **Environment**: Production mode with optimized builds

### Configuration
- Database URL required for PostgreSQL connection
- LiveKit credentials (API key, secret, WebSocket URL)
- Node environment detection for development/production modes

## Changelog

```
Changelog:
- June 18, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
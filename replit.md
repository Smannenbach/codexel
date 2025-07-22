# Codexel.ai - AI-Powered Code Development Platform

## Overview

Codexel.ai is a comprehensive AI-powered coding platform designed to democratize software development by making it accessible to both non-technical entrepreneurs and professional development teams. The platform combines multiple AI models, no-code/low-code capabilities, and full-stack development tools in a unified workspace similar to Replit but with enhanced AI orchestration capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

The frontend follows a component-driven architecture with a clear separation between UI components (`/components/ui`), business logic components (`/components/workspace`), and utility functions (`/lib`, `/hooks`).

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with JSON communication
- **File Structure**: Modular service-based architecture separating concerns

The backend implements a clean service layer pattern with dedicated modules for AI orchestration, storage operations, and external service integrations.

### Database and Storage
- **Primary Database**: PostgreSQL via Neon Database (serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migration System**: Drizzle Kit for schema management
- **Connection Pool**: Neon serverless connection pooling

The database schema supports multi-tenant projects, AI agents, message history, and usage tracking with proper relationships and indexing.

## Key Components

### AI Orchestration System
The platform integrates multiple AI providers through a unified orchestration layer:

- **OpenAI GPT-4/GPT-4 Turbo**: Primary reasoning and code generation
- **Anthropic Claude 3.5 Sonnet**: Advanced code analysis and architecture planning
- **Google Gemini Ultra**: Multimodal capabilities and cost-effective processing
- **Moonshot Kimi**: Cost-effective alternative for basic tasks
- **Qwen 2.5 Max**: High-performance, budget-friendly option

Each AI service is abstracted through dedicated service modules (`/server/services/`) allowing for easy model switching and cost optimization.

### Workspace Interface
The frontend implements a sophisticated workspace layout system:

- **Resizable Panels**: Using react-resizable-panels for flexible layout management
- **Chat Interface**: Real-time AI conversation with message history
- **Code Editor**: Integrated development environment (planned Monaco Editor integration)
- **Preview System**: Live preview of generated applications
- **Project Management**: Multi-project support with progress tracking

### Agent System
The platform supports multiple AI agents working collaboratively:

- **Specialized Roles**: Planning, architecture, frontend, backend, testing agents
- **Status Tracking**: Real-time agent status and task completion monitoring
- **Color-coded Interface**: Visual distinction between different agent types
- **Task Orchestration**: Dependency management and sequential task execution

### Deployment System
Comprehensive deployment infrastructure for production-ready applications:

- **One-Click Deployment**: Automated deployment process with progress tracking
- **Multiple Environments**: Support for production, staging, and development
- **Real-time Status**: Live deployment status updates and logs
- **Custom Domains**: Configuration for custom domain deployment

### Template System
Pre-built application templates for rapid development:

- **E-commerce Template**: Complete online store with payment integration
- **AI Chatbot Template**: Real-time chat application with AI integration
- **Checklist Generation**: Auto-generated task lists based on template type
- **Agent Assignment**: Pre-configured specialist agents per template

### Progress Tracking
Advanced project monitoring and analytics:

- **Visual Progress**: Category-based progress visualization
- **Time Tracking**: Elapsed time and velocity metrics
- **Completion Estimates**: AI-driven project completion predictions
- **Task Categorization**: Organized by Planning, Architecture, Design, Development, Testing, Deployment

## Data Flow

### User Interaction Flow
1. User creates or selects a project through the workspace interface
2. Chat messages are sent to the AI orchestration system
3. The orchestrator selects the appropriate AI model based on task type and cost considerations
4. AI responses are processed and stored in the database
5. Real-time updates are reflected in the workspace UI
6. Usage metrics are tracked for billing and optimization

### AI Processing Pipeline
1. **Message Analysis**: Incoming user messages are analyzed to determine task type
2. **Model Selection**: Optimal AI model is chosen based on capability requirements and cost
3. **Context Assembly**: Relevant project context and conversation history are compiled
4. **AI Generation**: Selected model processes the request with appropriate system prompts
5. **Response Processing**: AI output is parsed, validated, and formatted
6. **Storage**: Messages, usage metrics, and project updates are persisted

### Project Development Flow
1. **Requirements Analysis**: AI analyzes user input to extract project requirements
2. **Architecture Planning**: System architecture and technology stack recommendations
3. **Task Breakdown**: Project decomposition into manageable development tasks
4. **Code Generation**: Iterative development with multiple specialized agents
5. **Testing & Validation**: Automated testing and quality assurance
6. **Deployment**: Integrated deployment pipeline (planned)

## External Dependencies

### AI Service Providers
- **OpenAI API**: GPT-4 family models for advanced reasoning
- **Anthropic API**: Claude models for code analysis and writing
- **Google AI API**: Gemini models for multimodal capabilities
- **Moonshot API**: Kimi models for cost-effective processing
- **Qwen API**: High-performance alternative models

### Infrastructure Services
- **Neon Database**: Serverless PostgreSQL for data persistence
- **Vercel**: Frontend hosting and serverless functions (planned)
- **GitHub**: Version control and repository management (planned integration)

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **ESLint & Prettier**: Code quality and formatting
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server for frontend, tsx for backend hot reload
- **Database**: Neon development instance with connection pooling
- **Environment Variables**: Centralized configuration for API keys and database URLs

### Production Deployment
- **Frontend**: Static site generation with Vite build, served via CDN
- **Backend**: Node.js server deployment with PM2 or similar process manager
- **Database**: Neon production instance with optimized connection pooling
- **Monitoring**: Application performance monitoring and error tracking (planned)

### Scaling Considerations
- **Horizontal Scaling**: Stateless backend design enables easy horizontal scaling
- **Database Optimization**: Connection pooling and query optimization for high throughput
- **CDN Integration**: Static asset delivery optimization
- **Caching Strategy**: Redis integration for session management and API response caching (planned)

The architecture is designed to support rapid iteration and scaling from MVP to enterprise-level deployment while maintaining cost efficiency and performance optimization.

## Recent Changes (January 22, 2025)

### Major Architecture Updates
- **Memory System Implementation**: Added Google Cloud Vertex AI integration for perfect memory with embedding search and hive mind capabilities
- **Desktop Automation Service**: Created comprehensive automation framework supporting LinkedIn, GitHub, and 17+ app integrations
- **Prompt Queue System**: Implemented queue management to prevent user interruption and maintain AI context
- **Prompt Assistant**: Built intelligent prompt suggestion system with hover previews for non-technical users
- **Autonomous Panel**: Added centralized control for autonomous workflows and security monitoring

### New Components Added
- `MemoryService`: Google Cloud Vertex AI integration with embedding search and conflict resolution
- `DesktopAutomationService`: Multi-platform automation with security monitoring
- `AutonomousPanel`: Central control interface for autonomous operations
- `PromptQueue`: Queue management system with reordering and status tracking
- `PromptAssistant`: Smart prompt suggestions with category filtering and previews
- `ProgressTracker`: Enhanced progress monitoring with category breakdown
- `WorkspaceLayout`: Comprehensive workspace with tabbed interface

### Database Schema Extensions
- Added `memories` table for personal AI memory storage
- Added `hiveMindEntries` table for shared knowledge across agents
- Added `promptQueue` table for queue management system
- Implemented proper indexing for memory search and retrieval

### Security Enhancements
- Built-in rogue AI detection and prevention
- Comprehensive security monitoring for all autonomous actions
- Sandboxed execution environment for AI operations
- Permission-based access control for sensitive operations

### User Experience Improvements
- Non-technical user focus with simplified prompt suggestions
- Hover previews showing expected outcomes
- Queue system prevents accidental AI interruption
- Real-time progress tracking and status updates

## Current Development Focus
**Priority**: Deliver functional version ASAP with core memory system, queue functionality, and basic automation capabilities. Target: 2-week working prototype with LinkedIn automation, perfect memory, and prompt queue system.

## Next Milestones
1. Complete memory system with conflict detection and duplicate merging
2. Implement backend queue processing with context preservation
3. Expand desktop automation to GitHub and Slack integration
4. Add comprehensive testing and security validation
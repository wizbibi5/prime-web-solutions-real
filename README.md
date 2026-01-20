# Next.js Boilerplate Zylo

A production-ready Next.js 15 boilerplate with TypeScript, Tailwind CSS, Radix UI, and Zylo integration.

## Features

### Core Stack
- **Next.js 15** - React framework with App Router  
- **TypeScript** - Type-safe code
- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### State Management & Data Fetching
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client with interceptors

### Form Handling & Validation
- **React Hook Form** - Performant forms
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### UI Components
- **shadcn/ui** - Re-usable component library
- **Lucide React** - Icon library
- **Recharts** - Chart library
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

### Zylo Integration
- Built-in Zylo provider and hooks
- Authentication flow
- Protected routes
- API integration

## Getting Started

### Prerequisites
- Node.js 20+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
\`\`\`bash
git clone https://github.com/your-org/next.jsBoilerplateZylo.git
cd next.jsBoilerplateZylo
\`\`\`

2. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables:**
\`\`\`bash
cp .env.example .env.local
\`\`\`
Edit \`.env.local\` and add your values.

4. **Run the development server:**
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
src/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── error-boundary.tsx
│   ├── loading-skeleton.tsx
│   └── empty-state.tsx
├── hooks/                 # Custom React hooks
├── lib/                   # Core libraries
├── utils/                 # Utility functions
├── types/                 # TypeScript types
├── constants/             # App constants
└── stores/                # Zustand stores
\`\`\`

## Custom Hooks

### useDebounce
\`\`\`typescript
const debouncedSearch = useDebounce(searchTerm, 300);
\`\`\`

### useLocalStorage
\`\`\`typescript
const [user, setUser, removeUser] = useLocalStorage('user', null);
\`\`\`

### useMediaQuery
\`\`\`typescript
const isMobile = useIsMobile();
\`\`\`

## API Client

\`\`\`typescript
import { apiClient } from '@/utils';

const { data } = await apiClient.get('/users');
await apiClient.post('/users', { name: 'John' });
\`\`\`

## Components

### Error Boundary, Loading Skeletons, Empty States
All included and ready to use!

## Deployment

Deploy to Vercel with one click or use Docker.

## License

MIT License

---

Built with ❤️ using Next.js and TypeScript

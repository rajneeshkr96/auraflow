# Auraflow - AI-Powered Workflow Platform

## Overview

**Auraflow** is a sophisticated AI-powered workflow builder and automation platform. It enables users to create complex workflows visually using a node-based interface, integrate with external services, and automate business processes. Built with **Next.js**, **React Flow**, and AI capabilities, Auraflow delivers a powerful yet intuitive workflow automation experience.

---

## 🎯 Key Features

- **Visual Workflow Builder**: Drag-and-drop node-based interface
- **AI Integration**: Google Generative AI for intelligent workflows
- **Node Types**: Various node types for different operations
- **Connections**: Create complex workflow connections
- **Execution**: Run and monitor workflow execution
- **History**: Track workflow execution history
- **Templates**: Pre-built workflow templates
- **Export/Import**: Save and share workflows
- **Real-time Collaboration**: Live workspace updates
- **Performance Monitoring**: Track workflow metrics

---

## 🛠️ Tech Stack

### Frontend Framework
- **Framework**: Next.js 16.x (React 19.x)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, @codeswayam/ui

### Workflow Engine
- **Graph Visualization**: @xyflow/react
- **State Management**: Zustand
- **Real-time Updates**: Socket.io

### Key Libraries
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form, Zod
- **Animation**: Framer Motion
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **JWT**: jsonwebtoken

---

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v11.6.2+
- **Google AI API Key**: For AI features

---

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
# From root directory
npm install

# Or from auraflow directory
cd apps/auraflow
npm install
```

### 2. Environment Variables

Create `.env.local` file in the `apps/auraflow` directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=10000

# Aura API
NEXT_PUBLIC_AURA_API_URL=http://localhost:3000/aura

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_TEMPLATES=true

# JWT
NEXT_PUBLIC_JWT_SECRET=your_jwt_secret
```

---

## 🚀 Running the Application

### Development Mode

```bash
# Start development server
npm run dev

# Access at http://localhost:3004
```

### Build for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npm run start

# Access at http://localhost:3004
```

---

## 📁 Project Structure

```
apps/auraflow/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home/dashboard
│   ├── globals.css             # Global styles
│   ├── workflows/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Workflows list
│   │   ├── [id]/               # Workflow detail
│   │   │   └── page.tsx        # Workflow editor
│   │   └── templates/
│   ├── dashboard/
│   │   └── page.tsx            # User dashboard
│   ├── api/                    # API routes
│   └── settings/
├── components/
│   ├── workflow-builder/
│   │   ├── canvas.tsx          # Main canvas
│   │   ├── nodes/              # Node components
│   │   ├── edges/              # Edge components
│   │   └── toolbar.tsx         # Workflow toolbar
│   ├── layout/                 # Layout components
│   ├── ui/                     # UI components
│   └── common/                 # Reusable components
├── lib/
│   ├── api.ts                  # API client
│   ├── nodes.ts                # Node definitions
│   ├── hooks/                  # Custom hooks
│   └── utils.ts                # Utilities
├── actions/
│   ├── workflows.ts            # Server actions
│   └── nodes.ts
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server at port 3004
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

---

## 🎨 Workflow Builder

### Node Types
- **Trigger**: Start of workflow (manual, scheduled, webhook)
- **Action**: Execute operations (API call, send email, etc.)
- **Decision**: Conditional branching
- **Loop**: Iterate over items
- **Delay**: Wait for specified time
- **Script**: Execute custom code
- **AI**: AI-powered operations
- **Notification**: Send notifications
- **Output**: End of workflow

### Creating Workflows
1. Click "New Workflow"
2. Add nodes to canvas
3. Connect nodes
4. Configure node settings
5. Test workflow
6. Deploy/Save

### Workflow Execution
1. Click "Run" or trigger automatically
2. Monitor execution progress
3. View logs and results
4. Debug if needed
5. Adjust and retry

---

## 🔧 Node Configuration

### HTTP Request Node
```typescript
{
  url: 'https://api.example.com/endpoint',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: { /* data */ }
}
```

### AI Node
```typescript
{
  prompt: 'Your prompt here',
  model: 'gemini-pro',
  temperature: 0.7,
  maxTokens: 1000
}
```

---

## 📊 Dashboard

### Main Dashboard
- **Workflow List**: All user workflows
- **Recent Executions**: Recent runs
- **Performance Metrics**: Execution stats
- **Templates**: Available templates

### Workflow Details
- **Execution History**: All past executions
- **Logs**: Detailed execution logs
- **Statistics**: Performance metrics
- **Sharing**: Share with team

---

## 🔌 API Integration

### Workflow Endpoints
- `GET /workflows` - List workflows
- `POST /workflows` - Create workflow
- `GET /workflows/:id` - Get workflow
- `PATCH /workflows/:id` - Update workflow
- `DELETE /workflows/:id` - Delete workflow
- `POST /workflows/:id/execute` - Execute workflow
- `GET /workflows/:id/executions` - Get execution history

### Node Endpoints
- `POST /nodes/validate` - Validate node configuration
- `POST /nodes/execute` - Execute single node
- `GET /nodes/types` - Get available node types

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# E2E testing
npm run test:e2e
```

---

## 🌍 Deployment

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Production Setup
- Set production API URL
- Configure AI API keys
- Set up monitoring
- Configure webhooks

---

## 🤝 Contributing

### Code Standards
- Follow Next.js best practices
- Use TypeScript strictly
- Write accessible components
- Test workflows thoroughly

---

## 🐛 Troubleshooting

### Workflow Not Executing
- Verify node configuration
- Check API connectivity
- Review error logs
- Test individual nodes

### Node Connection Issues
- Verify node compatibility
- Check output/input types
- Review validation errors

### Performance Issues
- Monitor execution time
- Optimize node operations
- Use async operations
- Check API rate limits

---

## 📚 Resources

- [React Flow Documentation](https://reactflow.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

## 📄 License

ISC License

---

**Last Updated**: June 2026 (Supports `@codeswayam/api-client@1.3.0` upgrade pathways)

For more information, see the main [README.md](../../README.md)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

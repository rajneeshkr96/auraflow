# Auraflow Standards & Instructions

## 🎯 Purpose
Auraflow is a visual, AI-powered workflow builder and automation platform. It allows users to design, execute, and monitor complex business processes using a node-based graphical interface.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router), React 19
- **Graph Engine**: React Flow (@xyflow/react)
- **State Management**: Zustand (for canvas state)
- **Data Fetching**: TanStack React Query
- **AI Integration**: Google Generative AI (integrated via Core API)
- **Styling**: Tailwind CSS, Radix UI, @codeswayam/ui
- **Animation**: Framer Motion

## 📂 Key Directories & Files
- `app/workflows/[id]/page.tsx`: The main workflow editor canvas.
- `components/workflow-builder/`: Components specifically for the graph interface.
    - `nodes/`: Custom node components (Trigger, Action, AI, Decision, etc.).
    - `edges/`: Custom edge/connection components.
    - `canvas.tsx`: Main React Flow integration.
- `actions/`: Server actions for workflow persistence and execution.
- `lib/nodes.ts`: Logical definitions and validation for workflow nodes.

## 📐 Local Conventions
- **Node Development**: All new node types must be defined in `lib/nodes.ts` and have a corresponding component in `components/workflow-builder/nodes/`.
- **Canvas State**: Canvas updates (node moves, connections) are managed via Zustand to ensure high performance.
- **Port**: This application runs on port **3004**.

## 🔄 Specific Workflows
- **Development**: `npm run dev` (starts on port 3004).
- **Execution Testing**: Use the "Run" button in the editor to trigger a test execution through the `aura-api` sub-service in `core-api`.

## 🔐 Environment Variables
- `NEXT_PUBLIC_AURA_API_URL`: URL for the Aura API service (default: http://localhost:3000/aura).
- `NEXT_PUBLIC_JWT_SECRET`: Required for local token validation if bypass is not used.
- `NEXT_PUBLIC_ENABLE_AI_FEATURES`: Toggle for AI-powered node types.

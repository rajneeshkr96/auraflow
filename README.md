# ⚡ Auraflow — Enterprise Social Media Automation SaaS

> **Auraflow** is the flagship social media automation and lead-conversion CRM in the CodeSwayam platform ecosystem. It empowers creators, agencies, and businesses to automate Instagram Direct Messages, comment replies, lead generation funnels, and autonomous AI conversation closers.

---

## 🏛️ Architecture & Platform Integration

Auraflow is architected according to **Clean Domain-Driven Design** and serves as the **canonical reference architecture** for all 150+ CodeSwayam SaaS products.

### 1. Platform vs Domain Separation
- **Domain Data (Auraflow MongoDB via Prisma)**:
  - Automations, Triggers (`DM`, `COMMENT`), Keywords, Visual flow nodes.
  - Integrations (Instagram accounts, Page IDs, long-lived Graph API tokens).
  - Conversations, Threads, Messages, Lead tags, and CRM notes.
  - Webhook deduplication logs (`ProcessedComment`).
- **Platform Data (Core-API PostgreSQL + Redis)**:
  - Unified SSO Authentication & JWT verification.
  - Role-Based Access Control (`user`, `admin`, `superadmin`).
  - Subscriptions, plan tiers (`Free`, `Standard`, `Pro`, `Enterprise`), and Razorpay billing.
  - Centralized Entitlements & dynamic usage quotas (`appUsageCounters`).
  - Credit & Wallet balances with pay-per-use point deductions.
  - Neural AI Hub with model routing, fine-tuned system prompts, and RAG knowledge bases.

---

## 📁 Source Code Organization

```
apps/auraflow/
├── lib/
│   ├── platform/                       # ★ Central Platform Integration Layer
│   │   ├── types.ts                    # Platform contracts (Session, Entitlements, Quotas)
│   │   ├── auth.ts                     # Cryptographically verified JWT auth (getAuthSession)
│   │   ├── rbac.ts                     # Role-based guards (requireRole, isAdmin)
│   │   ├── entitlements.ts             # Server-side entitlement resolver (checkQuota)
│   │   ├── metering.ts                 # Usage reporter to Core-API (trackPlatformUsage)
│   │   ├── credits.ts                  # Credit check & point deduction facade
│   │   ├── neural.ts                   # Neural AI LLM client facade (PlatformNeuralService)
│   │   └── sso.ts                      # Centralized login, upgrade, and billing URLs
│   │
│   ├── domain/                         # ★ Domain Services & Repositories (SOLID Clean Architecture)
│   │   ├── automation/
│   │   │   ├── automation.repository.ts # Isolated MongoDB queries via Prisma
│   │   │   └── automation.service.ts    # Business rules & Core-API quota checks
│   │   ├── integration/
│   │   │   ├── integration.repository.ts
│   │   │   └── instagram.service.ts     # Instagram Graph API Adapter
│   │   ├── conversation/
│   │   │   └── conversation.repository.ts
│   │   └── webhook/
│   │       ├── webhook-dedup.service.ts # Event loop prevention & deduplication
│   │       ├── automation-matcher.ts    # Strategy-based trigger & keyword matcher
│   │       └── webhook-processor.service.ts # High-level event execution orchestrator
│   │
│   └── use-auraflow-access.ts          # Client hook wrapping @codeswayam/access
│
├── actions/                            # ★ Server Actions (Thin controllers)
│   ├── automations.ts                  # Delegates to AutomationService
│   ├── inbox.ts                        # Delegates to ConversationRepository & InstagramService
│   ├── integrations.ts                 # Delegates to IntegrationRepository
│   ├── templates.ts                    # Template marketplace & instantiation
│   └── user.ts                         # User profile context
│
├── components/
│   ├── global/
│   │   └── upgrade-modal.tsx           # Glassmorphism dynamic upgrade paywall modal
│   ├── automations/                    # Flow canvas & AutomationBuilder
│   ├── dashboard/                      # Live UsageMeter & metrics
│   └── analytics/                      # Feature-gated conversion performance charts
│
├── app/
│   ├── providers/
│   │   └── providers.tsx               # Injects CSWProvider + AccessProvider
│   └── api/webhooks/instagram/
│       └── route.ts                    # Thin HTTP controller (GET verify, POST dispatch)
│
├── REFERENCE_ARCHITECTURE.md           # Canonical reference blueprint for upcoming apps
└── package.json
```

---

## 🔑 Environment Variables

Configure `.env.local` for local development:

```env
# Core API & SSO
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_APP_AUTH_URL="http://localhost:3003"
NEXT_PUBLIC_APP_URL="http://localhost:3004"
JWT_SECRET="hgkjhkhjvb654gbhj"

# Auraflow MongoDB
MONGODB_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/auraflow?retryWrites=true&w=majority"

# Meta / Instagram Integration
INSTAGRAM_APP_CLIENT_ID="<your-client-id>"
INSTAGRAM_APP_CLIENT_SECRET="<your-client-secret>"
INSTAGRAM_REDIRECT_URI="http://localhost:3004/api/integrations/instagram/callback"
INSTAGRAM_WEBHOOK_VERIFY_TOKEN="auraflow_token"

# NeuralHub AI Platform
NEURAL_API_KEY="nhub_live_..."
NEURAL_API_URL="http://localhost:3005"
NEXT_PUBLIC_NEURAL_WEB_URL="http://localhost:3007"
```

---

## 🚀 Running Locally

```bash
# Generate Prisma Client for Auraflow
npm run db:generate

# Run development server on port 3004
npm run dev

# Typecheck code
npx tsc --noEmit
```

---

## 🛡️ Role-Based Access Control (RBAC)
- Standard users have access to `/dashboard`, `/automations`, `/inbox`, `/integrations`, `/templates`, and `/subscription`.
- Admin users (`admin`, `superadmin`) have access to `/admin` and `/admin/model-requests` for managing BYOK model approvals and tenant diagnostics.
- Protected server-side via `lib/platform/rbac.ts` (`requireRole("admin")`) and client-side via Next.js layout guards.

---

## 💎 Dynamic Entitlements & Paywalls
- **Zero Hardcoded Limits**: Auraflow never hardcodes subscription limits (`freeLimit = 5`) in frontend components or backend logic.
- **Real-Time Entitlement Resolution**: Limits (`automations`, `dms`, `comments`, `ai_responses`) are resolved dynamically from Core-API via `@codeswayam/access` and `lib/platform/entitlements.ts`.
- **Dynamic Paywalls**: When a free user hits their 5-automation limit, the `<UpgradeModal>` component dynamically renders available upgrade tiers, features, and direct SSO checkout redirects.

---

## 🔄 Single Active Subscription & Zero-Row Free Tier Architecture
- **Strict Invariant: Exactly One Active Subscription Per App**:
  - In modern SaaS billing, a user should never hold multiple active subscriptions for the same application.
  - When a user upgrades or subscribes to a new plan (e.g. from Standard to Pro), Core-API's payment engine automatically decommissions and supersedes any previous active subscription for that application (`status = 'canceled'`, reason: `Superseded by upgrade`).
- **Zero-Row Default Free Tier (Implicit Entitlement)**:
  - Users do **not** need to manually "activate" a Free plan, nor does the database store zero-rupee placeholder rows (`amount: 0`, `expiresAt: null`) that clutter financial tables.
  - Every registered user automatically receives Free tier entitlements by default across all CodeSwayam applications.
- **Autonomous Fallback on Expiry**:
  - The instant a paid subscription expires (`expiresAt < NOW()`), Core-API resolvers and the autonomous `SubscriptionExpiryService` transition the subscription to `expired` and immediately drop the user's active tier down to `Free`.
  - The user experiences seamless continuity: their existing automations remain intact, and they operate within standard Free tier limits without any manual reactivation.

---

## 🧠 Neural AI Hub & Pay-Per-Use Credit Economy
- **Autonomous Lead Generation**: Automations can leverage AI agents powered by CodeSwayam's central Neural Hub (`http://localhost:3005`).
- **Two-Way Agent Synchronization**: When creating or updating an automation in Auraflow, `AutomationService` automatically creates or updates the corresponding Neural Agent with customized business prompts.
- **Credit Balance Checks & Deductions**: Before calling AI LLMs, `canAffordFeature(userId, "ai_generation")` verifies the user's wallet. Upon completion, `deductCredits()` settles the transaction asynchronously in Core-API PostgreSQL.

---

## ⚡ Headless Webhook Execution & Background Auth
- Inbound Instagram webhooks arrive asynchronously from Meta servers without user browser sessions or cookies.
- Auraflow securely matches the event to the Instagram integration record in MongoDB to identify the `userId`.
- `lib/platform/metering.ts` and `lib/platform/credits.ts` generate cryptographically signed short-lived platform service JWTs to report usage and deduct credits against Core-API with zero security compromises.

---

## 📐 Applied Design Patterns & SOLID Compliance

| Pattern | Implementation | Responsibility |
|---|---|---|
| **Repository Pattern** | `AutomationRepository`, `IntegrationRepository`, `ConversationRepository` | Isolates Prisma MongoDB queries from business rules. |
| **Strategy Pattern** | `AutomationMatcher` (`matchesTrigger`, `matchKeyword`) | Pluggable matching algorithms for DM triggers, comment replies, and universal fallbacks without `switch-case` bloat. |
| **Facade Pattern** | `PlatformNeuralService`, `trackPlatformUsage`, `deductCredits` | Hides complex HTTP/JWT logic behind clean, one-liner functions. |
| **Idempotency Service** | `WebhookDedupService` | Multi-layer deduplication (LRU in-memory cache + DB `ProcessedComment` records) to prevent duplicate responses and event loops. |
| **Orchestrator Service** | `WebhookProcessorService` | High-level coordinator that handles incoming DMs and comments, dispatches actions, calls AI, and tracks usage. |

---

## 📖 Related Documentation
- 📘 [Canonical Reference Architecture Blueprint](./REFERENCE_ARCHITECTURE.md) — Comprehensive guide for onboarding new SaaS apps to CodeSwayam.
- 🌐 [CodeSwayam Monorepo Root README](../../README.md)
- 🔑 [Central Core-API Platform README](../../core-api/README.md)
- 🛡️ [@codeswayam/access Package](../../packages/access/README.md)


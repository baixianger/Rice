# Rice

This is a learning project

## Tech Stack

### 1. Next.js

- [Getting Started](https://nextjs.org/docs/app/getting-started/installation)

### 2. React with Shadcn UI and Tailwind CSS

- [Shadcn Installation](https://ui.shadcn.com/docs/installation/next)
- [Tailwind CSS min course](https://tailwindcss.com/build-uis-that-dont-suck)

### 3. Prisma with Neon

- [How to use Prisma ORM with Next.js](https://www.prisma.io/docs/guides/nextjs?utm_source=youtube&utm_medium=video&ref=codewithantonio&utm_campaign=course_vibe)
- [Neon Registration](https://neon.com/docs/introduction)
- Alternatively use [Supabase](https://supabase.com/)
- Generate Prisma Client: `npx prisma generate`
- Generate Prisma Migrations:
  ```prisma
  npx prisma migrate reset
  npx prisma migrate dev --name init
  ```

### 4. tRPC with TanStack React Query in Next.js

- [tRPC integration with Next.js](https://trpc.io/docs/client/nextjs)
- [TanStack React Query](https://tanstack.com/query/v5/docs/overview)
- [Server Side prefetch](https://trpc.io/docs/client/tanstack-react-query/server-components#using-your-api)
- [How to expose tRPC to a standalone API](https://github.com/mcampa/trpc-to-openapi)

### 5. Inngest, an event-driven durable execution platform

- [Next.js integration](https://www.inngest.com/docs/getting-started/nextjs-quick-start?ref=docs-home)
- [AgentKit](https://agentkit.inngest.com/overview)

### 6. E2B sandbox

- [E2B CLI](https://e2b.dev/docs/cli)
- [E2B Next.js Template Dockerfile](https://github.com/AntonioErdeljac/vibe-assets/tree/main)

  ```bash
  e2b template build --name rice-nextjs-test-2 --cmd "/compile_page.sh"
  ```

- [E2B interpreter](https://e2b.dev/docs)
- [E2B javascript SDK](https://e2b.dev/docs/sdk-reference/js-sdk/v1.7.1/sandbox#sandbox)

### 7. AGENT TOOLS

- [Add tools to agent](https://agentkit.inngest.com/concepts/tools)
  - "terminal" - How to run commands in E2B sandbox: [E2B commands](https://e2b.dev/docs/commands)
  - "createOrUpdateFiles"
  - "readFiles"
- Add a new prompt
- Add agent network & routers

### 8. Messages

- Create Message schema
- Create Fragment schema
- Save user input prompt as message
- Save Agent response as message & fragment

### 9. Projects

- Create Project schema
- Add Message relations
- Create new project on user prompt
- Preserve projectId in background jobs
- Add project page use useRouter

### 10. Messages UI

- Create Project View
- Create Messages Container
  - Create Message Card
  - Create Message Form
- Modify Messages `getMany` Procedure

### 11. Project Header

- Create Project Header
- Add Fragment selection
- Add Loading state

### 12. Fragment View

- Create Fragment View

### 13. Code View

- Create Tabs in Project View
- Create File Explorer

  - Create File Explorer
  - Create Tree View
  - Create File path Breadcrumbs

- 14. Home Page

  - Create Home Page
  - Create Projects List
  - Create Project Form

- 15. Theme

  - Pick and apply new theme

- 16. Authentication

  - Create a Clerk account
  - Setup Clerk
    - Update .env
    - Add ClerkProvider
    - Add Sign in and Sign up screns
    - Add middleware
  - Create home layout Navbar
  - Create User Control component
  - Create protected tRPC procedures
  - Update Prisma Schema

- 17. Billing

  - Enable Clerk billing [ref](https://clerk.com/docs/nextjs/billing/b2c-saas)
  - Create billing page
  - Add Rate Limiting [node-rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible/wiki/Prisma)
    - Update prisma schema
    - Create usage utils, i.e. getUsageTracker, consumeCredits, refundCredits
  - Create Usage Component
  - Update tRPC procedures to get usage status
  - Improve the usage design by using a tRPC middleware to check credits before each procedure

- 18. Agent Memory

  - Add previous messages context
  - Add fragment title generation
  - Add response message generation

- 19. Bug Fixes

  - Increase Sandbox expiration [E2B live time](https://e2b.dev/docs/sandbox)
  - Make E2B Template private
    | Went to `sandbox_templates/nextjs` folder where `e2b.toml` is located
    | Run command `e2b template publish/unpublish`
  - Improve Conversation history [use `take` parameters in prisma query](https://www.prisma.io/docs/orm/prisma-client/queries/pagination#sorting-and-cursor-based-pagination)
  - Improve Error handling [react-error-boundary (fine-grained error handling)](https://github.com/bvaughn/react-error-boundary) or [nextjs error handling (global error handling)](https://nextjs.org/docs/app/getting-started/error-handling)
  - Realtime Message Fetching in stead of polling [Inngest Realtime](https://www.inngest.com/docs/features/realtime/react-hooks)

- 20. Deployment
  - Local deployment test `npm run build && npm run start`
  - Deploy to Vercel

### other dependencies include:

- CodeRabbit, a PR review Agent to help you review your code
- Windsuft, a modern code agent to accerlate your code development
- AutoFocus, [When you have many displays and many windows open, focus follows mouse is a feature that can help you navigate between](https://github.com/synappser/AutoFocus)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# GovernMINT: Advanced Committee & Meeting Management System

GovernMINT is a high-performance, premium web application built for academic final year projects to streamline committee coordination, meeting scheduling, agenda locking, live voting, attendance validation, and AI-assisted summary drafting.

## 🚀 Key Features

1. **Role-Based Authentication (RBAC)**: Custom JWT sessions with fine-grained permissions for Super Admins, Committee Chairs, Secretaries, and Members.
2. **Conflict-Free Meeting Scheduler**: Automatic calendar lookup checks member availability before scheduling.
3. **Interactive Live Voting**: Quorum validation and real-time visualization of resolutions.
4. **Dynamic QR Attendance**: Cryptographic QR codes refresh every 10 seconds to validate physically co-located members.
5. **Collaborative Scribe Rooms**: Real-time minutes take-down during active committee meetings.
6. **Gemini AI Summarization**: Auto-compilation of raw notes into executive summaries and structured Action Items.
7. **Immutable Audit Trail**: SHA-256 hash-chaining of database transactions.
8. **Automated Reminders**: Built-in notifications and Resend HTML invite dispatches.
9. **Analytics Dashboard**: Rich visualization of committee engagement and performance.

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS & Shadcn UI
- **AI Integrations**: Google Gemini 1.5 Flash (via `@google/generative-ai`)
- **Mailing**: Resend SDK

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/governmint?schema=public"
NEXTAUTH_SECRET="your-next-auth-jwt-secret-key-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
RESEND_API_KEY="your-resend-api-key"
```

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Run Migrations & Seed**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

3. **Launch Dev Server**:
   ```bash
   npm run dev
   ```

## 📁 Repository Structure
Please refer to the detailed [Project Specification](file:///C:/Users/HTC/.gemini/antigravity/brain/6d5e46f0-d9ee-433d-aeb8-12c93ac09aab/artifacts/project_specification.md) for full folder layouts, ER diagrams, database schemas, and AI prompt designs.

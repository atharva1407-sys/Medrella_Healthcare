<div align="center">

# 🏥 Medrella Healthcare — Enterprise Outpatient Platform & AI Clinical Assistant

<p align="center">
  <img src="public/images/tech-stack.png" alt="Medrella Healthcare Tech Stack & Architecture" width="100%" />
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js_16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16.4" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind 4" /></a>
  <a href="https://orm.drizzle.team"><img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=000000" alt="Drizzle ORM" /></a>
  <a href="https://neon.tech"><img src="https://img.shields.io/badge/PostgreSQL_16-00E599?style=for-the-badge&logo=postgresql&logoColor=0B0D0E" alt="PostgreSQL 16" /></a>
  <a href="https://razorpay.com"><img src="https://img.shields.io/badge/Razorpay_Gateway-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF" alt="Razorpay" /></a>
  <a href="https://www.sarvam.ai"><img src="https://img.shields.io/badge/Sarvam_AI_Voice-FF6F00?style=for-the-badge&logo=probot&logoColor=white" alt="Sarvam AI" /></a>
  <a href="https://playwright.dev"><img src="https://img.shields.io/badge/Playwright_E2E-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright E2E" /></a>
</p>

Enterprise-grade outpatient clinical management platform featuring an **AI Clinical Assistant for Patients & Doctors** (voice & text), **Modular Repository Architecture**, **PostgreSQL Advisory-Locked Concurrency**, **Elastic OPD Scheduling**, and **Reliable Outbox Notifications** for **Medrella Healthcare, Ruby Hall, Pune, Maharashtra**.

🚀 **Live Production Application**: [https://medrella-healthcare.vercel.app](https://medrella-healthcare.vercel.app)

</div>

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Production Hardening Innovations](#-key-production-hardening-innovations)
- [AI Clinical Assistant Pipeline & Safety](#-ai-clinical-assistant-pipeline--safety)
- [Elastic Session Scheduling](#-elastic-session-scheduling)
- [Directory & Project Structure](#-directory--project-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Verification & Automated Test Suite](#-verification--automated-test-suite)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Operational Documentation Hub](#-operational-documentation-hub)
- [Clinical Facility & Compliance](#-clinical-facility--compliance)

---

## 🏛️ Architectural Overview

Medrella Healthcare is architected for clinical reliability, zero double-booking, and resilient high-concurrency patient access:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router UI                        │
│   Landing Page • Patient Portal • Doctor Schedule • Voice Assistant    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Server Actions & API Routes
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Lightweight Repo Facade                         │
│                           src/db/repo.ts                               │
└───────┬──────────────┬──────────────┬──────────────┬───────────┬───────┘
        │              │              │              │           │
        ▼              ▼              ▼              ▼           ▼
  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌───────────┐
  │User Repo   │ │Doctor Repo │ │Appointment │ │Billing    │ │Notif      │
  │            │ │            │ │Repo (Locks)│ │Repo(Idemp)│ │Repo(DLQ)  │
  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬─────┘ └─────┬─────┘
        │              │              │              │             │
        └──────────────┴───────┬──────┴──────────────┴─────────────┘
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Shared RepositoryContext (Drizzle)                   │
│    Neon Serverless Pool • Advisory Locks • Transactions • Fallback     │
└────────────────────────────────────────────────────────────────────────┘
```

- **Domain Repository Decomposition:** 3,600+ lines of monolithic database operations decomposed into 5 domain repositories (`UserRepository`, `DoctorRepository`, `AppointmentRepository`, `BillingRepository`, `NotificationRepository`) sharing a unified `RepositoryContext`.
- **Lightweight Backward-Compatible Facade:** `MedrellaRepository` in `src/db/repo.ts` delegates domain logic while preserving full backward compatibility.
- **Fail-Safe In-Memory Fallback:** Seamless local offline testing and demo modes while enforcing strict PostgreSQL validation in production environments.

---

## 🛡️ Key Production Hardening Innovations

### 1. Concurrency & Double-Booking Advisory Locks
- **Transaction-Scoped Advisory Locking:** Uses `pg_advisory_xact_lock` on doctor-day hashes (`lockDoctorDay`) to guarantee serializable slot reservations even under simultaneous burst requests.
- **Atomic Re-Checking:** Re-validates slot availability within the transaction boundary immediately before committing booking rows.

### 2. Distributed Rate Limiting
- **Atomic CTE Rate Limiter:** `src/lib/rate-limiter.ts` executes atomic Postgres CTE updates (`INSERT ... ON CONFLICT DO UPDATE`) guarded by transaction locks.
- **Resilient Fallback:** Automatically degrades to in-memory sliding window counters if the database experiences transient latency.

### 3. Payment & Refund Idempotency
- **Unique Constraint Recovery:** Webhook handlers and refund calls safely intercept PostgreSQL `23505` error collisions on idempotency keys, returning existing records without double-refunding or throwing 500 errors.
- **Multi-Phase Verification:** Webhook signatures from Razorpay are verified cryptographically before mutating appointment payment states.

### 4. Enterprise Session & Cookie Security
- **Strict HTTPS `Secure` Cookies:** Removed platform-specific checks in `src/actions/auth.ts`, guaranteeing `Secure; HttpOnly; SameSite=Lax` cookies across all production hosts (AWS, Vercel, Docker, Render).
- **Hardened Key Derivation:** PBKDF2 password hashing with 600,000 iterations and cryptographic salts.

---

## 🤖 AI Clinical Assistant Pipeline & Safety

The floating assistant serves both patients and doctors with text or hands-free voice interaction:

```
User (Voice/Text)
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. Session & Origin Gate (Signed HTTP-Only Cookie Authentication) │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Multilingual Emergency Triage Filter (English, Hindi,       │
│    Marathi, Hinglish) ──► Immediate 112 Route (No LLM Contact)  │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Role-Scoped Tool Execution (Zod-Validated Arguments)          │
│    Patient: search_doctors, get_open_slots, propose_booking     │
│    Doctor:  get_my_schedule, get_appointment_stats, conflicts   │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Two-Step Propose & Confirm (HMAC-Signed 5-Min Token Card)     │
│    No DB mutation occurs until user explicitly presses Confirm   │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Atomic Revalidation & Real-Time Booking / Payment Card       │
└─────────────────────────────────────────────────────────────────┘
```

- **Voice Activity Detection (VAD):** Speech synthesis in `src/components/assistant/use-voice.ts` maintains an active utterance reference set to prevent premature Garbage Collection clipping.
- **Sanitized Audit Trail:** All assistant interactions and tool executions are recorded in `agent_events` with sanitized identifiers; PHI (names, emails, phone numbers) is strictly redacted.

---

## 📅 Elastic Session Scheduling

Located at `src/lib/elastic-schedule.ts`, this engine allows clinic administrators and doctors to adapt OPD shifts on the fly:

- **Dynamic Shift Resizing:** Doctors can expand or shrink OPD hours even with booked patients present.
- **Clinical Conflict Resolution:**
  - **Move to Nearest Slot (Default):** Patients are automatically reassigned to the closest available slot in the modified hours.
  - **Cancel & Refund:** Cancels displaced bookings and queues an automated 100% gateway refund.
  - **Keep as Booked:** Preserves original appointment times outside new shift boundaries as clinical exceptions.

---

## 📁 Directory & Project Structure

```
Medrella_Healthcare/
├── .github/workflows/          # Automated CI/CD pipeline (PostgreSQL 16 + E2E)
├── public/images/              # Clinical assets, doctor photos & diagrams
├── scripts/
│   ├── migrate.ts              # Advisory-locked Neon PostgreSQL migration runner
│   └── test-pg-integration.ts  # Real PostgreSQL integration test harness
├── src/
│   ├── actions/                # Next.js Server Actions (Auth, Appointments)
│   ├── app/                    # Next.js 16 App Router pages & API routes
│   │   ├── api/health/         # Production health check probe (/api/health)
│   │   ├── api/agent/          # Assistant chat, voice transcribe & confirm
│   │   ├── doctor/             # Doctor portal & OPD schedule management
│   │   └── patient/            # Patient dashboard & booking workflows
│   ├── components/             # Reusable UI, slot picker, voice controls
│   ├── db/
│   │   ├── index.ts            # Drizzle client & connection lifecycle
│   │   ├── repo.ts             # Delegating repository facade
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   └── repositories/       # Modular Domain Repositories (5 modules)
│   ├── domain/                 # Core appointment lifecycle state machines
│   ├── hooks/                  # Clean separation React hooks (useSlotPicker)
│   └── lib/                    # Core business logic (Payments, Agent, Rate Limiting)
├── tests/
│   └── e2e/clinic.spec.ts      # 10 clinical user journeys in Playwright
├── DATABASE_MIGRATION_GUIDE.md # Production migration operational guide
├── ENVIRONMENT_VARIABLES.md    # Exhaustive environment variable specification
├── PRODUCTION_DEPLOYMENT_GUIDE.md # Zero-downtime deployment & rollback runbook
├── PRODUCTION_READINESS_REPORT.md # Production architecture verification report
├── RELEASE_NOTES.md            # Version release notes (v2.0.0)
├── TESTING_GUIDE.md            # Comprehensive testing manual
├── next.config.ts              # Production Next.js Turbopack config
├── package.json                # Scripts & dependencies
└── playwright.config.ts        # Playwright browser testing configuration
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL**: (Optional for local memory mode; required for production integration)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/atharva1407-sys/Medrella_Healthcare.git
   cd Medrella_Healthcare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   *(See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for full descriptions)*

4. **Run database migrations (when connecting to PostgreSQL):**
   ```bash
   npm run db:migrate
   ```

5. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚡ Verification & Automated Test Suite

Medrella Healthcare includes 11 deterministic domain test suites (750+ checks) and full-browser Playwright E2E tests:

```bash
# 1. Run complete domain unit & integration test suite (zero network required)
npm test

# 2. Run real PostgreSQL concurrency & advisory lock tests
npm run test:pg

# 3. Run Playwright End-to-End clinical user journeys
npm run test:e2e

# 4. Verify TypeScript and ESLint compliance
npx tsc --noEmit
npm run lint

# 5. Compile production build with Turbopack
npm run build
```

### Test Coverage Summary

| Test Suite File | Test Scope | Result |
| :--- | :--- | :---: |
| **`src/test-suite.ts`** | Clinical rules, wave/stream capacity, token sequences, double-booking guard | **115 Passed** |
| **`src/test-payment-hardening.ts`** | Razorpay webhooks, signature verification, seat holds, refund engine | **72 Passed** |
| **`src/test-notifications.ts`** | Outbox deduplication, IST midnight calculations, PHI redaction, DLQ | **81 Passed** |
| **`src/test-brevo-welcome.ts`** | Welcome notification pipeline, template escaping, non-blocking delivery | **31 Passed** |
| **`src/test-agent.ts`** | Sarvam AI tool calling, safety checks, multilingual emergency triage | **72 Passed** |
| **`src/test-assistant.ts`** | Doctor tools, 2-step confirmations, slot taken guards, VAD audio handling | **99 Passed** |
| **`src/test-timezone.ts`** | Timezone invariance across UTC, Asia/Kolkata, America/Los_Angeles | **4 Passed** |
| **`src/test-scheduling.ts`** | Wave & stream recurrence, specific-date shifts, timezone cross-checks | **114 Passed** |
| **`src/test-elastic.ts`** | Live OPD session expansion, shrinkage, slot calculation, conflict strategies | **105 Passed** |
| **`src/test-phase1-hardening.ts`** | Distributed rate limiting, env validation, sweep safety, advisory locks | **48 Passed** |
| **`src/test-phase3-lifecycle.ts`** | Appointment state transitions, concurrency guards, refund idempotency | **12 Passed** |
| **`tests/e2e/clinic.spec.ts`** | 10 Playwright E2E clinical journeys (login, booking, assistant, dashboard) | **10 Passed** |
| **Total Automated Checks** | **Comprehensive Deterministic Verification** | **763 Passed (100%)** |

---

## 🔄 CI/CD Pipeline

The repository includes a production-ready GitHub Actions workflow ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) triggered on pushes and pull requests:

1. **Static Analysis:** ESLint and strict TypeScript typechecking (`npx tsc --noEmit`).
2. **Domain Unit Testing:** Executes the full 11-suite test runner.
3. **Containerized PostgreSQL Testing:** Boots a `postgres:16-alpine` service container, executes `npm run db:migrate`, and runs `npm run test:pg`.
4. **Turbopack Build:** Compiles all 31 application routes.
5. **E2E Browser Validation:** Installs Chromium and executes Playwright tests against the built application.

---

## 📚 Operational Documentation Hub

Detailed runbooks and architectural documentation are available in the repository root:

- [🚀 Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md) — Pre-flight checklists, zero-downtime deployment, health probes, and rollback procedures.
- [🔐 Environment Variables Specification](ENVIRONMENT_VARIABLES.md) — Reference for all required and optional environment keys with validation rules.
- [🗄️ Database Migration Guide](DATABASE_MIGRATION_GUIDE.md) — Migration safety, advisory locking, rollback instructions, and schema evolution.
- [🧪 Testing Guide](TESTING_GUIDE.md) — Comprehensive guide for unit, integration, PostgreSQL, and Playwright E2E testing.
- [📋 Release Notes (v2.0.0)](RELEASE_NOTES.md) — Detailed changelog of production readiness improvements.
- [🛡️ Production Readiness Report](PRODUCTION_READINESS_REPORT.md) — Audit and remediation certification report.

---

## 🏥 Clinical Facility & Compliance

- **Institution:** Medrella Healthcare
- **Location:** Ruby Hall Clinic Campus, Pune, Maharashtra 411001, India
- **Timezone:** Indian Standard Time (`Asia/Kolkata`, UTC+05:30)
- **Data Protection:** PHI sanitization, role-scoped access control, encrypted session cookies, audit logs for clinical transactions.

---

<div align="center">
  <sub>Maintained by the Medrella Healthcare Engineering & Clinical Architecture Team.</sub>
</div>

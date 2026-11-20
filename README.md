<div align="center">

# 🏥 Medrella Healthcare

### Production Outpatient Operating System, Dynamic OPD Queue Orchestration & Multilingual Clinical AI

*Comprehensive Production Deployment for Ruby Hall Clinic, Pune*

[![Production Deployment](https://img.shields.io/badge/LIVE_PLATFORM-medrella--healthcare.vercel.app-0875DF?style=for-the-badge&logo=vercel&logoColor=white)](https://medrella-healthcare.vercel.app)
[![Task Monorepo](https://img.shields.io/badge/TASKS_MONOREPO-Pearl__Thoughts_Atharva--Mandlik-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/atharva1407-sys/Pearl_Thoughts_Atharva-Mandlik)
[![Test Verification](https://img.shields.io/badge/TESTS-891_PASSED-00C853?style=for-the-badge&logo=checkmarx&logoColor=white)](https://github.com/atharva1407-sys/Medrella_Healthcare)

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,postgres,nodejs,vercel,githubactions&perline=8" alt="Tech Stack" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.6-black?style=flat-square&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict_5.x-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Neon_Postgres-Serverless-00E599?style=flat-square&logo=postgresql" alt="Neon Postgres" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.38-C5F74F?style=flat-square&logo=drizzle" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Sarvam_AI-Voice_&_Chat-FF6F00?style=flat-square" alt="Sarvam AI" />
  <img src="https://img.shields.io/badge/Razorpay-Sandbox-0C2451?style=flat-square&logo=razorpay" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Brevo-Transactional_Email-0B996F?style=flat-square" alt="Brevo" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-Modern_UI-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
</p>

</div>

---

## 🌟 Executive Summary

**Medrella Healthcare** is a resilient, enterprise-grade clinical management system engineered for high-volume outpatient hospitals. Serving patients, specialists, and front-desk personnel at **Ruby Hall Clinic, Pune**, the platform coordinates the complete outpatient journey:

* 🩺 **Specialist Discovery & Scheduling**: Real-time slot availability, collision-proof stream and wave scheduling, doctor leave management, and elastic session adjustment.
* 🚶‍♂️ **Dynamic OPD Queue Orchestration**: Physical token numbers, real-time wait estimation, contiguous queue gap-closing, and an atomic patient "Unavailable" workflow.
* 👩‍💼 **Front-Desk Receptionist Console**: Scoped multi-doctor reception queues, patient check-in with duplicate guards, and dedicated staff management.
* 🤖 **Hands-Free Multilingual Voice AI**: Conversational booking and clinical inquiries in **English, Hindi, Marathi, and Hinglish** with Web Audio Voice Activity Detection (VAD) and barge-in support.
* 📋 **Longitudinal Health Records (LHR)**: Version-controlled patient medical profiles, immutable audit trail logs, and chronological visit encounters with SOAP notes and prescriptions.
* 💳 **Deterministic Financial Workflows**: Razorpay checkout with 10-minute seat holds, cryptographic signature checks, idempotent webhook reconciliation, and automated tiered cancellation refunds.
* 📬 **Transactional Outbox Engine**: Decoupled asynchronous notification pipeline supporting Brevo and Resend with dead-letter recovery and admin metrics.

---

## 🏛️ System Architecture

Medrella's architecture follows strict domain-driven design with explicit boundaries between HTTP handling, domain policies, and database transactions:

```mermaid
flowchart TD
    subgraph ClientLayer["🖥️ Frontend Clients"]
        P["Patient Portal (Mobile / Web)"]
        D["Doctor Clinical Dashboard"]
        R["Receptionist Front-Desk Console"]
        AI_UI["Hands-Free Voice AI Widget"]
    end

    subgraph AppRouter["⚡ Next.js 16.4.6 App Layer"]
        SA["Server Actions & Form Validation (Zod)"]
        RH["Route Handlers (Webhooks / Cron / APIs)"]
        MW["Auth Middleware & Encrypted Session Cookies"]
    end

    subgraph DomainCore["🧠 Domain Logic & Concurrency Control"]
        QL["Queue Engine & Token Contiguity (1..N)"]
        SR["Scheduling & Elastic Session Relocator"]
        AL["Appointment Lifecycle State Machine (CAS)"]
        AC["Advisory Lock Concurrency Manager"]
        MH["Medical History & Optimistic Concurrency Engine"]
    end

    subgraph Infrastructure["💾 Persistence & Cloud Integrations"]
        DB[("Neon Serverless PostgreSQL (Drizzle ORM)")]
        MEM[("Zero-Dependency In-Memory Store (Dev / CI)")]
        RP["Razorpay Payment Gateway API"]
        BR["Brevo / Resend Email Outbox Worker"]
        SAI["Sarvam AI Multilingual LLM & TTS"]
    end

    ClientLayer --> MW
    MW --> SA
    MW --> RH
    SA --> DomainCore
    RH --> DomainCore
    DomainCore --> AC
    AC --> DB
    DomainCore -.-> MEM
    DomainCore --> RP
    DomainCore --> BR
    DomainCore --> SAI
```

---

## 💎 Core Platform Capabilities

### 1. 🚶‍♂️ Dynamic OPD Queue & Token Engine
* **Contiguous Queue Positions ($1 \dots N$)**: As patients arrive and check in, they receive a static physical token (e.g. `#104`) and dynamic real-time queue position. When patients cancel or leave, queue positions dynamically close gaps without holes.
* **Wait Time Estimation**: Computes dynamic wait times based on consultation velocity and current consultation status.
* **Atomic Check-in Guards**: Single-use CAS transaction blocks duplicate or concurrent check-in scans.
* **"Unavailable" Action**: If a called patient is temporarily missing from the waiting room, front-desk staff mark them "Unavailable". The patient is temporarily removed from the active queue, the gap behind them closes contiguously, and an immediate reschedule dialog opens. If they return later, they re-enter at the end of the queue.

### 2. 👩‍💼 Doctor-Assigned Receptionist Front-Desk
* **Dedicated Portal**: Accessible via `/login?portal=reception`, isolating staff authentication from public sign-ups.
* **Doctor Scoping**: Doctors manage their front-desk team via `/doctor/reception-team`. Receptionists see only the queues of the doctors who assigned them.
* **Multi-Doctor Queue Switcher**: Front-desk personnel supporting multiple specialists can switch between doctor agendas with a single click.
* **Solo-Doctor Fallback**: Doctors without assigned receptionists retain front-desk check-in controls directly on their agenda.

### 3. 🤖 Multilingual Conversational Voice AI
* **Supported Languages**: English, Hindi (हिंदी), Marathi (मराठी), and Hinglish with automatic language detection.
* **Hands-Free Voice Interaction**: Custom Web Audio API Voice Activity Detection (VAD) with user interruption support (barge-in).
* **Signed Confirmation Cards**: Sensitive actions (booking, rescheduling, cancellations) generate cryptographic, single-use confirmation cards requiring explicit patient consent before execution.
* **Clinical Safety & Emergency Escalation**: Queries mentioning acute symptoms (e.g., chest pain, breathing difficulties) trigger an immediate hardcoded 112 emergency escalation message, bypassing LLM processing entirely.

### 4. 📋 Patient Longitudinal Health Records (Task 9)
* **Medical Profile**: Standardized recording of blood group, height, weight, allergies (with severity and reaction details), existing chronic conditions, current medications, past surgeries, and family history.
* **Versioned History Log (`patient_medical_history_log`)**: Every modification records the actor (patient or doctor), timestamp, clinical reason, and exact field-by-field before $\rightarrow$ after diffs.
* **Optimistic Concurrency Control**: Saves enforce `expectedVersion` matching. Concurrent edits from stale browser tabs are rejected with a "Reload Latest" prompt.
* **Chronological Visit Timeline**: Encounters display across all clinic departments with doctor diagnosis, clinical notes, follow-up advice, and prescriptions.

### 5. 💳 Razorpay Payments & Tiered Refund Policies
* **10-Minute Seat Holds**: Selected slots are temporarily reserved for 10 minutes while payment is processed in Razorpay Sandbox.
* **Automatic Expiration Worker**: Expired reservations release their seats back to the public pool automatically.
* **Tiered Notice Cancellation Refunds**:
  * $\ge$ **24 hours notice**: 100% full refund.
  * **2 to 24 hours notice**: 50% partial refund.
  * $<$ **2 hours notice**: 0% refund (clinical commitment window).
* **Printable Invoices**: Automated GST-ready printable receipts and payment audit history.

### 6. 📬 Transactional Notification Outbox
* **Decoupled Outbox Pattern**: Booking operations insert notifications into an `outbox` table within the same ACID database transaction, ensuring email failures never abort a booking.
* **Dual Delivery Channels**: Primary delivery via Brevo (Sendinblue) with fallback to Resend and local console logging.
* **Dead-Letter Dashboard**: Admin console (`/admin/notifications`) for inspecting failed deliveries with one-click re-queueing.

---

## 🔒 Role-Based Access Control (RBAC) Matrix

| Action / Capability | Patient | Treating Doctor | Assigned Receptionist | Clinic Admin |
|---|:---:|:---:|:---:|:---:|
| **Discover Specialists & Browse Availability** | ✅ | ✅ | ✅ | ✅ |
| **Book Appointment & Process Payment** | ✅ (Own) | ❌ | ❌ | ❌ |
| **Check In Patient (Same Day)** | ❌ | ✅ (Solo fallback) | ✅ (Assigned doctors) | ❌ |
| **Mark Patient Unavailable / No-Show** | ❌ | ✅ (Solo fallback) | ✅ (Assigned doctors) | ❌ |
| **Call Patient into Consultation** | ❌ | ✅ (Own queue) | ❌ | ❌ |
| **Complete Consultation & Write SOAP Notes** | ❌ | ✅ (Own patient) | ❌ | ❌ |
| **Write & Sign Prescriptions** | ❌ | ✅ (Own patient) | ❌ | ❌ |
| **View Full Medical Profile & History** | ✅ (Own) | ✅ (Treating only) | ❌ | ❌ |
| **Update Medical Profile (Versioned)** | ✅ (Own) | ✅ (Treating only) | ❌ | ❌ |
| **Manage Reception Team (Add/Remove Staff)** | ❌ | ✅ (Own team) | ❌ | ❌ |
| **Adjust Elastic Session Hours** | ❌ | ✅ (Own schedule) | ❌ | ❌ |
| **Admin Outbox Dead-Letter Recovery** | ❌ | ❌ | ❌ | ✅ |

---

## 🗄️ Database Architecture & Migrations

The database is built on **Neon PostgreSQL** managed via **Drizzle ORM** through 11 additive, backward-compatible migrations:

```
src/db/migrations/
├── 0000_curious_iron_lad.sql              # Core users, doctors, patients, appointments
├── 0001_ambiguous_shriek.sql              # Weekly availability sessions & slot capacity
├── 0002_hard_makkari.sql                  # Consultations, SOAP clinical notes & prescriptions
├── 0003_careless_mister_sinister.sql      # Doctor leave dates & schedule exceptions
├── 0004_sharp_the_liberteens.sql          # Razorpay billing, payments, holds & refunds
├── 0005_abandoned_black_crow.sql          # Transactional notification outbox & dead-letter queue
├── 0006_scheduling_dates.sql              # Wave & Stream recurring, date-of-month, and one-off dates
├── 0007_overjoyed_lethal_legion.sql       # OPD check-in timestamps, tokens & queue status
├── 0008_perpetual_expediter.sql           # Queue index optimization & check-in guards
├── 0009_receptionist_assignments.sql      # Doctor-assigned receptionists & portal auth
└── 0010_patient_medical_history.sql       # Medical profiles, history audit log & visit records
```

---

## 🧪 Comprehensive Verification Suite

Medrella includes an automated clinical verification harness covering **891 tests across 17 specialized test suites**:

| Suite | Focus Area | Checks |
|---|---|:---:|
| `test-suite.ts` | Clinical OPD Core, Password Cryptography, Double-Booking, Cancellations | 18 |
| `test-payment-hardening.ts` | Razorpay Verification, 10-Min Holds, Tiered Refunds, Double-Refund CAS | 10 |
| `test-notifications.ts` | Notification Outbox, Admin Dead-Letter Queue, PII Scrubbing | 81 |
| `test-brevo-welcome.ts` | Brevo Delivery, Welcome Sequences, Failure-Resilient Outbox | 31 |
| `test-agent.ts` | Conversational Agent Parser, Confirm Card Generator, Tool Executor | 42 |
| `test-assistant.ts` | Web Audio VAD, Barge-in Interruptions, Language Auto-Detection | 99 |
| `test-dev-store.ts` | Zero-Dependency In-Memory Dev Store Hot Reload & Persistence | 7 |
| `test-voice-choice.ts` | Multilingual Natural Voice Synthesis Selection (Indian Accents) | 14 |
| `test-chat-history.ts` | Local Storage Chat History, Quota Management, Sign-out Purging | 41 |
| `test-timezone.ts` | Multi-Timezone Consistency (UTC, Asia/Kolkata, America/Los_Angeles) | 4 |
| `test-scheduling.ts` | Stream vs Wave Capacity, Date-of-Month & One-off Recurring Sessions | 114 |
| `test-elastic.ts` | Elastic Session Expansion/Shrinkage, Booking Relocation Strategy | 105 |
| `test-phase1-hardening.ts` | Distributed Rate Limiting, Open Redirect Shields, Password Policies | 48 |
| `test-phase3-lifecycle.ts` | Terminal State Machine Invariants, Race-Free Lock Protocols | 12 |
| `test-checkin-queue.ts` | Dynamic Contiguous Queue Positions, Wait Estimation, Check-In CAS | 23 |
| `test-receptionist-queue.ts` | Front-Desk Permissions, Doctor Scoping, Unavailable Gap-Closing | 24 |
| `test-medical-history.ts` | Medical Profile Diffs, Access Gates, Optimistic Version Locking, LHR Timeline | 22 |
| **Total** | **Full System Automated Verification** | **891** |

---

## 🚀 Production Deployment & Environment Setup

### 1. Cloud Infrastructure Requirements
* **Hosting**: Vercel (Next.js 16.4.6 Node.js runtime).
* **Database**: Neon Serverless PostgreSQL with pooling (`postgresql://...`).
* **AI Provider**: Sarvam AI API Key (`SARVAM_API_KEY`).
* **Payments**: Razorpay Key ID and Secret (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
* **Email**: Brevo API Key (`BREVO_API_KEY`) or Resend (`RESEND_API_KEY`).

### 2. Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:pass@ep-cool-project-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Application Security
SESSION_SECRET="generate-a-random-64-character-hex-secret-here"
ADMIN_EMAILS="admin@rubyhall.com,ops@medrella.com"
NEXT_PUBLIC_APP_URL="https://medrella-healthcare.vercel.app"

# AI Assistant
SARVAM_API_KEY="your-sarvam-ai-key"

# Razorpay Sandbox
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YourKeyHere"
RAZORPAY_KEY_SECRET="YourRazorpaySecretHere"
RAZORPAY_WEBHOOK_SECRET="YourRazorpayWebhookSecretHere"

# Email Delivery
BREVO_API_KEY="your-brevo-api-key"
NOTIFICATION_FROM_EMAIL="appointments@medrella.com"
NOTIFICATION_FROM_NAME="Ruby Hall Clinic Appointments"
```

### 3. Build & Run Commands

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate-all

# Execute TypeScript typechecking
npm run build

# Run complete test suite
npm test
```

---

<div align="center">

**Medrella Healthcare — Enterprise Outpatient Operating System**  
*Built by **Atharva Mandlik** for **Pearl Thoughts***  
*Ruby Hall Clinic, Pune*

</div>

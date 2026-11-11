# 🏥 Medrella Healthcare — Outpatient Platform & AI Agent

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20Postgres-00e599?logo=postgresql)](https://neon.tech/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20(Test%20Mode)-0c2340?logo=razorpay)](https://razorpay.com/)
[![Sarvam AI](https://img.shields.io/badge/AI%20Agent-Sarvam%20AI-orange)](https://www.sarvam.ai/)
[![Deployment](https://img.shields.io/badge/Live%20App-Vercel-black?logo=vercel)](https://medrella-healthcare.vercel.app)

Production outpatient clinical management system with an integrated **Conversational Healthcare Agent** for **Medrella Healthcare, Ruby Hall, Pune, Maharashtra**.

🚀 **Live Production Application**: [https://medrella-healthcare.vercel.app](https://medrella-healthcare.vercel.app)

---

## 💎 Platform Capabilities

> [!NOTE]
> ### 🤖 Conversational Healthcare Agent
> **Patient-in-the-Loop Triage** · Multilingual AI triage in English, Hindi, and Marathi powered by Sarvam AI (`sarvam-105b-conversations`). Pre-model safety checks route acute emergencies (chest pain, severe bleeding, self-harm) immediately to **112**. Agent executes scoped, read-only slot lookups and returns interactive booking cards for patient review and authorization.

> [!TIP]
> ### 📅 Elastic & Multi-Session Scheduling
> **Flexible Clinic Roster** · Morning & Evening OPD shifts repeating weekly, on specific monthly dates (1–31), or one-date-only with Stream & Wave options (1–20 patients/slot). **Elastic Scheduling** (`src/lib/elastic-schedule.ts`) allows expanding or shrinking session hours with active bookings without displacing patients.

> [!IMPORTANT]
> ### 💳 Razorpay Payments & Automated Tiered Refunds
> **Financial Integrity** · 10-minute concurrency seat holds, server-side HMAC-SHA256 signature verification, and automated tiered cancellation refunds (≥24h: 100%, 2h–24h: 50%, <2h: 0%, Doctor Cancel: 100%). Fees are strictly read from the database, ignoring client-side values.

> [!NOTE]
> ### 📬 Reliable Transactional Email Outbox & DLQ
> **Fail-Safe Dispatch** · Outbox pattern with Brevo & Resend APIs. Reminders calculated in Asia/Kolkata (`Asia/Kolkata`, IST = UTC+05:30) with pre-send appointment status recheck. Protects clinical privacy through strict PHI redaction and offers an admin Dead-Letter Queue (DLQ) monitor (`/admin/notifications`).

---

## 🧭 Core Application Matrix

| Module | Route / Path | Capabilities & Highlights |
|---|---|---|
| **AI Assistant** | `/patient/assistant` | Triage, specialist search, slot availability, and booking proposal cards. |
| **Live OPD Queue** | `/queue` | Real-time waiting board with triage badges & obstetric emergency override. |
| **Reception Desk** | `/reception` | Walk-in registration, token allocation, and doctor session monitoring. |
| **Doctor Encounters** | `/encounters` | Consultation workspace with Chief Complaint, SOAP notes, ICD-10, & vitals. |
| **Weekly Schedule** | `/schedule` | 7-day multi-column calendar grid (8:00 AM – 5:00 PM) for OPD shifts. |
| **Doctor Availability** | `/doctor/availability` | Shift configurator (weekly, date-of-month, one-date, wave/stream capacity). |
| **Admin DLQ Outbox** | `/admin/notifications` | Delivery status monitor, dead-letter inspection, and 1-click retry requeue. |
| **Patient Settings** | `/settings` | Notification consent preferences & audit tracking with 1-click unsubscribe. |

---

## 🛡️ Architecture & Safety Pipeline

| Layer | Safety Mechanism | Implementation Details |
|---|---|---|
| **Emergency Triage** | Pre-Model Safety Filter | Keyword & regex detection across EN, HI, MR. Emergency guidance (112) is returned immediately without contacting the LLM. |
| **Agent Execution** | Scoped Read-Only Tools | Zod-validated parameters; agent cannot book or process payments directly. Tool calls logged in `agent_events` without message text. |
| **Seat Concurrency** | 10-Minute Concurrency Holds | Holds occupy capacity in stream/wave slot checks; unexpired holds prevent double-booking. |
| **Notifications** | Fail-Safe Outbox Pattern | Outbox decoupled from clinical operations; delivery errors never fail bookings. PHI and symptoms are strictly redacted. |
| **Timezone Precision** | Deterministic IST Handling | All appointment and reminder calculations evaluated in `Asia/Kolkata` (IST = UTC+05:30), avoiding UTC boundary shifts. |

---

## 🏃 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Run database migrations (additive only)
npm run db:migrate-0005    # adds agent audit table
npm run db:migrate-0006    # adds flexible scheduling recurrence

# 4. Start local development server
npm run dev

# 5. Run automated test suites (zero network required)
npm test
```

> [!TIP]
> **Zero-Database Offline Mode**: Set `DATABASE_URL="disabled-for-local-test"` and `USE_MOCK_PAYMENTS=true` to run completely offline with seeded specialists and simulated gateways.

---

## ⏱️ Background Cron Endpoints

Exposed for external schedulers (e.g., [cron-job.org](https://cron-job.org) or Vercel Cron) secured with `CRON_SECRET` Bearer authentication:

| Endpoint | Frequency | Function |
|---|:---:|---|
| `GET /api/cron/notifications` | Every 1 min (`* * * * *`) | Dispatches due notification emails and retries failures with backoff. |
| `GET /api/cron/payments` | Every 2 min (`*/2 * * * *`) | Reconciles captured payments and clears expired 10-min seat holds. |
| `GET /api/cron/engagement` | Daily (`0 10 * * *`) | Runs post-visit follow-ups, 90-day checkups, and 180-day re-engagement. |

---

## 🧪 Automated Test Verification

The application includes comprehensive automated test suites with **zero network dependencies**:

| Test Suite | Tests | Scope |
|---|:---:|---|
| **`src/test-suite.ts`** | **115** | Clinical rules, wave/stream capacity, token sequences, and double-booking guard. |
| **`src/test-payment-hardening.ts`** | **72** | Razorpay webhooks, signature verification, seat holds, and tiered refund engine. |
| **`src/test-notifications.ts`** | **81** | Outbox deduplication, IST midnight calculations, PHI redaction, and DLQ retries. |
| **`src/test-agent.ts`** | **72** | Sarvam AI tool calling, safety checks, multilingual emergency triage, and crons. |
| **Scheduling Timezone Suite** | **50** | Advanced recurrence (dates 1–31, one-date-only) across multiple client timezones. |
| **Total Test Suite** | **390 Passed** | **0 Failed · 100% Deterministic** |

---

## 👤 Pre-Seeded Test Credentials

| Specialty | Doctor Email | Password | Fee |
|---|---|---|:---:|
| **Cardiology** | `dr.rohan.mehta@medrella.com` | `Doctor@123` | ₹800 |
| **Neurology** | `dr.priya.nair@medrella.com` | `Doctor@123` | ₹900 |
| **Orthopedics** | `dr.arjun.rao@medrella.com` | `Doctor@123` | ₹750 |
| **General Medicine** | `dr.sandeep.kulkarni@medrella.com` | `Doctor@123` | ₹500 |
| **Patient Registration** | Register at `/register` | Custom | — |
| **Admin DLQ Dashboard** | `admin@rubyhall.com` | Configured via `ADMIN_EMAILS` | — |

---

## 📄 License & Attribution

Developed by **Atharva Mandlik** for **Pearl Thoughts** Full Stack Development Assessment.  
Designed for **Medrella Healthcare, Ruby Hall, Pune, Maharashtra**.

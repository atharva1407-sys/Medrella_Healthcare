<div align="center">

# 🏥 Medrella Healthcare — Outpatient Platform & AI Assistant

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,postgres,nodejs,vercel,docker" alt="Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, Node.js, Vercel" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16.4-black?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16.4" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=000000" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Neon_PostgreSQL_16-00E599?style=flat-square&logo=postgresql&logoColor=0B0D0E" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/Razorpay_Gateway-02042B?style=flat-square&logo=razorpay&logoColor=3395FF" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Sarvam_AI-FF6F00?style=flat-square&logo=probot&logoColor=white" alt="Sarvam AI" />
  <img src="https://img.shields.io/badge/CI%2FCD-100%25_Passing-success?style=flat-square&logo=githubactions&logoColor=white" alt="CI/CD Status" />
</p>

Full-stack outpatient clinical management platform with **Multilingual AI Clinical Voice Assistant**, **Elastic OPD Scheduling**, **Razorpay Payments with Tiered Refunds**, and **Reliable Transactional Outbox Notifications** for **Medrella Healthcare, Ruby Hall Clinic, Pune**.

🚀 **Live Production Application**: [https://medrella-healthcare.vercel.app](https://medrella-healthcare.vercel.app)

</div>

---

## ⚡ Executive Summary for Reviewers

Medrella Healthcare is architected for clinical reliability, zero double-booking under concurrency, and secure patient access:

- **🤖 Patient-in-the-Loop AI Assistant**: Text & hands-free voice in English, Hindi, Marathi, and Hinglish powered by Sarvam AI (`sarvam-105b-conversations`). Mutating actions (bookings, cancellations, reschedules) require an explicit user press on a 5-minute HMAC-signed token card. Emergency keywords bypass LLM and route to **112**.
- **📅 Elastic Session Scheduling**: Doctors dynamically stretch or shrink OPD sessions without dropping booked patients (`src/lib/elastic-schedule.ts`). Supports Stream & Wave formats (1–20 patients/slot), recurring weekly, monthly dates (1–31), and one-date clinics.
- **🔒 Zero Double-Booking Concurrency**: PostgreSQL transaction-scoped advisory locks (`pg_advisory_xact_lock`) on doctor-day hashes guarantee serializable slot reservations during concurrent burst traffic.
- **💳 Razorpay Payments & Tiered Refunds**: 10-minute temporary seat hold with live countdown, server-side HMAC-SHA256 signature verification, idempotent webhook processing, and automated tiered refunds (≥24h: 100%, 2h–24h: 50%, <2h: 0%, Doctor Cancel: 100%).
- **📬 Reliable Transactional Email Outbox**: Fail-safe database queuing with Brevo & Resend dispatch, strict Asia/Kolkata (`Asia/Kolkata`, IST = UTC+05:30) precision, pre-send status recheck, clinical PHI redaction, and an Admin Dead-Letter Queue (DLQ) monitor.
- **✅ Rigorous Test Coverage**: **580+ automated checks across 11 test suites**, including real PostgreSQL concurrency tests and Playwright E2E browser tests (100% green in GitHub Actions CI).

---

## 🔑 Reviewer Demo Accounts & Test Credentials

All roles are pre-seeded in the database for instant testing:

| Role / Specialist | Login Email | Password | Clinical Purpose & Demo Focus |
|---|---|---|---|
| **Cardiology** | `dr.rohan.mehta@medrella.com` | `Doctor@123` | Morning & Evening OPD shifts · ₹800 consultation fee |
| **Neurology** | `dr.priya.nair@medrella.com` | `Doctor@123` | Wave & Stream sessions · ₹900 fee · Elastic rescheduling |
| **Orthopedics** | `dr.arjun.rao@medrella.com` | `Doctor@123` | Sports trauma OPD · ₹750 fee · Leave dates management |
| **General Medicine** | `dr.sandeep.kulkarni@medrella.com` | `Doctor@123` | Walk-in triage · ₹500 fee · SOAP notes & prescriptions |
| **Patient Account** | *Self-register at `/register`* | *Any 8+ char* | Instant access to AI Assistant, Slot Picker & Payments |
| **Admin Monitor** | `admin@rubyhall.com` | *Authorized* | Live Email Outbox & Dead-Letter Queue at `/admin/notifications` |

### Razorpay Sandbox Test Payment Details
- **Test Card (Visa)**: `4718 6091 0820 4366` · Exp: `12/28` · CVV: `123`
- **Test UPI**: `success@razorpay` *(instant success simulation)*

---

## 🧭 Core Application Routes

| Path | Purpose & Reviewer Highlights |
|---|---|
| [`/`](https://medrella-healthcare.vercel.app/) | Landing page, hospital branding, 8 clinical specialists catalog, next open slot preview |
| [`/book`](https://medrella-healthcare.vercel.app/book) | Interactive slot picker, 10-minute seat hold timer, wave & stream capacity chips |
| [`/queue`](https://medrella-healthcare.vercel.app/queue) | Real-time live OPD waiting queue with obstetric pre-eclampsia priority override |
| [`/doctor/dashboard`](https://medrella-healthcare.vercel.app/doctor/dashboard) | Doctor schedule, encounter completion, no-show marking, session shifts manager |
| [`/patient/dashboard`](https://medrella-healthcare.vercel.app/patient/dashboard) | Patient portal with floating multilingual AI Voice Assistant (`useVoice` STT/TTS) |
| [`/patient/prescriptions`](https://medrella-healthcare.vercel.app/patient/prescriptions) | Digital prescriptions, dosage instructions, and active medication list |
| [`/admin/notifications`](https://medrella-healthcare.vercel.app/admin/notifications) | Transactional Outbox monitor, delivery stats, Dead-Letter Queue (DLQ) & 1-click retry |

---

## 🛠️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router UI                        │
│   Landing Page • Patient Portal • Doctor Schedule • Voice Assistant    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Server Actions & API Routes
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Lightweight Repo Facade                         │
│   src/db/repo.ts ──► UserRepo • DoctorRepo • AppointmentRepo • Billing  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 PostgreSQL (Neon Serverless + Local TCP)               │
│    Advisory Locks (pg_advisory_xact_lock) • Additive Migrations 0000-07│
└────────────────────────────────────────────────────────────────────────┘
```

| Layer | Technologies & Implementations |
|---|---|
| **Framework & UI** | Next.js 16.4.3 (Turbopack, App Router), React 19, TypeScript 5, Tailwind CSS 4, Radix UI Primitives, Lucide Icons |
| **Database & ORM** | Neon Serverless PostgreSQL, Drizzle ORM, dual TCP/WebSocket drivers (`pg` + `@neondatabase/serverless`), 8 migrations (`0000`–`0007`) |
| **Security & Auth** | PBKDF2 (600,000 iterations), signed HTTP-only JWT cookies (`Secure; HttpOnly; SameSite=Lax`), role-based access control |
| **Concurrency Guard** | Transaction-scoped advisory locks (`pg_advisory_xact_lock(hashtext(key))`), atomic slot re-validation before commit |
| **Payments** | Razorpay Gateway (Sandbox), 10-min seat holds, HMAC-SHA256 verification, idempotent webhooks, tiered refunds |
| **Email & Outbox** | Transactional Outbox Pattern, Brevo API, Resend API, ConsoleChannel fallback, Asia/Kolkata (`Asia/Kolkata`, IST = UTC+05:30) precision |
| **AI Assistant** | Sarvam AI (`sarvam-105b-conversations`), Multilingual voice & text (EN, HI, MR, Hinglish), Zod tool calling, signed cards |

---

## 🧪 Automated Testing & Verification Suite

Medrella Healthcare includes 11 dedicated test suites running on every pull request and commit:

```bash
# Run all 11 domain test suites (580+ checks, 0 network required)
npm test

# Run genuine PostgreSQL concurrency & advisory lock tests
npm run test:pg

# Run Playwright end-to-end browser user journeys
npm run test:e2e
```

| Suite | Focus Area | Checks |
|---|---|:---:|
| `test-suite.ts` | Auth, slots, cancellation policies, queue, wave tokens, doctor leave | **115** Pass |
| `test-payment-hardening.ts` | Razorpay order validation, signature verification, tiered refunds | **51** Pass |
| `test-notifications.ts` | Transactional outbox, Asia/Kolkata timezone, DLQ retry, PHI redaction | **56** Pass |
| `test-brevo-welcome.ts` | Multi-channel email delivery, template rendering, failure isolation | **31** Pass |
| `test-agent.ts` | Assistant tool schemas, role guards, prompt structure, emergency triage | **37** Pass |
| `test-assistant.ts` | Multilingual 112 routing, token signing, voice hands-free detection | **99** Pass |
| `test-timezone.ts` | Cross-timezone consistency across UTC, Asia/Kolkata, US/Pacific, Auckland | **4** Pass |
| `test-scheduling.ts` | Elastic schedule expansion & shrinking, slot preservation | **114** Pass |
| `test-elastic.ts` | Interactive session shift re-calculation without patient drop | **14** Pass |
| `test-phase1-hardening.ts` | Connection-pinned migrations, advisory locks, distributed rate limiting | **48** Pass |
| `test-phase3-lifecycle.ts` | Appointment state machine transitions, burst double-booking prevention | **12** Pass |

---

## 🏃 Getting Started Locally

```bash
# 1. Clone repository
git clone https://github.com/atharva1407-sys/Medrella_Healthcare.git
cd Medrella_Healthcare

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Start development server
npm run dev
# Open http://localhost:3000
```

> [!TIP]
> **Offline Demo Mode**: To test locally without configuring a database, set `DATABASE_URL="disabled-for-local-test"` and `USE_MOCK_PAYMENTS=true` in `.env.local`. The built-in in-memory repository will automatically seed doctors and appointments.

---

## 📄 License & Attribution

Developed by **Atharva Mandlik** for **Medrella Healthcare, Ruby Hall Clinic, Pune, Maharashtra**.

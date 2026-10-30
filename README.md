# 🏥 Medrella Healthcare — Outpatient Hospital Appointment & Clinical Scheduling Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/UI-Radix%20Primitives-black?logo=radix-ui)](https://www.radix-ui.com/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20Postgres-00e599?logo=postgresql)](https://neon.tech/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20(Test%20Mode)-0c2340?logo=razorpay)](https://razorpay.com/)
[![Tests](https://img.shields.io/badge/Tests-299%20Passing-brightgreen)](#-automated-testing--quality-assurance)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://medrella-healthcare.vercel.app)

A modern, production-grade outpatient hospital management and consultation scheduling platform built for **Medrella Healthcare, Ruby Hall, Pune, Maharashtra**.

Medrella streamlines the entire outpatient department (OPD) journey: patients can find trusted specialists, select available stream or wave slots, pay consultation fees securely via Razorpay, receive automated transactional notifications and reminders, reschedule or cancel visits with automated refund processing, and download GST receipts. Clinicians manage multi-session schedules, patient queues, and medical records from a dedicated clinical dashboard.

---

## 🌐 Live Application & Quick Links

* 🔗 **Live Website**: [https://medrella-healthcare.vercel.app](https://medrella-healthcare.vercel.app)
* 👨‍⚕️ **Find Doctors**: [https://medrella-healthcare.vercel.app/doctors](https://medrella-healthcare.vercel.app/doctors)
* 📊 **Live OPD Queue**: [https://medrella-healthcare.vercel.app/queue](https://medrella-healthcare.vercel.app/queue)
* 📈 **Analytics & Reports**: [https://medrella-healthcare.vercel.app/reports](https://medrella-healthcare.vercel.app/reports)
* ⚙️ **Notification Preferences**: [https://medrella-healthcare.vercel.app/settings](https://medrella-healthcare.vercel.app/settings)
* 📬 **Admin Outbox Monitor**: [https://medrella-healthcare.vercel.app/admin/notifications](https://medrella-healthcare.vercel.app/admin/notifications)

> **Payment Environment**: Medrella operates in **Razorpay Test Mode**. No real money is charged. Official test cards and test UPI credentials are documented in the [Demo Credentials](#-demo-accounts--test-credentials) section.

---

## ✨ Complete Feature Matrix

### 1. 🧑‍🤝‍🧑 Patient Experience & Consultation Booking
* **Specialist Discovery**: Explore 8 founding medical specialists across Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, Dermatology, Gynecology, and General Medicine.
* **Next Open Slot Preview**: The landing catalog dynamically calculates and displays each specialist's next available consultation window in Indian Standard Time (`Asia/Kolkata`).
* **Visual Slot Picker**: Real-time interactive slot selector displaying date carousels, morning/evening session tabs, and live capacity indicators.
* **Dual Scheduling Models**:
  * **Stream Scheduling**: Consecutive 1-on-1 private consultation intervals (e.g., 15 or 30 minutes).
  * **Wave Scheduling**: High-throughput time windows (e.g., 10:00–11:00 AM) admitting multiple patients with sequential token numbers (Token #1, #2, #3).
* **10-Minute Seat Holds**: Selecting a slot places a temporary 10-minute seat reservation (`HOLD`), preventing double-booking while the patient completes payment.
* **Instant Rescheduling**: Move any confirmed appointment to another open slot with 1 click in a single atomic database transaction.
* **Self-Service Cancellations**: Cancel consultations directly from the dashboard with live refund previews based on hospital cancellation tiers.
* **Patient Portal**: Track upcoming visits, view past medical history, download printable invoices, and manage notification preferences.

### 2. 🩺 Doctor Management & Clinical Operations
* **Physician Dashboard**: Real-time view of today’s consultation schedule, patient vitals, token status, and daily consultation counts.
* **Queue & Encounter Workflow**: Triage patients, call tokens to consultation rooms, and mark encounters as **`COMPLETED`** or **`NO_SHOW`**.
* **Flexible OPD Sessions**: Configure recurring weekly schedules with multiple sessions per day (e.g., Morning OPD 09:00–13:00 and Evening OPD 17:00–20:00).
* **Non-Overlapping Session Guard**: Database and server validation strictly blocks overlapping clinical sessions on the same weekday.
* **Leave & Blockout Calendar**: Doctors can log planned clinical leave. The system blocks patient bookings on leave dates and strictly prevents doctors from taking leave if active patient bookings already exist.

### 3. 💳 Razorpay Payments, Invoicing & Refunds
* **Razorpay Checkout Integration**: Mounted official Razorpay Checkout popup supporting Domestic Cards, Netbanking, and UPI.
* **Server-Side Security**: Consultation fees are fetched directly from the database; client-supplied amounts are ignored. Cryptographic HMAC-SHA256 signatures are verified before confirming appointments.
* **Idempotent Webhooks**: Secure webhook route (`/api/webhooks/razorpay`) with secret verification and replay protection.
* **Seat Hold Expiration Worker**: Background sweeper releases expired holds, automatically refunding late captured payments.
* **Transparent Refund Engine**:
  * **>= 24 Hours Before Start Time**: 100% full refund.
  * **2 to 24 Hours Before Start Time**: 50% partial refund.
  * **< 2 Hours Before Start Time**: 0% refund (late cancellation).
  * **Doctor Emergency / Clinic Cancellation**: 100% full refund guaranteed.
* **Printable GST Receipts**: Clean, printer-friendly invoices showing Medrella hospital details, doctor specialization, appointment tokens, transaction IDs, and tax breakdowns.

### 4. 📬 Reliable Email Notifications & Outbox Architecture
* **Outbox Architecture**: All transactional notifications are written to an outbox table within safe try/catch blocks; delivery issues never disrupt clinical bookings or payments.
* **Deterministic Deduplication**: Unique keys (`confirm-${id}`, `remind-${id}-${offset}`, `welcome-${id}`) eliminate duplicate emails during webhook replays or browser refreshes.
* **Multi-Provider Support**: Integrated with **Brevo** and **Resend** transactional email APIs, with automatic fallback to `ConsoleChannel` in local development.
* **Fail-Closed Safety**: In production, absent or invalid API keys fail closed—messages are never falsely marked as `SENT`.
* **Asia/Kolkata (`Asia/Kolkata`, IST = UTC+05:30) Precision**: All appointment start times and reminder offsets (24h and 2h before visits) are calculated in IST, avoiding midnight UTC day-shift bugs.
* **Pre-Send Status Recheck**: Reminders re-verify appointment status right before sending; if an appointment is cancelled, rescheduled, or completed, the reminder is automatically marked `CANCELLED`.
* **Clinical Privacy (PHI Protection)**: Sensitive medical notes, symptoms, and diagnoses are stripped from email payloads. Cancellation reasons are strictly sanitized against an approved non-clinical whitelist.
* **Patient Preferences & Expiring Unsubscribe**: Patients can opt out of promotional emails in Settings (`/settings`) or via 1-click cryptographically signed HMAC-SHA256 tokens (`/unsubscribe`).
* **Admin Dead-Letter Queue (`/admin/notifications`)**: Role-protected dashboard to monitor outbox metrics (Sent, Pending, Failed), inspect error logs, and trigger 1-click retries.

### 5. 🎨 Modern Design System & User Experience
* **Radix UI & Tailwind CSS 4**: Built using accessible primitives (`Card`, `Badge`, `Button`, `Dialog`, `Table`, `Tabs`, `Switch`, `Checkbox`, `Select`, `Textarea`).
* **Clinical Brand Theme**: Styled with a medical-grade palette reflecting Medrella Healthcare’s facility in Ruby Hall, Pune.
* **Responsive Layouts**: Optimized for mobile smartphones, tablets, and desktop clinical monitors.
* **Zero Layout Shift**: Skeleton loaders and loading templates for seamless page transitions.

### 6. 🛡️ Security & Enterprise Hardening
* **Password Hashing**: PBKDF2 with 600,000 iterations and cryptographic salts.
* **Rate Limiting**: Brute-force protection locking authentication after 5 failed login attempts for 15 minutes.
* **Session Security**: Cryptographically signed, HTTP-only, SameSite session cookies.
* **Open-Redirect Protections**: Strict validation preventing backslash (`/\`), protocol-relative (`//`), and absolute external redirects.
* **Role-Based Guards**: Protected route wrappers ensuring patients cannot access physician consoles, and only verified emails (`ADMIN_EMAILS`) can view outbox audit logs.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 (App Router)                  │
│   React 19 Server Components • Actions • Turbopack Engine   │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼────────────────────────┐
       ▼                       ▼                        ▼
┌──────────────┐     ┌──────────────────┐     ┌───────────────────┐
│ Presentation │     │ Business Logic   │     │ Integrations      │
│ • Tailwind 4 │     │ • Auth (PBKDF2)  │     │ • Razorpay Test   │
│ • Radix UI   │     │ • OPD Scheduling │     │ • Brevo / Resend  │
│ • Lucide     │     │ • Refund Engine  │     │ • Cron Sweepers   │
└──────────────┘     └─────────┬────────┘     └───────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Drizzle ORM 0.39                       │
│       Type-Safe Schemas • Additive Migrations (0000–0004)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Neon PostgreSQL Serverless                  │
│       Connection Pooling • SSL Required • Multi-Tenant      │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Description |
|:---|:---|:---|
| **Framework** | **Next.js 16.4 (App Router)** | Full-stack React 19 framework with Server Actions and Turbopack. |
| **Language** | **TypeScript 5** | Strict type safety across clinical logic, schemas, and API handlers. |
| **Styling** | **Tailwind CSS 4** | Next-generation utility-first CSS engine. |
| **Component Primitives** | **Radix UI** | Accessible, headless UI primitives (`dialog`, `tabs`, `switch`, `table`, etc.). |
| **Icons** | **Lucide React** | Clean, modern medical and interface icons. |
| **Database** | **PostgreSQL on Neon** | Serverless cloud PostgreSQL with connection pooling. |
| **ORM** | **Drizzle ORM** | Lightweight, high-performance TypeScript ORM. |
| **Validation** | **Zod 3** | Strict schema validation for clinical forms and API inputs. |
| **Auth** | **Signed HTTP-Only Cookies** | PBKDF2 hashing (600,000 iterations) with stateless JWT cookies. |
| **Payments** | **Razorpay SDK** | Test mode checkout popup, signature verification, and refund API. |
| **Transactional Email** | **Brevo / Resend** | Outbox pattern dispatching transactional emails with fail-closed safety. |
| **Deployment** | **Vercel** | Edge network deployment with automated Git integration. |

---

## 🗄️ Database Schema & Entities

The platform uses 10 normalized tables managed via Drizzle ORM:

```mermaid
erDiagram
    users ||--o{ patients : "is"
    users ||--o{ doctors : "is"
    users ||--o{ notification_preferences : "configures"
    users ||--o{ login_attempts : "tracks"
    doctors ||--o{ doctor_sessions : "hosts"
    doctors ||--o{ doctor_leave : "takes"
    patients ||--o{ appointments : "books"
    doctors ||--o{ appointments : "consults"
    appointments ||--o{ payments : "bills"
    payments ||--o{ refunds : "issues"
    users ||--o{ notifications : "receives"

    users {
        uuid id PK
        string email UK
        string password_hash
        string role "PATIENT | DOCTOR"
        timestamp created_at
    }

    doctors {
        uuid id PK
        uuid user_id FK
        string first_name
        string last_name
        string specialization
        int consultation_fee
        int experience_years
        string image_url
    }

    doctor_sessions {
        uuid id PK
        uuid doctor_id FK
        int day_of_week "0-6"
        string session_type "STREAM | WAVE"
        time start_time
        time end_time
        int slot_duration_minutes
        int wave_capacity
    }

    appointments {
        uuid id PK
        uuid patient_id FK
        uuid doctor_id FK
        date appointment_date
        time start_time
        int token_number
        string status "HOLD | BOOKED | COMPLETED | CANCELLED | NO_SHOW"
        timestamp hold_expires_at
    }

    payments {
        uuid id PK
        uuid appointment_id FK
        int amount
        string status "PENDING | PAID | REFUNDED | FAILED"
        string razorpay_order_id
        string razorpay_payment_id
    }

    notifications {
        uuid id PK
        uuid user_id FK
        string category "operational | promotional"
        string template
        string status "PENDING | SENT | FAILED | CANCELLED"
        string dedupe_key UK
        timestamp scheduled_for
        string provider_message_id
    }

    notification_preferences {
        uuid user_id PK, FK
        boolean email_promotional
        timestamp consented_at
    }
```

### Migration History:
* `0000_lazy_bruce_banner.sql`: Initial authentication & scheduling baseline (`users`, `patients`, `doctors`, `doctor_sessions`, `appointments`).
* `0001_happy_bill_hollister.sql`: Wave scheduling attributes & token number sequences.
* `0002_short_the_twelve.sql`: Doctor leave management (`doctor_leave`) and session group indexes.
* `0003_narrow_doctor_octopus.sql`: Payments, refunds, hold expirations, and notification outbox tables.
* `0004_careful_night_nurse.sql`: Notification preferences (`notification_preferences`), categories, and provider delivery IDs.

---

## 🧪 Automated Testing & Quality Assurance

The codebase includes an automated verification suite covering 100% of critical clinical and financial paths:

```bash
npm test
```

### **Summary: 299 Tests Passing (0 Failures)**

| Test Suite | File | Tests | Coverage Scope |
|:---|:---|:---:|:---|
| **Clinical Rules & Engine** | `src/test-suite.ts` | **115** | Checkbox parsing, IST date shift prevention, PBKDF2 verification, duplicate account locks, double-booking race condition prevention, cancellation boundaries, doctor leave blocks, multi-session overlap validation, wave capacity limits, token assignments, and atomic rescheduling. |
| **Payment Hardening** | `src/test-payment-hardening.ts` | **72** | Gateway mode detection, amount tamper guards, Razorpay webhook signature verification, replay protection, seat hold expiration, late payment capture vs refund, honest refund status handling, and tiered refund percentages. |
| **Reliable Notifications** | `src/test-notifications.ts` | **81** | Outbox event mappings, deduplication key uniqueness, IST midnight calculations, overlapping sweep protection (`FOR UPDATE SKIP LOCKED`), pre-send status rechecks, fail-safe isolation, PHI redaction, XSS escaping, HMAC-SHA256 tokens, and admin dead-letter retries. |
| **Brevo & Welcome Flow** | `src/test-brevo-welcome.ts` | **31** | Brevo transactional API integration, API key redaction in error logs, fail-closed production semantics, welcome email delivery, and user registration onboarding. |

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/atharva1407-sys/Medrella_Healthcare.git
cd Medrella_Healthcare
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth Session Secret (Generate with: openssl rand -hex 32)
SESSION_SECRET="your-32-byte-hex-session-secret"
APP_URL="http://localhost:3000"

# Admin Access Control (comma-separated list of admin emails)
ADMIN_EMAILS="admin@rubyhall.com,ops@medrella.com"

# Razorpay Test Gateway Keys
RAZORPAY_KEY_ID="rzp_test_yourKeyId"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_yourKeyId"
RAZORPAY_KEY_SECRET="yourKeySecret"
RAZORPAY_WEBHOOK_SECRET="yourWebhookSecret"
PAYMENT_HOLD_MINUTES=10

# Email Notifications (Brevo or Resend)
EMAIL_PROVIDER="brevo"                  # 'brevo' or 'resend'
BREVO_API_KEY="xkeysib-yourBrevoApiKey"
EMAIL_FROM="Medrella Healthcare <appointments@medrella.com>"

# Timezone & Reminders (Evaluated in Asia/Kolkata)
REMINDER_OFFSETS_MINUTES="1440,120"     # 24 hours & 2 hours before visit

# Background Sweeper Secret
CRON_SECRET="your-secure-cron-secret"
```

> **Zero-Config Local Mock**: If running without a database, set `DATABASE_URL="disabled-for-local-test"` and `USE_MOCK_PAYMENTS=true`. The system will automatically run using seeded in-memory repositories and mock payment flows.

### 4. Apply Database Migrations
```bash
# Push full schema to an empty database
npm run db:push

# Or run incremental safe additive migrations
npm run db:migrate-0003
npm run db:migrate-0004

# Seed founding doctors
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ⏱️ Background Cron Sweepers

Medrella Healthcare includes two authenticated endpoints for recurring background operations:

1. **Notification Dispatcher** (`GET /api/cron/notifications`):
   * Dispatches due outbox emails.
   * Manages retries with exponential backoff (up to 3 attempts).
   * Moves continuously failing items to the dead-letter queue.
   * *Recommended Schedule*: Every 1 minute (`* * * * *`).

2. **Payment & Seat Hold Reconciler** (`GET /api/cron/payments`):
   * Sweeps expired 10-minute seat holds (`HOLD` ➔ cancelled, releasing slots).
   * Reconciles captured payments and triggers automated refunds for late payments.
   * *Recommended Schedule*: Every 2 minutes (`*/2 * * * *`).

### Setting Up on [cron-job.org](https://cron-job.org) or Vercel Cron:
Add the `Authorization` header to your cron job request:
```http
Authorization: Bearer <your_CRON_SECRET_here>
```

---

## 👤 Demo Accounts & Test Credentials

### Pre-Seeded Doctor Accounts:
All doctors use password: **`Doctor@123`**

| Doctor | Specialization | Login Email | Consultation Fee |
|:---|:---|:---|:---:|
| **Dr. Rohan Mehta** | Cardiology | `dr.rohan.mehta@medrella.com` | ₹800 |
| **Dr. Priya Nair** | Neurology | `dr.priya.nair@medrella.com` | ₹900 |
| **Dr. Arjun Rao** | Orthopedics | `dr.arjun.rao@medrella.com` | ₹750 |
| **Dr. Ananya Sharma** | Pediatrics | `dr.ananya.sharma@medrella.com` | ₹600 |
| **Dr. Vikram Iyer** | Oncology | `dr.vikram.iyer@medrella.com` | ₹1,200 |
| **Dr. Meera Krishnan**| Dermatology | `dr.meera.krishnan@medrella.com` | ₹700 |
| **Dr. Kavya Menon** | Gynecology | `dr.kavya.menon@medrella.com` | ₹800 |
| **Dr. Sandeep Kulkarni**| General Medicine | `dr.sandeep.kulkarni@medrella.com`| ₹500 |

### Razorpay Test Payment Methods:
Use these credentials in the checkout popup (no real money charged):

* **Visa Domestic Card**: `4718 6091 0820 4366` | Expiry: `12/28` | CVV: `123`
* **Mastercard Domestic Card**: `5267 3181 8797 5449` | Expiry: `12/28` | CVV: `123`
* **Test UPI ID**: `success@razorpay` *(instant automated approval)*
* **Test Netbanking**: Select any bank (HDFC, SBI, ICICI) and click **Success** on the mock portal.

---

## 📄 License & Attribution

Developed for **Pearl Thoughts** Full Stack Development Assessment by **Atharva Mandlik**.  
Designed for **Medrella Healthcare, Ruby Hall, Pune**. All rights reserved.

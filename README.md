# Seyal Web Frontend 🚀

> **Next.js 15 (App Router) · TypeScript · Tailwind CSS · Collaborative Workspace & Task Hierarchy**

The modern, responsive web application for **Seyal** — a Notion-style workspace platform designed for colleges, schools, companies, and individuals.

---

## ✨ Key Features

- **🔐 3 Authentication Modes:**
  - **✉️ Email OTP (Passwordless):** Enter email → receive 6-digit verification code → auto-login.
  - **🔑 Email & Password:** Traditional credentials with registration and role assignment.
  - **📱 Phone OTP:** Mobile number SMS verification.
  - **🌐 Social Logins:** Google, Apple, and Facebook OAuth flows.
- **🏢 Multi-Workspace Switcher & Private Personal Mode:**
  - Switch between Organization/Team workspaces and a private **Personal Workspace**.
  - One-click upgrade to convert Personal workspaces into Team workspaces.
- **📋 Hierarchy-First Task Management:**
  - Owner/GM → Department HOD → Faculty/Staff hierarchy.
  - Kanban board (To Do, In Progress, Submitted, Completed).
  - Task submission with evidence attachments and Manager review approval/rejection.
- **📝 Notion-Style Block Editor:**
  - Headings (H1/H2/H3), paragraphs, checklists, bullet lists, blockquotes, callouts, and dividers.
  - Type `/` for instant slash command insertion.
- **📊 Databases & Dynamic Views:**
  - Table and Board views with custom properties (text, date, select, person).
- **💡 Personal Productivity Tools:**
  - **Habit Tracker:** Daily streak tracking, motivational progress stats, and categories.
  - **Templates Library:** Pre-designed templates for daily planners, study schedules, goal tracking, and project roadmaps.
  - **🎂 Birthday & Occasion Reminders:** Countdown timer, turning age calculator, 1-click WhatsApp wishing, mail greetings, and board task generation.
- **🤖 Anthropic Claude 3.5 Sonnet Copilot:**
  - In-app AI assistant for document drafting, project breakdowns, summaries, and strategy queries.
- **📁 Google Workspace Integration:**
  - **Google Drive Explorer:** Search and attach Docs, Sheets, and Slides directly to pages.
  - **Gmail Reader:** View incoming messages and convert emails into workspace tasks with 1 click.
- **🔌 API Keys & Live Integrations Hub:**
  - Dedicated settings modal to enter production API keys for Anthropic Claude, Google Cloud OAuth, and Razorpay.
  - Live roundtrip connection test with latency benchmarks.
- **🌍 Regional Language Support:**
  - Instant toggle between **English** and **Tamil (தமிழ்)** across all views.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS & Lucide Icons
- **HTTP Client:** Native fetch with JWT Bearer Token interceptor & refresh token rotation
- **State Management:** React Context (`AuthContext` with multi-workspace support)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm

### Installation

```bash
# Clone the frontend repository
git clone https://github.com/From-update/seyal---FE.git
cd seyal---FE

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run Next.js development server
npm run dev
```

Open [**http://localhost:3000**](http://localhost:3000) in your browser.

---

## 🐳 Running with Docker

```bash
# Build and run with Docker
docker compose up -d --build

# View logs
docker compose logs -f
```

---

## 🔗 Connected Backend

This frontend connects to the **Seyal Django REST API**:
- Repository: [https://github.com/From-update/seyal--BE.git](https://github.com/From-update/seyal--BE.git)
- Default API URL: `http://localhost:8001/api/v1` (or port `8000`)

---

## 🔑 Demo Login Credentials

You can test the application instantly with pre-seeded demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Owner / GM** | `gm@seyal.app` | `password123` |
| **HOD / Manager** | `manager@seyal.app` | `password123` |
| **Faculty / Staff** | `staff@seyal.app` | `password123` |
| **Personal Student**| `student@seyal.app` | `password123` |

*(Or click the 1-click Demo Role buttons directly on the login screen).*

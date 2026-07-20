# 🚨 Campus Pulse

**A real-time incident reporting and dispatch platform for college campuses.**

Report a fire, medical, or safety incident anonymously in seconds — watch campus staff triage it live, comment on it, and resolve it, with every action tracked in a full audit trail.

---

## 🎥 What it does

Campus Pulse has two sides:

**For anyone on campus (no account needed)**
- Submit an incident report (Fire / Medical / Safety) in under a minute
- Get an 8-character tracking code back immediately
- Check the live status of a report at any time — no login required
- Get pushed status updates over WebSocket the instant an admin acts on it

**For campus staff (authenticated dashboard)**
- Watch new incidents land on the dashboard in **real time**, no refreshing
- Move an incident through its lifecycle: `Active → Investigating → Resolved` (or `False Report`)
- Leave timestamped comments/notes on an incident for a full case timeline
- See a live analytics overview — active vs. resolved counts, average resolution time, false-report rate, incidents by type
- Get in-app notifications when new incidents come in or get resolved
- (Super Admin) Review a complete audit log of every administrative action, and manage admin accounts

---

## 🧱 Tech Stack

| Layer            | Technology                                              |
|-------------------|----------------------------------------------------------|
| Frontend          | Next.js 16 (App Router), React 19, JavaScript (JSX)     |
| Styling / UI      | Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons |
| State             | Zustand (auth), React hooks                              |
| Real-time         | Native browser WebSockets + `reconnecting-websocket`     |
| Backend           | FastAPI (Python)                                          |
| Database          | MySQL                                                     |
| ORM               | SQLAlchemy (sync) + PyMySQL                                |
| Auth              | JWT (`python-jose`) + bcrypt password hashing (`passlib`)  |
| Rate limiting     | SlowAPI (protects the public report endpoint from abuse)   |

No TypeScript, no Alembic migrations, no ORM-agnostic abstraction layers — the stack was kept intentionally lean and readable end to end.

---

## ✨ Feature Highlights

- **Two live WebSocket channels** — one broadcast feed (`/ws/alerts`) that powers the whole admin dashboard, and one per-report channel (`/ws/status/{reference}`) so an anonymous reporter can watch *their own* ticket update live without ever logging in.
- **Anonymous-first reporting** — the public report flow requires zero personal information; the tracking code *is* the access key.
- **Enforced status state machine** — the backend rejects invalid transitions (e.g. you can't resolve an alert that's still `active`), so the pipeline can't get into an inconsistent state.
- **Full audit trail** — every status change is logged with who did it and when, viewable in a dedicated audit log screen.
- **Rate-limited public endpoint** — the anonymous report-creation route is capped (5 requests / 10 minutes per IP) to deter spam/abuse without requiring an account.
- **Theming done right** — a light/dark toggle for the main content area paired with a permanently-dark sidebar "command rail," with a deliberate two-tier color system: one palette for *pipeline status* (active/investigating/resolved) and a separate palette for *incident type* (fire/medical/safety), so the two meanings never visually collide.
- **Optimistic, resilient UI** — auto-reconnecting sockets, skeleton loading states, empty states, and toast notifications throughout.

---

## 🗂️ Project Structure

```
├── backend/               FastAPI application
│   └── app/
│       ├── api/routes/    Route handlers (alerts, auth, comments, audit, admins, dashboard, public, websocket)
│       ├── core/          Config, JWT, password hashing, auth dependencies
│       ├── db/            SQLAlchemy engine/session setup
│       ├── models/        SQLAlchemy models (Alert, User, AuditLog, Comment, Notification)
│       ├── schemas/       Pydantic request/response schemas
│       ├── services/      Business logic, kept out of the route layer
│       └── websocket/     Connection managers for the two socket channels
│
└── frontend/              Next.js application
    └── src/
        ├── app/           Pages: dashboard, alerts, audit-logs, login, report, check-status
        ├── components/    Alert cards, layout shell, shadcn/ui primitives
        ├── hooks/         useAlertsSocket, useStatusSocket
        ├── lib/           Axios instance, shared status/priority metadata, utils
        └── store/         Zustand auth store
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- A running MySQL instance

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/campus_pulse
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run the API:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000` (interactive docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🔌 API Overview

| Method | Endpoint                                   | Access          | Description                              |
|--------|---------------------------------------------|-----------------|-------------------------------------------|
| POST   | `/api/auth/login`                          | Public          | Staff login, returns a JWT                |
| GET    | `/api/auth/me`                             | Authenticated   | Current user profile                      |
| POST   | `/api/alerts/`                             | Public          | Submit a new incident (rate-limited)      |
| GET    | `/api/alerts/`                             | Staff           | Paginated, filterable alert list          |
| PATCH  | `/api/alerts/{id}/investigate`             | Staff           | Move an alert into investigation          |
| PATCH  | `/api/alerts/{id}/resolve`                 | Staff           | Resolve an alert                          |
| PATCH  | `/api/alerts/{id}/false-report`            | Staff           | Mark an alert as a false report           |
| GET/POST | `/api/alerts/{id}/comments`               | Staff           | Timeline / investigation notes            |
| GET    | `/api/public/alerts/{reference}`           | Public          | Look up a report by its tracking code     |
| GET    | `/api/public/latest-alerts`                | Public          | Recent public incident feed for the homepage |
| GET    | `/api/analytics/overview`                  | Staff           | Dashboard stats                           |
| GET    | `/api/audit-logs/`                         | Super Admin     | Full administrative audit trail           |
| GET/POST/DELETE | `/api/admins/`                    | Super Admin     | Manage staff accounts                     |
| WS     | `/ws/alerts`                                | Staff           | Live broadcast of every alert event       |
| WS     | `/ws/status/{reference}`                   | Public          | Live status updates for one report        |

---

## 🎯 Why this project

Campus Pulse was built to demonstrate end-to-end, production-shaped engineering: a real WebSocket architecture (not polling), a strictly enforced backend state machine instead of trusting the client, rate-limiting on public write endpoints, JWT-based auth with role-gated routes, and a UI that pays attention to loading/empty/error states rather than only the happy path — all without over-engineering a solo/portfolio-scale project with unnecessary infrastructure.

---

## 📄 License

This project is available for educational and portfolio purposes.

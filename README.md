# ♻️ GreenSetu

**Sell Smart. Earn Fair. Recycle Right.**
*कबाड़ी से अधिकृत रिसाइकलर तक का डिजिटल सेतु*

GreenSetu is a digital bridge connecting India's informal e-waste collectors (kabadiwalas, scrap aggregators, waste pickers) with **authorized e-waste recyclers** — making formal recycling more profitable, easier, transparent, safer and traceable.

Built as a complete full-stack platform: public landing site + collector mobile web app + recycler dashboard + admin dashboard, with a working backend, QR traceability, offline-first lot creation, tri-lingual voice support and demo data.

---

## ✨ Features

### 🌐 Public site (`/`)
- Premium hero with the Collector → **GreenSetu bridge** → Recycler visual
- "How GreenSetu Works" — 6-step flow (Photo → AI Identify → Fair Price → Recyclers → QR Handover → Payment)
- **Live Price Board** from the database (materials table) with 🇮🇳 Hindi/Marathi voice output and clear **Demo / Sample Market Data** labels
- **Recycler map** with authorization badges, offered rate, distance, pickup availability and rating
- **Unit economics** comparison (Traditional ₹6,500 vs GreenSetu ₹8,500 → +₹2,000)
- Partners, Safety Center (voice-supported), Contact and Footer

### 🧺 Collector app (`/app`, role: collector)
- Mobile-first bottom-nav UI: Home · Sell · Lots · Earnings · Safety
- **Sell flow**: photo (camera/upload) → AI material detection (confidence, manual fallback grid) → weight entry (1/5/10/25 KG chips) → value estimation (range, trend, condition) → **ranked recycler match** (35% auth · 30% price · 15% distance · 10% pickup · 10% material) with 🥇 Best Deal / 📍 Nearest badges and ⚠️ low-offer warning → lot creation → **QR handover record**
- **Digital lot system** with IDs like `GS-DEL-2026-000123`, statuses from `Created` → `Completed`
- **Traceability timeline** per lot + handover QR + Lot ID copy
- **Earnings ledger** (total / received / pending, Today/Week/Month/All filters, confirm-payment)
- Offline mode: lots created offline are queued in localStorage with a 🟢🟡🔴 sync badge and auto-sync on reconnect

### 🏭 Recycler dashboard (`/app`, role: recycler)
- KPIs: incoming lots, pending quotes, completed transactions, total material, paid out
- Incoming lots with **QR scan/confirm handover** (duplicate-confirmations blocked server-side → auto-creates transaction)
- Payments tab: **Mark Cash Paid** (cash is the primary method; UPI/bank are roadmap)
- Offered rates panel & authorization details

### 🛡️ Admin dashboard (`/app`, role: admin)
- Analytics: total lots, KG recycled, collector earnings, active recyclers, material mix chart, geographic activity
- Lots & traceability explorer, **authorization verification** (verified/pending/expired/unverified), user directory

### 🗣️ Language & voice
- Full UI translation: **English / हिंदी / मराठी** (`src/lib/i18n.tsx`)
- Text-to-speech for prices, safety instructions (Web Speech API, `hi-IN` / `mr-IN`)

### 🧠 AI modules (`src/lib/ai.ts`)
- Material classification seam (`classifyMaterial`) — demo heuristic, swappable with a real vision API
- Price estimation with condition factors, recycler ranking, low-offer anomaly detection

---

## 🏗️ Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui |
| Backend / DB | **Convex** (reactive queries, mutations, auth) |
| Auth | Convex Auth (email OTP + guest) via Freebuff |
| Maps | Leaflet + OpenStreetMap (keyless; Google Maps drop-in ready via `VITE_GOOGLE_MAPS_API_KEY`) |
| Charts | Recharts |
| QR | qrcode.react |
| Voice | Web Speech API |

> Note: the original spec called for Supabase; this build uses **Convex**, the platform's managed reactive backend. All data access goes through typed queries/mutations in `src/convex/` — the equivalent of the requested tables exist as Convex tables: `users`, `profiles`, `materials`, `recyclers`, `lots`, `transactions`, `traceability`, `safetyContent`, `syncLogs`.

## 📁 Structure

```
src/
├── components/gs/      # GreenSetu shared UI (logo, header/footer, price board, map, safety…)
├── components/ui/      # shadcn/ui
├── convex/             # Backend: schema, lots, transactions, recyclers, materials, profiles, admin, demo, seed
├── features/
│   ├── collector/      # Collector app (sell flow, lots, earnings, QR)
│   ├── recycler/       # Recycler dashboard
│   └── admin/          # Admin dashboard
├── lib/                # i18n, TTS, offline queue, AI modules, geo, seed data
├── pages/              # Landing, Auth, App shell, Privacy
└── hooks/
```

## 🚀 Running

```bash
bun install
bun run dev        # frontend
bun convex dev     # backend (seeds materials/recyclers/safety on first load)
```

### Demo walkthrough (hackathon script)
1. Open `/` → explore price board (🔊 listen in Hindi/Marathi), map, safety.
2. **Sign In** → Continue as Guest → choose **Collector**.
3. The account is auto-seeded with a **demo history** (paid / pending / completed lots).
4. Tap **📸 Sell Scrap Now** → photo → AI detects (e.g. PCB, 91%) → 5 KG → ₹2,250 estimate → best recycler **₹470/KG → ₹2,350** → lot + QR created.
5. In another session, sign in → **Recycler** (bind to GreenCycle) → see the lot → **Scan / Confirm** → **Mark Cash Paid**.
6. Back as collector → **Earnings** → ✅ Confirm Payment Received → lot `Completed`, earnings updated.

All sample records are labeled **Demo Data / Demo / Sample Market Data** in the UI.

## 🔐 Environment variables

See `.env.example`. Secrets are configured through the platform's key management — never hardcoded.

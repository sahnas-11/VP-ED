# 🌸 SLIIT Gavel Club — VPE Educational Planning & Tracking Portal

A comprehensive, full-stack MERN web application built for the **Vice President Education (VPE)** of **SLIIT Gavel Club** (Toastmasters-affiliated club in Sri Lanka). It replaces scattered Excel sheets and manual PDFs with an intuitive, cute soft-pink planning, scheduling, and tracking dashboard.

---

## 🎨 Aesthetic & Design
- **Cute Soft Pink Palette**: Pastel pinks, blush cards (`#FFF8FA`), rose accents, cream white, and mauve typography.
- **Soft Dark-Pink Mode**: High-contrast, gentle dark-pink theme for evening planning sessions.
- **Typography & Components**: Rounded cards (`rounded-cute`), gentle shadows, friendly icons (Lucide React), and clean typography (`Quicksand` & `Nunito`).

---

## 🚀 Key Modules & Capabilities

### 1. 📅 Term Calendar (Nov 2026 – Sep 2027)
- **Interactive FullCalendar Views**: Month, Week, and List views.
- **Sri Lanka Public Holidays & Poya Days**: Pre-seeded with full 2026–2027 holidays and Poya moon days flagged as tentative (`🌙`).
- **SLIIT Academic Schedule**: Semester, mid-exam, and final-exam periods displayed as "No Meeting / Break" blocks with automated conflict warnings.
- **Drag-and-Drop Rescheduling**: Reschedule meetings effortlessly with instant database persistence.
- **Weekly Meeting Generator**: Auto-generates weekly meetings across the term while intelligently skipping holidays and exam blocks.
- **Export Options**: Export calendar as `.ics` (Google Calendar / Outlook), Excel, or styled PDF.

### 2. 👥 Members Roster & Comprehensive Trackers
- **Members CRUD**: Search, filter by status/batch/faculty, sort by activity, CC level, or reliability.
- **Member CC & CL Summary**: Live speeches given, leadership roles performed, activity score, and reliability score.
- **General CC Tracker**: Historical records of all CC speeches (CC1–CC10), with support for bulk-adding speech marathon entries from posters.
- **General CL Tracker**: Complete log of leadership roles with dates and meeting numbers.
- **Standby / Backup Pool**: Standby speaker & roleplayer pool. Priority flag auto-assigned for *"first in line next meeting"*.
- **In-App Excel Import & Export**: Fast batch ingestion and export.

### 3. 🤝 Mentor - Mentee Management
- **Pre-Seeded Roster**: Ingested directly from `Mentor_Mentee_Assignment.xlsx` (8 senior mentors & 72 mentees).
- **Mentee Progress View**: Track each mentee's CC speech journey.
- **Auto-Match Load Balancer**: Suggests optimal mentors based on current capacity and maximum mentee limits.
- **1-Click Reassignments**: Reassign mentees with full historical change audit trails.

### 4. 📋 Meeting-Day Planner & Agenda Generator
- **Exact Agenda Recreation**: Reproduces the layout of the **213th Educational Meeting Agenda (Formula 1 themed)** with club header, exco sidebar, timetable, speaker/project/evaluator grid, and `#GAVELNEVERSTOPS` footer.
- **Smart Role Recommendations**: Suggests members who haven't performed a role recently.
- **Role Conflict Detector**: Real-time warnings if a member is assigned multiple simultaneous roles.
- **Post-Meeting 1-Click Sync**: Marks meeting complete and auto-updates all member CC speeches and CL records.
- **Downloads**: 1-click Meeting Agenda PDF, Summary Excel, and Role Scripts & Logs bundle.

### 5. 💖 Reliability, Gentle Cancellations & WhatsApp Nudges
- **Private Exco Reliability Score**: Starts at 100%, rewards completed roles (+3 pts), adjusts for late drops <48h (-15 pts).
- **Dependable Member Star Badges**: Awarded for consistent attendance; ready for club shoutouts.
- **Gentle Consequence Engine**: Late droppers are automatically placed at the front of the standby backup pool for the next meeting.
- **1-Click WhatsApp Templates**:
  - *3-Day Before Confirmation Reminder* (warm & cute tone)
  - *Polite "Cancel Early" Nudge*
  - *Dependable Member Social Shoutout*

### 6. 📖 Educational Guides & Role Scripts
- **CC Speech Guide**: CC1 to CC10 objectives and executive summaries extracted from the Competent Communicator manual.
- **Role Scripts & Logs**: TMOD, Timer (with green/yellow/red card thresholds), Ah-Counter, Grammarian (Word of the Day), and General Evaluator logs.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, FullCalendar, Recharts, Lucide Icons, Canvas Confetti.
- **Backend**: Express.js, Node.js (MVC: Models, Controllers, Routes, Middleware).
- **Database**: MongoDB + Mongoose (with automated in-memory MongoDB fallback).
- **Auth**: JWT Authentication with bcrypt password hashing.
- **Exports**: `exceljs` (Excel spreadsheets), `pdfmake` (styled PDFs), `ics` (iCalendar).

---

## ⚡ Quick Start Instructions

### 1. Backend Setup
```bash
cd server
npm install
npm run seed     # Seeds VPE login, holidays, CC projects, role scripts, and Excel data
npm start        # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

### 3. Default Login Credentials
- **Email**: `vpe@sliitgavel.org`
- **Password**: `Gavel@2026`
- **Role**: Vice President Education (VPE)

<div align="center">

# Self-Hosted Digital Asset Manager

<img width="1901" height="879" alt="image" src="https://github.com/user-attachments/assets/ff759a7d-ff97-497c-9032-ad008d8d23b9" />


<a align="center" href="https://damshowcase.vercel.app/">View Showcase</a>

**Self‑hosted all your digital files** – images, videos, documents, 3D models (GLB) and more. Keep full control of storage, version history, metadata and user access under your own infrastructure.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Django-5.2-0C4B33?logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Node.js-%3E=18-43853D?logo=node.js&logoColor=white" alt="Node.js">
</p>

</div>

## Core Features
- Fast asset uploads (captures size & path automatically)
- Multi‑folder assignment (organize one asset in several contexts)
- Rich versioning with JSON snapshots (name, description, tags, metadata)
- Dynamic metadata fields (string, integer, date, boolean, float)
- Tag management (add/remove; full replacement on update actions)
- Hierarchical folders with protected root `media`
- Role‑based access control (RBAC) via Django Groups
- Bulk user import from Excel (with downloadable template)
- Insight widgets: asset type mix, top contributors, recent updates, daily activity
- Client‑side search + category & tag filtering

## Tech Stack 
- **Frontend:** Next.js 15 (React 19) + Chakra UI
- **Backend:** Django 5 + PostgreSQL + DRF Session Authentication
- **Storage:** Local media folder (can swap for S3/Azure later)

## Quick Start (Local Self‑Hosted)
### 1. Prerequisites
- Python ≥ 3.11
- Node.js ≥ 18
- PostgreSQL running locally (default user/db `postgres` or adjust settings)

### 2. Backend Setup
```powershell
cd "backend"
python -m venv .venv; .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_users   # creates admin/editor/viewer demo users & groups
python manage.py runserver
```
Optional: edit DB creds in `backend/settings.py` before running migrations.

### 3. Frontend Setup
```powershell
cd "client"
npm install
setx NEXT_PUBLIC_BACKEND_URL "http://localhost:8000"
npm run dev
```
Open: http://localhost:3000

### 4. Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `DemoPass123` |
| Editor | `editor@example.com` | `DemoPass123` |
| Viewer | `viewer@example.com` | `DemoPass123` |


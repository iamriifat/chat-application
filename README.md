# NexChat — Real-Time Chat Application

<div align="center">

![NexChat](https://img.shields.io/badge/NexChat-v1.0.0-00d4aa?style=for-the-badge&logo=chatbot)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

**A full-stack, real-time chat application built with FastAPI + React + WebSockets.**

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure token-based login & registration |
| ⚡ **Real-time Messaging** | Bi-directional WebSocket communication |
| 😊 **Emoji Support** | Built-in emoji picker with large emoji rendering |
| 📎 **File Sharing** | Upload and share any file type |
| 🖼️ **Image Sharing** | Share images with micro-thumbnail blur previews |
| 👥 **Online Status** | Live presence indicators per user |
| 📱 **Mobile Responsive** | Full mobile layout with panel switching |
| 🎨 **Modern UI** | Glassmorphism dark theme with teal accents |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (React)                    │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │ Sidebar  │  │  ChatArea  │  │   RightPanel     │ │
│  │ (users)  │  │ (messages) │  │ (shared media)   │ │
│  └────┬─────┘  └─────┬──────┘  └──────────────────┘ │
│       │              │                               │
│  ┌────▼──────────────▼──────────────────────────┐   │
│  │         SocketContext + AuthContext           │   │
│  └────────────────────┬──────────────────────────┘  │
└───────────────────────┼─────────────────────────────┘
                        │ HTTP REST + WebSocket
┌───────────────────────▼─────────────────────────────┐
│               FastAPI Backend (Python)               │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │   Auth   │  │   REST   │  │  ConnectionManager │ │
│  │  (JWT)   │  │  Routes  │  │   (WebSockets)     │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│                      │                               │
│  ┌───────────────────▼──────────────────────────┐   │
│  │         SQLAlchemy ORM + SQLite/PostgreSQL    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| `FastAPI` | 0.111.0 | REST API framework |
| `Uvicorn` | 0.30.1 | ASGI server |
| `SQLAlchemy` | 2.0.30 | ORM / database layer |
| `passlib[bcrypt]` | 1.7.4 | Password hashing |
| `bcrypt` | 4.0.1 | Hashing backend (pinned for compatibility) |
| `python-jose` | 3.3.0 | JWT token generation & validation |
| `Pillow` | 10.3.0 | Image micro-thumbnail generation |
| `python-multipart` | 0.0.9 | File upload handling |
| `websockets` | 12.0 | WebSocket support |
| `python-dotenv` | 1.0.1 | Environment variable management |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| `React` | 18 | UI framework |
| `Vite` | 5 | Dev server & build tool |
| `lucide-react` | latest | Icon library |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repo
```bash
git clone https://github.com/iamriifat/chat-application.git
cd chat-application
```

### 2. Run (Windows)
Double-click **`run.bat`** or run:
```bat
.\run.bat
```

This automatically:
- Creates a Python virtual environment
- Installs all backend dependencies
- Starts FastAPI on `http://localhost:8000`
- Installs frontend npm packages
- Starts Vite dev server on `http://localhost:5173`

### 3. Open the app
Navigate to **[http://localhost:5173](http://localhost:5173)**

---

## ⚙️ Environment Variables

Create a `backend/.env` file (already included):

```env
DATABASE_URL=sqlite:///./chat.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
PORT=8000
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy DB URL | `sqlite:///./chat.db` |
| `SECRET_KEY` | JWT signing key — **change in production!** | `supersecret...` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL in minutes | `1440` (24h) |

---

## 📡 API Reference

### Authentication

#### `POST /api/auth/register`
Register a new user.

**Request body:**
```json
{
  "username": "rifat",
  "password": "mypassword",
  "gender": "Male"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "rifat",
  "gender": "Male",
  "status": false
}
```

---

#### `POST /api/auth/login`
Login and receive a JWT token.

**Request body:**
```json
{
  "username": "rifat",
  "password": "mypassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": { "id": 1, "username": "rifat", "gender": "Male", "status": true }
}
```

---

### Users

#### `GET /api/users`
Get all registered users with live online status.

**Response:**
```json
[
  { "id": 1, "username": "rifat", "gender": "Male", "status": true },
  { "id": 2, "username": "alice", "gender": "Female", "status": false }
]
```

---

### Messages

#### `GET /api/messages/{other_user_id}?token=<jwt>`
Fetch conversation history between the authenticated user and another user.

**Response:**
```json
[
  {
    "id": 1,
    "message_type": 1,
    "from_user_id": 1,
    "to_user_id": 2,
    "text": "Hello!",
    "file_id": null,
    "created_at": "2026-06-06T12:00:00Z",
    "file_record": null
  }
]
```

---

### File Upload

#### `POST /api/files/upload`
Upload a file or image. Returns a file record with a path and optional blur-hash thumbnail.

**Request:** `multipart/form-data` with field `file`

**Response:**
```json
{
  "id": 1,
  "file_name": "photo.jpg",
  "file_extension": ".jpg",
  "blur_hash": "data:image/jpeg;base64,...",
  "status": "COMPLETED",
  "file_path": "/uploads/20260606120000123456.jpg"
}
```

---

## 🔌 WebSocket Protocol

### Connect
```
ws://localhost:8000/ws/{user_id}?token={jwt_token}
```

The server validates the JWT on connect. If invalid, the connection is closed with code `1008`.

---

### Send a Message
```json
{
  "type": "send_message",
  "message_type": 1,
  "to_user_id": 2,
  "text": "Hey there!",
  "file_id": null
}
```

| `message_type` | Meaning |
|---|---|
| `1` | Text message |
| `2` | Emoji-only message |
| `3` | File attachment |
| `4` | Image attachment |

---

### Receive a Message
```json
{
  "type": "receive_message",
  "id": 42,
  "message_type": 1,
  "from_user_id": 1,
  "to_user_id": 2,
  "text": "Hey there!",
  "file_id": null,
  "created_at": "2026-06-06T12:34:56Z",
  "file_record": null
}
```

---

### User Status Update
Broadcast to all connected clients when a user connects or disconnects:
```json
{
  "type": "user_status",
  "user_id": 1,
  "status": true
}
```

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

This starts:
- **Backend** on port `8000`
- **Frontend** (Nginx-served) on port `80`

### `docker-compose.yml` overview
```yaml
services:
  backend:   # FastAPI on :8000
  frontend:  # Nginx serving React build on :80
```

---

## 📂 Project Structure

```
chat-application/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, routes, WebSocket
│   │   ├── models.py        # SQLAlchemy models (User, Message, File)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── auth.py          # JWT + password hashing utilities
│   │   └── database.py      # DB engine + session factory
│   ├── uploads/             # Uploaded files (git-ignored)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginRegister.jsx  # Auth page
│   │   │   ├── Sidebar.jsx        # User list
│   │   │   ├── ChatArea.jsx       # Message thread
│   │   │   └── RightPanel.jsx     # Shared media panel
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Auth state + API calls
│   │   │   └── SocketContext.jsx  # WebSocket + message state
│   │   ├── App.jsx
│   │   ├── index.css              # Global design tokens + styles
│   │   └── main.jsx
│   ├── Dockerfile
│   └── nginx.conf
├── .github/workflows/ci.yml   # GitHub Actions CI
├── docker-compose.yml
├── run.bat                    # Windows dev launcher
└── README.md
```

---

## 🔒 Security Notes

> [!WARNING]
> Before deploying to production:
> - Change `SECRET_KEY` in `.env` to a long random string
> - Restrict `allow_origins` in CORS settings to your frontend domain
> - Switch `DATABASE_URL` from SQLite to PostgreSQL
> - Enable HTTPS / use a reverse proxy (Nginx + SSL)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">
Built with ❤️ using FastAPI + React + WebSockets
</div>

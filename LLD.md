# LLD — LMS AI Agent

This doc covers how the app is put together under the hood. It's a student portal where users can manage their profile, enroll in courses, and chat with an AI bot ("Kalvi") that can actually read and update their data in plain English.

Stack at a glance:
- **Frontend** — React 18 + Vite + Tailwind, deployed on Vercel
- **Backend** — FastAPI (Python), deployed on Render
- **DB** — SQLite via SQLAlchemy
- **Auth** — JWT (HS256) + bcrypt
- **AI** — LangChain + OpenAI `gpt-4o-mini` talking directly to the SQLite schema

---

## Architecture

Nothing exotic here. The frontend talks to the backend over HTTPS, every request after login carries a JWT in the `Authorization` header, and the backend talks to a single SQLite file.

```
┌─────────────────────────────────────────────────────┐
│                  Browser (Vercel)                    │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Login /  │  │ Profile  │  │   ChatWidget       │ │
│  │ Register │  │ Form     │  │   (Kalvi Bot)      │ │
│  └────┬─────┘  └────┬─────┘  └────────┬───────────┘ │
│       │              │                 │              │
│       └──────────────┴─────────────────┘             │
│                    Axios (JWT Bearer)                 │
└──────────────────────────┬──────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────┐
│               FastAPI Backend (Render)               │
│                                                      │
│  /auth/*   /profile/*   /chat/*                      │
│      │           │           │                       │
│  AuthSvc   ProfileSvc   ChatbotSvc                   │
│      │           │           │                       │
│  Security    ORM Models   SQL Agent                  │
│      └───────────┴──────────┘                        │
│                    SQLAlchemy                        │
└──────────────────────────┬──────────────────────────┘
                           │
               ┌───────────▼──────────┐
               │  SQLite Database     │
               │  kalviumlabs_forge   │
               └──────────────────────┘
```

---

## Database

Four tables. Pretty simple — one student gets one education record, and can have many course applications.

```
┌──────────────────────┐       ┌────────────────────────────┐
│       students       │       │      education_details      │
├──────────────────────┤ 1   1 ├────────────────────────────┤
│ PK  id               │───────│ PK  id                     │
│     full_name        │       │ FK  student_id             │
│     email  (unique)  │       │     tenth_board            │
│     password (hash)  │       │     tenth_percentage       │
│     phone            │       │     twelfth_board          │
│     date_of_birth    │       │     twelfth_percentage     │
│     city             │       └────────────────────────────┘
│     created_at       │
└──────────┬───────────┘
           │ 1
           │ N
┌──────────▼───────────┐       ┌───────────────────────┐
│     applications     │       │        courses        │
├──────────────────────┤ N   1 ├───────────────────────┤
│ PK  id               │───────│ PK  id                │
│ FK  student_id       │       │     title             │
│ FK  course_id        │       │     duration_months   │
│     status           │       │     fee               │
│     applied_at       │       └───────────────────────┘
│     reviewed_at      │
└──────────────────────┘
```

**students** — core account info. Email is unique, password is stored as a bcrypt hash (never plaintext).

**education_details** — one-to-one with students. Created on first save, stores 10th and 12th board + percentage.

**courses** — a static catalog (GenAI, ML, Full Stack, etc.). Seeded on every server start.

**applications** — the join between students and courses. When a student "enrolls", we wipe their old applications and re-insert fresh ones in a single transaction so there's no orphan state on failure.

---

## Backend layout

```
backend/
├── app/
│   ├── main.py                 # app entry, CORS, startup seed
│   ├── api/
│   │   ├── auth_routes.py      # register + login
│   │   ├── profile_routes.py   # profile CRUD
│   │   └── chatbot_routes.py   # single chat endpoint
│   ├── services/
│   │   ├── auth_service.py     # business logic for auth
│   │   ├── profile_service.py  # business logic for profile updates
│   │   └── chatbot_service.py  # wires user context into the AI agent
│   ├── agent/
│   │   └── sql_agent.py        # the LangChain SQL agent
│   ├── core/
│   │   └── security.py         # hashing, JWT, FastAPI dependencies
│   ├── db/
│   │   ├── models.py           # SQLAlchemy ORM models
│   │   └── session.py          # engine + session factory
│   └── schemas/
│       ├── auth.py             # pydantic request/response models
│       ├── profile.py
│       └── chatbot.py
```

### What each piece does

**`main.py`** — sets up CORS (explicit origin list, not `*`), mounts the three routers, and runs a `lifespan` seed on every boot that creates tables and inserts the course catalog + a demo account if they're missing.

**`security.py`** — four things: `hash_password`, `verify_password` (both bcrypt with a 72-byte truncation), `create_token` (60-min HS256 JWT), and `get_current_user` (a FastAPI dependency that decodes the token and returns the Student row).

**`auth_service.py`**
```
register_user  →  checks email isn't taken → hashes password → inserts Student
login_user     →  finds user by email → bcrypt verify → returns a signed JWT
```

**`profile_service.py`**
```
get_full_profile   →  joins student + education + enrolled courses into one dict
update_personal    →  setattr loop over provided fields, commit
update_education   →  creates the row first if missing, then updates
update_courses     →  delete old applications + re-insert new ones, single commit
                      (rollback on bad course id so no orphan state left behind)
```

**`sql_agent.py`** — the interesting bit. `build_sql_agent()` returns a `SimpleSQLAgent` that:
1. Takes a natural-language prompt
2. Sends the DB schema + prompt to `gpt-4o-mini` → gets back a SQL statement
3. Strips any markdown formatting the model might wrap it in
4. Runs the SQL against SQLite
5. If it was a write, commits
6. Sends the result back to the model to get a human-friendly reply
7. Returns that reply

**`chatbot_service.py`** — thin wrapper. Lazy-loads the agent on first use (so a missing `OPENAI_API_KEY` doesn't crash the server at startup), then prepends a system prompt that locks every query down to `student_id = {user.id}`.

---

## API endpoints

### Auth

| | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | `{ message }` |
| POST | `/auth/login` | `{ email, password }` | `{ access_token, token_type }` |

No auth needed on either. Errors come back as `400` with a `detail` string.

### Profile

All write endpoints require a valid JWT. The courses `GET` is public since the course picker could theoretically be shown before login.

| | Endpoint | Auth | Body | Returns |
|---|---|---|---|---|
| GET | `/profile/` | ✅ | — | full profile |
| PUT | `/profile/` | ✅ | mixed personal/education keys | updated fields |
| PUT | `/profile/personal` | ✅ | name, phone, dob, city | updated student |
| PUT | `/profile/education` | ✅ | board names + percentages | updated education |
| GET | `/profile/courses` | ❌ | — | all courses |
| PUT | `/profile/courses` | ✅ | `[{ id }]` | updated applications |

### Chat

| | Endpoint | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/chat/` | ✅ | `{ message }` | `{ reply }` |

---

## Login flow

Worth spelling out because this is where most bugs have shown up.

```
Browser                     FastAPI                       SQLite
  │                            │                             │
  │  POST /auth/login          │                             │
  │  { email, password }  ────>│                             │
  │                            │  SELECT * FROM students     │
  │                            │  WHERE email = ?       ────>│
  │                            │<──── Student row ───────────│
  │                            │                             │
  │                            │  bcrypt.verify(plain, hash) │
  │                            │  create_token({ sub: email })
  │<──── { access_token } ─────│                             │
  │                            │                             │
  │  localStorage.setItem("token", ...)                      │
  │                            │                             │
  │  GET /profile/             │                             │
  │  Authorization: Bearer ... │                             │
  │  ─────────────────────────>│                             │
  │                            │  jwt.decode → email         │
  │                            │  SELECT student by email ──>│
  │                            │<──── Student row ───────────│
  │<──── profile JSON ─────────│                             │
```

Every subsequent request goes through the Axios interceptor that reads `localStorage.getItem("token")` and attaches it as a Bearer header automatically.

---

## Frontend structure

```
App.jsx
├── /           → redirect to /login
├── /login      → <Login />
├── /register   → <Register />
└── /profile    → <ProtectedRoute>
                      └── <Profile />
                           ├── <ProfileForm profile={...} refresh={fn} />
                           └── <ChatWidget refresh={fn} />
```

**Login / Register** — self-contained forms with client-side validation before hitting the API. After login the JWT goes into `localStorage` and the user is sent to `/profile`.

**ProtectedRoute** — just checks `localStorage` for a token. No token → redirect to `/login`. Simple and that's fine.

**Profile** — fetches `GET /profile/` on mount. Passes the data and a `refresh` callback down so both `ProfileForm` and `ChatWidget` can trigger a re-fetch after any change.

**ProfileForm** — three inline-editable sections (personal, education, courses). Each section has its own Edit/Save button that calls the matching `PUT` endpoint. After saving it calls `refresh()` to pull fresh data from the backend.

**ChatWidget** — floating bubble in the corner. Keeps a local message history. On each message it calls `POST /chat`, appends the bot reply, then calls `refresh()` so if the bot updated something (like a percentage) the profile card reflects it straight away.

---

## Chat → profile update, end to end

Example: user sends *"Update my 12th percentage to 95"*

```
ChatWidget.sendMessage()
  │
  POST /chat { message: "Update my 12th percentage to 95" }
  │
chatbot_routes.chat()
  │  verifies JWT → gets Student (id=3)
  │
chatbot_service.process_query(user, message)
  │  builds prompt: "student_id=3, only touch your own rows...
  │                  User: Update my 12th percentage to 95"
  │
sql_agent.SimpleSQLAgent.run(prompt)
  │  LLM call 1 → SQL:
  │    UPDATE education_details SET twelfth_percentage = 95 WHERE student_id = 3;
  │  executes on SQLite, commits
  │  LLM call 2 → "Updated your 12th percentage to 95 successfully."
  │
ChatWidget appends bot reply, calls refresh()
Profile re-fetches → ProfileForm re-renders with new value
```

---

## Security notes

- Passwords are bcrypt-hashed. Input is truncated to 72 bytes before hashing because that's bcrypt's hard limit — anything beyond is silently ignored, which causes verify mismatches without the truncation.
- JWTs are HS256 signed with a hardcoded secret. Fine for a demo, should be an env var in a real deployment.
- Tokens expire after 60 minutes.
- CORS uses an explicit allowlist — `allow_origins=["*"]` combined with `allow_credentials=True` is invalid per the spec and browsers reject it outright.
- All protected routes use `Depends(get_current_user)` which decodes the token and fetches the student in one go.
- The AI agent's system prompt forces `WHERE student_id = {user.id}` on every generated query so the model can't access other students' rows.

---

## Startup seeding

Render's filesystem is ephemeral so the SQLite file is gone after each redeploy. The `_seed()` function runs inside FastAPI's `lifespan` on every boot:

```
_seed()
 ├── Base.metadata.create_all()   ← creates tables if missing, safe to re-run
 ├── inserts each of the 6 courses if they aren't there yet
 └── inserts test@example.com / password123 if that account doesn't exist
```

This means the demo login always works right after a deploy, and registered users can use the app until the next restart resets the file.

---

## Axios setup

One shared instance in `src/api/axios.js`, used everywhere:

```js
baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

// runs before every request
token = localStorage.getItem("token")
if (token) headers.Authorization = `Bearer ${token}`
```

Base URL per environment:

| where | file | value |
|---|---|---|
| local dev | `frontend/.env` | `http://localhost:8000` |
| vercel build | `frontend/.env.production` | `https://task-round-x8c5.onrender.com` |

The `|| "http://localhost:8000"` fallback matters — without it, if the env var isn't picked up during a build you get `baseURL: undefined` and completely silent network failures with no useful error message.

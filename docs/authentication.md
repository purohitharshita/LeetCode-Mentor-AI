# LeetCode Mentor AI — Authentication Deep Dive

> How the JWT auth system works, why each piece exists, and what would break without it.

---

## Table of Contents

1. [Why Auth Is Needed](#1-why-auth-is-needed)
2. [File Structure and Layers](#2-file-structure-and-layers)
3. [Password Hashing with bcrypt](#3-password-hashing-with-bcrypt)
4. [JWT — JSON Web Token](#4-jwt--json-web-token)
5. [Access Token + Refresh Token Pattern](#5-access-token--refresh-token-pattern)
6. [Pydantic Schemas](#6-pydantic-schemas)
7. [FastAPI Dependency Injection](#7-fastapi-dependency-injection)
8. [selectinload — The Async SQLAlchemy Fix](#8-selectinload--the-async-sqlalchemy-fix)
9. [The Complete Register Flow](#9-the-complete-register-flow)
10. [Summary Table](#10-summary-table)

---

## 1. Why Auth Is Needed

Without auth, anyone can call any endpoint. No auth = no users, no personalization, no "your" problems, "your" progress. Every feature built from Day 4 onward depends on knowing **who is making the request**.

Auth answers one question: **"Who are you, and can I trust that?"**

---

## 2. File Structure and Layers

```
app/core/security.py           ← pure crypto utilities (hash, verify, create/decode tokens)
app/schemas/auth.py            ← what request/response bodies look like
app/schemas/user.py            ← what a user looks like in API responses
app/services/auth.py           ← business logic (create user, check password, manage tokens)
app/api/v1/endpoints/auth.py   ← HTTP routes (register, login, refresh, logout)
app/api/v1/endpoints/users.py  ← protected routes (/me)
```

Each layer has one job — **separation of concerns**:

```
HTTP Request
    ↓
endpoints/auth.py      ← handles HTTP: reads body, returns response
    ↓
services/auth.py       ← handles business logic: "does this email exist?"
    ↓
core/security.py       ← handles crypto: hashing, token creation
    ↓
models/user.py         ← handles database: reads/writes users table
```

---

## 3. Password Hashing with bcrypt

### The Problem
You cannot store passwords as plain text. If your database is ever leaked, every user's password is exposed.

### What bcrypt Does
bcrypt is a **one-way hashing function**. It takes a password and produces a fixed-length string of gibberish. You cannot reverse it — you can never get the original password back from the hash.

```
"password123"  →  bcrypt  →  "$2b$12$KIx3fHs7n..."   (stored in DB)
```

When a user logs in, you hash what they typed and **compare the two hashes**. You never compare the raw password.

```python
# app/core/security.py
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())
```

**Why `bcrypt.gensalt()`?**
Every hash gets a random "salt" mixed in. This means even if two users have the same password, their hashes are completely different. Prevents attackers from using pre-computed "rainbow tables."

**Why we dropped passlib:**
`passlib` is the older wrapper library around bcrypt. It stopped being maintained and broke with `bcrypt >= 4.0`. Using `bcrypt` directly is cleaner and has no compatibility issues.

---

## 4. JWT — JSON Web Token

### The Problem
After a user logs in, how does the server know it's them on the next request? Traditional approach: store a session ID in a database and look it up on every request. This is stateful and doesn't scale.

### What JWT Does
JWT is a **self-contained token**. The server doesn't store it — the token itself proves who you are.

A JWT has three parts separated by dots:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIn0.SIGNATURE
      HEADER                    PAYLOAD              SIGNATURE
```

- **Header** — algorithm used (`HS256`)
- **Payload** — the data: `{"sub": "user-id", "exp": 1234567890, "type": "access"}`
- **Signature** — `HMAC(header + payload, SECRET_KEY)`

The signature is the security. Only the server knows `SECRET_KEY`. If anyone tampers with the payload, the signature won't match and the server rejects the token.

```python
# app/core/security.py
def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=30)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    # Raises JWTError if signature is invalid or token is expired
```

**Stateless** — the server never stores the access token. It just verifies the signature on every request. No database lookup needed.

---

## 5. Access Token + Refresh Token Pattern

### The Problem With a Single Token
If you make an access token that lasts 30 days and it gets stolen, the attacker has 30 days of access. If you make it last 5 minutes, users have to log in every 5 minutes.

### The Solution: Two Tokens

```
Login
  │
  ├── ACCESS TOKEN  (30 minutes)
  │   Used for: every API request
  │   Stored in: frontend memory / localStorage
  │   If stolen: expires in 30 min automatically
  │
  └── REFRESH TOKEN  (7 days)
      Used for: getting a new access token when it expires
      Stored in: Redis (server-side) + frontend
      If stolen: can be revoked instantly (delete from Redis)
```

### The Flow

```
1. User logs in
   → receives access_token (30min) + refresh_token (7 days)

2. User makes API calls
   → sends access_token in Authorization header
   → server verifies signature only (no DB lookup)

3. Access token expires
   → frontend calls POST /auth/refresh with refresh_token
   → server checks Redis: "is this token still valid?"
   → server issues a new access_token

4. User logs out
   → DELETE refresh_token from Redis
   → even if someone has the token, it's now invalid
```

### Why Store Refresh Tokens in Redis?

If a user's device is stolen, you want to immediately invalidate their session. With a pure JWT refresh token you can't — it's valid until it expires. By storing refresh tokens in Redis, logout just deletes the key. Instant revocation.

```python
# app/services/auth.py
async def store_refresh_token(redis, token, user_id):
    key = f"refresh:{token}"
    ttl = 7 * 24 * 3600  # 7 days in seconds
    await redis.setex(key, ttl, str(user_id))

async def revoke_refresh_token(redis, token):
    await redis.delete(f"refresh:{token}")  # logout = delete key
```

---

## 6. Pydantic Schemas

Every API endpoint needs to know:
- What shape of data comes **in** (request body)
- What shape of data goes **out** (response body)

Pydantic schemas define these contracts.

```python
# app/schemas/auth.py
class RegisterRequest(BaseModel):
    email: EmailStr       # validates it's a real email format
    name: str
    password: str

    @field_validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v
```

If someone sends `{"email": "notanemail"}`, FastAPI automatically returns a `422 Unprocessable Entity` before your code even runs. The validation is free.

```python
# app/schemas/user.py
class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    profile: UserProfileResponse | None = None

    model_config = {"from_attributes": True}
    # Tells Pydantic to read from SQLAlchemy object attributes, not dict keys
```

---

## 7. FastAPI Dependency Injection

Instead of writing auth checks inside every endpoint, you write it once as a **dependency** and inject it anywhere.

```python
# app/api/v1/endpoints/users.py
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    db: AsyncSession = Depends(get_db),
):
    token = credentials.credentials  # the Bearer token from the header
    payload = decode_token(token)    # verify signature, check expiry
    user_id = uuid.UUID(payload["sub"])
    user = await get_user_by_id(db, user_id)
    return user


@router.get("/me")
async def get_me(current_user = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
```

`Depends(get_current_user)` tells FastAPI: "before running `get_me`, run `get_current_user` and pass the result in."

The endpoint doesn't know anything about tokens. It just receives a `User` object. Every protected endpoint going forward uses the same pattern:

```python
@router.post("/attempts")
async def create_attempt(current_user = Depends(get_current_user), ...):
    # current_user is already verified — just use it
```

---

## 8. selectinload — The Async SQLAlchemy Fix

SQLAlchemy relationships are **lazy** by default. When you load a `User`, it doesn't load `user.profile` until you access it. In synchronous code this works fine. In **async** code it breaks — when Pydantic tries to serialize `user.profile`, it triggers an implicit SQL query outside the async context, causing a `MissingGreenlet` error.

The fix: `selectinload` tells SQLAlchemy to load the relationship **eagerly** in the same async operation.

```python
# Instead of (breaks in async):
select(User).where(User.email == email)

# We do (safe in async):
select(User).options(selectinload(User.profile)).where(User.email == email)
```

The SQL generated:
```sql
-- Query 1: load the user
SELECT * FROM users WHERE email = $1

-- Query 2: immediately load profiles for those user IDs
SELECT * FROM user_profiles WHERE user_id IN ($1)
```

Two queries, both controlled, both async-safe. No implicit lazy loading happens later.

---

## 9. The Complete Register Flow

```
POST /auth/register  { email, name, password }
        │
        ▼
RegisterRequest validates input (email format, password length ≥ 8)
        │
        ▼
services/auth.py → get_user_by_email()
  → "does this email already exist?" → if yes, raise AuthError(409)
        │
        ▼
hash_password("password123") → "$2b$12$..."
        │
        ▼
INSERT INTO users (email, name, password_hash)
INSERT INTO user_profiles (user_id, experience_level="beginner")
COMMIT
        │
        ▼
Re-fetch user WITH selectinload(profile) → user object with profile loaded
        │
        ▼
create_access_token(user.id)  → JWT signed with SECRET_KEY, expires 30 min
create_refresh_token(user.id) → JWT signed with SECRET_KEY, expires 7 days
        │
        ▼
Redis: SET "refresh:{token}" = "user-id" with TTL = 7 days
        │
        ▼
Return 201: { access_token, refresh_token, user: { id, email, name, profile } }
```

---

## 10. Summary Table

| Component | What it is | Why we need it |
|---|---|---|
| `bcrypt` | One-way password hasher | Never store raw passwords |
| `JWT` | Self-contained signed token | Stateless auth, no DB lookup per request |
| Access token | Short-lived JWT (30 min) | Proves identity on every API request |
| Refresh token | Long-lived JWT (7 days) | Gets new access tokens, can be revoked |
| Redis | Token store | Enables instant logout / revocation |
| Pydantic schemas | Request/response shapes | Validates input, documents the API |
| `selectinload` | Eager relationship loading | Required for async SQLAlchemy |
| `Depends()` | FastAPI dependency injection | Write auth logic once, use everywhere |

---

*Last updated: Day 3 — Authentication implemented and verified*

# Architecture Diagrams

## Backend: Modular Monolith Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Request                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express App (app.js)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Middleware │  │   CORS     │  │   Helmet   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Module Router (index.js)                  │
│                    /api/auth, /api/clients                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Controller Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Validate request                                   │   │
│  │  • Call service                                       │   │
│  │  • Format response                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Business logic                                     │   │
│  │  • Orchestration                                      │   │
│  │  • Call repositories                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Repository Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Database queries                                   │   │
│  │  • Data mapping                                       │   │
│  │  • CRUD operations                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL)                   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend: Feature-based Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         User Action                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Page Component                            │
│                  (features/auth/pages/)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Render UI                                          │   │
│  │  • Handle user interactions                           │   │
│  │  • Use custom hooks                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks                              │
│                  (features/auth/hooks/)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • State management                                   │   │
│  │  • Side effects                                       │   │
│  │  • Call services                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Feature Service                           │
│                (features/auth/services/)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • API calls                                          │   │
│  │  • Data transformation                                │   │
│  │  • Error handling                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Client (Axios)                        │
│                  (shared/services/api.js)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Add auth token                                     │   │
│  │  • Handle responses                                   │   │
│  │  • Interceptors                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
└─────────────────────────────────────────────────────────────┘
```

## Module Structure (Backend)

```
modules/auth/
│
├── index.js                    # Module entry point & routes
│   └── Defines: POST /login, POST /register, etc.
│
├── controllers/
│   └── auth.controller.js      # HTTP layer
│       ├── login()             # Handle login request
│       ├── register()          # Handle register request
│       └── logout()            # Handle logout request
│
├── services/
│   └── auth.service.js         # Business logic
│       ├── login()             # Validate credentials, generate token
│       ├── register()          # Create user, send email
│       └── logout()            # Invalidate token
│
├── repositories/
│   └── auth.repository.js      # Data access
│       ├── findByEmail()       # Query user by email
│       ├── create()            # Insert new user
│       └── update()            # Update user data
│
└── validators/
    └── auth.validator.js       # Input validation
        ├── validateLogin()     # Validate login input
        └── validateRegister()  # Validate register input
```

## Feature Structure (Frontend)

```
features/auth/
│
├── index.js                    # Feature public API
│   └── Exports: LoginPage, useAuth, authService
│
├── pages/
│   ├── LoginPage.jsx           # Login page
│   ├── RegisterPage.jsx        # Register page
│   └── ForgotPasswordPage.jsx  # Forgot password page
│
├── components/
│   ├── LoginForm.jsx           # Login form component
│   ├── RegisterForm.jsx        # Register form component
│   └── PasswordInput.jsx       # Password input with toggle
│
├── hooks/
│   ├── useAuth.js              # Auth state & actions
│   ├── useLogin.js             # Login logic
│   └── useRegister.js          # Register logic
│
├── services/
│   └── auth.service.js         # API calls
│       ├── login()             # POST /api/auth/login
│       ├── register()          # POST /api/auth/register
│       └── logout()            # POST /api/auth/logout
│
└── types/
    └── auth.types.js           # TypeScript types
        ├── User                # User interface
        └── LoginCredentials    # Login data interface
```

## Request Flow Example: User Login

### Backend Flow
```
1. POST /api/auth/login
   ↓
2. auth/index.js → Route to controller
   ↓
3. auth.controller.login()
   • Validate input with validator
   • Call service
   ↓
4. auth.service.login()
   • Call repository to find user
   • Verify password
   • Generate JWT token
   ↓
5. auth.repository.findByEmail()
   • Query database
   • Return user data
   ↓
6. Response: { user, token }
```

### Frontend Flow
```
1. User clicks "Login" button
   ↓
2. LoginPage.handleLogin()
   • Get credentials from form
   • Call useAuth hook
   ↓
3. useAuth.login()
   • Call auth service
   • Update state
   ↓
4. authService.login()
   • Make API call via axios
   • Store token in localStorage
   ↓
5. API Client (axios)
   • Add headers
   • Send request
   ↓
6. Update UI with user data
```

## Shared Infrastructure

### Backend Shared
```
shared/
├── database/           # DB connection & queries
├── middleware/         # Auth, error handling, rate limiting
├── utils/              # Logger, validators, helpers
├── config/             # Environment config
└── types/              # Shared TypeScript types
```

### Frontend Shared
```
shared/
├── components/         # Button, Input, Modal, etc.
├── hooks/              # useDebounce, useLocalStorage, etc.
├── services/           # API client, WebSocket, etc.
├── utils/              # Formatters, validators, etc.
├── context/            # Theme, Auth, etc.
└── layouts/            # MainLayout, AuthLayout, etc.
```

## Benefits Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    OLD STRUCTURE                             │
├─────────────────────────────────────────────────────────────┤
│  routes/                                                     │
│    ├── auth.js        ← Everything mixed together           │
│    ├── clients.js     ← Hard to find related code           │
│    └── projects.js    ← Difficult to test                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ RESTRUCTURE ↓
┌─────────────────────────────────────────────────────────────┐
│                    NEW STRUCTURE                             │
├─────────────────────────────────────────────────────────────┤
│  modules/auth/                                               │
│    ├── controllers/   ← Clear separation                    │
│    ├── services/      ← Easy to find                        │
│    ├── repositories/  ← Easy to test                        │
│    └── validators/    ← Maintainable                        │
└─────────────────────────────────────────────────────────────┘
```

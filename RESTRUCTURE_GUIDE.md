# Project Restructure Guide

## Overview
تم إعادة هيكلة المشروع باستخدام:
- **Backend**: Modular Monolith Architecture
- **Frontend**: Feature-based React Architecture

## Backend Structure

### Modular Monolith Pattern

```
backend/src-new/
├── modules/                    # Business modules (bounded contexts)
│   ├── auth/                   # Authentication module
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access layer
│   │   ├── models/             # Data models
│   │   ├── validators/         # Input validation
│   │   └── index.js            # Module routes
│   ├── clients/
│   ├── projects/
│   ├── tasks/
│   ├── invoices/
│   └── ...
├── shared/                     # Shared infrastructure
│   ├── database/               # Database connection
│   ├── middleware/             # Express middleware
│   ├── utils/                  # Utility functions
│   ├── config/                 # Configuration
│   └── types/                  # Shared types
├── app.js                      # Express app setup
└── server.js                   # Server entry point
```

### Module Structure

كل module يحتوي على:

1. **Controllers**: Handle HTTP requests/responses
2. **Services**: Business logic and orchestration
3. **Repositories**: Database queries and data access
4. **Models**: Data structures and validation
5. **Validators**: Input validation schemas
6. **index.js**: Module routes definition

### Benefits

- ✅ Clear separation of concerns
- ✅ Easy to test each layer independently
- ✅ Scalable to microservices if needed
- ✅ Better code organization and maintainability
- ✅ Reusable shared infrastructure

### Example: Auth Module

```javascript
// modules/auth/index.js - Routes
router.post('/login', authController.login);

// modules/auth/controllers/auth.controller.js - Controller
async login(req, res, next) {
  const result = await authService.login(req.body);
  res.json(result);
}

// modules/auth/services/auth.service.js - Business Logic
async login({ email, password }) {
  const user = await authRepository.findByEmail(email);
  // ... business logic
  return { user, token };
}

// modules/auth/repositories/auth.repository.js - Data Access
async findByEmail(email) {
  return await db.query('SELECT * FROM users WHERE email = $1', [email]);
}
```

## Frontend Structure

### Feature-based Architecture

```
frontend/src-new/
├── features/                   # Feature modules
│   ├── auth/                   # Authentication feature
│   │   ├── components/         # Feature-specific components
│   │   ├── hooks/              # Feature-specific hooks
│   │   ├── services/           # API calls for this feature
│   │   ├── types/              # TypeScript types
│   │   ├── pages/              # Feature pages
│   │   └── index.js            # Feature exports
│   ├── clients/
│   ├── projects/
│   ├── tasks/
│   └── ...
├── shared/                     # Shared resources
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Reusable hooks
│   ├── services/               # API client, etc.
│   ├── utils/                  # Utility functions
│   ├── types/                  # Shared types
│   ├── context/                # Global contexts
│   └── layouts/                # Layout components
├── App.jsx
└── main.jsx
```

### Feature Structure

كل feature يحتوي على:

1. **components/**: Feature-specific UI components
2. **hooks/**: Custom hooks for this feature
3. **services/**: API calls and data fetching
4. **types/**: TypeScript interfaces/types
5. **pages/**: Page components
6. **index.js**: Exports all public APIs

### Benefits

- ✅ Features are self-contained and isolated
- ✅ Easy to find and modify code
- ✅ Better collaboration (teams can work on different features)
- ✅ Reusable shared components
- ✅ Clear dependencies

### Example: Auth Feature

```javascript
// features/auth/index.js - Public API
export { LoginPage, RegisterPage } from './pages';
export { useAuth, useLogin } from './hooks';
export { authService } from './services';

// features/auth/services/auth.service.js - API calls
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

// features/auth/hooks/useAuth.js - Custom hook
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
  };
  return { user, login };
};

// features/auth/pages/LoginPage.jsx - Page component
const LoginPage = () => {
  const { login } = useAuth();
  return <LoginForm onSubmit={login} />;
};
```

## Migration Steps

### Backend Migration

1. ✅ Create new structure in `backend/src-new/`
2. ⏳ Move and refactor existing routes to modules
3. ⏳ Extract business logic to services
4. ⏳ Create repositories for data access
5. ⏳ Move shared code to `shared/`
6. ⏳ Update imports and test
7. ⏳ Replace `src/` with `src-new/`

### Frontend Migration

1. ✅ Create new structure in `frontend/src-new/`
2. ⏳ Group components by feature
3. ⏳ Move pages to respective features
4. ⏳ Extract API calls to feature services
5. ⏳ Create feature-specific hooks
6. ⏳ Move shared components to `shared/`
7. ⏳ Update imports and test
8. ⏳ Replace `src/` with `src-new/`

## Next Steps

1. Continue migrating remaining modules
2. Add tests for each module/feature
3. Update documentation
4. Review and optimize

## Resources

- [Modular Monolith](https://www.kamilgrzybek.com/design/modular-monolith-primer/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

# Frontend - Feature-based React Architecture

## Overview

This frontend follows the **Feature-based** architecture pattern, organizing code by features rather than technical layers.

## Structure

```
src-new/
├── features/            # Feature modules
│   ├── auth/           # Authentication feature
│   ├── clients/        # Client management
│   ├── projects/       # Project management
│   ├── tasks/          # Task management
│   └── ...             # Other features
├── shared/             # Shared resources
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Reusable hooks
│   ├── services/       # API client
│   ├── utils/          # Utility functions
│   ├── context/        # Global contexts
│   └── layouts/        # Layout components
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Feature Pattern

Each feature follows the same structure:

```
features/[feature-name]/
├── components/         # Feature-specific components
├── hooks/             # Feature-specific hooks
├── services/          # API calls for this feature
├── types/             # TypeScript types (optional)
├── pages/             # Feature pages
└── index.js           # Public API exports
```

### Layer Responsibilities

1. **Pages**: Composition and routing
   - Compose components
   - Use hooks
   - Handle routing

2. **Components**: Presentational
   - Display UI
   - Handle user interactions
   - Receive props

3. **Hooks**: State management
   - Manage state
   - Handle side effects
   - Call services

4. **Services**: API calls
   - Make HTTP requests
   - Transform data
   - Handle errors

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Freelance Management
```

### Running

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Routes

- `/login` - Login page
- `/register` - Register page
- `/forgot-password` - Password reset
- `/dashboard` - Dashboard (protected)
- `/clients` - Clients management (protected)
- `/projects` - Projects management (protected)
- `/tasks` - Tasks management (protected)
- `/invoices` - Invoices management (protected)

## Creating a New Feature

1. Create feature structure:
```bash
mkdir -p features/[feature-name]/{components,hooks,services,pages}
```

2. Create service:
```javascript
// features/[feature-name]/services/[feature].service.js
import api from '../../../shared/services/api';

export const featureService = {
  async getAll() {
    const response = await api.get('/[feature]');
    return response.data;
  },
  
  async create(data) {
    const response = await api.post('/[feature]', data);
    return response.data;
  }
};
```

3. Create hook:
```javascript
// features/[feature-name]/hooks/use[Feature].js
import { useState, useEffect } from 'react';
import { featureService } from '../services/[feature].service';

export const useFeature = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await featureService.getAll();
      setItems(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { items, loading };
};
```

4. Create page:
```javascript
// features/[feature-name]/pages/[Feature]Page.jsx
import { useFeature } from '../hooks/use[Feature]';

const FeaturePage = () => {
  const { items, loading } = useFeature();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Feature</h1>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

export default FeaturePage;
```

5. Export from index:
```javascript
// features/[feature-name]/index.js
export { default as FeaturePage } from './pages/FeaturePage';
export { useFeature } from './hooks/useFeature';
export * from './services/[feature].service';
```

6. Add route in App.jsx:
```javascript
import { FeaturePage } from './features/[feature-name]';

<Route path="[feature]" element={<FeaturePage />} />
```

## Shared Components

Reusable UI components in `shared/components/`:

```javascript
import { Button, Modal, LoadingSpinner } from '../shared/components';

<Button onClick={handleClick}>Click Me</Button>
<Modal isOpen={isOpen} onClose={handleClose}>Content</Modal>
<LoadingSpinner />
```

## Shared Hooks

Reusable hooks in `shared/hooks/`:

```javascript
import { useDebounce, useLocalStorage } from '../shared/hooks';

const debouncedValue = useDebounce(value, 500);
const [stored, setStored] = useLocalStorage('key', defaultValue);
```

## API Client

Axios instance with interceptors:

```javascript
import api from '../shared/services/api';

// Automatically adds auth token
const response = await api.get('/endpoint');
```

## Utilities

Helper functions in `shared/utils/`:

```javascript
import { formatDate, formatCurrency, isEmail } from '../shared/utils';

const formatted = formatDate(date);
const price = formatCurrency(1000);
const valid = isEmail('test@example.com');
```

## State Management

### Local State
Use `useState` for component-level state:

```javascript
const [count, setCount] = useState(0);
```

### Feature State
Use custom hooks for feature-level state:

```javascript
const { items, loading, createItem } = useFeature();
```

### Global State
Use Context API for app-level state:

```javascript
const { user, login, logout } = useAuth();
```

## Styling

- CSS Modules or styled-components
- Tailwind CSS (optional)
- Theme variables in `theme.css`

## Testing

```bash
npm test
```

## Best Practices

1. **Keep components small** - Single responsibility
2. **Use custom hooks** - Extract logic
3. **Colocate code** - Keep related code together
4. **Shared vs Feature** - Only truly reusable in shared
5. **Type safety** - Use PropTypes or TypeScript
6. **Error boundaries** - Catch component errors
7. **Loading states** - Always show loading

## Error Handling

Use ErrorBoundary component:

```javascript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## Authentication

Protected routes use ProtectedRoute:

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Performance

- Use `React.memo` for expensive components
- Use `useCallback` for functions
- Use `useMemo` for expensive calculations
- Lazy load routes with `React.lazy`

## Documentation

- See root `RESTRUCTURE_GUIDE.md` for detailed patterns
- See root `NEW_ARCHITECTURE_README.md` for complete guide
- See root `ARCHITECTURE_DIAGRAM.md` for visual guides

## License

MIT

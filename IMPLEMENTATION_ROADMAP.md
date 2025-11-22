# 🗺️ Implementation Roadmap

## Phase 1: Production Ready (Week 1-2)
**Goal**: Make the app secure and stable for production use

### 1. Security Enhancements ⚠️ CRITICAL

#### Rate Limiting
```bash
cd backend
npm install express-rate-limit
```

```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  message: 'Too many login attempts, please try again later.'
});

module.exports = { apiLimiter, authLimiter };
```

#### Two-Factor Authentication
```bash
npm install speakeasy qrcode
```

```javascript
// backend/src/routes/auth.js - Add 2FA endpoints
router.post('/2fa/setup', authenticateToken, async (req, res) => {
  const secret = speakeasy.generateSecret({ name: 'Freelancer App' });
  // Store secret.base32 in user record
  // Generate QR code
  qrcode.toDataURL(secret.otpauth_url, (err, data) => {
    res.json({ qrCode: data, secret: secret.base32 });
  });
});

router.post('/2fa/verify', authenticateToken, async (req, res) => {
  const verified = speakeasy.totp.verify({
    secret: user.twofa_secret,
    encoding: 'base32',
    token: req.body.token
  });
  res.json({ verified });
});
```

#### Input Sanitization
```bash
npm install dompurify isomorphic-dompurify
```

---

### 2. Database Migration to PostgreSQL

```bash
npm install pg
```

```javascript
// backend/src/db/postgres.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
```

**Migration Steps**:
1. Export SQLite data to SQL
2. Convert SQLite syntax to PostgreSQL
3. Update all queries
4. Test thoroughly
5. Deploy

---

### 3. Error Monitoring

```bash
npm install @sentry/node @sentry/react
```

```javascript
// backend/src/server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

---

## Phase 2: Core Features (Week 3-4)
**Goal**: Add essential business features

### 1. Calendar View for Tasks 📅

```bash
cd frontend
npm install react-big-calendar date-fns
```

```jsx
// frontend/src/pages/TaskCalendar.jsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': require('date-fns/locale/en-US') };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const TaskCalendar = () => {
  const [tasks, setTasks] = useState([]);

  const events = tasks.map(task => ({
    title: task.title,
    start: new Date(task.due_date),
    end: new Date(task.due_date),
    resource: task
  }));

  return (
    <div style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </div>
  );
};
```

---

### 2. Payment Gateway (Stripe) 💳

```bash
cd backend
npm install stripe
```

```javascript
// backend/src/routes/payments.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  const { amount, invoiceId } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: 'usd',
    metadata: { invoiceId }
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'payment_intent.succeeded') {
    // Update invoice status to paid
    const invoiceId = event.data.object.metadata.invoiceId;
    await runQuery(
      'UPDATE invoices SET status = "paid", paid_date = CURRENT_TIMESTAMP WHERE id = ?',
      [invoiceId]
    );
  }

  res.json({ received: true });
});
```

```jsx
// frontend/src/components/PaymentForm.jsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, invoiceId }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { clientSecret } = await axios.post('/api/payments/create-payment-intent', {
      amount,
      invoiceId
    });

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });

    if (result.error) {
      alert(result.error.message);
    } else {
      alert('Payment successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay ${amount}</button>
    </form>
  );
};
```

---

### 3. Expense Tracking 💰

```sql
-- Add to schema.sql
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  is_billable INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);
```

```javascript
// backend/src/routes/expenses.js
router.get('/', authenticateToken, async (req, res) => {
  const expenses = await getAll('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', [req.user.id]);
  res.json(expenses);
});

router.post('/', authenticateToken, async (req, res) => {
  const { project_id, category, amount, date, description, is_billable } = req.body;
  const result = await runQuery(
    'INSERT INTO expenses (user_id, project_id, category, amount, date, description, is_billable) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, project_id, category, amount, date, description, is_billable]
  );
  res.status(201).json({ id: result.id });
});
```

---

### 4. Recurring Invoices 🔄

```sql
-- Add to schema.sql
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  template_invoice_id INTEGER,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_date DATE NOT NULL,
  end_date DATE,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
```

```javascript
// backend/src/jobs/recurringInvoices.js
const cron = require('node-cron');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  const dueRecurring = await getAll(
    'SELECT * FROM recurring_invoices WHERE is_active = 1 AND next_date <= date("now")'
  );

  for (const recurring of dueRecurring) {
    // Create new invoice from template
    const template = await getOne('SELECT * FROM invoices WHERE id = ?', [recurring.template_invoice_id]);
    
    await runQuery(
      'INSERT INTO invoices (user_id, client_id, invoice_number, amount, status, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [recurring.user_id, recurring.client_id, generateInvoiceNumber(), template.amount, 'draft', calculateDueDate(), template.notes]
    );

    // Update next_date
    const nextDate = calculateNextDate(recurring.frequency, recurring.next_date);
    await runQuery('UPDATE recurring_invoices SET next_date = ? WHERE id = ?', [nextDate, recurring.id]);
  }
});
```

---

## Phase 3: Enhanced UX (Week 5-6)
**Goal**: Improve user experience

### 1. Pagination

```javascript
// backend/src/routes/clients.js
router.get('/', authenticateToken, async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM clients WHERE user_id = ?';
  let countQuery = 'SELECT COUNT(*) as total FROM clients WHERE user_id = ?';
  let params = [req.user.id];

  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    countQuery += ' AND (name LIKE ? OR email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const clients = await getAll(query, params);
  const { total } = await getOne(countQuery, params.slice(0, -2));

  res.json({
    data: clients,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});
```

---

### 2. Dark Mode 🌙

```jsx
// frontend/src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) setIsDark(JSON.parse(saved));
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('darkMode', JSON.stringify(!isDark));
    document.body.classList.toggle('dark-mode');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

```css
/* frontend/src/index.css - Add dark mode styles */
body.dark-mode {
  background: #1a1a1a;
  color: #ffffff;
}

body.dark-mode .card {
  background: #2d2d2d;
  color: #ffffff;
}

body.dark-mode input,
body.dark-mode textarea,
body.dark-mode select {
  background: #3d3d3d;
  color: #ffffff;
  border-color: #555;
}
```

---

### 3. Loading Skeletons

```jsx
// frontend/src/components/Skeleton.jsx
const Skeleton = ({ width = '100%', height = '20px', style = {} }) => (
  <div
    style={{
      width,
      height,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite',
      borderRadius: '4px',
      ...style
    }}
  />
);

// Add to index.css
@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Phase 4: Advanced Features (Week 7-8)
**Goal**: Add sophisticated functionality

### 1. Real-Time Updates (WebSocket)

```bash
npm install socket.io socket.io-client
```

```javascript
// backend/src/server.js
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Emit events when data changes
io.to(`user_${userId}`).emit('task_updated', task);
```

---

### 2. Advanced Analytics

```javascript
// backend/src/routes/analytics.js
router.get('/revenue-trend', authenticateToken, async (req, res) => {
  const { months = 6 } = req.query;
  
  const trend = await getAll(`
    SELECT 
      strftime('%Y-%m', created_at) as month,
      SUM(amount) as revenue,
      COUNT(*) as invoice_count
    FROM invoices
    WHERE user_id = ? AND status = 'paid'
      AND created_at >= date('now', '-${months} months')
    GROUP BY month
    ORDER BY month
  `, [req.user.id]);

  res.json(trend);
});

router.get('/client-profitability', authenticateToken, async (req, res) => {
  const profitability = await getAll(`
    SELECT 
      c.name,
      SUM(i.amount) as revenue,
      COUNT(DISTINCT p.id) as project_count,
      SUM(te.duration) as hours_spent
    FROM clients c
    LEFT JOIN invoices i ON c.id = i.client_id AND i.status = 'paid'
    LEFT JOIN projects p ON c.id = p.client_id
    LEFT JOIN time_entries te ON p.id = te.project_id
    WHERE c.user_id = ?
    GROUP BY c.id
    ORDER BY revenue DESC
  `, [req.user.id]);

  res.json(profitability);
});
```

---

## Quick Implementation Checklist

### Security (Do First!)
- [ ] Add rate limiting
- [ ] Add input sanitization
- [ ] Implement 2FA
- [ ] Add CSRF protection
- [ ] Set up Sentry

### Performance
- [ ] Add pagination
- [ ] Implement caching
- [ ] Optimize queries
- [ ] Add indexes
- [ ] Code splitting

### Features
- [ ] Calendar view
- [ ] Payment gateway
- [ ] Expense tracking
- [ ] Recurring invoices
- [ ] Dark mode

### Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Cypress)
- [ ] Load testing

### DevOps
- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Monitoring
- [ ] Backup strategy
- [ ] Deployment automation

---

**Priority Order**: Security → Performance → Features → Testing → DevOps

**Estimated Timeline**: 8-10 weeks for complete implementation

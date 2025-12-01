-- Production Announcements Migration
-- Run this in Azure Portal Query Editor

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  media_url TEXT,
  media_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcements_featured ON announcements(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- Seed sample announcements
INSERT INTO announcements (title, content, is_featured) VALUES
(
  'Welcome to Roastify!',
  'We''re excited to have you here! Roastify is your all-in-one platform for managing your freelance business. Track time, manage clients, create invoices, and get paid faster.

This is a featured announcement that will appear on your home page and dashboard. You can create, edit, and manage announcements from the Admin Panel.

Stay tuned for more updates and new features!',
  true
),
(
  'New Features Coming Soon',
  'We''re constantly working to improve Roastify and add new features that make your freelance life easier.

Upcoming features include:
- Advanced reporting and analytics
- Team collaboration tools
- Mobile app for iOS and Android
- Integration with popular payment gateways
- Automated invoice reminders

Keep an eye on this space for announcements about new releases!',
  false
),
(
  'Tips for Getting Started',
  'Here are some quick tips to help you get the most out of Roastify:

1. Set up your profile with your business information
2. Add your clients and their contact details
3. Create projects and assign them to clients
4. Track your time as you work
5. Generate professional invoices with one click
6. Monitor your income and expenses in the dashboard

Need help? Check out our documentation or contact support at support@roastify.online',
  false
);

-- Verify the data
SELECT COUNT(*) as total_announcements FROM announcements;
SELECT * FROM announcements ORDER BY created_at DESC;

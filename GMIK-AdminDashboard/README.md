# GMIK Admin Dashboard - Setup Guide

## Prerequisites
- Node.js v14+ (LTS recommended)
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
cd GMIK-AdminDashboard
npm install
```

### 2. Configure Backend URL
Edit `src/services/api.js` and update `API_URL`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

### 3. Start Development Server
```bash
npm start
```

The dashboard will open at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Project Structure

```
GMIK-AdminDashboard/
├── public/
│   └── index.html
├── src/
│   ├── pages/              # Admin pages
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   ├── UsersPage.js
│   │   ├── ActivityLogsPage.js
│   │   └── ModerationPage.js
│   ├── components/         # Reusable components
│   │   ├── Layout.js
│   │   ├── PrivateRoute.js
│   │   └── StatCard.js
│   ├── services/           # API services
│   │   └── api.js
│   ├── App.js             # Main app component
│   └── index.js           # Entry point
└── package.json
```

## Features

### Dashboard
- System metrics overview
  - Total users
  - Active tasks
  - Completed tasks
  - Total payments processed
- Real-time data refresh

### User Management
- View all registered users
- User details (email, name, completed tasks)
- Account status (active/disabled)
- Disable user accounts for moderation

### Activity Logs
- System-wide activity tracking
- Action history with timestamps
- Entity type and user information
- Filterable log entries

### Content Moderation
- Flagged content review
- Task removal interface
- User violation tracking

## Authentication

### Login
1. Navigate to `http://localhost:3000/login`
2. Enter admin email and password
3. Token is stored in localStorage
4. Auto-redirect on token expiry

### Admin User Setup

Create admin user in backend:
```sql
INSERT INTO users (email, password_hash, display_name, email_verified, is_active)
VALUES (
  'admin@gmik.com',
  '$2a$10$...', -- bcrypt hash of password
  'Admin User',
  true,
  true
);
```

Or via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmik.com",
    "password": "adminpassword",
    "displayName": "Admin User"
  }'
```

## API Integration

### Authentication
```javascript
const response = await adminAPI.login(email, password);
// Returns: { accessToken, refreshToken, user }
```

### Dashboard Metrics
```javascript
const metrics = await adminAPI.getMetrics();
// Returns: { totalUsers, activeTasks, completedTasks, totalPaymentsProcessed }
```

### User Management
```javascript
const users = await adminAPI.getUsers();
await adminAPI.disableUser(userId);
```

### Activity Logs
```javascript
const logs = await adminAPI.getActivityLogs();
// Returns paginated list of activities
```

### Content Moderation
```javascript
await adminAPI.moderateContent(taskId, action);
// action: 'remove', 'flag', 'review'
```

## Styling

The dashboard uses CSS modules and plain CSS for styling:
- `src/pages/*.css` - Page-specific styles
- `src/components/*.css` - Component styles
- `src/index.css` - Global styles

Custom color scheme:
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#51cf66` (Green)
- Danger: `#ff6b6b` (Red)

## Responsive Design

- Desktop: Full sidebar navigation
- Tablet: Collapsible sidebar
- Mobile: Stacked layout

## Deployment

### Using Vercel
```bash
npm install -g vercel
vercel --prod
```

### Using Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Using Docker
```bash
# Build image
docker build -t gmik-admin .

# Run container
docker run -p 3000:3000 gmik-admin
```

### Docker Compose
```yaml
version: '3'
services:
  admin-dashboard:
    build: ./GMIK-AdminDashboard
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:5000/api
```

## Environment Variables

Create `.env` file in root:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
- Ensure backend CORS is configured correctly
- Add frontend URL to backend CORS whitelist

### Login Failed
- Verify backend is running
- Check admin credentials
- Ensure JWT_SECRET is set in backend

### Performance Issues
- Use React DevTools to profile
- Check Redux DevTools for state management
- Optimize re-renders

## Development Tips

### Enable Redux DevTools
```javascript
// Install extension in browser
// Redux state will be visible in DevTools
```

### Hot Module Replacement
```bash
npm start
# Changes save automatically without refresh
```

### Component Debugging
Use React DevTools extension to inspect components and props.

## Support & Documentation

- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- React official docs: https://react.dev/

## Future Enhancements

- [ ] Advanced filtering and search
- [ ] Data export (CSV/PDF)
- [ ] Real-time notifications
- [ ] Custom reports builder
- [ ] User analytics dashboard
- [ ] Task completion metrics
- [ ] Revenue analytics

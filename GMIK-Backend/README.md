# GMIK Backend - Installation & Setup Guide

## Prerequisites
- Node.js v16+ (LTS recommended)
- PostgreSQL 12+ with PostGIS extension
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies
```bash
cd GMIK-Backend
npm install
```

### 2. Setup Database

#### Option A: Using PostgreSQL CLI
```bash
psql -U postgres -d gmik_db -f database/init.sql
```

#### Option B: Using Node Script
```bash
npm run db:migrate
```

### 3. Configure Environment Variables
```bash
# Copy the example .env file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Configuration:**
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` - Generate a strong random string
- `GOOGLE_MAPS_API_KEY` - Get from Google Cloud Console
- `FIREBASE_*` - Firebase Cloud Messaging credentials

### 4. Start the Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/refresh-token` - Refresh access token

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create new task
- `POST /api/tasks/:id/accept` - Accept task
- `PUT /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Messages
- `GET /api/messages/task/:taskId` - Get task messages
- `POST /api/messages/task/:taskId` - Send message

### Payments
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:userId/disable` - Disable user
- `GET /api/admin/logs` - Activity logs
- `GET /api/admin/metrics` - System metrics
- `POST /api/admin/moderate` - Moderate content

## WebSocket Events

Connect to `http://localhost:5000` with Socket.IO

**Events:**
- `join_task` - Join task chat room
- `send_message` - Send message in task chat
- `message_received` - Receive new message
- `task_status_updated` - Task status update notification

## Testing

```bash
npm test
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check `DB_HOST` and `DB_PORT` in .env
- Verify credentials

### JWT Secret Error
```
Error: JWT_SECRET is not defined
```
- Add `JWT_SECRET=your_secret_key` to .env

### CORS Error
```
Cross-Origin Request Blocked
```
- Update CORS origins in `server.js`
- Ensure frontend URLs are in CORS whitelist

## Deployment

### Using Docker
```bash
docker build -t gmik-backend .
docker run -p 5000:5000 -e DB_HOST=db gmik-backend
```

### Using Heroku
```bash
heroku create gmik-backend
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

## Support
For issues and questions, create an issue on the project repository.

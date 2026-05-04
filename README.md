# GMIK - Complete Project Structure

## Overview
GMIK (Get My Immediate Kababayan) is a hyperlocal task marketplace platform connecting task posters (Droppers) with task executors (Chasers) within their immediate geographic vicinity.

## Project Structure

```
GMIK/
├── GMIK-Backend/              # Node.js/Express backend server
│   ├── config/               # Configuration files
│   ├── controllers/          # Request handlers
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── database/            # Database setup & migrations
│   ├── sockets/             # WebSocket handlers
│   ├── utils/               # Utility functions
│   ├── server.js            # Entry point
│   ├── package.json         # Dependencies
│   ├── .env.example         # Environment template
│   └── README.md            # Backend documentation
│
├── GMIK-Frontend/             # React Native mobile app
│   ├── src/
│   │   ├── screens/         # Screen components
│   │   │   ├── auth/       # Login/Register screens
│   │   │   ├── tasks/      # Task-related screens
│   │   │   ├── chat/       # Messaging screen
│   │   │   └── profile/    # Profile screen
│   │   ├── components/      # Reusable components
│   │   ├── redux/          # State management
│   │   ├── services/       # API client
│   │   ├── utils/          # Utilities
│   │   └── constants/      # App constants
│   ├── android/             # Android native code
│   ├── App.js              # Main app component
│   ├── package.json        # Dependencies
│   └── README.md           # Frontend documentation
│
├── GMIK-AdminDashboard/       # React web admin panel
│   ├── src/
│   │   ├── pages/          # Admin pages
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API client
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── public/             # Static files
│   ├── package.json        # Dependencies
│   └── README.md          # Admin documentation
│
└── Documentation/
    ├── DATABASE_SCHEMA.md     # Database structure
    ├── API_REFERENCE.md       # API endpoints
    ├── DEPLOYMENT.md          # Deployment guide
    └── ARCHITECTURE.md        # System architecture
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL + PostGIS (geolocation)
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **External APIs**: Google Maps, Firebase Cloud Messaging

### Frontend (Mobile)
- **Framework**: React Native
- **Language**: JavaScript/JSX
- **State Management**: Redux
- **Navigation**: React Navigation
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Storage**: AsyncStorage
- **UI Components**: React Native Paper

### Admin Dashboard
- **Framework**: React
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Styling**: CSS

## Key Features

### User Features
- ✅ Email registration & verification
- ✅ Task posting (Dropper role)
- ✅ Task discovery (Chaser role)
- ✅ GPS-based location services
- ✅ Real-time task-specific chat
- ✅ Task acceptance & completion
- ✅ Payment confirmation
- ✅ User profile & reputation (task count)
- ✅ Push notifications (FCM)

### Admin Features
- ✅ User management
- ✅ Activity logging
- ✅ System metrics dashboard
- ✅ Content moderation
- ✅ User account disabling

## Database Schema

### Core Tables
- **users** - User accounts and profiles
- **tasks** - Posted tasks
- **task_acceptance** - Task assignments to chasers
- **messages** - Task-specific conversations
- **payments** - Payment records
- **notifications** - User notifications
- **activity_logs** - Admin audit trail

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/refresh-token` - Token refresh

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task
- `POST /api/tasks/:id/accept` - Accept task
- `PUT /api/tasks/:id/status` - Update status
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

### Messages & Notifications
- `GET /api/messages/task/:taskId` - Get messages
- `POST /api/messages/task/:taskId` - Send message
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Admin
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/disable` - Disable user
- `GET /api/admin/logs` - Activity logs
- `GET /api/admin/metrics` - System metrics
- `POST /api/admin/moderate` - Moderate content

## Installation & Setup

### Quick Start (All Components)

```bash
# 1. Clone repository
git clone <repo-url>
cd GMIK

# 2. Backend Setup
cd GMIK-Backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run db:migrate
npm run dev

# 3. Frontend Setup (in new terminal)
cd ../GMIK-Frontend
npm install
# Update API_URL in src/services/api.js
npm start
# Choose device (Android emulator or physical device)

# 4. Admin Dashboard (in new terminal)
cd ../GMIK-AdminDashboard
npm install
npm start
# Opens at http://localhost:3000
```

### Detailed Setup
See individual README files in each folder for detailed instructions.

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=...
DB_NAME=gmik_db

PORT=5000
JWT_SECRET=...
GOOGLE_MAPS_API_KEY=...
FIREBASE_PROJECT_ID=...
```

### Frontend
Update `API_URL` in `src/services/api.js`

## Deployment

### Backend (Node.js)
- Heroku: `git push heroku main`
- Docker: Build & push to registry
- AWS EC2: Deploy with PM2

### Frontend (React Native)
- Build APK: `./gradlew assembleRelease`
- Google Play Store: Upload APK/AAB
- Internal Testing: Share APK directly

### Admin Dashboard (React)
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`
- AWS S3 + CloudFront

## Testing

### Backend
```bash
cd GMIK-Backend
npm test
```

### Frontend
```bash
cd GMIK-Frontend
npm test
```

## Development Workflow

1. **Backend Development**
   - Start with `npm run dev`
   - API hot-reloads with changes
   - Use Postman/Insomnia for API testing

2. **Frontend Development**
   - Use Metro bundler: `npm start`
   - App reloads on changes
   - Use React DevTools for debugging

3. **Admin Dashboard**
   - Hot module replacement enabled
   - Open developer tools for debugging
   - Redux DevTools for state inspection

## Performance Considerations

- **Geospatial Queries**: Use PostGIS indexes
- **Real-time Chat**: WebSocket connections
- **Notifications**: Firebase Cloud Messaging
- **Image Uploads**: Consider CDN integration
- **Database**: Connection pooling via node-postgres

## Security

- JWT token-based authentication
- Bcrypt password hashing
- CORS configuration
- HTTPS/TLS enforcement
- PostgreSQL parameterized queries (SQL injection prevention)
- Input validation & sanitization

## Monitoring & Logging

- Activity logs in admin dashboard
- Server logs in backend console
- Firebase analytics for mobile app
- PostgreSQL query logging

## Future Enhancements

- [ ] iOS app support
- [ ] 5-star rating system
- [ ] Dispute resolution mechanism
- [ ] In-app payments (Stripe/PayMaya)
- [ ] Task categories expansion
- [ ] AI-based task recommendations
- [ ] Video calling for coordination
- [ ] Insurance/protection program

## Support & Contact

For questions or issues:
1. Check README files in respective folders
2. Review API documentation
3. Check GitHub issues
4. Contact development team

## License

This project is licensed under MIT License - see LICENSE file for details.

---

**Project Timeline**: February 2026 - November 2026 (MVP Phase)
**Target Users**: Academic community (30-50 concurrent users MVP)
**Version**: 1.0.0-MVP

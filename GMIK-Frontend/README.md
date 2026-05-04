# GMIK Frontend (React Native) - Setup Guide

## Prerequisites
- Node.js v16+ (LTS recommended)
- Android SDK (for Android development)
- React Native CLI
- Android Emulator or physical Android device (API 29+)

## Installation Steps

### 1. Install Dependencies
```bash
cd GMIK-Frontend
npm install
```

### 2. Install Android Buildtools
```bash
# If you don't have Android SDK, follow React Native documentation:
# https://reactnative.dev/docs/environment-setup
```

### 3. Configure Backend URL
Edit `src/services/api.js` and update `API_URL`:
```javascript
const API_URL = 'http://YOUR_BACKEND_IP:5000/api';
```

### 4. Start the Development Server

#### Metro Bundler (in separate terminal)
```bash
npm start
```

#### Run on Android Emulator
```bash
npm run android
```

#### Run on Physical Device
```bash
npx react-native run-android
```

## Project Structure

```
GMIK-Frontend/
├── App.js                 # Entry point
├── src/
│   ├── screens/           # Screen components
│   │   ├── auth/         # Auth screens
│   │   ├── tasks/        # Task screens
│   │   ├── chat/         # Chat screen
│   │   ├── profile/      # Profile screen
│   │   └── SplashScreen.js
│   ├── components/        # Reusable components
│   ├── navigation/        # Navigation setup
│   ├── redux/            # State management
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   └── constants/        # Constants
└── android/              # Android-specific code
```

## Key Features Implemented

### Authentication
- Email/Password registration and login
- Token-based authentication (JWT)
- Session persistence with AsyncStorage

### Task Management
- Browse task feed with filters
- Create new tasks with location
- Accept tasks from other users
- Update task status
- Real-time task updates

### Location Services
- GPS-based task location
- Distance-based filtering (1km, 5km, custom)
- Location permissions handling

### Real-time Chat
- Task-specific messaging
- Socket.IO integration
- Real-time notifications

### User Profile
- Display profile information
- Track completed tasks
- Profile picture support
- Logout functionality

## Permissions Required

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## Testing

### Test Registration
1. Launch app
2. Go to "Sign Up"
3. Enter email, password, display name
4. Verify email (check console logs)
5. Login with credentials

### Test Task Creation
1. Login as user
2. Go to "Post Task" tab
3. Fill in task details
4. Submit

### Test Task Discovery
1. Go to "Find Tasks" tab
2. Browse available tasks
3. View task details
4. Accept a task

## Troubleshooting

### Metro Bundler Crash
```bash
npm start -- --reset-cache
```

### Emulator Not Starting
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd emulator_name
```

### Network Connection Error
- Check backend is running: `http://localhost:5000/api/health`
- Update `API_URL` to match backend host
- Check Android emulator network settings

### Location Permission Denied
- Grant permission when prompted
- Check app permissions in Android settings
- Ensure backend has Google Maps API key

## Building APK for Release

### Development APK
```bash
npx react-native run-android
```

### Release APK
```bash
# Generate signing key
keytool -genkey -v -keystore release.keystore -alias gmik -keyalg RSA -keysize 2048 -validity 10000

# Build APK
cd android
./gradlew assembleRelease

# Built APK: app/release/app-release.apk
```

## Firebase Cloud Messaging (FCM)

1. Create Firebase project at console.firebase.google.com
2. Add Firebase configuration to app
3. Update `FIREBASE_*` credentials in backend

## Performance Tips

- Use React DevTools: `npm install react-devtools-core`
- Profile app: `React.Profiler`
- Use `React.memo()` for expensive components
- Optimize re-renders with Redux selectors

## Support
For issues and setup problems, refer to:
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation Guide](https://reactnavigation.org/)
- Project GitHub issues

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from './src/redux/store';
import { setSettings } from './src/redux/settingsSlice';
import { getTheme } from './src/utils/theme';
import { taskService } from './src/services/api';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import TaskDetailsScreen from './src/screens/tasks/TaskDetailsScreen';
import EditTaskScreen from './src/screens/tasks/EditTaskScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import UserProfileScreen from './src/screens/profile/UserProfileScreen';
import PostScreen from './src/screens/PostScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import MyDocumentsScreen from './src/screens/MyDocumentsScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import PaymentMethodsScreen from './src/screens/profile/PaymentMethodsScreen';
import SettingsScreen from './src/screens/profile/SettingsScreen';
import HelpSupportScreen from './src/screens/profile/HelpSupportScreen';

// Try to import native navigation
let NavigationContainer, createNativeStackNavigator, createBottomTabNavigator;
try {
  const nav = require('@react-navigation/native');
  NavigationContainer = nav.NavigationContainer;
  createNativeStackNavigator = require('@react-navigation/native-stack').createNativeStackNavigator;
  createBottomTabNavigator = require('@react-navigation/bottom-tabs').createBottomTabNavigator;
} catch (e) {
  NavigationContainer = ({ children }) => <View>{children}</View>;
  createNativeStackNavigator = () => ({
    Navigator: ({ children }) => <View>{children}</View>,
    Screen: ({ component: Component }) => <Component />,
  });
  createBottomTabNavigator = () => ({
    Navigator: ({ children }) => <View>{children}</View>,
    Screen: ({ component: Component }) => <Component />,
  });
}

const isWeb = Platform.OS === 'web' || typeof document !== 'undefined';

let Stack = null, Tab = null;
if (!isWeb) {
  Stack = createNativeStackNavigator();
  Tab = createBottomTabNavigator();
}

// ============ WEB VERSION ============
const WebAppContent = () => {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [profileScreen, setProfileScreen] = useState(null);
  const [taskDetailsId, setTaskDetailsId] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  const [directMessageUserId, setDirectMessageUserId] = useState(null);
  const [directMessageUserName, setDirectMessageUserName] = useState(null);
  const [directMessagePostTitle, setDirectMessagePostTitle] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [lastSeenPostsCount, setLastSeenPostsCount] = useState(0);
  const { isLoggedIn } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);

  const dispatch = useDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load persisted settings from AsyncStorage
        const savedSettings = await AsyncStorage.getItem('userSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          console.log('Loaded persisted settings from AsyncStorage:', settings);
          
          const reduxPayload = {
            darkMode: settings.dark_mode ?? false,
            notifications_enabled: settings.notifications_enabled ?? true,
            email_updates_enabled: settings.email_updates_enabled ?? true,
            task_alerts_enabled: settings.task_alerts_enabled ?? true,
            message_alerts_enabled: settings.message_alerts_enabled ?? true,
            location_services: settings.location_services ?? true,
            profile_privacy: settings.profile_privacy ?? 'public',
            show_online_status: settings.show_online_status ?? true,
            allow_messages: settings.allow_messages ?? true,
          };
          dispatch(setSettings(reduxPayload));
        }
        setCurrentScreen('Login');
        setProfileScreen(null);
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setInitialized(true);
      }
    };
    initializeApp();
  }, [dispatch]);

  useEffect(() => {
    console.log('isLoggedIn state changed:', isLoggedIn);
    if (!isLoggedIn) {
      console.log('User logged out - resetting to Login screen');
      setCurrentScreen('Login');
      setProfileScreen(null);
      setTaskDetailsId(null);
      setEditTaskId(null);
    } else if (isLoggedIn && currentScreen === 'Login') {
      console.log('User logged in - switching to Post screen');
      setCurrentScreen('Post');
    }
  }, [isLoggedIn]);

  // Poll for new posts to update notification badge
  useEffect(() => {
    if (!isLoggedIn) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await taskService.getTasks({ 
          status: 'posted',
          limit: 1
        });
        const newCount = response.data?.total || 0;
        setNewPostsCount(newCount);
      } catch (error) {
        console.error('Error polling new posts:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <View style={styles.webContainer}>
        {currentScreen === 'Login' ? (
          <LoginScreen navigation={{ navigate: () => setCurrentScreen('Register'), setOptions: () => {} }} />
        ) : (
          <RegisterScreen navigation={{ navigate: () => setCurrentScreen('Login'), setOptions: () => {} }} />
        )}
      </View>
    );
  }

  if (profileScreen === 'EditProfile') {
    return (
      <View style={styles.appContainer}>
        <EditProfileScreen navigation={{ goBack: () => setProfileScreen(null) }} />
      </View>
    );
  }
  if (profileScreen === 'PaymentMethods') {
    return (
      <View style={styles.appContainer}>
        <PaymentMethodsScreen navigation={{ goBack: () => setProfileScreen(null) }} />
      </View>
    );
  }
  if (profileScreen === 'Settings') {
    return (
      <View style={styles.appContainer}>
        <SettingsScreen navigation={{ goBack: () => setProfileScreen(null) }} />
      </View>
    );
  }
  if (profileScreen === 'HelpSupport') {
    return (
      <View style={styles.appContainer}>
        <HelpSupportScreen navigation={{ goBack: () => setProfileScreen(null) }} />
      </View>
    );
  }
  if (profileScreen?.name === 'UserProfile') {
    return (
      <View style={[styles.appContainer, { backgroundColor: theme.background }]}>
        <UserProfileScreen
          route={{ params: { userId: profileScreen.userId } }}
          navigation={{
            goBack: () => setProfileScreen(null),
            navigate: (screen, params) => {
              if (screen === 'Chat') {
                setDirectMessageUserId(params?.directMessageUserId);
                setDirectMessageUserName(params?.directMessageUserName);
                setDirectMessagePostTitle(params?.postTitle || null);
                setTaskDetailsId(null);
                setProfileScreen(null);
                setCurrentScreen('Chat');
              }
            },
          }}
        />
      </View>
    );
  }
  if (taskDetailsId) {
    return (
      <View style={[styles.appContainer, { backgroundColor: theme.background }]}>
        <TaskDetailsScreen
          route={{ params: { taskId: taskDetailsId } }}
          navigation={{
            goBack: () => setTaskDetailsId(null),
            navigate: (screen, params) => {
              if (screen === 'UserProfile') {
                setProfileScreen({ name: 'UserProfile', userId: params?.userId });
              }
              if (screen === 'Chat') {
                setDirectMessageUserId(params?.directMessageUserId);
                setDirectMessageUserName(params?.directMessageUserName);
                setDirectMessagePostTitle(params?.postTitle || null);
                setCurrentScreen('Chat');
              }
            },
            setOptions: () => {},
          }}
        />
      </View>
    );
  }
  if (editTaskId) {
    return (
      <View style={styles.appContainer}>
        <EditTaskScreen
          route={{ params: { taskId: editTaskId } }}
          navigation={{ goBack: () => setEditTaskId(null) }}
        />
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.title}>GMIK</Text>
      </View>
      <View style={[styles.content, { backgroundColor: theme.background }]}>
        {currentScreen === 'Post' && <PostScreen navigation={{ navigate: (screen, params) => { 
          if (screen === 'TaskDetails') setTaskDetailsId(params.taskId);
          if (screen === 'Chat') {
            setDirectMessageUserId(params.directMessageUserId);
            setDirectMessageUserName(params.directMessageUserName);
            setDirectMessagePostTitle(params.postTitle);
            setCurrentScreen('Chat');
          }
        } }} />}
        {currentScreen === 'Browse' && <BrowseScreen navigation={{ navigate: (screen, params) => { if (screen === 'TaskDetails') setTaskDetailsId(params.taskId); } }} />}
        {currentScreen === 'MyDocuments' && <MyDocumentsScreen navigation={{ navigate: (screen, params) => { if (screen === 'TaskDetails') setTaskDetailsId(params.taskId); if (screen === 'EditTask') setEditTaskId(params.taskId); } }} />}
        {currentScreen === 'Chat' && <ChatScreen route={{ params: { directMessageUserId, directMessageUserName, postTitle: directMessagePostTitle } }} navigation={{ navigate: () => {} }} />}
        {currentScreen === 'Profile' && <ProfileScreen navigation={{ navigate: (screen) => setProfileScreen(screen), logout: () => { setCurrentScreen('Login'); setProfileScreen(null); } }} />}
      </View>
      <View style={[styles.navbar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        {['Post', 'Browse', 'MyDocuments', 'Chat', 'Profile'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.navButton,
              currentScreen === tab && { borderBottomColor: theme.primary },
            ]}
            onPress={() => {
              setCurrentScreen(tab);
              if (tab === 'Post') {
                setLastSeenPostsCount(newPostsCount);
              }
            }}
          >
            <View style={{ position: 'relative', alignItems: 'center' }}>
              <Text
                style={[
                  styles.navButtonText,
                  {
                    color: currentScreen === tab ? theme.primary : theme.textSecondary,
                    fontWeight: currentScreen === tab ? '600' : '500',
                  },
                ]}
              >
                {tab === 'MyDocuments' ? 'My Docs' : tab}
              </Text>
              {tab === 'Post' && newPostsCount > lastSeenPostsCount && (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>
                    {newPostsCount - lastSeenPostsCount > 99 ? '99+' : newPostsCount - lastSeenPostsCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ============ NATIVE VERSION ============
const TaskTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Post') {
          iconName = 'add-circle';
        } else if (route.name === 'Browse') {
          iconName = 'search';
        } else if (route.name === 'MyDocuments') {
          iconName = 'document-text';
        } else if (route.name === 'Chat') {
          iconName = 'chatbubbles';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="Post"
      component={PostScreen}
      options={{
        tabBarLabel: 'Post',
        headerTitle: 'Create Post',
      }}
    />
    <Tab.Screen
      name="Browse"
      component={BrowseScreen}
      options={{
        tabBarLabel: 'Browse',
        headerTitle: 'Browse Posts',
      }}
    />
    <Tab.Screen
      name="MyDocuments"
      component={MyDocumentsScreen}
      options={{
        tabBarLabel: 'My Documents',
        headerTitle: 'My Documents',
      }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatScreen}
      options={{
        tabBarLabel: 'Chat',
        headerTitle: 'Messages',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        headerTitle: 'My Profile',
      }}
    />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainApp"
      component={TaskTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TaskDetails"
      component={TaskDetailsScreen}
      options={{ title: 'Task Details' }}
    />
    <Stack.Screen
      name="EditTask"
      component={EditTaskScreen}
      options={{ title: 'Edit Task' }}
    />
    <Stack.Screen
      name="UserProfile"
      component={UserProfileScreen}
      options={{ title: 'User Profile' }}
    />
  </Stack.Navigator>
);

const NativeAppContent = () => {
  const { isLoggedIn } = useSelector(state => state.auth);
  
  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

// ============ MAIN APP ============
export default function App() {
  if (isWeb) {
    return (
      <Provider store={store}>
        <WebAppContent />
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <NativeAppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 60,
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navButtonActive: {
    borderBottomColor: '#007AFF',
  },
  navButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  navButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});

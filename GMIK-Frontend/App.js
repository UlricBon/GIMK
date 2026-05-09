import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from './src/redux/store';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import TaskDetailsScreen from './src/screens/tasks/TaskDetailsScreen';
import EditTaskScreen from './src/screens/tasks/EditTaskScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
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
  const [initialized, setInitialized] = useState(false);
  const { isLoggedIn } = useSelector(state => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setCurrentScreen('Login');
        setProfileScreen(null);
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setInitialized(true);
      }
    };
    initializeApp();
  }, []);

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
  if (taskDetailsId) {
    return (
      <View style={styles.appContainer}>
        <TaskDetailsScreen
          route={{ params: { taskId: taskDetailsId } }}
          navigation={{ goBack: () => setTaskDetailsId(null) }}
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
      <View style={styles.header}>
        <Text style={styles.title}>GMIK</Text>
      </View>
      <View style={styles.content}>
        {currentScreen === 'Post' && <PostScreen navigation={{ navigate: () => {} }} />}
        {currentScreen === 'Browse' && <BrowseScreen navigation={{ navigate: (screen, params) => { if (screen === 'TaskDetails') setTaskDetailsId(params.taskId); } }} />}
        {currentScreen === 'MyDocuments' && <MyDocumentsScreen navigation={{ navigate: (screen, params) => { if (screen === 'TaskDetails') setTaskDetailsId(params.taskId); if (screen === 'EditTask') setEditTaskId(params.taskId); } }} />}
        {currentScreen === 'Chat' && <ChatScreen navigation={{ navigate: () => {} }} />}
        {currentScreen === 'Profile' && <ProfileScreen navigation={{ navigate: (screen) => setProfileScreen(screen), logout: () => { setCurrentScreen('Login'); setProfileScreen(null); } }} />}
      </View>
      <View style={styles.navbar}>
        {['Post', 'Browse', 'MyDocuments', 'Chat', 'Profile'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.navButton, currentScreen === tab && styles.navButtonActive]}
            onPress={() => setCurrentScreen(tab)}
          >
            <Text style={[styles.navButtonText, currentScreen === tab && styles.navButtonTextActive]}>
              {tab === 'MyDocuments' ? 'My Docs' : tab}
            </Text>
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
});

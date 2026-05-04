import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import TaskFeedScreen from './screens/tasks/TaskFeedScreen';
import TaskDetailsScreen from './screens/tasks/TaskDetailsScreen';
import CreateTaskScreen from './screens/tasks/CreateTaskScreen';
import ChatScreen from './screens/chat/ChatScreen';
import ProfileScreen from './screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

const TaskTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#007AFF',
    }}
  >
    <Tab.Screen
      name="Feed"
      component={TaskFeedScreen}
      options={{
        tabBarLabel: 'Find Tasks',
        headerTitle: 'Task Feed',
      }}
    />
    <Tab.Screen
      name="CreateTask"
      component={CreateTaskScreen}
      options={{
        tabBarLabel: 'Post Task',
        headerTitle: 'Create Task',
      }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatScreen}
      options={{
        tabBarLabel: 'Messages',
        headerTitle: 'Chat',
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
  </Stack.Navigator>
);

const RootNavigator = ({ isLoading, isLoggedIn }) => {
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

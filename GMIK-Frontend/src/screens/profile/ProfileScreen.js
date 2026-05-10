import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService, taskService } from '../../services/api';
import { logout } from '../../redux/authSlice';
import { getTheme } from '../../utils/theme';

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);
  const [profile, setProfile] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    loadProfileAndTasks();
  }, []);

  const loadProfileAndTasks = async () => {
    try {
      // Fetch profile from backend API
      if (user) {
        const profileResponse = await userService.getUserProfile();
        setProfile(profileResponse.data?.user || user);
        
        // Fetch user's tasks
        const tasksResponse = await taskService.getUserTasks();
        setUserTasks(tasksResponse.data?.tasks || []);
      } else {
        setProfile(user);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Use Redux data as fallback
      if (user) {
        setProfile(user);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            console.log('Logout confirmed - clearing storage');
            // Clear AsyncStorage
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            console.log('Storage cleared - dispatching logout action');
            // Dispatch logout action
            dispatch(logout());
            console.log('Logout action dispatched - navigating to login');
            // Navigate to login
            if (navigation?.logout) {
              navigation.logout();
            }
          } catch (error) {
            console.error('Logout error:', error);
            // Dispatch logout even if storage clear fails
            dispatch(logout());
            if (navigation?.logout) {
              navigation.logout();
            }
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={[styles.profileImage, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{profile?.display_name?.[0] || 'U'}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{profile?.display_name || 'User'}</Text>
        <Text style={[styles.email, { color: theme.textTertiary }]}>{profile?.email || 'user@gmik.com'}</Text>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>{profile?.completed_tasks_count || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Tasks Completed</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>{userTasks?.length || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>My Posts</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>4.8</Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Rating</Text>
        </View>
      </View>

      {userTasks && userTasks.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>My Posts</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('MyDocuments')}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={userTasks.slice(0, 3)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.taskItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => navigation?.navigate('TaskDetails', { taskId: item.id })}
              >
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.taskCategory, { color: theme.primary }]}>{item.category}</Text>
                </View>
                <View style={styles.taskMeta}>
                  <Text style={[styles.taskStatus, { color: theme.textTertiary }]}>{item.status}</Text>
                  <Text style={[styles.taskCompensation, { color: theme.primary }]}>₱{item.compensation}</Text>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Account Settings</Text>
        
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.border }]}
          onPress={() => navigation?.navigate ? navigation.navigate('EditProfile') : console.log('Navigate to EditProfile')}
        >
          <Ionicons name="person-circle" size={24} color={theme.primary} />
          <View style={styles.menuContent}>
            <Text style={[styles.menuItemText, { color: theme.text }]}>Edit Profile</Text>
            <Text style={[styles.menuItemSubtext, { color: theme.textTertiary }]}>Update your personal information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.border }]}
          onPress={() => navigation?.navigate ? navigation.navigate('PaymentMethods') : console.log('Navigate to PaymentMethods')}
        >
          <Ionicons name="card" size={24} color={theme.primary} />
          <View style={styles.menuContent}>
            <Text style={[styles.menuItemText, { color: theme.text }]}>Payment Methods</Text>
            <Text style={[styles.menuItemSubtext, { color: theme.textTertiary }]}>Manage your payment options</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.border }]}
          onPress={() => navigation?.navigate ? navigation.navigate('Settings') : console.log('Navigate to Settings')}
        >
          <Ionicons name="settings" size={24} color={theme.primary} />
          <View style={styles.menuContent}>
            <Text style={[styles.menuItemText, { color: theme.text }]}>Settings</Text>
            <Text style={[styles.menuItemSubtext, { color: theme.textTertiary }]}>Customize your preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.lastMenuItem, { borderBottomColor: theme.border }]}
          onPress={() => navigation?.navigate ? navigation.navigate('HelpSupport') : console.log('Navigate to HelpSupport')}
        >
          <Ionicons name="help-circle" size={24} color={theme.primary} />
          <View style={styles.menuContent}>
            <Text style={[styles.menuItemText, { color: theme.text }]}>Help & Support</Text>
            <Text style={[styles.menuItemSubtext, { color: theme.textTertiary }]}>Get help and contact us</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: theme.danger }]} 
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtext: {
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  viewAllText: {
    fontWeight: '600',
    fontSize: 12,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    marginHorizontal: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskCategory: {
    fontSize: 12,
  },
  taskMeta: {
    alignItems: 'flex-end',
  },
  taskStatus: {
    fontSize: 11,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  taskCompensation: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ProfileScreen;

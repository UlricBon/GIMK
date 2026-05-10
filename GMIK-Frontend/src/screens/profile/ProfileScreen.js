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

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImage}>
          <Text style={styles.avatarText}>{profile?.display_name?.[0] || 'U'}</Text>
        </View>
        <Text style={styles.name}>{profile?.display_name || 'User'}</Text>
        <Text style={styles.email}>{profile?.email || 'user@gmik.com'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{profile?.completed_tasks_count || 0}</Text>
          <Text style={styles.statLabel}>Tasks Completed</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userTasks?.length || 0}</Text>
          <Text style={styles.statLabel}>My Posts</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {userTasks && userTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Posts</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('MyDocuments')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={userTasks.slice(0, 3)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.taskItem}
                onPress={() => navigation?.navigate('TaskDetails', { taskId: item.id })}
              >
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.taskCategory}>{item.category}</Text>
                </View>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskStatus}>{item.status}</Text>
                  <Text style={styles.taskCompensation}>₱{item.compensation}</Text>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation?.navigate ? navigation.navigate('EditProfile') : console.log('Navigate to EditProfile')}
        >
          <Ionicons name="person-circle" size={24} color="#007AFF" />
          <View style={styles.menuContent}>
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Text style={styles.menuItemSubtext}>Update your personal information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation?.navigate ? navigation.navigate('PaymentMethods') : console.log('Navigate to PaymentMethods')}
        >
          <Ionicons name="card" size={24} color="#007AFF" />
          <View style={styles.menuContent}>
            <Text style={styles.menuItemText}>Payment Methods</Text>
            <Text style={styles.menuItemSubtext}>Manage your payment options</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation?.navigate ? navigation.navigate('Settings') : console.log('Navigate to Settings')}
        >
          <Ionicons name="settings" size={24} color="#007AFF" />
          <View style={styles.menuContent}>
            <Text style={styles.menuItemText}>Settings</Text>
            <Text style={styles.menuItemSubtext}>Customize your preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.lastMenuItem]}
          onPress={() => navigation?.navigate ? navigation.navigate('HelpSupport') : console.log('Navigate to HelpSupport')}
        >
          <Ionicons name="help-circle" size={24} color="#007AFF" />
          <View style={styles.menuContent}>
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Text style={styles.menuItemSubtext}>Get help and contact us</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#007AFF',
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
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    marginBottom: 2,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: '#999',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 12,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskCategory: {
    fontSize: 12,
    color: '#007AFF',
  },
  taskMeta: {
    alignItems: 'flex-end',
  },
  taskStatus: {
    fontSize: 11,
    color: '#999',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  taskCompensation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
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

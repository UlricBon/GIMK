import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../../services/api';
import { logout } from '../../redux/authSlice';

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // For web or if no user data, use mock data
      if (!user) {
        setProfile({
          display_name: 'Regular User',
          email: 'user@gmik.com',
          completed_tasks_count: 12,
        });
      } else {
        setProfile(user);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
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
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

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

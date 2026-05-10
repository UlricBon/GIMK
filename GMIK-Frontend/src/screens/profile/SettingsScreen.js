import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { settingsService } from '../../services/api';

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      const settings = response.data?.settings || {};
      
      setNotifications(settings.notifications_enabled ?? true);
      setEmailUpdates(settings.email_updates_enabled ?? true);
      setDarkMode(settings.dark_mode ?? false);
      setLocationServices(settings.location_services ?? true);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Silently fail - use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting, value) => {
    try {
      const newSettings = {
        notifications_enabled: setting === 'notifications' ? value : notifications,
        email_updates_enabled: setting === 'emailUpdates' ? value : emailUpdates,
        dark_mode: setting === 'darkMode' ? value : darkMode,
        location_services: setting === 'locationServices' ? value : locationServices,
      };

      await settingsService.updateSettings(newSettings);
      
      // Add delay to ensure database persistence
      await new Promise(resolve => setTimeout(resolve, 500));

      if (setting === 'notifications') setNotifications(value);
      if (setting === 'emailUpdates') setEmailUpdates(value);
      if (setting === 'darkMode') setDarkMode(value);
      if (setting === 'locationServices') setLocationServices(value);
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const SettingItem = ({ icon, label, description, value, setting }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => handleSettingChange(setting, newValue)}
        trackColor={{ false: '#ddd', true: '#81C784' }}
        thumbColor="#fff"
      />
    </View>
  );

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon="notifications"
          label="Push Notifications"
          description="Receive task and message alerts"
          value={notifications}
          setting="notifications"
        />
        <SettingItem
          icon="mail"
          label="Email Updates"
          description="Get email newsletters and updates"
          value={emailUpdates}
          setting="emailUpdates"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display</Text>
        <SettingItem
          icon="moon"
          label="Dark Mode"
          description="Use dark theme"
          value={darkMode}
          setting="darkMode"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location & Privacy</Text>
        <SettingItem
          icon="location"
          label="Location Services"
          description="Allow access to your location"
          value={locationServices}
          setting="locationServices"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuInfo}>
            <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
            <Text style={styles.menuText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuInfo}>
            <Ionicons name="lock-closed" size={20} color="#007AFF" />
            <Text style={styles.menuText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]}>
          <View style={styles.menuInfo}>
            <Ionicons name="document-text" size={20} color="#007AFF" />
            <Text style={styles.menuText}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.dangerButton}>
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default SettingsScreen;

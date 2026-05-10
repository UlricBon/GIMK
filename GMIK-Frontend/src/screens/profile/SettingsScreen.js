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
import { useDispatch, useSelector } from 'react-redux';
import { settingsService } from '../../services/api';
import { logout } from '../../redux/authSlice';
import { setSettings } from '../../redux/settingsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../../utils/theme';

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [profilePrivacy, setProfilePrivacy] = useState('public');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const reduxDarkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(reduxDarkMode);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch fresh data from backend
      const response = await settingsService.getSettings();
      console.log('=== SettingsScreen loadSettings ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      const settings = response.data?.settings || {};
      console.log('Extracted settings:', settings);
      console.log('dark_mode value:', settings.dark_mode);
      console.log('dark_mode type:', typeof settings.dark_mode);

      setNotifications(settings.notifications_enabled ?? true);
      setEmailUpdates(settings.email_updates_enabled ?? true);
      setTaskAlerts(settings.task_alerts_enabled ?? true);
      setMessageAlerts(settings.message_alerts_enabled ?? true);
      setLocationServices(settings.location_services ?? true);
      setProfilePrivacy(settings.profile_privacy ?? 'public');
      setShowOnlineStatus(settings.show_online_status ?? true);
      setAllowMessages(settings.allow_messages ?? true);

      // Sync Redux state - convert snake_case to camelCase
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
      console.log('Redux payload darkMode:', reduxPayload.darkMode);
      dispatch(setSettings(reduxPayload));
      
      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
      console.log('Settings saved to AsyncStorage');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting, value) => {
    try {
      console.log('=== Saving setting ===', { setting, value });
      
      const newSettings = {
        notifications_enabled: setting === 'notifications' ? value : notifications,
        email_updates_enabled: setting === 'emailUpdates' ? value : emailUpdates,
        task_alerts_enabled: setting === 'taskAlerts' ? value : taskAlerts,
        message_alerts_enabled: setting === 'messageAlerts' ? value : messageAlerts,
        dark_mode: setting === 'darkMode' ? value : reduxDarkMode,
        location_services: setting === 'locationServices' ? value : locationServices,
        profile_privacy: profilePrivacy,
        show_online_status: setting === 'showOnlineStatus' ? value : showOnlineStatus,
        allow_messages: setting === 'allowMessages' ? value : allowMessages,
      };

      console.log('Sending to backend:', newSettings);
      
      // Save to AsyncStorage immediately for instant UI feedback
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      console.log('Settings saved to AsyncStorage immediately');
      
      // Update Redux state immediately
      const reduxUpdate = {
        darkMode: newSettings.dark_mode,
        notifications_enabled: newSettings.notifications_enabled,
        email_updates_enabled: newSettings.email_updates_enabled,
        task_alerts_enabled: newSettings.task_alerts_enabled,
        message_alerts_enabled: newSettings.message_alerts_enabled,
        location_services: newSettings.location_services,
        profile_privacy: newSettings.profile_privacy,
        show_online_status: newSettings.show_online_status,
        allow_messages: newSettings.allow_messages,
      };
      dispatch(setSettings(reduxUpdate));
      console.log('Redux state updated immediately');
      
      // Then sync with backend
      const response = await settingsService.updateSettings(newSettings);
      console.log('Backend response:', response);
      console.log('Backend returned settings:', response.data?.settings);

      // Use the response from backend if available, otherwise use local values
      const updatedSettings = response.data?.settings || newSettings;
      console.log('Using for final storage:', updatedSettings);

      // Save backend response to AsyncStorage to ensure consistency
      await AsyncStorage.setItem('userSettings', JSON.stringify(updatedSettings));

      if (setting === 'notifications') setNotifications(value);
      if (setting === 'emailUpdates') setEmailUpdates(value);
      if (setting === 'taskAlerts') setTaskAlerts(value);
      if (setting === 'messageAlerts') setMessageAlerts(value);
      if (setting === 'locationServices') setLocationServices(value);
      if (setting === 'showOnlineStatus') setShowOnlineStatus(value);
      if (setting === 'allowMessages') setAllowMessages(value);
      
      console.log('Setting saved successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update setting: ' + error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('user');
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    const loadingTheme = getTheme(reduxDarkMode);
    return (
      <View style={[styles.container, { backgroundColor: loadingTheme.background }]}>
        <ActivityIndicator size="large" color={loadingTheme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Notifications</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color={theme.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: theme.textTertiary }]}>Receive notifications</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={(v) => handleSettingChange('notifications', v)}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail" size={24} color={theme.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Email Updates</Text>
              <Text style={[styles.settingDescription, { color: theme.textTertiary }]}>Receive email notifications</Text>
            </View>
          </View>
          <Switch
            value={emailUpdates}
            onValueChange={(v) => handleSettingChange('emailUpdates', v)}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="briefcase" size={24} color={theme.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Task Alerts</Text>
              <Text style={[styles.settingDescription, { color: theme.textTertiary }]}>Get alerts for new tasks</Text>
            </View>
          </View>
          <Switch
            value={taskAlerts}
            onValueChange={(v) => handleSettingChange('taskAlerts', v)}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="chatbubble" size={24} color={theme.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Message Alerts</Text>
              <Text style={[styles.settingDescription, { color: theme.textTertiary }]}>Get notified of new messages</Text>
            </View>
          </View>
          <Switch
            value={messageAlerts}
            onValueChange={(v) => handleSettingChange('messageAlerts', v)}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Display & Preferences</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color={theme.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: theme.textTertiary }]}>Use dark theme</Text>
            </View>
          </View>
          <Switch
            value={reduxDarkMode}
            onValueChange={(v) => handleSettingChange('darkMode', v)}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="location" size={24} color={theme.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Location Services</Text>
              <Text style={[styles.settingDescription, { color: theme.textTertiary }]}>Allow location access</Text>
            </View>
          </View>
          <Switch
            value={locationServices}
            onValueChange={(v) => handleSettingChange('locationServices', v)}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Privacy & Safety</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="eye" size={24} color={theme.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Show Online Status</Text>
              <Text style={[styles.settingDescription, { color: theme.textTertiary }]}>Let others see when you're online</Text>
            </View>
          </View>
          <Switch
            value={showOnlineStatus}
            onValueChange={(v) => handleSettingChange('showOnlineStatus', v)}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail-open" size={24} color={theme.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Allow Messages</Text>
              <Text style={[styles.settingDescription, { color: theme.textTertiary }]}>Allow others to message you</Text>
            </View>
          </View>
          <Switch
            value={allowMessages}
            onValueChange={(v) => handleSettingChange('allowMessages', v)}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Account</Text>
        
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.menuInfo}>
            <Ionicons name="key" size={20} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.menuInfo}>
            <Ionicons name="download" size={20} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>Download My Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.menuInfo}>
            <Ionicons name="information-circle" size={20} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>About GMIK</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.danger }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginTop: 10,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default SettingsScreen;

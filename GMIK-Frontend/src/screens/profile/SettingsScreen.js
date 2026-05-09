import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const SettingItem = ({ icon, label, description, value, onChange }) => (
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
        onValueChange={onChange}
        trackColor={{ false: '#ddd', true: '#81C784' }}
        thumbColor="#fff"
      />
    </View>
  );

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
          onChange={setNotifications}
        />
        <SettingItem
          icon="mail"
          label="Email Updates"
          description="Get email newsletters and updates"
          value={emailUpdates}
          onChange={setEmailUpdates}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display</Text>
        <SettingItem
          icon="moon"
          label="Dark Mode"
          description="Use dark theme"
          value={darkMode}
          onChange={setDarkMode}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location & Privacy</Text>
        <SettingItem
          icon="location"
          label="Location Services"
          description="Allow access to your location"
          value={locationServices}
          onChange={setLocationServices}
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
    backgroundColor: '#f44336',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default SettingsScreen;

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { authService, settingsService } from '../../services/api';
import { setUser, setToken } from '../../redux/authSlice';
import { setSettings } from '../../redux/settingsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../../utils/theme';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);

  const handleRegister = async () => {
    if (!email || !password || !displayName || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.register(email, password, displayName);

      // Auto-login after successful registration
      try {
        const loginResponse = await authService.login(email, password);
        const { accessToken, refreshToken, user } = loginResponse.data;

        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
          ['user', JSON.stringify(user)],
        ]);

        dispatch(setToken(accessToken));
        dispatch(setUser(user));

        // Load settings after login
        try {
          const settingsResponse = await settingsService.getSettings();
          const settings = settingsResponse.data?.settings || {};
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
        } catch (settingsError) {
          console.log('Settings load warning:', settingsError.message);
        }
      } catch (loginError) {
        const loginErrorMessage = loginError.response?.data?.error || 'Auto-login failed';
        Alert.alert('Error', loginErrorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>Create Account</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Display Name"
        placeholderTextColor={theme.textTertiary}
        value={displayName}
        onChangeText={setDisplayName}
        editable={!loading}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Email"
        placeholderTextColor={theme.textTertiary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={theme.textTertiary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Confirm Password"
        placeholderTextColor={theme.textTertiary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
        <Text style={[styles.link, { color: theme.primary }]}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default RegisterScreen;

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../../services/api';
import { setUser, setToken, setError } from '../../redux/authSlice';
import { setSettings } from '../../redux/settingsSlice';
import { settingsService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../../utils/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { accessToken, refreshToken, user } = response.data;

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
        
        // Convert snake_case to camelCase
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
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('not found')) {
        setEmailError(errorMessage);
      } else if (errorMessage.toLowerCase().includes('password')) {
        setPasswordError(errorMessage);
      } else {
        setEmailError(errorMessage);
      }
      dispatch(setError(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={require('../../assets/gmik-logo.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: emailError ? '#FF6B6B' : theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Email"
        placeholderTextColor={theme.textTertiary}
        value={email}
        onChangeText={(val) => {
          setEmail(val);
          setEmailError('');
        }}
        keyboardType="email-address"
        editable={!loading}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: passwordError ? '#FF6B6B' : theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={theme.textTertiary}
        value={password}
        onChangeText={(val) => {
          setPassword(val);
          setPasswordError('');
        }}
        secureTextEntry
        editable={!loading}
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.primary },
          loading && styles.buttonDisabled,
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
        <Text style={[styles.link, { color: theme.primary }]}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginBottom: 40,
    borderRadius: 125,
    borderWidth: 4,
    borderColor: '#007AFF',
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
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
    textAlign: 'center',
    fontSize: 14,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
});

export default LoginScreen;

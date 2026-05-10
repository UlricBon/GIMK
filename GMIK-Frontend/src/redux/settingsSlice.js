import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: false,
  notifications_enabled: true,
  email_updates_enabled: true,
  task_alerts_enabled: true,
  message_alerts_enabled: true,
  location_services: true,
  profile_privacy: 'public',
  show_online_status: true,
  allow_messages: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
    resetSettings: () => initialState,
  },
});

export const { setSettings, setDarkMode, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;

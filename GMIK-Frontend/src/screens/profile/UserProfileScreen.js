import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { userService } from '../../services/api';
import { getTheme } from '../../utils/theme';

const StarRating = ({ value, onChange, editable }) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!editable}
          onPress={() => onChange && onChange(star)}
        >
          <Ionicons
            name={value >= star ? 'star' : 'star-outline'}
            size={24}
            color={value >= star ? '#FFD700' : '#ccc'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const authUser = useSelector(state => state.auth.user);
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, ratingsRes] = await Promise.all([
        userService.getUserById(userId),
        userService.getUserRatings(userId),
      ]);
      setProfile(profileRes.data.user);
      setRatings(ratingsRes.data);
      // Find my rating if present
      const my = ratingsRes.data.ratings.find(r => r.rater_id === authUser.id);
      setMyRating(my ? my.rating : 0);
    } catch (error) {
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating) => {
    setSubmitting(true);
    try {
      await userService.rateUser(userId, rating);
      setMyRating(rating);
      await loadProfile();
      Alert.alert('Success', 'Rating submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessage = async () => {
    const params = {
      directMessageUserId: userId,
      directMessageUserName: profile.display_name,
    };

    if (navigation?.navigate) {
      navigation.navigate('Chat', params);
    }
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
      <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>User Profile</Text>
        <View style={styles.backButton} />
      </View>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}> 
        <View style={[styles.profileImage, { backgroundColor: theme.primary }]}> 
          <Text style={styles.avatarText}>{profile.display_name?.[0] || 'U'}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{profile.display_name}</Text>
        <Text style={[styles.email, { color: theme.textTertiary }]}>{profile.email}</Text>
      </View>
      <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}> 
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>{ratings?.average || '-'}</Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Avg. Rating</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>{ratings?.count || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Ratings</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Rate this user</Text>
        <StarRating value={myRating} onChange={handleRate} editable={!submitting && authUser.id !== userId} />
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={[styles.messageButton, { backgroundColor: theme.primary }]} onPress={handleMessage}>
          <Ionicons name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Ratings</Text>
        {ratings?.ratings?.length === 0 && <Text style={{ color: theme.textTertiary }}>No ratings yet.</Text>}
        {ratings?.ratings?.map((r, idx) => (
          <View key={idx} style={styles.ratingItem}>
            <StarRating value={r.rating} editable={false} />
            <Text style={{ color: theme.textTertiary, fontSize: 12 }}>{r.comment || ''}</Text>
            <Text style={{ color: theme.textTertiary, fontSize: 10 }}>
              {new Date(r.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: { alignItems: 'center', padding: 24, borderBottomWidth: 1 },
  profileImage: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 32 },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  email: { fontSize: 14, marginTop: 2 },
  statsContainer: { flexDirection: 'row', justifyContent: 'center', padding: 16 },
  statBox: { alignItems: 'center', marginHorizontal: 16 },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  messageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8 },
  messageButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  ratingItem: { marginBottom: 8 },
});

export default UserProfileScreen;

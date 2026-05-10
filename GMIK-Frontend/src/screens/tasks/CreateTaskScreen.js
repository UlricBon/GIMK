import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { taskService } from '../../services/api';
import { getTheme } from '../../utils/theme';

const CreateTaskScreen = ({ navigation }) => {
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [compensation, setCompensation] = useState('');
  const [address, setAddress] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [postType, setPostType] = useState('job_offer'); // 'job_offer' or 'job_seeker'
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async () => {
    if (!title || !category || !compensation || !address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title,
        description,
        category,
        compensation: parseFloat(compensation),
        address,
        urgency,
        postType, // Add post type
        latitude: 14.5995, // Default coordinates - replace with actual geolocation
        longitude: 120.9842,
      };

      await taskService.createTask(taskData);
      Alert.alert('Success', 'Post created successfully!');
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create post';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Delivery', 'Repair', 'Cleaning', 'Moving', 'Other'];
  const urgencies = ['Low', 'Normal', 'High', 'Urgent'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Post Type *</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            postType === 'job_offer' && styles.typeButtonActive,
          ]}
          onPress={() => setPostType('job_offer')}
        >
          <Text
            style={[
              styles.typeButtonText,
              postType === 'job_offer' && styles.typeButtonTextActive,
            ]}
          >
            Hiring (Looking for workers)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            postType === 'job_seeker' && styles.typeButtonActive,
          ]}
          onPress={() => setPostType('job_seeker')}
        >
          <Text
            style={[
              styles.typeButtonText,
              postType === 'job_seeker' && styles.typeButtonTextActive,
            ]}
          >
            Job Seeker (Looking for work)
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Task Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task title"
        value={title}
        onChangeText={setTitle}
        editable={!loading}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the task in detail"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        editable={!loading}
      />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.buttonGroup}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              category === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                category === cat && styles.categoryButtonTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Compensation (₱) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter compensation amount"
        value={compensation}
        onChangeText={setCompensation}
        keyboardType="decimal-pad"
        editable={!loading}
      />

      <Text style={styles.label}>Location *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter location address"
        value={address}
        onChangeText={setAddress}
        editable={!loading}
      />

      <Text style={styles.label}>Urgency</Text>
      <View style={styles.buttonGroup}>
        {urgencies.map(u => (
          <TouchableOpacity
            key={u}
            style={[
              styles.urgencyButton,
              urgency === u.toLowerCase() && styles.urgencyButtonActive,
            ]}
            onPress={() => setUrgency(u.toLowerCase())}
          >
            <Text
              style={[
                styles.urgencyButtonText,
                urgency === u.toLowerCase() && styles.urgencyButtonTextActive,
              ]}
            >
              {u}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleCreateTask}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Creating...' : 'Post Task'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  urgencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  urgencyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  urgencyButtonText: {
    fontSize: 12,
    color: '#666',
  },
  urgencyButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateTaskScreen;

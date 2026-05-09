import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const PostScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [postedTask, setPostedTask] = useState(null);

  const categories = ['General', 'Development', 'Design', 'Writing', 'Marketing', 'Other'];

  const handlePost = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - create task/post
      const newTask = {
        id: Math.random().toString(),
        title,
        description,
        category,
        budget: budget ? `$${budget}` : 'Not specified',
        author: user?.display_name || 'You',
        createdAt: new Date().toLocaleDateString(),
      };
      
      setPostedTask(newTask);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnother = () => {
    setPostedTask(null);
    setTitle('');
    setDescription('');
    setBudget('');
    setCategory('General');
  };

  const handleViewPost = () => {
    // Navigate to Browse tab to see the post
    navigation?.navigate?.('Browse') || console.log('Navigate to Browse');
  };

  return (
    <ScrollView style={styles.container}>
      {postedTask ? (
        // SUCCESS SCREEN
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Post Created Successfully!</Text>
          <Text style={styles.successSubtitle}>Your task is now live on the platform</Text>

          <View style={styles.postPreview}>
            <Text style={styles.previewTitle}>{postedTask.title}</Text>
            <Text style={styles.previewCategory}>{postedTask.category}</Text>
            <Text style={styles.previewDescription} numberOfLines={2}>
              {postedTask.description}
            </Text>
            <View style={styles.previewFooter}>
              <Text style={styles.previewBudget}>{postedTask.budget}</Text>
              <Text style={styles.previewDate}>{postedTask.createdAt}</Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleViewPost}>
              <Ionicons name="eye" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>View Post</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handlePostAnother}>
              <Ionicons name="add-circle" size={18} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Post Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // FORM SCREEN
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create a Post</Text>
            <Text style={styles.subtitle}>Share your task or project</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter post title"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your task or project in detail"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                editable={!loading}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Budget (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter budget amount"
                placeholderTextColor="#999"
                value={budget}
                onChangeText={setBudget}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.postButton, loading && styles.postButtonDisabled]}
              onPress={handlePost}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  postButtonDisabled: {
    opacity: 0.7,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  postPreview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  previewCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  previewBudget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  previewDate: {
    fontSize: 12,
    color: '#999',
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PostScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { taskService } from '../services/api';

const PostScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [screen, setScreen] = useState('feed'); // 'feed', 'form', or 'success'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);
  const [postedTask, setPostedTask] = useState(null);
  const [posts, setPosts] = useState([]);

  const categories = ['General', 'Development', 'Design', 'Writing', 'Marketing', 'Other'];

  // Load feed on mount
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setFeedLoading(true);
    try {
      const response = await taskService.getTasks({ category: 'all', limit: 20 });
      setPosts(response.data?.tasks || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setFeedLoading(false);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title,
        description,
        category,
        compensation: budget ? parseFloat(budget) : 0,
        // Mock location data (in production, get user's actual location)
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
        urgency: 'normal',
      };
      
      // Call backend API to create task
      const response = await taskService.createTask(taskData);
      const newTask = response.data.task;
      
      setPostedTask({
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        category: newTask.category,
        budget: newTask.compensation ? `$${newTask.compensation}` : 'Not specified',
        author: user?.display_name || 'You',
        createdAt: new Date().toLocaleDateString(),
      });
      
      setScreen('success');
      // Refresh feed with new post
      await loadFeed();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnother = () => {
    setScreen('form');
    setTitle('');
    setDescription('');
    setBudget('');
    setCategory('General');
  };

  const handleViewPost = () => {
    setScreen('feed');
    setPostedTask(null);
  };

  const handleBackToFeed = () => {
    setScreen('feed');
    setTitle('');
    setDescription('');
    setBudget('');
    setCategory('General');
    setPostedTask(null);
  };

  const PostCard = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.author?.[0] || 'U'}</Text>
        </View>
        <View style={styles.postInfo}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postAuthor}>{item.author || 'Anonymous'}</Text>
        </View>
      </View>

      <View style={styles.postBody}>
        <Text style={styles.postDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.postMeta}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
          <Text style={styles.budget}>${item.budget || '0'}</Text>
        </View>
      </View>
    </View>
  );

  if (feedLoading && screen === 'feed' && posts.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {screen === 'feed' ? (
        <>
          <View style={styles.feedHeader}>
            <Text style={styles.feedTitle}>Discover Tasks</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setScreen('form')}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>

          {feedLoading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
          ) : posts.length > 0 ? (
            <FlatList
              data={posts}
              renderItem={({ item }) => <PostCard item={item} />}
              keyExtractor={item => item.id?.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Be the first to post a task!</Text>
            </View>
          )}
        </>
      ) : screen === 'form' ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToFeed}>
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create a Post</Text>
            <View style={{ width: 24 }} />
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
      ) : screen === 'success' ? (
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
              <Text style={styles.primaryButtonText}>View Feed</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handlePostAnother}>
              <Ionicons name="add-circle" size={18} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Post Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  feedHeader: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 10,
  },
  feedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: '#0056b3',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  postInfo: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 12,
    color: '#666',
  },
  postBody: {
    padding: 16,
  },
  postDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  budget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
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

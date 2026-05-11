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
import { getTheme } from '../utils/theme';

const PostScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);
  const [screen, setScreen] = useState('feed'); // 'feed', 'form', or 'success'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('General');
  const [postType, setPostType] = useState('job_offer'); // 'job_offer' or 'job_seeker'
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
      // Fetch all posts without limit, excluding user's own posts
      const response = await taskService.getTasks({ 
        status: 'posted',
        excludeUserId: user?.id 
      });
      const allPosts = response.data?.tasks || [];
      // Sort by newest first
      const sortedPosts = allPosts.sort((a, b) => 
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      setPosts(sortedPosts);
      console.log(`Loaded ${sortedPosts.length} posts`);
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
        postType, // Add post type
        // Mock location data (in production, get user's actual location)
        latitude: 14.5995,
        longitude: 120.9842,
        address: 'Manila, Philippines',
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
        budget: newTask.compensation ? `₱${newTask.compensation.toLocaleString()}` : 'Not specified',
        author: user?.display_name || 'You',
        createdAt: new Date().toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' }),
        postType: postType,
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
    setPostType('job_offer');
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
    setPostType('job_offer');
    setPostedTask(null);
  };

  const PostCard = ({ item }) => {
    const displayName = item.display_name || item.author || 'Anonymous';
    const compensation = item.compensation || 0;
    const postTypeLabel = item.post_type === 'job_seeker' ? 'Seeking' : 'Hiring';
    const postTypeBgColor = item.post_type === 'job_seeker' ? '#E8D5FF' : '#D5E5FF';
    const postTypeTextColor = item.post_type === 'job_seeker' ? '#7C3AED' : '#007AFF';
    const createdDate = item.created_at 
      ? new Date(item.created_at).toLocaleDateString('en-PH', {
          timeZone: 'Asia/Manila',
          month: 'short', 
          day: 'numeric',
          year: item.created_at.includes(new Date().getFullYear().toString()) ? undefined : 'numeric'
        })
      : 'Recently';

    return (
      <View 
        style={[
          styles.postCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('TaskDetails', { taskId: item.id })}
        >
          <View style={[styles.postHeader, { borderBottomColor: theme.borderLight }]}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>{displayName?.[0] || 'U'}</Text>
            </View>
            <View style={styles.postInfo}>
              <View style={styles.postTitleRow}>
                <Text style={[styles.postTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={[styles.postTypeBadge, { backgroundColor: postTypeBgColor }]}>
                  <Text style={[styles.postTypeBadgeText, { color: postTypeTextColor }]}>
                    {postTypeLabel}
                  </Text>
                </View>
              </View>
              <Text style={[styles.postAuthor, { color: theme.textSecondary }]}>
                {displayName}
              </Text>
              <Text style={[styles.postDate, { color: theme.textTertiary }]}>
                {createdDate}
              </Text>
            </View>
          </View>

          <View style={styles.postBody}>
            <Text style={[styles.postDescription, { color: theme.textSecondary }]} numberOfLines={3}>
              {item.description}
            </Text>
            
            <View style={styles.postMetaTags}>
              <View style={[styles.postTypeTag, { backgroundColor: postTypeBgColor }]}>
                <Text style={[styles.postTypeTagText, { color: postTypeTextColor }]}>
                  {postTypeLabel}
                </Text>
              </View>
              <View style={[styles.categoryTag, { backgroundColor: theme.borderLight }]}>
                <Text style={[styles.categoryTagText, { color: theme.primary }]}>
                  {item.category}
                </Text>
              </View>
              {item.urgency && (
                <View style={[styles.urgencyTag, item.urgency === 'high' && styles.urgencyTagHigh]}>
                  <Text style={[styles.urgencyTagText, { color: '#FF9800' }]}>
                    {item.urgency.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.postFooter, { borderTopColor: theme.borderLight }]}>
              <Text style={[styles.budget, { color: theme.success }]}>
                ₱{compensation.toLocaleString()}
              </Text>
              {item.location_address && (
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={14} color={theme.textSecondary} />
                  <Text style={[styles.locationText, { color: theme.textTertiary }]} numberOfLines={1}>
                    {item.location_address}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.postActions, { borderTopColor: theme.borderLight }]}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.borderLight }]}
            activeOpacity={0.6}
            onPress={() => {
              console.log('View Details pressed for task:', item.id);
              navigation?.navigate('TaskDetails', { taskId: item.id });
            }}
          >
            <Ionicons name="eye-outline" size={16} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.primary }]}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.borderLight }]}
            activeOpacity={0.6}
            onPress={() => {
              console.log('Message pressed for user:', displayName);
              navigation?.navigate('Chat', { 
                directMessageUserId: item.dropper_id,
                directMessageUserName: displayName,
                postTitle: item.title
              });
            }}
          >
            <Ionicons name="mail-outline" size={16} color={theme.success} />
            <Text style={[styles.actionButtonText, { color: theme.success }]}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (feedLoading && screen === 'feed' && posts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {screen === 'feed' ? (
        <>
          <View style={[styles.feedHeader, { backgroundColor: theme.surface }]}>
            <Text style={[styles.feedTitle, { color: theme.text }]}>Discover Tasks</Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              onPress={() => setScreen('form')}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>

          {feedLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          ) : posts.length > 0 ? (
            <FlatList
              data={posts}
              renderItem={({ item }) => <PostCard item={item} />}
              keyExtractor={item => item.id?.toString()}
              scrollEnabled={false}
              nestedScrollEnabled={false}
              pointerEvents="auto"
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No posts yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>Be the first to post a task!</Text>
            </View>
          )}
        </>
      ) : screen === 'form' ? (
        <>
          <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={handleBackToFeed}>
              <Ionicons name="chevron-back" size={24} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Create a Post</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={[styles.form, { backgroundColor: theme.background }]}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Post Type *</Text>
              <View style={styles.postTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.postTypeButton,
                    postType === 'job_offer' && [styles.postTypeButtonActive, { backgroundColor: theme.primary }],
                    postType !== 'job_offer' && { borderColor: theme.border, backgroundColor: theme.surface },

                  ]}
                  onPress={() => setPostType('job_offer')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.postTypeText,
                      postType === 'job_offer' && styles.postTypeTextActive,
                    ]}
                  >
                    Hiring
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.postTypeButton,
                    postType === 'job_seeker' && styles.postTypeButtonActive,
                  ]}
                  onPress={() => setPostType('job_seeker')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.postTypeText,
                      postType === 'job_seeker' && styles.postTypeTextActive,
                    ]}
                  >
                    Job Seeker
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Title</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Enter post title"
                placeholderTextColor={theme.textTertiary}
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Describe your task or project in detail"
                placeholderTextColor={theme.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                editable={!loading}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && { backgroundColor: theme.primary, borderColor: theme.primary },
                      category !== cat && { borderColor: theme.border, backgroundColor: theme.surface },
                    ]}
                    onPress={() => setCategory(cat)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat ? { color: '#fff' } : { color: theme.text },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Budget (Optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Enter budget amount"
                placeholderTextColor={theme.textTertiary}
                value={budget}
                onChangeText={setBudget}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.postButton,
                { backgroundColor: theme.primary },
                loading && styles.postButtonDisabled,
              ]}
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
        <View style={[styles.successContainer, { backgroundColor: theme.background }]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={theme.success} />
          </View>
          <Text style={[styles.successTitle, { color: theme.text }]}>Post Created Successfully!</Text>
          <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
            Your task is now live on the platform
          </Text>

          <View style={[styles.postPreview, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: theme.text }]}>{postedTask.title}</Text>
              <View style={[styles.previewPostType, { backgroundColor: theme.primary }]}>
                <Text style={[styles.previewPostTypeText, { color: '#fff' }]}>
                  {postedTask.postType === 'job_seeker' ? 'Seeking' : 'Hiring'}
                </Text>
              </View>
            </View>
            <Text style={[styles.previewCategory, { color: theme.primary }]}>
              {postedTask.category}
            </Text>
            <Text style={[styles.previewDescription, { color: theme.textSecondary }]}>
              {postedTask.description}
            </Text>
            <View style={[styles.previewFooter, { borderTopColor: theme.borderLight }]}>
              <Text style={[styles.previewBudget, { color: theme.success }]}>{postedTask.budget}</Text>
              <Text style={[styles.previewDate, { color: theme.textTertiary }]}>{postedTask.createdAt}</Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={handleViewPost}
            >
              <Ionicons name="eye" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>View Feed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={handlePostAnother}
            >
              <Ionicons name="add-circle" size={18} color={theme.primary} />
              <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Post Another</Text>
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
  postTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  postTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  postTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  postAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  postDate: {
    fontSize: 11,
    color: '#999',
  },
  postBody: {
    padding: 16,
    paddingTop: 12,
  },
  postDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  postMetaTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  postTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  postTypeTagText: {
    fontSize: 12,
    fontWeight: '700',
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
  urgencyTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgencyTagHigh: {
    backgroundColor: '#FFEBEE',
  },
  urgencyTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9800',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  budget: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginLeft: 16,
  },
  locationText: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    gap: 6,
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
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
  postTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  postTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  postTypeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  postTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  postTypeTextActive: {
    color: '#fff',
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
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  previewPostType: {
    backgroundColor: '#E8D5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  previewPostTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
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

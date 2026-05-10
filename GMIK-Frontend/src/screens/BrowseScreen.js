import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { taskService } from '../services/api';
import { getTheme } from '../utils/theme';

const BrowseScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const user = useSelector(state => state.auth.user);
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);

  const categories = ['All', 'Development', 'Design', 'Writing', 'Marketing', 'Other'];

  useEffect(() => {
    fetchTasks();
  }, [selectedCategory]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Fetch tasks from backend API
      const params = {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        excludeUserId: user?.id, // Exclude user's own posts
      };
      console.log('Current user:', user);
      console.log('Fetching tasks with params:', params);
      const response = await taskService.getTasks(params);
      console.log('Tasks response:', response);
      setTasks(response.data?.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.display_name && task.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const TaskCard = ({ task }) => (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
    >
      <View style={styles.taskHeader}>
        <View style={styles.authorInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{task.display_name ? task.display_name[0] : '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text>
            <Text style={[styles.authorName, { color: theme.textTertiary }]}>{task.display_name || 'Unknown'}</Text>
          </View>
        </View>
        <View style={styles.tagsContainer}>
          <View style={[styles.categoryTag, task.post_type === 'job_seeker' ? styles.jobSeekerTag : styles.hiringTag]}>
            <Text style={[styles.categoryTagText, task.post_type === 'job_seeker' ? styles.jobSeekerTagText : styles.hiringTagText]}>
              {task.post_type === 'job_seeker' ? 'Seeking' : 'Hiring'}
            </Text>
          </View>
        </View>
      </View>
      {task.compensation && (
        <View style={styles.budgetContainer}>
          <Ionicons name="cash" size={16} color={theme.primary} />
          <Text style={[styles.budgetText, { color: theme.primary }]}>₱{task.compensation}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search tasks..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={[styles.categoryScroll, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryFilter,
                {
                  backgroundColor: selectedCategory === item ? theme.primary : theme.surface,
                  borderColor: selectedCategory === item ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  { color: selectedCategory === item ? '#fff' : theme.textTertiary },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryContent}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TaskCard task={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No tasks found</Text>
            </View>
          }
          contentContainerStyle={styles.tasksList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  categoryScroll: {
    height: 45,
    borderBottomWidth: 1,
  },
  categoryContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tasksList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  taskCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginLeft: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  hiringTag: {
    backgroundColor: '#E8F4FF',
  },
  hiringTagText: {
    color: '#007AFF',
  },
  jobSeekerTag: {
    backgroundColor: '#F0E8FF',
  },
  jobSeekerTagText: {
    color: '#7C3AED',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});

export default BrowseScreen;

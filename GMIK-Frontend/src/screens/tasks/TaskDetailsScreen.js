import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { taskService } from '../../services/api';
import { getTheme } from '../../utils/theme';

const TaskDetailsScreen = ({ route, navigation }) => {
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);
  const { taskId } = route.params;
  const { user } = useSelector(state => state.auth);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    try {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            style={{ paddingLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </TouchableOpacity>
        ),
        headerTitle: 'Task Details',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: theme.text,
        },
        headerStyle: {
          backgroundColor: theme.surface,
          shadowColor: theme.border,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
      });
    } catch (error) {
      console.warn('Error setting navigation options:', error);
    }
  }, [navigation, theme]);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      console.log('Loading task with ID:', taskId);
      const response = await taskService.getTaskById(taskId);
      console.log('Task response:', response);
      setTask(response.data.task);
    } catch (error) {
      console.error('Error loading task:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async () => {
    setAccepting(true);
    try {
      await taskService.acceptTask(taskId);
      Alert.alert('Success', 'Task accepted! You can now chat with the dropper.');
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to accept task';
      Alert.alert('Error', errorMessage);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }] }>
        <Text style={{ color: theme.text }}>Task not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerBar, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Task Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollContent}>
        <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>{task.title}</Text>
          <Text style={[styles.category, { color: theme.primary, backgroundColor: theme.borderLight }]}>{task.category}</Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{task.description}</Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Type:</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {task.post_type === 'job_seeker' ? 'Looking for Work' : 'Hiring'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Compensation:</Text>
            <Text style={[styles.value, { color: theme.text }]}>₱{task.compensation}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Location:</Text>
            <Text style={[styles.value, { color: theme.text }]}>{task.location_address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Urgency:</Text>
            <Text style={[styles.value, { color: theme.text }]}>{task.urgency}</Text>
          </View>
        </View>


        <View style={[styles.section, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Posted by</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserProfile', { userId: task.dropper_id })}
          >
            <Text style={[styles.postedBy, { color: theme.primary, textDecorationLine: 'underline' }]}>{task.display_name}</Text>
          </TouchableOpacity>
          <Text style={[styles.completedTasks, { color: theme.textTertiary }]}>
            {task.completed_tasks_count} tasks completed
          </Text>
        </View>

        {user?.id !== task.dropper_id && (
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: theme.primary }, accepting && styles.buttonDisabled]}
            onPress={handleAcceptTask}
            disabled={accepting}
          >
            <Text style={styles.acceptButtonText}>
              {accepting ? 'Processing...' : (task.post_type === 'job_seeker' ? 'Hire' : 'Take Job')}
            </Text>
          </TouchableOpacity>
        )}
        
        {user?.id === task.dropper_id && (
          <View style={[styles.ownPostContainer, { backgroundColor: theme.borderLight, borderColor: theme.success }]}>
            <Text style={styles.ownPostText}>✓ This is your post</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  postedBy: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedTasks: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ownPostContainer: {
    padding: 15,
    margin: 20,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  ownPostText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default TaskDetailsScreen;

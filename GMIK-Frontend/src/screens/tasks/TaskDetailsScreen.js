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

const TaskDetailsScreen = ({ route, navigation }) => {
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
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
        ),
        headerTitle: 'Task Details',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#000',
        },
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
      });
    } catch (error) {
      console.warn('Error setting navigation options:', error);
    }
  }, [navigation]);

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
    return <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />;
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Task not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.category}>{task.category}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>
              {task.post_type === 'job_seeker' ? 'Looking for Work' : 'Hiring'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Compensation:</Text>
            <Text style={styles.value}>₱{task.compensation}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{task.location_address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Urgency:</Text>
            <Text style={styles.value}>{task.urgency}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posted by</Text>
          <Text style={styles.postedBy}>{task.display_name}</Text>
          <Text style={styles.completedTasks}>
            {task.completed_tasks_count} tasks completed
          </Text>
        </View>

        {user?.id !== task.dropper_id && (
          <TouchableOpacity
            style={[styles.acceptButton, accepting && styles.buttonDisabled]}
            onPress={handleAcceptTask}
            disabled={accepting}
          >
            <Text style={styles.acceptButtonText}>
              {accepting ? 'Processing...' : (task.post_type === 'job_seeker' ? 'Hire' : 'Take Job')}
            </Text>
          </TouchableOpacity>
        )}
        
        {user?.id === task.dropper_id && (
          <View style={styles.ownPostContainer}>
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

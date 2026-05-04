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
import { taskService } from '../../services/api';

const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      const response = await taskService.getTaskById(taskId);
      setTask(response.data.task);
    } catch (error) {
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
    <ScrollView style={styles.container}>
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

      <TouchableOpacity
        style={[styles.acceptButton, accepting && styles.buttonDisabled]}
        onPress={handleAcceptTask}
        disabled={accepting}
      >
        <Text style={styles.acceptButtonText}>
          {accepting ? 'Accepting...' : 'Accept Task'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
});

export default TaskDetailsScreen;

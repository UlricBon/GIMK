import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { taskService } from '../../services/api';
import { setTasks, setLoading, setFilters } from '../../redux/taskSlice';
import TaskCard from '../../components/TaskCard';

const TaskFeedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { tasks, isLoading, filters } = useSelector(state => state.tasks);
  const [searchText, setSearchText] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    dispatch(setLoading(true));
    try {
      const params = {
        search: filters.search,
        radius: filters.radius,
      };
      if (location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }
      const response = await taskService.getTasks(params);
      dispatch(setTasks(response.data.tasks));
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    dispatch(setFilters({ search: text }));
  };

  const renderTaskCard = ({ item }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search tasks..."
        value={searchText}
        onChangeText={handleSearch}
      />

      <TouchableOpacity style={styles.filterButton} onPress={loadTasks}>
        <Text style={styles.filterButtonText}>Refresh</Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tasks found</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});

export default TaskFeedScreen;

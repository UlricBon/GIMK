import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { taskService } from '../services/api';
import { getTheme } from '../utils/theme';

const MyDocumentsScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, taskId: null });

  useEffect(() => {
    fetchMyDocuments();
  }, [filter]);

  const fetchMyDocuments = async () => {
    setLoading(true);
    try {
      // Fetch user's own tasks from backend API
      const params = {
        status: filter === 'all' ? null : filter,
      };
      const response = await taskService.getUserTasks(params);
      setDocuments(response.data?.tasks || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyDocuments();
    setRefreshing(false);
  };

  const handleDeleteDocument = (docId) => {
    console.log('Delete requested for task:', docId);
    console.log('Platform:', Platform.OS);
    
    // Use window.confirm for web, Alert for native
    if (Platform.OS === 'web') {
      console.log('Using web confirm dialog');
      try {
        const confirmed = window.confirm(
          'Are you sure you want to delete this task? This action cannot be undone.'
        );
        console.log('Confirm result:', confirmed);
        if (confirmed) {
          console.log('User confirmed delete, proceeding...');
          performDelete(docId);
        } else {
          console.log('Delete cancelled by user');
        }
      } catch (err) {
        console.error('Error in confirm:', err);
      }
    } else {
      // For native, show the confirmation modal
      console.log('Using native modal');
      setDeleteConfirm({ visible: true, taskId: docId });
    }
  };

  const performDelete = async (docId) => {
    try {
      console.log('Confirming delete for task:', docId);
      const response = await taskService.deleteTask(docId);
      console.log('Delete response:', response);
      setDocuments(documents.filter(doc => doc.id !== docId));
      Alert.alert('Success', 'Task deleted successfully');
    } catch (error) {
      console.error('Delete error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete task';
      Alert.alert('Error', errorMessage);
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#4CAF50' : '#9e9e9e';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? 'checkmark-circle' : 'checkmark-done-circle';
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  const DocumentCard = ({ document }) => (
    <View style={[styles.documentCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.documentContent}>
        <View style={styles.documentHeader}>
          <Text style={[styles.documentTitle, { color: theme.text }]}>{document.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) }]}>
            <Text style={styles.statusText}>{document.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.documentMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="pricetag" size={14} color={theme.primary} />
            <Text style={[styles.metaText, { color: theme.textTertiary }]}>{document.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={14} color={theme.primary} />
            <Text style={[styles.metaText, { color: theme.textTertiary }]}>{document.applicants} applicants</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color={theme.primary} />
            <Text style={[styles.metaText, { color: theme.textTertiary }]}>{document.createdAt}</Text>
          </View>
        </View>

        <View style={styles.budgetRow}>
          <Text style={[styles.budgetLabel, { color: theme.textTertiary }]}>Budget:</Text>
          <Text style={[styles.budgetValue, { color: theme.primary }]}>₱{document.compensation}</Text>
        </View>
      </View>

      <View style={styles.documentActions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.border }]}
          onPress={() => navigation.navigate('TaskDetails', { taskId: document.id })}
        >
          <Ionicons name="eye" size={18} color={theme.primary} />
          <Text style={[styles.actionLabel, { color: theme.primary }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.border }]}
          onPress={() => navigation.navigate('EditTask', { taskId: document.id })}
        >
          <Ionicons name="pencil" size={18} color="#FF9800" />
          <Text style={[styles.actionLabel, { color: '#FF9800' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.border }]}
          onPress={() => handleDeleteDocument(document.id)}
        >
          <Ionicons name="trash" size={18} color={theme.danger} />
          <Text style={[styles.actionLabel, { color: theme.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.filterContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {['all', 'active', 'completed'].map(filterOption => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && [styles.filterButtonActive, { backgroundColor: theme.primary }],
              filter !== filterOption && { borderColor: theme.border, backgroundColor: theme.surface },
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === filterOption && styles.filterButtonTextActive,
                filter !== filterOption && { color: theme.textTertiary },
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <DocumentCard document={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No documents yet</Text>
              <Text style={styles.emptySubtext}>Create your first post to get started</Text>
            </View>
          }
          contentContainerStyle={styles.documentsList}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={deleteConfirm.visible}
        animationType="fade"
        onRequestClose={() => setDeleteConfirm({ visible: false, taskId: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Task?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete this task? This action cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => {
                  console.log('Delete cancelled');
                  setDeleteConfirm({ visible: false, taskId: null });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={() => {
                  setDeleteConfirm({ visible: false, taskId: null });
                  if (deleteConfirm.taskId) {
                    performDelete(deleteConfirm.taskId);
                  }
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  documentsList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  documentContent: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  documentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  actionLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
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
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MyDocumentsScreen;

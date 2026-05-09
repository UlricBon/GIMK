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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { taskService } from '../services/api';

const MyDocumentsScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    fetchMyDocuments();
  }, [filter]);

  const fetchMyDocuments = async () => {
    setLoading(true);
    try {
      // Fetch user's tasks from backend API
      const params = {
        status: filter === 'all' ? null : filter,
      };
      const response = await taskService.getTasks(params);
      setDocuments(response.data || []);
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
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setDocuments(documents.filter(doc => doc.id !== docId));
            Alert.alert('Success', 'Document deleted successfully');
          },
          style: 'destructive',
        },
      ]
    );
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
    <View style={styles.documentCard}>
      <View style={styles.documentContent}>
        <View style={styles.documentHeader}>
          <Text style={styles.documentTitle}>{document.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) }]}>
            <Text style={styles.statusText}>{document.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.documentMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="pricetag" size={14} color="#007AFF" />
            <Text style={styles.metaText}>{document.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={14} color="#007AFF" />
            <Text style={styles.metaText}>{document.applicants} applicants</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color="#007AFF" />
            <Text style={styles.metaText}>{document.createdAt}</Text>
          </View>
        </View>

        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Budget:</Text>
          <Text style={styles.budgetValue}>${document.budget}</Text>
        </View>
      </View>

      <View style={styles.documentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TaskDetails', { taskId: document.id })}
        >
          <Ionicons name="eye" size={18} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="pencil" size={18} color="#FF9800" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteDocument(document.id)}
        >
          <Ionicons name="trash" size={18} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['all', 'active', 'completed'].map(filterOption => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === filterOption && styles.filterButtonTextActive,
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
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
    padding: 8,
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
});

export default MyDocumentsScreen;

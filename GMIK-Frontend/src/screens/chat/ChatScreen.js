import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { messageService } from '../../services/api';

const ChatScreen = ({ route }) => {
  const { taskId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      loadMessages();
    }
  }, [taskId]);

  const loadMessages = async () => {
    try {
      const response = await messageService.getMessages(taskId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  return (
    <View style={styles.container}>
      {!taskId ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Select a task to start chatting</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View style={styles.messageItem}>
              <Text style={styles.senderName}>{item.display_name}</Text>
              <Text style={styles.messageContent}>{item.content}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.created_at).toLocaleTimeString()}
              </Text>
            </View>
          )}
          keyExtractor={item => item.id}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  messageItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});

export default ChatScreen;

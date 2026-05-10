import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Badge,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { messageService, taskService, userService } from '../../services/api';
import { getTheme } from '../../utils/theme';

const ChatScreen = ({ route, navigation }) => {
  const { user } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'friends'
  const [unreadCount, setUnreadCount] = useState(0);
  const [newPostsCount, setNewPostsCount] = useState(0);

  // Check if opening direct message from route params
  useEffect(() => {
    const directUserId = route?.params?.directMessageUserId;
    if (directUserId) {
      const userName = route.params?.directMessageUserName || 'User';
      const postTitle = route.params?.postTitle || 'Direct Message';
      
      setSelectedChat({
        id: `direct_${directUserId}`,
        name: userName,
        taskTitle: postTitle,
        isDirectMessage: true,
        otherUserId: directUserId,
      });
      
      loadDirectMessages(directUserId);
      setActiveTab('messages');
    } else {
      setActiveTab('messages');
      loadChats();
      loadFriends();
    }
  }, [route?.params?.directMessageUserId]);

  // Auto-reload messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      if (selectedChat.isDirectMessage) {
        loadDirectMessages(selectedChat.otherUserId);
      } else {
        loadMessages(selectedChat.id);
      }
    }
  }, [selectedChat?.id]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatList = [];
      const processedChats = new Set();

      // 1. Load task-based messages
      const tasksResponse = await taskService.getUserTasks();
      const userTasks = tasksResponse.data?.tasks || [];
      
      for (const task of userTasks) {
        try {
          const messagesResponse = await messageService.getMessages(task.id);
          const taskMessages = messagesResponse.data?.messages || [];

          if (taskMessages.length > 0) {
            let otherUserId = null;
            let otherUserName = 'User';

            if (task.dropper_id === user?.id) {
              otherUserId = task.acceptor_id;
              otherUserName = task.acceptor_name || 'Applicant';
            } else {
              otherUserId = task.dropper_id;
              otherUserName = task.display_name || 'Employer';
            }

            const chatKey = `task-${task.id}`;
            if (!processedChats.has(chatKey)) {
              processedChats.add(chatKey);

              const lastMessage = taskMessages[taskMessages.length - 1];
              chatList.push({
                id: task.id,
                name: otherUserName,
                taskTitle: task.title,
                lastMessage: lastMessage?.content || 'No messages yet',
                timestamp: lastMessage?.created_at ? new Date(lastMessage.created_at) : new Date(),
                unread: 0,
                otherUserId,
                isDirectMessage: false,
              });
            }
          }
        } catch (error) {
          console.error(`Error loading messages for task ${task.id}:`, error);
        }
      }

      // 2. Load direct messages from all friends
      try {
        const friendsResponse = await taskService.getTasks({ status: 'posted' });
        const allTasks = friendsResponse.data?.tasks || [];
        
        // Get unique user IDs
        const friendIds = new Set();
        for (const task of allTasks) {
          if (task.dropper_id !== user?.id) {
            friendIds.add(task.dropper_id);
          }
        }

        // Load direct messages for each friend
        for (const friendId of friendIds) {
          // Skip if this is the current user (safety check)
          if (friendId === user?.id) {
            console.log('Skipping self-message for user:', friendId);
            continue;
          }

          try {
            const directMessagesResponse = await messageService.getDirectMessages(friendId);
            const directMessages = directMessagesResponse.data?.messages || [];

            if (directMessages.length > 0) {
              const chatKey = `direct-${friendId}`;
              if (!processedChats.has(chatKey)) {
                processedChats.add(chatKey);

                // Find the OTHER user's name (not the current user)
                let friendName = 'User';
                for (const msg of directMessages) {
                  if (msg.sender_id !== user?.id) {
                    friendName = msg.display_name || 'User';
                    break;
                  }
                }

                const lastMessage = directMessages[directMessages.length - 1];
                
                chatList.push({
                  id: `direct_${friendId}`,
                  name: friendName,
                  taskTitle: 'Direct Message',
                  lastMessage: lastMessage?.content || 'No messages yet',
                  timestamp: lastMessage?.created_at ? new Date(lastMessage.created_at) : new Date(),
                  unread: 0,
                  otherUserId: friendId,
                  isDirectMessage: true,
                });
              }
            }
          } catch (error) {
            console.error(`Error loading direct messages for user ${friendId}:`, error);
          }
        }
      } catch (error) {
        console.error('Error loading direct messages:', error);
      }

      // Sort by timestamp
      chatList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setChats(chatList);
      
      const unread = chatList.length > 0 ? chatList.length : 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      // Get all users to display as friends
      const response = await taskService.getTasks({ status: 'posted' });
      const allTasks = response.data?.tasks || [];
      
      // Extract unique users from tasks
      const friendsSet = new Map();
      
      for (const task of allTasks) {
        const userId = task.dropper_id;
        const userName = task.display_name || 'User';
        
        if (userId !== user?.id && !friendsSet.has(userId)) {
          friendsSet.set(userId, {
            id: userId,
            name: userName,
            email: task.email || 'user@gmik.com',
          });
        }
      }
      
      setFriends(Array.from(friendsSet.values()));
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadMessages = async (taskId) => {
    try {
      const response = await messageService.getMessages(taskId);
      const taskMessages = response.data?.messages || [];
      setMessages(taskMessages);
      console.log(`Loaded ${taskMessages.length} task messages for task ${taskId}`);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const loadDirectMessages = async (directUserId) => {
    try {
      const response = await messageService.getDirectMessages(directUserId);
      const directMessages = response.data?.messages || [];
      setMessages(directMessages);
      console.log(`Loaded ${directMessages.length} direct messages`);
    } catch (error) {
      console.error('Error loading direct messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    // Prevent sending messages to yourself
    if (selectedChat.isDirectMessage && selectedChat.otherUserId === user?.id) {
      Alert.alert('Error', 'You cannot message yourself');
      return;
    }

    try {
      setSendingMessage(true);
      const messageContent = messageInput.trim();
      
      if (selectedChat.isDirectMessage) {
        // Send direct message
        console.log('Sending direct message to:', selectedChat.otherUserId);
        await messageService.sendDirectMessage(selectedChat.otherUserId, messageContent);
        setMessageInput('');
        
        // Reload direct messages
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure message is saved
        await loadDirectMessages(selectedChat.otherUserId);
      } else {
        // Send task-based message
        console.log('Sending task message to task:', selectedChat.id);
        await messageService.sendMessage(selectedChat.id, messageContent);
        setMessageInput('');
        
        // Reload messages to show the sent message
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure message is saved
        await loadMessages(selectedChat.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const ChatListItem = ({ chat }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => {
        setSelectedChat(chat);
        if (chat.isDirectMessage) {
          loadDirectMessages(chat.otherUserId);
        } else {
          loadMessages(chat.id);
        }
      }}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{chat.name[0]}</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>{Math.min(unreadCount, 99)}</Text>
          </View>
        )}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{chat.name}</Text>
          <Text style={styles.timestamp}>
            {chat.timestamp.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={styles.taskTitle} numberOfLines={1}>
          {chat.isDirectMessage ? 'Direct Message' : `Task: ${chat.taskTitle}`}
        </Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {chat.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const FriendItem = ({ friend }) => {
    // Prevent chatting with yourself
    if (friend.id === user?.id) {
      return null;
    }

    return (
      <TouchableOpacity 
        style={styles.friendItem}
        onPress={() => {
          // Double check to prevent self-messaging
          if (friend.id === user?.id) {
            Alert.alert('Error', 'You cannot message yourself');
            return;
          }

          setSelectedChat({
            id: `direct_${friend.id}`,
            name: friend.name,
            taskTitle: 'Direct Message',
            isDirectMessage: true,
            otherUserId: friend.id,
          });
          loadDirectMessages(friend.id);
        }}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{friend.name[0]}</Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friend.name}</Text>
          <Text style={styles.friendEmail} numberOfLines={1}>{friend.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  if (selectedChat) {
    const refreshMessages = () => {
      if (selectedChat.isDirectMessage) {
        loadDirectMessages(selectedChat.otherUserId);
      } else {
        loadMessages(selectedChat.id);
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.selectedChatHeader}>
          <TouchableOpacity onPress={() => {
            setSelectedChat(null);
            setMessages([]);
          }}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.selectedChatTitle}>
            <Text style={styles.selectedChatName}>{selectedChat.name}</Text>
            <Text style={styles.selectedChatTask} numberOfLines={1}>
              {selectedChat.isDirectMessage ? 'Direct Message' : `Task: ${selectedChat.taskTitle}`}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={messages}
          renderItem={({ item }) => {
            const isOwnMessage = item.sender_id === user?.id;
            return (
              <View
                style={[
                  styles.messageItem,
                  isOwnMessage ? styles.ownMessage : styles.otherMessage,
                ]}
              >
                {!isOwnMessage && <Text style={styles.senderName}>{selectedChat.name}</Text>}
                <View
                  style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                  ]}
                >
                  <Text style={[styles.messageContent, isOwnMessage ? styles.ownText : {}]}>
                    {item.content}
                  </Text>
                </View>
                <Text style={styles.messageTime}>
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          }}
          keyExtractor={(item, index) => item.id || `msg-${index}`}
          contentContainerStyle={styles.messagesContainer}
          inverted={false}
          extraData={messages}
          onRefresh={refreshMessages}
          refreshing={loading}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={messageInput}
            onChangeText={setMessageInput}
            editable={!sendingMessage}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={sendingMessage || !messageInput.trim()}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.tabContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={[
            styles.tab,
            activeTab === 'messages' && { borderBottomColor: theme.primary },
          ]}
          onPress={() => setActiveTab('messages')}
        >
          <Ionicons name="chatbubbles" size={20} color={activeTab === 'messages' ? theme.primary : theme.textTertiary} />
          <Text style={[
            styles.tabLabel,
            activeTab === 'messages' && { color: theme.primary },
            activeTab !== 'messages' && { color: theme.textTertiary },
          ]}>Messages</Text>
          {unreadCount > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.tabBadgeText}>{Math.min(unreadCount, 9)}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab,
            activeTab === 'friends' && { borderBottomColor: theme.primary },
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'friends' ? theme.primary : theme.textTertiary} />
          <Text style={[
            styles.tabLabel,
            activeTab === 'friends' && { color: theme.primary },
            activeTab !== 'friends' && { color: theme.textTertiary },
          ]}>Friends</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'messages' ? (
        <>
          <View style={[styles.sectionHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Conversations</Text>
          </View>
          <FlatList
            data={chats}
            renderItem={({ item }) => <ChatListItem chat={item} />}
            keyExtractor={item => item.id}
            onRefresh={loadChats}
            refreshing={loading}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>No conversations yet</Text>
                <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                  Accept or post tasks to start chatting
                </Text>
              </View>
            }
          />
        </>
      ) : (
        <FlatList
          data={friends}
          renderItem={({ item }) => <FriendItem friend={item} />}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No friends yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                Browse and interact with users to build your friends list
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fafafa',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taskTitle: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  selectedChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedChatTitle: {
    flex: 1,
    marginHorizontal: 12,
  },
  selectedChatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedChatTask: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  messagesContainer: {
    padding: 12,
    paddingBottom: 16,
  },
  messageItem: {
    marginBottom: 8,
    flexDirection: 'column',
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginHorizontal: 8,
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  messageContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  ownText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#f0f7ff',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  tabLabelActive: {
    color: '#007AFF',
  },
  tabBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  friendItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  friendEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default ChatScreen;

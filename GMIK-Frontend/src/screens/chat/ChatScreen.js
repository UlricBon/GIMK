import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { messageService } from '../../services/api';

const ChatScreen = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'friends'
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chats, setChats] = useState([
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/50',
      lastMessage: 'Great! When can you start?',
      timestamp: new Date(Date.now() - 300000),
      unread: 0,
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://via.placeholder.com/50',
      lastMessage: 'Thanks for the update!',
      timestamp: new Date(Date.now() - 3600000),
      unread: 2,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'https://via.placeholder.com/50',
      lastMessage: 'Perfect, see you tomorrow',
      timestamp: new Date(Date.now() - 86400000),
      unread: 0,
    },
  ]);

  const [friends, setFriends] = useState([
    {
      id: '4',
      name: 'Sarah Wilson',
      avatar: 'https://via.placeholder.com/50',
      status: 'online',
    },
    {
      id: '5',
      name: 'Tom Brown',
      avatar: 'https://via.placeholder.com/50',
      status: 'offline',
    },
    {
      id: '6',
      name: 'Lisa Anderson',
      avatar: 'https://via.placeholder.com/50',
      status: 'online',
    },
  ]);

  const [messages, setMessages] = useState([
    {
      id: '1',
      display_name: 'John Doe',
      content: 'Hey, are you interested in this task?',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      isOwn: false,
    },
    {
      id: '2',
      display_name: 'You',
      content: 'Yes, I can help with that!',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      isOwn: true,
    },
    {
      id: '3',
      display_name: 'John Doe',
      content: 'Great! When can you start?',
      created_at: new Date().toISOString(),
      isOwn: false,
    },
  ]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const ChatListItem = ({ chat }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => setSelectedChat(chat)}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{chat.name[0]}</Text>
        </View>
        {chat.unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{chat.unread}</Text>
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
        <Text style={styles.lastMessage} numberOfLines={1}>
          {chat.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const FriendItem = ({ friend }) => (
    <TouchableOpacity style={styles.friendItem} onPress={() => setSelectedChat(friend)}>
      <View style={styles.friendAvatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{friend.name[0]}</Text>
        </View>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: friend.status === 'online' ? '#4CAF50' : '#999' },
          ]}
        />
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.name}</Text>
        <Text style={styles.friendStatus}>
          {friend.status === 'online' ? 'Online' : 'Offline'}
        </Text>
      </View>
      <TouchableOpacity style={styles.messageButton}>
        <Ionicons name="send" size={20} color="#007AFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (selectedChat) {
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedChat(null)}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.selectedChatName}>{selectedChat.name}</Text>
          <View style={{ width: 24 }} />
        </View>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageItem,
                item.isOwn ? styles.ownMessage : styles.otherMessage,
              ]}
            >
              {!item.isOwn && <Text style={styles.senderName}>{item.display_name}</Text>}
              <View
                style={[
                  styles.messageBubble,
                  item.isOwn ? styles.ownBubble : styles.otherBubble,
                ]}
              >
                <Text style={[styles.messageContent, item.isOwn ? styles.ownText : {}]}>
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
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
          onPress={() => setActiveTab('chats')}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
            Chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chats' ? (
        <FlatList
          data={chats}
          renderItem={({ item }) => <ChatListItem chat={item} />}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No conversations yet</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={friends}
          renderItem={({ item }) => <FriendItem friend={item} />}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No friends yet</Text>
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
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 12,
    color: '#666',
  },
  friendItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  friendAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  statusIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  friendStatus: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  messageButton: {
    padding: 8,
  },
  selectedChatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  messagesContainer: {
    paddingVertical: 8,
  },
  messageItem: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '70%',
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#e0e0e0',
  },
  senderName: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
    fontWeight: '500',
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
  },
  ownText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});

export default ChatScreen;

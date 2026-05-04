import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const TaskCard = ({ task, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.compensation}>₱{task.compensation}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{task.category}</Text>
          {task.urgency && task.urgency !== 'normal' && (
            <Text style={[styles.tag, styles.urgentTag]}>{task.urgency}</Text>
          )}
        </View>
        <Text style={styles.postedBy}>by {task.display_name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  compensation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    fontSize: 11,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#333',
  },
  urgentTag: {
    backgroundColor: '#FFE5E5',
    color: '#FF3B30',
  },
  postedBy: {
    fontSize: 12,
    color: '#999',
  },
});

export default TaskCard;

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { getTheme } from '../utils/theme';

const TaskCard = ({ task, onPress }) => {
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.title, { color: theme.text }]}>{task.title}</Text>
        <Text style={[styles.compensation, { color: theme.primary }]}>₱{task.compensation}</Text>
      </View>

      <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
        {task.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.tagContainer}>
          <Text style={[styles.tag, { backgroundColor: theme.borderLight, color: theme.text }]}>
            {task.category}
          </Text>
          {task.urgency && task.urgency !== 'normal' && (
            <Text style={[styles.tag, styles.urgentTag, { backgroundColor: '#FFE5E5', color: theme.danger }]}>
              {task.urgency}
            </Text>
          )}
        </View>
        <Text style={[styles.postedBy, { color: theme.textTertiary }]}>by {task.display_name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
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
  },
  description: {
    fontSize: 13,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgentTag: {
    fontWeight: '600',
  },
  postedBy: {
    fontSize: 12,
  },
});

export default TaskCard;

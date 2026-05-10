import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../../services/api';

const PaymentMethodsScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentMethods();
      const methods = response.data?.methods || [];
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Use empty list if error
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await paymentService.setDefaultPaymentMethod(id);
      // Add delay to ensure database persistence
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadPaymentMethods();
      Alert.alert('Success', 'Default payment method updated!');
    } catch (error) {
      console.error('Error setting default:', error);
      Alert.alert('Error', 'Failed to update payment method');
    }
  };

  const handleRemove = (id) => {
    Alert.alert('Remove Payment Method', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Remove',
        onPress: async () => {
          try {
            await paymentService.removePaymentMethod(id);
            // Add delay to ensure database persistence
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadPaymentMethods();
            Alert.alert('Success', 'Payment method removed!');
          } catch (error) {
            console.error('Error removing payment method:', error);
            Alert.alert('Error', 'Failed to remove payment method');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const PaymentCard = ({ method }) => (
    <View style={[styles.card, method.is_default && styles.defaultCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <View style={styles.cardIcon}>
            <Ionicons
              name={method.type === 'credit_card' ? 'card' : 'wallet'}
              size={24}
              color="#007AFF"
            />
          </View>
          <View>
            <Text style={styles.cardName}>{method.card_holder_name}</Text>
            <Text style={styles.cardNumber}>•••• {method.last_four_digits}</Text>
            <Text style={styles.cardExpiry}>Expires {method.expiry_date}</Text>
          </View>
        </View>
        {method.is_default && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSetDefault(method.id)}
        >
          <Text style={styles.actionButtonText}>
            {method.is_default ? 'Default' : 'Set as Default'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleRemove(method.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {paymentMethods.length > 0 ? (
          <FlatList
            data={paymentMethods}
            renderItem={({ item }) => <PaymentCard method={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No payment methods yet</Text>
            <Text style={styles.emptySubtext}>Add a payment method to get started</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#eee',
  },
  defaultCard: {
    borderColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 12,
    color: '#666',
  },
  cardExpiry: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  removeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  emptyContainer: {
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
});

export default PaymentMethodsScreen;

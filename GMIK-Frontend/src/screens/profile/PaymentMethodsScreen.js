import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentMethodsScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'credit_card',
      name: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'debit_card',
      name: 'Mastercard',
      last4: '5555',
      expiry: '08/24',
      isDefault: false,
    },
  ]);

  const handleSetDefault = (id) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    Alert.alert('Success', 'Default payment method updated!');
  };

  const handleRemove = (id) => {
    Alert.alert('Remove Payment Method', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Remove',
        onPress: () => {
          setPaymentMethods(paymentMethods.filter(m => m.id !== id));
          Alert.alert('Success', 'Payment method removed!');
        },
        style: 'destructive',
      },
    ]);
  };

  const PaymentCard = ({ method }) => (
    <View style={[styles.card, method.isDefault && styles.defaultCard]}>
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
            <Text style={styles.cardName}>{method.name}</Text>
            <Text style={styles.cardNumber}>•••• {method.last4}</Text>
            <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
          </View>
        </View>
        {method.isDefault && (
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
            {method.isDefault ? 'Default' : 'Set as Default'}
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
        <FlatList
          data={paymentMethods}
          renderItem={({ item }) => <PaymentCard method={item} />}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

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
    borderRadius: 6,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeButtonText: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PaymentMethodsScreen;

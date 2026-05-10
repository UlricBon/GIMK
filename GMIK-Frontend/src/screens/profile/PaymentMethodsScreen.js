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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { paymentService } from '../../services/api';
import { getTheme } from '../../utils/theme';

const PaymentMethodsScreen = ({ navigation }) => {
  const darkMode = useSelector(state => state.settings.darkMode);
  const theme = getTheme(darkMode);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [addingCard, setAddingCard] = useState(false);

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

  const handleAddPaymentMethod = async () => {
    if (!cardholderName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setAddingCard(true);
    try {
      await paymentService.addPaymentMethod({
        card_holder_name: cardholderName,
        card_number: cardNumber,
        expiry_date: expiryDate,
        cvv: cvv,
      });
      
      Alert.alert('Success', 'Payment method added successfully!');
      setCardholderName('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setShowAddModal(false);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    } finally {
      setAddingCard(false);
    }
  };

  const PaymentCard = ({ method }) => (
    <View style={[styles.card, method.is_default && styles.defaultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <View style={styles.cardIcon}>
            <Ionicons
              name={method.type === 'credit_card' ? 'card' : 'wallet'}
              size={24}
              color={theme.primary}
            />
          </View>
          <View>
            <Text style={[styles.cardName, { color: theme.text }]}>{method.card_holder_name}</Text>
            <Text style={[styles.cardNumber, { color: theme.textTertiary }]}>•••• {method.last_four_digits}</Text>
            <Text style={[styles.cardExpiry, { color: theme.textTertiary }]}>Expires {method.expiry_date}</Text>
          </View>
        </View>
        {method.is_default && (
          <View style={[styles.defaultBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.primary }]}
          onPress={() => handleSetDefault(method.id)}
        >
          <Text style={[styles.actionButtonText, { color: theme.primary }]}>
            {method.is_default ? 'Default' : 'Set as Default'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton, { borderColor: theme.danger }]}
          onPress={() => handleRemove(method.id)}
        >
          <Text style={[styles.removeButtonText, { color: theme.danger }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.content, { backgroundColor: theme.background }]}>
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

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardholderName}
                onChangeText={setCardholderName}
                editable={!addingCard}
              />

              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={19}
                editable={!addingCard}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    keyboardType="numeric"
                    maxLength={5}
                    editable={!addingCard}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    editable={!addingCard}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
                disabled={addingCard}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, addingCard && { opacity: 0.6 }]}
                onPress={handleAddPaymentMethod}
                disabled={addingCard}
              >
                {addingCard ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Card</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PaymentMethodsScreen;

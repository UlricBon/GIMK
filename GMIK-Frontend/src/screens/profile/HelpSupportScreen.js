import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpSupportScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [message, setMessage] = useState('');

  const faqs = [
    {
      id: '1',
      question: 'How do I post a task?',
      answer: 'Go to the Post tab, fill in task details, set a budget, and click Post. It will appear in the Browse tab.',
    },
    {
      id: '2',
      question: 'How do I accept a task?',
      answer: 'Browse tasks in the Browse tab, click on one you like, review details, and click "Accept Task".',
    },
    {
      id: '3',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit cards, debit cards, and digital wallets. Add your payment method in Payment Methods.',
    },
    {
      id: '4',
      question: 'How is the payment process?',
      answer: 'Payment is held securely until task completion. Once complete, payment is released to the freelancer.',
    },
    {
      id: '5',
      question: 'Can I dispute a payment?',
      answer: 'Yes, you can dispute within 7 days. Contact support with evidence for investigation.',
    },
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  const FaqItem = ({ item }) => (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() =>
          setExpandedFaq(expandedFaq === item.id ? null : item.id)
        }
      >
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <Ionicons
          name={expandedFaq === item.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#007AFF"
        />
      </TouchableOpacity>
      {expandedFaq === item.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );

  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    Alert.alert('Success', 'Your message has been sent. We\'ll get back to you soon!');
    setMessage('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
          onPress={() => setActiveTab('faq')}
        >
          <Text
            style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}
          >
            FAQ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'contact' && styles.activeTabText,
            ]}
          >
            Contact Us
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'faq' ? (
        <View style={styles.content}>
          <FlatList
            data={faqs}
            renderItem={({ item }) => <FaqItem item={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <Text style={styles.contactSubtitle}>
            Have a question or issue? Send us a message and we'll help you out.
          </Text>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color="#007AFF" />
              <View>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>support@gmik.com</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#007AFF" />
              <View>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>+1 (555) 123-4567</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="time" size={20} color="#007AFF" />
              <View>
                <Text style={styles.contactLabel}>Hours</Text>
                <Text style={styles.contactValue}>Mon-Fri, 9AM-6PM EST</Text>
              </View>
            </View>
          </View>

          <Text style={styles.formTitle}>Send us a message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Describe your issue..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSendMessage}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.submitButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  content: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  faqAnswer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  contactInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactLabel: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
    marginTop: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  messageInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default HelpSupportScreen;

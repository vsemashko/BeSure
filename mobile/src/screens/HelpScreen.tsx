import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { supportApi } from '../api';
import type { CreateTicketRequest } from '../api/support';
import { faqData, categoryNames, categoryIcons, FAQItem } from '../data/faq';
import { colors, typography, spacing } from '../theme';
import logger from '../utils/logger';

export function HelpScreen() {
  const navigation = useNavigation();

  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Contact form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState<CreateTicketRequest['category']>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message');
      return;
    }

    if (subject.length < 5) {
      Alert.alert('Error', 'Subject must be at least 5 characters');
      return;
    }

    if (message.length < 10) {
      Alert.alert('Error', 'Message must be at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await supportApi.createTicket({
        subject: subject.trim(),
        message: message.trim(),
        category: ticketCategory,
      });

      logger.logUserAction('submit_support_ticket', {
        ticketId: result.ticketId,
        category: ticketCategory,
      });

      Alert.alert(
        'Ticket Submitted!',
        'Thank you for contacting us. Our support team will review your ticket and respond as soon as possible.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setMessage('');
              setTicketCategory('other');
              setShowContactForm(false);
            },
          },
        ]
      );
    } catch (error: any) {
      logger.error('Failed to submit support ticket', error);
      Alert.alert('Error', error.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFAQs = selectedCategory
    ? faqData.filter((faq) => faq.category === selectedCategory)
    : faqData;

  const categories = Object.keys(categoryNames) as Array<keyof typeof categoryNames>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowContactForm(!showContactForm)}
          >
            <Ionicons
              name={showContactForm ? 'close-circle' : 'mail-outline'}
              size={24}
              color={colors.primary}
            />
            <Text style={styles.quickActionText}>
              {showContactForm ? 'Close Form' : 'Contact Support'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Form */}
        {showContactForm && (
          <Card style={styles.contactForm}>
            <Text style={styles.contactFormTitle}>Submit a Support Ticket</Text>
            <Text style={styles.contactFormDescription}>
              Describe your issue or question, and our team will get back to you.
            </Text>

            {/* Category Selection */}
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryButtons}>
              {(['bug', 'feature', 'account', 'billing', 'other'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    ticketCategory === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setTicketCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      ticketCategory === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Subject Input */}
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief description of your issue"
              maxLength={200}
              placeholderTextColor={colors.textSecondary}
            />

            {/* Message Input */}
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Please provide details about your issue or question..."
              multiline
              numberOfLines={6}
              maxLength={2000}
              textAlignVertical="top"
              placeholderTextColor={colors.textSecondary}
            />

            <Button
              title={isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              onPress={handleSubmitTicket}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </Card>
        )}

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            <TouchableOpacity
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Ionicons
                  name={categoryIcons[cat] as any}
                  size={16}
                  color={selectedCategory === cat ? colors.white : colors.primary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {categoryNames[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ List */}
          {filteredFAQs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => handleToggleFAQ(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.primary}
                />
              </View>
              {expandedFAQ === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Info */}
        <Card style={styles.contactInfo}>
          <Text style={styles.contactInfoTitle}>Still Need Help?</Text>
          <Text style={styles.contactInfoText}>
            Email us at:{' '}
            <Text style={styles.contactInfoEmail}>support@besure.app</Text>
          </Text>
          <Text style={styles.contactInfoText}>
            We typically respond within 24-48 hours during business days.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  quickActions: {
    marginBottom: spacing.lg,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  quickActionText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  contactForm: {
    marginBottom: spacing.lg,
  },
  contactFormTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  contactFormDescription: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 120,
    paddingTop: spacing.md,
  },
  faqSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  categories: {
    marginBottom: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginRight: spacing.md,
  },
  faqAnswer: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  contactInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  contactInfoTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  contactInfoText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  contactInfoEmail: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default HelpScreen;

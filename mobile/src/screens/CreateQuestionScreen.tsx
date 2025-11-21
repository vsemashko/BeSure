import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { questionApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { colors, typography, spacing, borderRadius } from '../theme';

const EXPIRATION_OPTIONS = [
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '6 hours', minutes: 360 },
  { label: '24 hours', minutes: 1440 },
  { label: '3 days', minutes: 4320 },
  { label: '7 days', minutes: 10080 },
];

export function CreateQuestionScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [expiresInMinutes, setExpiresInMinutes] = useState(1440); // 24 hours default
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Calculate cost
  const isUrgent = expiresInMinutes < 360;
  const baseCost = 10;
  const anonymousCost = isAnonymous ? 3 : 0;
  const urgentCost = isUrgent ? 5 : 0;
  const totalCost = baseCost + anonymousCost + urgentCost;

  const canAfford = (user?.points || 0) >= totalCost;

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validate = () => {
    const newErrors: any = {};

    if (!title.trim()) {
      newErrors.title = 'Question title is required';
    } else if (title.length > 500) {
      newErrors.title = 'Title must be less than 500 characters';
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    options.forEach((opt, index) => {
      if (opt.length > 200) {
        newErrors[`option${index}`] = 'Option must be less than 200 characters';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    if (!canAfford) {
      Alert.alert(
        'Insufficient Points',
        `You need ${totalCost} points to create this question. You have ${user?.points} points.\n\nVote on ${Math.ceil((totalCost - (user?.points || 0)) / 2)} more questions to earn enough points!`
      );
      return;
    }

    try {
      setIsCreating(true);

      const validOptions = options
        .filter((opt) => opt.trim())
        .map((opt) => ({ content: opt.trim() }));

      await questionApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        options: validOptions,
        expiresInMinutes,
        isAnonymous,
        privacyLevel: 'public',
      });

      Alert.alert(
        'Question Created!',
        `Your question has been posted successfully!\n\nCost: ${totalCost} points`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              // Reload user to update points
              useAuthStore.getState().loadUser();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create question');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Question</Text>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsLabel}>Cost:</Text>
              <Text style={[styles.pointsCost, !canAfford && styles.pointsCostInsufficient]}>
                {totalCost} pts
              </Text>
              <Text style={styles.pointsBalance}>
                (Balance: {user?.points || 0})
              </Text>
            </View>
          </View>

          {/* Question Title */}
          <Input
            label="Question Title"
            placeholder="What do you need help deciding?"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            multiline
            maxLength={500}
          />

          {/* Description (Optional) */}
          <Input
            label="Description (Optional)"
            placeholder="Add more context..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Options ({options.filter((opt) => opt.trim()).length}/6)
            </Text>
            {errors.options && <Text style={styles.errorText}>{errors.options}</Text>}

            {options.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChangeText={(value) => updateOption(index, value)}
                  error={errors[`option${index}`]}
                  containerStyle={styles.optionInput}
                  maxLength={200}
                />
                {options.length > 2 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeOption(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {options.length < 6 && (
              <Button
                title="+ Add Option"
                onPress={addOption}
                variant="secondary"
                size="small"
              />
            )}
          </View>

          {/* Expiration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expires In</Text>
            <View style={styles.expirationOptions}>
              {EXPIRATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.minutes}
                  style={[
                    styles.expirationOption,
                    expiresInMinutes === option.minutes && styles.expirationOptionSelected,
                  ]}
                  onPress={() => setExpiresInMinutes(option.minutes)}
                >
                  <Text
                    style={[
                      styles.expirationOptionText,
                      expiresInMinutes === option.minutes && styles.expirationOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {isUrgent && (
              <Text style={styles.urgentWarning}>
                ⚡ Urgent questions (<6 hours) cost +5 points
              </Text>
            )}
          </View>

          {/* Settings */}
          <Card>
            <TouchableOpacity
              style={styles.setting}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="eye-off-outline"
                  size={24}
                  color={colors.textPrimary}
                />
                <View>
                  <Text style={styles.settingTitle}>Post Anonymously</Text>
                  <Text style={styles.settingDescription}>
                    {isAnonymous ? '+3 points' : 'Hide your identity'}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.checkbox,
                  isAnonymous && styles.checkboxSelected,
                ]}
              >
                {isAnonymous && (
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                )}
              </View>
            </TouchableOpacity>
          </Card>

          {/* Create Button */}
          <Button
            title={`Create Question (${totalCost} points)`}
            onPress={handleCreate}
            loading={isCreating}
            disabled={!canAfford}
            style={styles.createButton}
          />

          {!canAfford && (
            <Text style={styles.insufficientText}>
              You need {totalCost - (user?.points || 0)} more points. Vote on{' '}
              {Math.ceil((totalCost - (user?.points || 0)) / 2)} questions to earn enough!
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pointsLabel: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
  },
  pointsCost: {
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  pointsCostInsufficient: {
    color: colors.error,
  },
  pointsBalance: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  optionInput: {
    flex: 1,
  },
  removeButton: {
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  expirationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  expirationOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  expirationOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  expirationOptionText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semiBold,
  },
  expirationOptionTextSelected: {
    color: colors.primary,
  },
  urgentWarning: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.warning,
    marginTop: spacing.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  settingDescription: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  createButton: {
    marginBottom: spacing.md,
  },
  insufficientText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.error,
    textAlign: 'center',
  },
});

export default CreateQuestionScreen;

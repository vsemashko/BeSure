import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Card } from '../components/Card';
import {
  TEMPLATE_CATEGORIES,
  QUESTION_TEMPLATES,
  getTemplatesByCategory,
  getRandomTemplates,
  type TemplateCategory,
  type QuestionTemplate,
} from '../data/templates';
import logger from '../utils/logger';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TemplatesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const displayedTemplates =
    selectedCategory === 'all'
      ? QUESTION_TEMPLATES
      : getTemplatesByCategory(selectedCategory);

  const handleTemplateSelect = (template: QuestionTemplate) => {
    logger.logUserAction('select_question_template', {
      templateId: template.id,
      category: template.category,
    });

    // Navigate to CreateQuestion with template data
    navigation.navigate('Create' as never, {
      template: {
        title: template.title,
        options: template.options,
        expiresInMinutes: template.expiresInMinutes,
      },
    } as never);
  };

  const renderCategoryPill = (category: typeof TEMPLATE_CATEGORIES[0] | { key: 'all'; label: string; icon: string; color: string }) => {
    const isSelected = selectedCategory === category.key;

    return (
      <TouchableOpacity
        key={category.key}
        style={[
          styles.categoryPill,
          isSelected && { backgroundColor: category.color + '20' },
        ]}
        onPress={() => setSelectedCategory(category.key as TemplateCategory | 'all')}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text
          style={[
            styles.categoryLabel,
            isSelected && { color: category.color, fontWeight: '600' },
          ]}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTemplate = ({ item }: { item: QuestionTemplate }) => (
    <TouchableOpacity
      style={styles.templateCard}
      onPress={() => handleTemplateSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.templateHeader}>
        <Text style={styles.templateIcon}>{item.icon}</Text>
        <View style={styles.templateInfo}>
          <Text style={styles.templateTitle}>{item.title}</Text>
          <Text style={styles.templateDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>

      <View style={styles.templateOptions}>
        {item.options.slice(0, 3).map((option, index) => (
          <View key={index} style={styles.optionPreview}>
            <View style={styles.optionDot} />
            <Text style={styles.optionText} numberOfLines={1}>
              {option}
            </Text>
          </View>
        ))}
        {item.options.length > 3 && (
          <Text style={styles.moreOptions}>+{item.options.length - 3} more options</Text>
        )}
      </View>

      {item.tips && (
        <View style={styles.tipsContainer}>
          <Ionicons name="bulb-outline" size={14} color={colors.warning} />
          <Text style={styles.tipsText} numberOfLines={2}>
            {item.tips}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderQuickStart = () => {
    const quickTemplates = getRandomTemplates(3);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Quick Start</Text>
        <Text style={styles.sectionSubtitle}>Popular templates to get you started</Text>

        {quickTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.quickStartCard}
            onPress={() => handleTemplateSelect(template)}
          >
            <Text style={styles.quickStartIcon}>{template.icon}</Text>
            <View style={styles.quickStartInfo}>
              <Text style={styles.quickStartTitle}>{template.title}</Text>
              <Text style={styles.quickStartOptions}>
                {template.options.length} options
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Question Templates</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {renderCategoryPill({ key: 'all', label: 'All', icon: '📋', color: colors.primary })}
        {TEMPLATE_CATEGORIES.map(renderCategoryPill)}
      </ScrollView>

      {/* Content */}
      <FlatList
        style={styles.content}
        data={displayedTemplates}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={selectedCategory === 'all' ? renderQuickStart() : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  categoriesContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 20,
    gap: spacing.xs,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  quickStartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickStartIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  quickStartInfo: {
    flex: 1,
  },
  quickStartTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  quickStartOptions: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  templateCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  templateIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  templateDescription: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
  },
  templateOptions: {
    marginBottom: spacing.sm,
  },
  optionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  optionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  optionText: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  moreOptions: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: spacing.lg,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '10',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  tipsText: {
    flex: 1,
    fontSize: typography.fontSize.bodySmall,
    color: colors.textPrimary,
    lineHeight: 18,
  },
});

export default TemplatesScreen;

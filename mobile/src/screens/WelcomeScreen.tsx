import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { colors, typography, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <Text style={styles.logo}>🎯</Text>
            <Text style={styles.title}>BeSure</Text>
            <Text style={styles.subtitle}>
              Make decisions faster with collective wisdom
            </Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <FeatureItem
              icon="✓"
              text="Vote on others' questions to earn points"
            />
            <FeatureItem
              icon="?"
              text="Create your own questions and get help"
            />
            <FeatureItem
              icon="⚡"
              text="Quick results, no endless discussions"
            />
          </View>

          {/* CTA Buttons */}
          <View style={styles.buttons}>
            <Button
              title="Get Started"
              onPress={() => navigation.navigate('Register')}
              style={styles.primaryButton}
            />
            <Button
              title="I already have an account"
              onPress={() => navigation.navigate('Login')}
              variant="ghost"
              style={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxxl,
    justifyContent: 'space-between',
    paddingVertical: spacing.huge,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.huge,
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.display * 1.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.bodyLarge,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  features: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.white,
    opacity: 0.95,
  },
  buttons: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.white,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.white,
  },
  secondaryButtonText: {
    color: colors.white,
  },
});

export default WelcomeScreen;

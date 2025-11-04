import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { Theme, useAppTheme } from '@/constants/theme';

const APP_INFORMATION = [
  { label: 'Application size', value: '125 MB' },
  { label: 'Data size', value: '47 MB' },
  { label: 'Cache size', value: '23 MB' },
  { label: 'Last update', value: '3 days ago' },
];

const LEGAL_LINKS = [
  'Terms of Use',
  'Privacy Policy',
  'Open Source Licenses',
  'Copyrights',
];

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
      gap: theme.spacing.xl,
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textMuted,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    sectionHeaderWrapper: {
      gap: theme.spacing.xs,
    },
    sectionUnderline: {
      height: StyleSheet.hairlineWidth,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148, 163, 184, 0.2)'
          : 'rgba(15, 23, 42, 0.12)',
    },
    card: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    appRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    appTitleGroup: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    appName: {
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: 1,
      color: theme.colors.textPrimary,
    },
    appTagline: {
      fontSize: 13,
      color: theme.colors.textMuted,
      letterSpacing: 0.2,
    },
    versionText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      letterSpacing: 0.2,
    },
    appDescription: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    logoBox: {
      width: 68,
      height: 68,
      borderRadius: theme.radius.xxl,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148, 163, 184, 0.12)'
          : 'rgba(15, 23, 42, 0.08)',
      transform: [{ rotate: '-12deg' }],
    },
    logoLetter: {
      fontSize: 46,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      letterSpacing: 2,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148, 163, 184, 0.2)'
          : 'rgba(15, 23, 42, 0.1)',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },
    infoLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    legalList: {
      gap: theme.spacing.sm,
    },
    legalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    legalBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.textSecondary,
    },
    legalText: {
      fontSize: 13,
      color: theme.colors.textPrimary,
    },
  });

const AboutScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View>
          <View style={styles.sectionHeaderWrapper}>
            <Text style={styles.sectionHeader}>App information</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <AdaptiveGlassView style={styles.card}>
            <View style={styles.appRow}>
              <View style={styles.appTitleGroup}>
                <Text style={styles.appName}>LEORA</Text>
                <Text style={styles.appTagline}>LEORA Premium</Text>
                <Text style={styles.versionText}>Version: 1.0.0 (Build 145)</Text>
              </View>
              <AdaptiveGlassView style={styles.logoBox}>
                <Text style={styles.logoLetter}>L</Text>
              </AdaptiveGlassView>
            </View>
            <View style={styles.divider} />
            <Text style={styles.appDescription}>
              Your Personal AI Companion for Financial Freedom
            </Text>
          </AdaptiveGlassView>
        </View>

        <View>
          <View style={styles.sectionHeaderWrapper}>
            <Text style={styles.sectionHeader}>Information</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <AdaptiveGlassView style={styles.card}>
            {APP_INFORMATION.map((item, index) => (
              <View key={item.label}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
                {index < APP_INFORMATION.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </AdaptiveGlassView>
        </View>

        <View>
          <View style={styles.sectionHeaderWrapper}>
            <Text style={styles.sectionHeader}>Legal information</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <AdaptiveGlassView style={styles.card}>
            <View style={styles.legalList}>
              {LEGAL_LINKS.map((item) => (
                <View key={item} style={styles.legalItem}>
                  <View style={styles.legalBullet} />
                  <Text style={styles.legalText}>{item}</Text>
                </View>
              ))}
            </View>
          </AdaptiveGlassView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;

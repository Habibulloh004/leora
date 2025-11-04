import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Apple,
  CalendarDays,
  ChevronRight,
  CloudCog,
  CloudOff,
  Home,
  LifeBuoy,
  PlugZap,
  SmartphoneCharging,
  Watch,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { Theme, useAppTheme } from '@/constants/theme';

type SectionKey = 'calendars' | 'banks' | 'applications' | 'devices';

type IntegrationItem = {
  key: string;
  icon: React.ReactNode;
  name: string;
  meta?: string;
  statusLabel: string;
  statusTone?: 'positive' | 'warning' | 'neutral';
};

const SECTION_METADATA: Record<SectionKey, { title: string; activeLabel: string }> = {
  calendars: { title: 'Calendars', activeLabel: 'Active 2 / 3' },
  banks: { title: 'Banks', activeLabel: 'Active 0 / 4' },
  applications: { title: 'Applications', activeLabel: 'Active 2 / 8' },
  devices: { title: 'Devices', activeLabel: 'Active 1 / 2' },
};

const buildSectionContent = (theme: Theme): Record<SectionKey, IntegrationItem[]> => ({
  calendars: [
    {
      key: 'google-calendar',
      icon: <CalendarDays size={22} color="#34A853" />,
      name: 'Google Calendar',
      meta: 'Last sync: 15 mins ago',
      statusLabel: 'Settings',
      statusTone: 'positive',
    },
    {
      key: 'apple-calendar',
      icon: <Apple size={22} color={theme.colors.textPrimary} />,
      name: 'Apple calendar',
      meta: 'Last sync: 1 hour ago',
      statusLabel: 'Settings',
      statusTone: 'positive',
    },
    {
      key: 'outlook-calendar',
      icon: <CloudCog size={22} color={theme.colors.icon} />,
      name: 'Outlook',
      statusLabel: 'Connect',
      statusTone: 'neutral',
    },
  ],
  banks: [
    { key: 'uzcard', icon: <CloudOff size={22} color={theme.colors.icon} />, name: 'Uzcard', statusLabel: 'Connect', statusTone: 'neutral' },
    { key: 'humo', icon: <LifeBuoy size={22} color={theme.colors.icon} />, name: 'Humo', statusLabel: 'Connect', statusTone: 'neutral' },
    { key: 'kapitalbank', icon: <Home size={22} color={theme.colors.icon} />, name: 'Kapitalbank', statusLabel: 'Connect', statusTone: 'neutral' },
    { key: 'ipotekabank', icon: <LifeBuoy size={22} color={theme.colors.icon} />, name: 'Ipoteka Bank', statusLabel: 'Connect', statusTone: 'neutral' },
  ],
  applications: [
    { key: 'telegram', icon: <PlugZap size={22} color="#34A853" />, name: 'Telegram', statusLabel: 'Notification on', statusTone: 'positive' },
    { key: 'whatsapp', icon: <PlugZap size={22} color="#22C55E" />, name: 'WhatsApp', statusLabel: 'Notification on', statusTone: 'positive' },
    { key: 'slack', icon: <PlugZap size={22} color={theme.colors.warning} />, name: 'Slack', statusLabel: 'Status updating', statusTone: 'warning' },
    { key: 'notion', icon: <PlugZap size={22} color={theme.colors.icon} />, name: 'Notion', statusLabel: 'Connect', statusTone: 'neutral' },
    { key: 'todoist', icon: <PlugZap size={22} color={theme.colors.icon} />, name: 'Todoist', statusLabel: 'Connect', statusTone: 'neutral' },
    { key: 'spotify', icon: <PlugZap size={22} color="#22C55E" />, name: 'Spotify', statusLabel: 'Connect', statusTone: 'neutral' },
    { key: 'strava', icon: <PlugZap size={22} color={theme.colors.icon} />, name: 'Strava', statusLabel: 'Connect', statusTone: 'neutral' },
    { key: 'myfitnesspal', icon: <PlugZap size={22} color={theme.colors.icon} />, name: 'MyFitnessPal', statusLabel: 'Connect', statusTone: 'neutral' },
  ],
  devices: [
    {
      key: 'apple-watch',
      icon: <Watch size={24} color="#FFFFFF" />,
      name: 'Apple Watch',
      meta: 'Model: Series 8',
      statusLabel: 'Settings',
      statusTone: 'positive',
    },
    {
      key: 'wear-os',
      icon: <SmartphoneCharging size={22} color={theme.colors.icon} />,
      name: 'Wear OS',
      statusLabel: 'Connect',
      statusTone: 'neutral',
    },
  ],
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingBottom:32
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
      paddingTop: theme.spacing.lg,
      gap: theme.spacing.xl,
    },
    filterBar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 10,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(40,43,55,0.6)'
          : 'rgba(226,232,240,0.7)',
    },
    chipActive: {
      backgroundColor:
        theme.mode === 'dark'
          ? theme.colors.primary
          : theme.colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      letterSpacing: 0.3,
    },
    chipTextActive: {
      color: theme.colors.onPrimary,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      letterSpacing: -0.25,
    },
    sectionMeta: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textMuted,
      letterSpacing: 0.3,
    },
    sectionCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      backgroundColor:theme.colors.card
    },
    integrationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flex: 1,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(35,38,52,0.8)'
          : 'rgba(226,232,240,0.7)',
    },
    integrationTextGroup: {
      flex: 1,
    },
    integrationName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      letterSpacing: -0.2,
    },
    integrationMeta: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    statusPill: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 8,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(56,60,72,0.7)'
          : 'rgba(226,232,240,0.7)',
    },
    statusPillPositive: {
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(34,197,94,0.16)'
          : 'rgba(16,185,129,0.18)',
    },
    statusPillWarning: {
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(250,204,21,0.16)'
          : 'rgba(234,179,8,0.2)',
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.4,
      color: theme.colors.textSecondary,
    },
    statusPillTextPositive: {
      color: theme.colors.success,
    },
    statusPillTextWarning: {
      color: theme.colors.warning,
    },
    footerCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    footerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(56,60,72,0.85)'
          : 'rgba(229,231,235,0.85)',
    },
    footerButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      letterSpacing: 0.3,
    },
  });

const useSectionRegistry = () => {
  const sectionsRef = useRef<Partial<Record<SectionKey, number>>>({});
  const scrollRef = useRef<ScrollView | null>(null);
  const pending = useRef<SectionKey | null>(null);

  const scrollToSection = useCallback((key: SectionKey) => {
    const y = sectionsRef.current[key];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(y - 96, 0), animated: true });
    }
  }, []);

  const registerSection = useCallback(
    (key: SectionKey) =>
      (event: { nativeEvent: { layout: { y: number } } }) => {
        sectionsRef.current[key] = event.nativeEvent.layout.y;
        if (pending.current === key) {
          pending.current = null;
          requestAnimationFrame(() => scrollToSection(key));
        }
      },
    [scrollToSection],
  );

  const schedule = useCallback(
    (key: SectionKey) => {
      pending.current = key;
      requestAnimationFrame(() => scrollToSection(key));
    },
    [scrollToSection],
  );

  return { scrollRef, registerSection, scrollToSection, schedule };
};

const IntegrationsScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const { section } = useLocalSearchParams<{ section?: string }>();
  const normalizedSection = (section?.toLowerCase() ?? 'calendars') as SectionKey;

  const [activeSection, setActiveSection] = useState<SectionKey>(
    SECTION_METADATA[normalizedSection] ? normalizedSection : 'calendars',
  );

  const { scrollRef, registerSection, schedule } = useSectionRegistry();

  const sectionContent = useMemo(() => buildSectionContent(theme), [theme]);

  useEffect(() => {
    if (SECTION_METADATA[normalizedSection]) {
      setActiveSection(normalizedSection);
      schedule(normalizedSection);
    }
  }, [normalizedSection, schedule]);

  const handleFilterPress = useCallback(
    (target: SectionKey) => {
      setActiveSection(target);
      schedule(target);
      router.setParams({ section: target });
    },
    [router, schedule],
  );

  const renderIntegrationRow = useCallback(
    (item: IntegrationItem) => {
      const toneStyles =
        item.statusTone === 'positive'
          ? [styles.statusPill, styles.statusPillPositive]
          : item.statusTone === 'warning'
          ? [styles.statusPill, styles.statusPillWarning]
          : [styles.statusPill];

      const toneTextStyles =
        item.statusTone === 'positive'
          ? [styles.statusPillText, styles.statusPillTextPositive]
          : item.statusTone === 'warning'
          ? [styles.statusPillText, styles.statusPillTextWarning]
          : [styles.statusPillText];

      return (
        <AdaptiveGlassView key={item.key} style={styles.integrationRow}>
          <View style={styles.rowLeft}>
            <AdaptiveGlassView style={styles.iconWrap}>{item.icon}</AdaptiveGlassView>
            <View style={styles.integrationTextGroup}>
              <Text style={styles.integrationName}>{item.name}</Text>
              {item.meta ? <Text style={styles.integrationMeta}>{item.meta}</Text> : null}
            </View>
          </View>
          <AdaptiveGlassView style={toneStyles}>
            <Text style={toneTextStyles}>{item.statusLabel}</Text>
          </AdaptiveGlassView>
        </AdaptiveGlassView>
      );
    },
    [styles],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {(Object.keys(SECTION_METADATA) as SectionKey[]).map((key) => (
          <View
            key={key}
            style={styles.section}
            onLayout={registerSection(key)}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{SECTION_METADATA[key].title}</Text>
              <Text style={styles.sectionMeta}>{SECTION_METADATA[key].activeLabel}</Text>
            </View>
            <AdaptiveGlassView style={styles.sectionCard}>
              {sectionContent[key].map(renderIntegrationRow)}
            </AdaptiveGlassView>
          </View>
        ))}

        <AdaptiveGlassView style={styles.footerCard}>
          <Pressable onPress={() => router.push('/(tabs)/more/settings')}>
            <AdaptiveGlassView style={styles.footerButton}>
              <ChevronRight size={16} color={theme.colors.textPrimary} />
              <Text style={styles.footerButtonText}>Find other integrations</Text>
            </AdaptiveGlassView>
          </Pressable>
        </AdaptiveGlassView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default IntegrationsScreen;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  Mail,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkle,
  Star,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { Theme, useAppTheme } from '@/constants/theme';

type SectionKey = 'popular' | 'manuals' | 'videos' | 'contact';

type PopularQuestion = {
  id: string;
  title: string;
};

type ManualItem = {
  id: string;
  title: string;
  duration: string;
};

type VideoItem = {
  id: string;
  title: string;
  duration: string;
  isChannel?: boolean;
};

type SupportChannel = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  cta?: string;
  tone?: 'positive' | 'warning';
};

const SECTION_METADATA: Record<SectionKey, { title: string; subTitle: string }> = {
  popular: {
    title: 'Popular questions',
    subTitle: 'Your teammates looked into these recently',
  },
  manuals: {
    title: 'Manuals',
    subTitle: 'Step-by-step guides to master LEORA',
  },
  videos: {
    title: 'Video tutorials',
    subTitle: 'Learn faster with concise walkthroughs',
  },
  contact: {
    title: 'Contact support',
    subTitle: 'Reach out and we will be right with you',
  },
};

const POPULAR_QUESTIONS: PopularQuestion[] = [
  { id: 'voice-transaction', title: 'How to add transaction with voice?' },
  { id: 'premium-offers', title: 'What Premium offers?' },
  { id: 'focus-mode', title: 'How focus mode works?' },
  { id: 'export-data', title: 'Can we export data?' },
  { id: 'change-currency', title: 'How to change the currency?' },
];

const MANUAL_ITEMS: ManualItem[] = [
  { id: 'quick-start', title: 'Quick start', duration: '5 mins' },
  { id: 'financials', title: 'Financials controlling', duration: '9 mins' },
  { id: 'planning', title: 'Planning and goals', duration: '11 mins' },
  { id: 'habit', title: 'Habit forming', duration: '7 mins' },
  { id: 'ai-functions', title: 'AI functions', duration: '6 mins' },
  { id: 'pro-guides', title: 'Professionals guides', duration: '12 mins' },
];

const VIDEO_ITEMS: VideoItem[] = [
  { id: 'intro', title: 'First steps into LEORA', duration: '3:45' },
  { id: 'voice', title: 'Voice typing', duration: '2:15' },
  { id: 'budget', title: 'Budget settings', duration: '4:30' },
  { id: 'focus', title: 'Focus Mode', duration: '3:00' },
  { id: 'channel', title: 'Youtube channel', duration: '', isChannel: true },
];

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingBottom: 32
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
      paddingTop: theme.spacing.lg,
      gap: theme.spacing.xl,
    },
    filtersWrapper: {
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
          ? 'rgba(40,43,55,0.55)'
          : 'rgba(226,232,240,0.72)',
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
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
    sectionHeader: {
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
      gap: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      letterSpacing: -0.25,
    },
    sectionSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      letterSpacing: 0.3,
    },
    sectionCard: {
      gap: theme.spacing.sm,
    },
    accordionRow: {
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(35,38,52,0.7)'
          : 'rgba(226,232,240,0.8)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    accordionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    manualRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(38,42,54,0.75)'
          : 'rgba(233,236,244,0.85)',
    },
    manualTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    manualDuration: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    videoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(38,42,54,0.78)'
          : 'rgba(233,236,244,0.88)',
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flex: 1,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(41,44,60,0.8)'
          : 'rgba(216,222,233,0.9)',
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    rowMeta: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    supportRow: {
      gap: theme.spacing.sm,
    },
    supportRowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(27,29,39,0.75)'
          : 'rgba(226,232,240,0.85)',
    },
    supportCTA: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.4,
      color: theme.colors.primary,
    },
    supportCTAWarning: {
      color: theme.colors.warning,
    },
    supportCTAPositive: {
      color: theme.colors.success,
    },
    footerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
    },
    footerButton: {
      flex: 1,
      minWidth: '48%',
      borderRadius: theme.radius.full,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(38,42,54,0.82)'
          : 'rgba(226,232,240,0.82)',
    },
    footerButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
  });

const useSectionRegistry = () => {
  const mapRef = useRef<Partial<Record<SectionKey, number>>>({});
  const scrollRef = useRef<ScrollView | null>(null);
  const pending = useRef<SectionKey | null>(null);

  const scrollToSection = useCallback((key: SectionKey) => {
    const y = mapRef.current[key];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(y - 96, 0), animated: true });
    }
  }, []);

  const register = useCallback(
    (key: SectionKey) =>
      (event: { nativeEvent: { layout: { y: number } } }) => {
        mapRef.current[key] = event.nativeEvent.layout.y;
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

  return { scrollRef, register, schedule };
};

const SupportScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const { section } = useLocalSearchParams<{ section?: string }>();
  const normalizedSection = (section?.toLowerCase() ?? 'popular') as SectionKey;

  const [activeSection, setActiveSection] = useState<SectionKey>(
    SECTION_METADATA[normalizedSection] ? normalizedSection : 'popular',
  );

  const { scrollRef, register, schedule } = useSectionRegistry();

  useEffect(() => {
    if (SECTION_METADATA[normalizedSection]) {
      setActiveSection(normalizedSection);
      schedule(normalizedSection);
    }
  }, [normalizedSection, schedule]);

  const handleFilter = useCallback(
    (target: SectionKey) => {
      setActiveSection(target);
      schedule(target);
      router.setParams({ section: target });
    },
    [router, schedule],
  );

  const renderPopular = useCallback(
    () => (
      <View style={styles.sectionCard}>
        {POPULAR_QUESTIONS.map((item) => (
          <AdaptiveGlassView key={item.id} style={styles.accordionRow}>
            <Text style={styles.accordionText}>{item.title}</Text>
            <ArrowRight size={16} color={theme.colors.textSecondary} />
          </AdaptiveGlassView>
        ))}
        <Pressable onPress={() => console.log('Open FAQ')}>
          <Text style={styles.supportCTA}>All FAQ</Text>
        </Pressable>
      </View>
    ),
    [styles.accordionRow, styles.accordionText, styles.sectionCard, styles.supportCTA, theme.colors.textSecondary],
  );

  const renderManuals = useCallback(
    () => (
      <View style={styles.sectionCard}>
        {MANUAL_ITEMS.map((item) => (
          <AdaptiveGlassView key={item.id} style={styles.manualRow}>
            <View style={styles.rowLeft}>
              <AdaptiveGlassView style={styles.iconWrap}>
                <BookOpen size={18} color={theme.colors.iconText} />
              </AdaptiveGlassView>
              <Text style={styles.manualTitle}>{item.title}</Text>
            </View>
            <Text style={styles.manualDuration}>{item.duration}</Text>
          </AdaptiveGlassView>
        ))}
        <Pressable onPress={() => console.log('All manuals')}>
          <Text style={styles.supportCTA}>All manuals</Text>
        </Pressable>
      </View>
    ),
    [
      styles.sectionCard,
      styles.manualRow,
      styles.rowLeft,
      styles.iconWrap,
      styles.manualTitle,
      styles.manualDuration,
      styles.supportCTA,
      theme.colors.iconText,
    ],
  );

  const renderVideos = useCallback(
    () => (
      <View style={styles.sectionCard}>
        {VIDEO_ITEMS.map((item) => (
          <AdaptiveGlassView key={item.id} style={styles.videoRow}>
            <View style={styles.rowLeft}>
              <AdaptiveGlassView style={styles.iconWrap}>
                {item.isChannel ? (
                  <Sparkle size={18} color="#FF4D4F" />
                ) : (
                  <Play size={18} color={theme.colors.iconText} />
                )}
              </AdaptiveGlassView>
              <Text style={styles.rowTitle}>{item.title}</Text>
            </View>
            {item.duration ? <Text style={styles.rowMeta}>{item.duration}</Text> : null}
          </AdaptiveGlassView>
        ))}
      </View>
    ),
    [styles.sectionCard, styles.videoRow, styles.rowLeft, styles.iconWrap, styles.rowTitle, styles.rowMeta, theme.colors.iconText],
  );

  const renderSupport = useCallback(() => {
    const channels: SupportChannel[] = [
      {
        id: 'chat',
        icon: <MessageCircle size={18} color={theme.colors.iconText} />,
        title: 'Chat support',
        subtitle: 'Average response time: 5 min',
        cta: 'Start',
        tone: 'positive',
      },
      {
        id: 'email',
        icon: <Mail size={18} color={theme.colors.iconText} />,
        title: 'Email support@leora.app',
        cta: 'Email',
      },
      {
        id: 'telegram',
        icon: <MessageCircle size={18} color={theme.colors.iconText} />,
        title: 'Telegram @leora_support',
        cta: 'Open',
      },
      {
        id: 'premium',
        icon: <Star size={18} color={theme.colors.iconText} />,
        title: 'Premium support',
        subtitle: '< 1 hour',
        cta: 'Priority',
        tone: 'positive',
      },
      {
        id: 'free',
        icon: <ShieldCheck size={18} color={theme.colors.iconText} />,
        title: 'Free support',
        subtitle: '< 24 hours',
        cta: 'Standard',
        tone: 'warning',
      },
    ];

    return (
      <View style={styles.supportRow}>
        {channels.map((channel) => (
          <AdaptiveGlassView key={channel.id} style={styles.supportRowItem}>
            <View style={styles.rowLeft}>
              <AdaptiveGlassView style={styles.iconWrap}>{channel.icon}</AdaptiveGlassView>
              <View>
                <Text style={styles.rowTitle}>{channel.title}</Text>
                {channel.subtitle ? <Text style={styles.rowMeta}>{channel.subtitle}</Text> : null}
              </View>
            </View>
            {channel.cta ? (
              <Text
                style={[
                  styles.supportCTA,
                  channel.tone === 'positive' && styles.supportCTAPositive,
                  channel.tone === 'warning' && styles.supportCTAWarning,
                ]}
              >
                {channel.cta}
              </Text>
            ) : null}
          </AdaptiveGlassView>
        ))}

        <View style={styles.footerActions}>
          <Pressable >
            <AdaptiveGlassView style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Report error</Text>
            </AdaptiveGlassView>
          </Pressable>
          <Pressable>
            <AdaptiveGlassView style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Suggest a feature</Text>
            </AdaptiveGlassView>
          </Pressable>
        </View>
      </View>
    );
  }, [
    styles.supportRow,
    styles.supportRowItem,
    styles.rowLeft,
    styles.iconWrap,
    styles.rowTitle,
    styles.rowMeta,
    styles.supportCTA,
    styles.supportCTAPositive,
    styles.supportCTAWarning,
    styles.footerActions,
    styles.footerButton,
    styles.footerButtonText,
    theme.colors.iconText,
  ]);

  const renderSection = useCallback(
    (key: SectionKey) => {
      switch (key) {
        case 'popular':
          return renderPopular();
        case 'manuals':
          return renderManuals();
        case 'videos':
          return renderVideos();
        case 'contact':
          return renderSupport();
        default:
          return null;
      }
    },
    [renderManuals, renderPopular, renderSupport, renderVideos],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {(Object.keys(SECTION_METADATA) as SectionKey[]).map((key) => (
          <View key={key} style={{ gap: 12 }} onLayout={register(key)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{SECTION_METADATA[key].title}</Text>
              <Text style={styles.sectionSubtitle}>{SECTION_METADATA[key].subTitle}</Text>
            </View>
            {renderSection(key)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportScreen;

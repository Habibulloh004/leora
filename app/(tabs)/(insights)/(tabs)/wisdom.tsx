import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowRight,
  BookOpen,
  Heart,
  Lightbulb,
  MessageCircle,
  Plus,
  RefreshCcw,
  Search,
  Share2,
  Star,
  Target,
  type LucideIcon,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import type { Theme } from '@/constants/theme';
import { useAppTheme } from '@/constants/theme';

type Quote = {
  text: string;
  author: string;
  context: string;
};

type FavoriteQuote = {
  id: string;
  text: string;
  author: string;
};

type Advisor = {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  insight: string;
  reminder: string;
  recommendation: string;
  challenge: string;
};

const QUOTE_OF_DAY: Quote = {
  text: 'Путь в тысячу миль начинается с одного шага',
  author: 'Лао-цзы',
  context: 'You have 3 big projects. Start small — with the first task.',
};

const APPLICATION_MESSAGE =
  "Your goal 'Buy a car' may seem far away, but you have already covered 82% of the way. Today's contribution of 50,000 is your 'one step' toward the big goal.";

const FAVORITES: FavoriteQuote[] = [
  {
    id: 'tree',
    text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
    author: 'Chinese Proverb',
  },
  {
    id: 'excellence',
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Aristotle',
  },
];

const CHALLENGE_QUOTE: Quote = {
  text: 'Rise every time you fall.',
  author: 'Aristotle',
  context: 'Task: Don’t skip your morning workout',
};

const ADVISORS: Advisor[] = [
  {
    id: 'buffett',
    name: 'Уоррен Баффет',
    role: 'Financial Advisor',
    icon: BookOpen,
    insight: 'Your entertainment expenses have increased by 35%.',
    reminder: 'Remember: Wealth is built not on how much you earn, but on how much you save.',
    recommendation: 'Recommended 50/30/20 rule: 50% essentials, 30% wants, 20% savings.',
    challenge: 'Your current proportions: 45 / 40 / 15',
  },
  {
    id: 'musk',
    name: 'Илон Маск',
    role: 'Productivity Advisor',
    icon: Target,
    insight: '2 hours on social media every day? That’s 14 hours a week.',
    reminder:
      'In that time, you could learn a new language or master a programming skill. Use time boxing to divide your day into 15-minute blocks.',
    recommendation: 'Challenge of the day: Spend the day without social media and invest that time into your project.',
    challenge: 'Your progress: 45/120 minutes this week',
  },
  {
    id: 'marcus',
    name: 'Марк Аврелий',
    role: 'Balancing Advisor',
    icon: Star,
    insight: 'Missed meditation for 3 days.',
    reminder: 'Consistency matters. Start small — just 2 minutes of morning meditation.',
    recommendation: 'Today’s reflection: You have power over your mind, not outside events.',
    challenge: 'Your progress: 4 / 7 days this week',
  },
];

const CATEGORIES = [
  'All',
  'Motivation',
  'Discipline',
  'Finance',
  'Productivity',
  'Balance',
  'Relations',
];

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl + 32,
      gap: theme.spacing.xxl,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      letterSpacing: 0.2,
    },
    sectionDate: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
    quoteCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    quoteText: {
      fontSize: 20,
      lineHeight: 28,
      color: theme.colors.textPrimary,
      letterSpacing: 0.2,
    },
    quoteAuthor: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'right',
    },
    quoteContext: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    quoteActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    bulbHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    applicationCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      backgroundColor:
        theme.colors.card,
      gap: theme.spacing.md,
    },
    bodyText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    ctaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      alignSelf: 'flex-start',
    },
    ctaText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    libraryCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      backgroundColor:theme.colors.card,
    },
    tabRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    tabChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      backgroundColor:theme.colors.card,
    },
    tabChipActive: {
      backgroundColor:theme.colors.card,
    },
    chipText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    chipTextActive: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    favoriteBlock: {
      gap: theme.spacing.sm,
    },
    favoriteTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    favoriteQuote: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    favoriteAuthor: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: 'right',
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      alignSelf: 'flex-start',
    },
    challengeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    challengeStatus: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    challengeCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    challengeText: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      lineHeight: 24,
    },
    searchField: {
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor:theme.colors.card,
    },
    searchPlaceholder: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    advisorsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    advisorList: {
      gap: theme.spacing.lg,
    },
    advisorCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    advisorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    advisorName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    advisorRole: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    advisorBody: {
      gap: theme.spacing.xs,
    },
    advisorText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    advisorActions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
    },
    advisorAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    advisorActionText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    addMentorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      borderRadius: theme.radius.full,
      paddingVertical: theme.spacing.md,
      backgroundColor:theme.colors.card,
    },
    addMentorText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
  });

const WisdomTab: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Wisdom of the day</Text>
          <Text style={styles.sectionDate}>6 January</Text>
        </View>
        <View style={styles.divider} />
        <AdaptiveGlassView style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            “{QUOTE_OF_DAY.text}”
          </Text>
          <Text style={styles.quoteAuthor}>— {QUOTE_OF_DAY.author}</Text>
          <Text style={styles.quoteContext}>Context: {QUOTE_OF_DAY.context}</Text>
          <View style={styles.quoteActions}>
            <View style={styles.actionButton}>
              <Heart size={16} color={theme.colors.textSecondary} />
              <Text style={styles.actionText}>Add to favorites</Text>
            </View>
            <View style={styles.actionButton}>
              <RefreshCcw size={16} color={theme.colors.textSecondary} />
              <Text style={styles.actionText}>Show another</Text>
            </View>
            <View style={styles.actionButton}>
              <Share2 size={16} color={theme.colors.textSecondary} />
              <Text style={styles.actionText}>Share</Text>
            </View>
          </View>
        </AdaptiveGlassView>
      </View>

      <View style={styles.section}>
        <View style={styles.bulbHeader}>
          <Lightbulb size={16} color={theme.colors.textSecondary} />
          <Text style={styles.sectionTitle}>Application today</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.applicationCard}>
          <Text style={styles.bodyText}>{APPLICATION_MESSAGE}</Text>
          <View style={styles.ctaRow}>
            <Plus size={16} color={theme.colors.textSecondary} />
            <Text style={styles.ctaText}>Make a contribution now</Text>
            <ArrowRight size={16} color={theme.colors.textSecondary} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Wisdoms library</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.libraryCard}>
          <View style={styles.tabRow}>
            {CATEGORIES.map((category, index) => {
              const active = index === 0;
              return (
                <View
                  key={category}
                  style={[styles.tabChip, active && styles.tabChipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {category}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.favoriteBlock}>
            <Text style={styles.favoriteTitle}>Favorite</Text>
            {FAVORITES.map((quote) => (
              <View key={quote.id} style={{ gap: 4 }}>
                <Text style={styles.favoriteQuote}>“{quote.text}”</Text>
                <Text style={styles.favoriteAuthor}>— {quote.author}</Text>
              </View>
            ))}
            <View style={styles.linkRow}>
              <Heart size={14} color={theme.colors.textSecondary} />
              <Text style={styles.actionText}>Show all favorites</Text>
            </View>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <View style={styles.challengeHeader}>
              <View style={styles.linkRow}>
                <Share2 size={14} color={theme.colors.textSecondary} />
                <Text style={styles.favoriteTitle}>Quotes challenge</Text>
              </View>
              <Text style={styles.challengeStatus}>Active</Text>
            </View>
            <Text style={styles.favoriteQuote}>
              “{CHALLENGE_QUOTE.text}”
            </Text>
            <Text style={styles.favoriteAuthor}>— {CHALLENGE_QUOTE.author}</Text>
          </View>

          <AdaptiveGlassView style={styles.challengeCard}>
            <Text style={styles.challengeText}>
              “{CHALLENGE_QUOTE.text}”
            </Text>
            <Text style={styles.bodyText}>Your progress: 3 / 7 days</Text>
            <Text style={styles.bodyText}>{CHALLENGE_QUOTE.context}</Text>
            <View style={styles.linkRow}>
              <MessageCircle size={14} color={theme.colors.textSecondary} />
              <Text style={styles.actionText}>Mark as completed</Text>
            </View>
          </AdaptiveGlassView>
        </View>

        <View style={styles.searchField}>
          <Search size={16} color={theme.colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search by author or theme</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.advisorsHeader}>
          <Text style={styles.sectionTitle}>Your board of advisors</Text>
          <Text style={styles.sectionDate}>Edit</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.advisorList}>
          {ADVISORS.map((advisor) => {
            const Icon = advisor.icon;
            return (
              <AdaptiveGlassView key={advisor.id} style={styles.advisorCard}>
                <View style={styles.advisorHeader}>
                  <View>
                    <Text style={styles.advisorName}>{advisor.name}</Text>
                    <Text style={styles.advisorRole}>{advisor.role}</Text>
                  </View>
                  <Icon size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.advisorBody}>
                  <Text style={styles.advisorText}>{advisor.insight}</Text>
                  <Text style={styles.advisorText}>{advisor.reminder}</Text>
                  <Text style={styles.advisorText}>{advisor.recommendation}</Text>
                  <Text style={styles.advisorText}>{advisor.challenge}</Text>
                </View>
                <View style={styles.advisorActions}>
                  <View style={styles.advisorAction}>
                    <MessageCircle size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.advisorActionText}>Ask a question</Text>
                  </View>
                  <View style={styles.advisorAction}>
                    <Target size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.advisorActionText}>Action plan</Text>
                  </View>
                </View>
              </AdaptiveGlassView>
            );
          })}
        </View>
        <View style={styles.addMentorButton}>
          <Plus size={16} color={theme.colors.textSecondary} />
          <Text style={styles.addMentorText}>Add new Mentor</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default WisdomTab;

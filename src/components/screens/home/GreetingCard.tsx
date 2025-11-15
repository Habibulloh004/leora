import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
import { useLocalization } from '@/localization/useLocalization';

interface GreetingCardProps {
  userName?: string;
  date?: Date;
}

export default function GreetingCard({
  userName = 'Sarvar',
  date,
}: GreetingCardProps) {
  const theme = useAppTheme();
  const displayDate = date ?? new Date();
  const { strings, locale } = useLocalization();

  const greetingText = useMemo(() => {
    const hour = displayDate.getHours();
    if (hour < 12) return strings.home.greeting.morning;
    if (hour < 18) return strings.home.greeting.afternoon;
    return strings.home.greeting.evening;
  }, [displayDate, strings.home.greeting.afternoon, strings.home.greeting.evening, strings.home.greeting.morning]);

  const formattedDate = useMemo(() => {
    return displayDate.toLocaleDateString(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [displayDate, locale]);

  const styles = createStyles(theme);

  return (
    <AdaptiveGlassView style={styles.card}>
      <View style={styles.content}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textPrimary }]}>
            {greetingText}, {userName}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textMuted }]}>{formattedDate}</Text>
        </View>
      </View>
    </AdaptiveGlassView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: theme.colors.card,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
});

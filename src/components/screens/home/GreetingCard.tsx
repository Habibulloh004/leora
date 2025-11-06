import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

interface GreetingCardProps {
  userName?: string;
  date?: Date;
}

export default function GreetingCard({
  userName = 'Sardor',
  date,
}: GreetingCardProps) {
  const theme = useAppTheme();
  const displayDate = date ?? new Date();

  const getGreeting = () => {
    const hour = displayDate.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    return displayDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const styles = createStyles(theme);

  return (
    <AdaptiveGlassView style={styles.card}>
      <View style={styles.content}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textPrimary }]}>
            {getGreeting()}, {userName}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textMuted }]}>{getFormattedDate()}</Text>
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

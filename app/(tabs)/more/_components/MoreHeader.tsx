import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/constants/theme';
import GradientText from '@/components/ui/GradientText';

export default function MoreHeader() {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.borderMuted ?? theme.colors.border,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <GradientText containerStyle={styles.leftLabelContainer} style={styles.leftLabel}>
        PREMIUM
      </GradientText>

      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>MORE</Text>

      <GradientText containerStyle={styles.rightLabelContainer} style={styles.rightLabel}>
        15 MARCH
      </GradientText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  leftLabelContainer: {
    position: 'absolute',
    left: 20,
  },
  leftLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  rightLabelContainer: {
    position: 'absolute',
    right: 20,
  },
  rightLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
});

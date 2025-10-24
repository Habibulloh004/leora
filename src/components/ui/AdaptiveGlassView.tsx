// src/components/ui/AdaptiveGlassView.tsx
import React from 'react';
import { StyleSheet, ViewStyle, View, Platform } from 'react-native';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import { useAppTheme } from '@/constants/theme';

interface AdaptiveGlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const AdaptiveGlassView: React.FC<AdaptiveGlassViewProps> = ({
  children,
  style,
}) => {
  const theme = useAppTheme();

  // For Android, use a semi-transparent background with theme colors
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // For iOS, use expo-glass-effect with dynamic tint
  // Dark theme uses 'regular' style, light theme uses 'clear' style
  const glassStyle = 'clear';

  return (
      <GlassView tintColor={theme.colors.glassTinColor} isInteractive glassEffectStyle={glassStyle} style={[styles.container, style]}>
        {children}
      </GlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
});

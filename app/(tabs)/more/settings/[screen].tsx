import React, { useEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import Placeholder from '../_components/Placeholder';

const SETTINGS_CONFIG: Record<string, { title: string; description: string; emoji?: string }> = {
  appearance: { title: 'Appearance', description: 'Switch between light and dark themes.', emoji: '🎨' },
  notifications: { title: 'Notifications', description: 'Choose how and when you receive alerts.', emoji: '🔔' },
  assistant: { title: 'AI Assistant', description: 'Configure your productivity copilot preferences.', emoji: '🤖' },
  security: { title: 'Security', description: 'Manage authentication, biometrics, and safety.', emoji: '🔐' },
  language: { title: 'Language & Region', description: 'Select your preferred language and locale.', emoji: '🌐' },
};

export default function MoreSettingsScreen() {
  const { screen } = useLocalSearchParams<{ screen?: string | string[] }>();
  const navigation = useNavigation();

  const slug = Array.isArray(screen) ? screen[0] : screen ?? '';
  const config = SETTINGS_CONFIG[slug] ?? { title: 'Settings', description: 'Configuration coming soon.' };

  useEffect(() => {
    navigation.setOptions({ title: config.title });
  }, [config.title, navigation]);

  return <Placeholder title={config.title} description={config.description} emoji={config.emoji} />;
}

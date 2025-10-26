import React, { useEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import Placeholder from '../_components/Placeholder';

const HELP_CONFIG: Record<string, { title: string; description: string; emoji?: string }> = {
  manual: { title: 'User Manual', description: 'Step-by-step guidance for every feature.', emoji: '📘' },
  faq: { title: 'FAQ', description: 'Quick answers to the most common questions.', emoji: '❓' },
  support: { title: 'Support', description: 'Reach our support team any time you need help.', emoji: '🛟' },
  about: { title: 'About LEORA', description: 'Learn about our mission and team.', emoji: 'ℹ️' },
};

export default function MoreHelpScreen() {
  const { topic } = useLocalSearchParams<{ topic?: string | string[] }>();
  const navigation = useNavigation();

  const slug = Array.isArray(topic) ? topic[0] : topic ?? '';
  const config = HELP_CONFIG[slug] ?? { title: 'Help', description: 'Guides coming soon.' };

  useEffect(() => {
    navigation.setOptions({ title: config.title });
  }, [config.title, navigation]);

  return <Placeholder title={config.title} description={config.description} emoji={config.emoji} />;
}

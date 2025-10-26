import React, { useEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import Placeholder from './_components/Placeholder';

const PAGE_CONFIG: Record<string, { title: string; description: string; emoji?: string }> = {
  profile: { title: 'Profile', description: 'Manage your personal information and photo.', emoji: '👤' },
  premium: { title: 'Premium Status', description: 'See benefits, billing details, and upgrade options.', emoji: '💎' },
  achievements: { title: 'Achievements', description: 'Track progress toward your productivity goals.', emoji: '🏆' },
  statistics: { title: 'Statistics', description: 'Review trends and detailed usage insights.', emoji: '📊' },
};

export default function MorePageScreen() {
  const { page } = useLocalSearchParams<{ page?: string | string[] }>();
  const navigation = useNavigation();

  const slug = Array.isArray(page) ? page[0] : page ?? '';
  const config = PAGE_CONFIG[slug] ?? { title: 'More', description: 'Coming soon.' };

  useEffect(() => {
    navigation.setOptions({ title: config.title });
  }, [config.title, navigation]);

  return <Placeholder title={config.title} description={config.description} emoji={config.emoji} />;
}

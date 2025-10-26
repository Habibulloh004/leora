import React, { useEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import Placeholder from '../_components/Placeholder';

const DATA_CONFIG: Record<string, { title: string; description: string; emoji?: string }> = {
  backup: { title: 'Backup & Restore', description: 'Create backups or restore your workspace.', emoji: '☁️' },
  export: { title: 'Export Data', description: 'Download reports or export to external tools.', emoji: '📤' },
  cache: { title: 'Clear Cache', description: 'Free up storage by clearing temporary data.', emoji: '🧹' },
};

export default function MoreDataScreen() {
  const { screen } = useLocalSearchParams<{ screen?: string | string[] }>();
  const navigation = useNavigation();

  const slug = Array.isArray(screen) ? screen[0] : screen ?? '';
  const config = DATA_CONFIG[slug] ?? { title: 'Data', description: 'Data tools coming soon.' };

  useEffect(() => {
    navigation.setOptions({ title: config.title });
  }, [config.title, navigation]);

  return <Placeholder title={config.title} description={config.description} emoji={config.emoji} />;
}

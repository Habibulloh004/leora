import React, { useEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import Placeholder from '../_components/Placeholder';

const INTEGRATION_CONFIG: Record<string, { title: string; description: string; emoji?: string }> = {
  calendars: { title: 'Calendar Integrations', description: 'Connect Google, iCloud, and other calendars.', emoji: '🗓️' },
  banks: { title: 'Bank Connections', description: 'Securely link your financial accounts.', emoji: '🏦' },
  apps: { title: 'App Integrations', description: 'Sync with your favourite productivity apps.', emoji: '🧩' },
  devices: { title: 'Connected Devices', description: 'Manage wearables and companion devices.', emoji: '📱' },
};

export default function MoreIntegrationScreen() {
  const { integration } = useLocalSearchParams<{ integration?: string | string[] }>();
  const navigation = useNavigation();

  const slug = Array.isArray(integration) ? integration[0] : integration ?? '';
  const config = INTEGRATION_CONFIG[slug] ?? { title: 'Integrations', description: 'Connectors coming soon.' };

  useEffect(() => {
    navigation.setOptions({ title: config.title });
  }, [config.title, navigation]);

  return <Placeholder title={config.title} description={config.description} emoji={config.emoji} />;
}

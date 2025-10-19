// src/components/widget/UniversalWidget.tsx
import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { AVAILABLE_WIDGETS, WidgetType } from '@/config/widgetConfig';
import { useWidgetStoreHydrated } from '@/stores/widgetStore';

interface UniversalWidgetProps {
  widgetId: WidgetType;
  onRemove?: () => void;
  editMode?: boolean;
}

export default function UniversalWidget({
  widgetId,
}: UniversalWidgetProps) {
  const hasHydrated = useWidgetStoreHydrated();
  const widget = AVAILABLE_WIDGETS[widgetId];
  
  // Show loading while store is hydrating from AsyncStorage
  if (!hasHydrated) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  }

  // If widget config doesn't exist, return null
  if (!widget) {
    return null;
  }

  const WidgetComponent = widget.component;

  return (
    <View style={styles.container}>
      <WidgetComponent {...widget.defaultProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical:12
  },
  loadingContainer: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
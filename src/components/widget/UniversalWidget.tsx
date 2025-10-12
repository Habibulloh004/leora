// src/components/widget/UniversalWidget.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AVAILABLE_WIDGETS, WidgetType } from '@/config/widgetConfig';

interface UniversalWidgetProps {
  widgetId: WidgetType;
  onRemove?: () => void; // Keep for potential future use, but not used now
  editMode?: boolean; // Keep for potential future use, but not used now
}

export default function UniversalWidget({
  widgetId,
}: UniversalWidgetProps) {
  const widget = AVAILABLE_WIDGETS[widgetId];
  
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
  },
});
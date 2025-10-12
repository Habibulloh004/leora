import React from 'react';
import { StyleSheet, View ,Text} from 'react-native';
import { AVAILABLE_WIDGETS, WidgetType } from '@/config/widgetConfig';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface UniversalWidgetProps {
  widgetId: WidgetType;
  onRemove?: () => void;
  editMode?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (newIndex: number) => void;
}

export default function UniversalWidget({
  widgetId,
  onRemove,
  editMode = false,
  onDragStart,
  onDragEnd,
}: UniversalWidgetProps) {
  const widget = AVAILABLE_WIDGETS[widgetId];
  const WidgetComponent = widget.component;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .enabled(editMode)
    .onStart(() => {
      scale.value = withSpring(1.05);
      onDragStart?.();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      onDragEnd?.(0); // Calculate new index based on position
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {editMode && (
          <View style={styles.editOverlay}>
            <View style={styles.removeButton}>
              <Text style={styles.removeText}>×</Text>
            </View>
          </View>
        )}
        <WidgetComponent {...widget.defaultProps} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  editOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
});
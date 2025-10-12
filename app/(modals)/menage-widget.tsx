// app/(modals)/menage-widget.tsx
import { AVAILABLE_WIDGETS, WidgetType } from '@/config/widgetConfig';
import { X, GripVertical, Plus, Minus } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@active_widgets';

export default function ManageWidgetModal() {
  const router = useRouter();
  const [activeWidgets, setActiveWidgets] = useState<WidgetType[]>([
    'daily-tasks',
    'goals',
    'habits',
    'weekly-review',
  ]);

  const inactiveWidgets = Object.keys(AVAILABLE_WIDGETS).filter(
    (id) => !activeWidgets.includes(id as WidgetType)
  ) as WidgetType[];

  const handleAddWidget = (widgetId: WidgetType) => {
    setActiveWidgets([...activeWidgets, widgetId]);
  };

  const handleRemoveWidget = (widgetId: WidgetType) => {
    setActiveWidgets(activeWidgets.filter((id) => id !== widgetId));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newOrder = [...activeWidgets];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setActiveWidgets(newOrder);
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activeWidgets));
      router.back();
    } catch (error) {
      console.error('Error saving widgets:', error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Widgets</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Active Widgets Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACTIVE WIDGETS</Text>
            <Text style={styles.sectionSubtitle}>
              Drag to reorder • Tap minus to remove
            </Text>

            {activeWidgets.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No active widgets</Text>
                <Text style={styles.emptySubtext}>Add widgets from below</Text>
              </View>
            ) : (
              <View style={styles.widgetList}>
                {activeWidgets.map((widgetId, index) => (
                  <DraggableWidgetItem
                    key={widgetId}
                    widgetId={widgetId}
                    index={index}
                    onRemove={() => handleRemoveWidget(widgetId)}
                    onReorder={handleReorder}
                    totalItems={activeWidgets.length}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Available Widgets Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AVAILABLE WIDGETS</Text>
            <Text style={styles.sectionSubtitle}>Tap plus to add</Text>

            {inactiveWidgets.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>All widgets are active</Text>
              </View>
            ) : (
              <View style={styles.widgetList}>
                {inactiveWidgets.map((widgetId) => (
                  <AvailableWidgetItem
                    key={widgetId}
                    widgetId={widgetId}
                    onAdd={() => handleAddWidget(widgetId)}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// Draggable Widget Item for Active Widgets
interface DraggableWidgetItemProps {
  widgetId: WidgetType;
  index: number;
  onRemove: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  totalItems: number;
}

function DraggableWidgetItem({
  widgetId,
  index,
  onRemove,
  onReorder,
  totalItems,
}: DraggableWidgetItemProps) {
  const widget = AVAILABLE_WIDGETS[widgetId];
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;
      const itemHeight = 80;
      const newIndex = Math.round(index + translateY.value / itemHeight);
      const clampedIndex = Math.max(0, Math.min(totalItems - 1, newIndex));

      if (clampedIndex !== index) {
        runOnJS(onReorder)(index, clampedIndex);
      }

      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: isDragging.value ? 0.7 : 1,
    zIndex: isDragging.value ? 100 : 1,
  }));

  return (
    <Animated.View style={[styles.widgetItem, animatedStyle]}>
      <GestureDetector gesture={gesture}>
        <View style={styles.dragHandle}>
          <GripVertical color="#7E8491" size={24} />
        </View>
      </GestureDetector>

      <View style={styles.widgetInfo}>
        <Text style={styles.widgetIcon}>{widget.icon}</Text>
        <View style={styles.widgetText}>
          <Text style={styles.widgetTitle}>{widget.title}</Text>
          <Text style={styles.widgetDescription}>{widget.description}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={onRemove} style={styles.actionButton}>
        <View style={[styles.actionIcon, styles.removeIcon]}>
          <Minus color="#FFFFFF" size={20} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Available Widget Item
interface AvailableWidgetItemProps {
  widgetId: WidgetType;
  onAdd: () => void;
}

function AvailableWidgetItem({ widgetId, onAdd }: AvailableWidgetItemProps) {
  const widget = AVAILABLE_WIDGETS[widgetId];

  return (
    <View style={styles.widgetItem}>
      <View style={styles.widgetInfo}>
        <Text style={styles.widgetIcon}>{widget.icon}</Text>
        <View style={styles.widgetText}>
          <Text style={styles.widgetTitle}>{widget.title}</Text>
          <Text style={styles.widgetDescription}>{widget.description}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={onAdd} style={styles.actionButton}>
        <View style={[styles.actionIcon, styles.addIcon]}>
          <Plus color="#FFFFFF" size={20} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E8491',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7E8491',
    marginBottom: 16,
  },
  widgetList: {
    gap: 12,
  },
  widgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34343D',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  widgetInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  widgetIcon: {
    fontSize: 32,
  },
  widgetText: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  widgetDescription: {
    fontSize: 14,
    color: '#7E8491',
  },
  actionButton: {
    padding: 8,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    backgroundColor: '#4CAF50',
  },
  removeIcon: {
    backgroundColor: '#F44336',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7E8491',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7E8491',
  },
});
// app/(modals)/manage-widget.tsx
import { AVAILABLE_WIDGETS, WidgetType } from '@/config/widgetConfig';
import { useWidgetStore, useWidgetStoreHydrated } from '@/stores/widgetStore';
import { X, GripVertical, Plus, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import Sortable from 'react-native-sortables';
import type { SortableGridDragEndParams, SortableGridRenderItem } from 'react-native-sortables';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';

export default function ManageWidgetModal() {
  const router = useRouter();
  const hasHydrated = useWidgetStoreHydrated();

  // Get state and actions from Zustand store
  const { activeWidgets: storeActiveWidgets, setActiveWidgets } = useWidgetStore();

  const [activeWidgets, setActiveWidgetsLocal] = useState<WidgetType[]>(storeActiveWidgets || []);

  useEffect(() => {
    setActiveWidgetsLocal(storeActiveWidgets || []);
  }, [storeActiveWidgets]);

  const inactiveWidgets = useMemo<WidgetType[]>(() => {
    return Object.keys(AVAILABLE_WIDGETS).filter(
      (id) => !activeWidgets.includes(id as WidgetType)
    ) as WidgetType[];
  }, [activeWidgets]);

  const handleAddWidget = useCallback((widgetId: WidgetType) => {
    setActiveWidgetsLocal((prev) => {
      if (prev.includes(widgetId)) {
        return prev;
      }
      const updated = [...prev, widgetId];
      setActiveWidgets(updated);
      return updated;
    });
  }, [setActiveWidgets]);

  const handleRemoveWidget = useCallback((widgetId: WidgetType) => {
    setActiveWidgetsLocal((prev) => {
      const updated = prev.filter((id) => id !== widgetId);
      setActiveWidgets(updated);
      return updated;
    });
  }, [setActiveWidgets]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Save to store after drag ends
  const handleDragEnd = useCallback(({ data }: SortableGridDragEndParams<WidgetType>) => {
    setActiveWidgetsLocal(data);
    setActiveWidgets(data);
  }, [setActiveWidgets]);

  const renderInactiveWidget = useCallback<SortableGridRenderItem<WidgetType>>(
    ({ item: widgetId }) => {
      const widget = AVAILABLE_WIDGETS[widgetId];

      const Icon = widget.icon;

      return (
        <View style={styles.widgetItem}>
          <View style={styles.widgetInfo}>
            <View style={styles.widgetIconBadge}>
              <Icon size={18} color={Colors.textPrimary} />
            </View>
            <View style={styles.widgetText}>
              <Text style={styles.widgetTitle}>{widget.title}</Text>
              <Text style={styles.widgetDescription}>{widget.description}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => handleAddWidget(widgetId)} style={styles.actionButton}>
            <View style={[styles.actionIcon, styles.addIcon]}>
              <Plus color={Colors.textPrimary} size={18} />
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [handleAddWidget]
  );

  const renderActiveWidget = useCallback<SortableGridRenderItem<WidgetType>>(
    ({ item: widgetId }) => {
      const widget = AVAILABLE_WIDGETS[widgetId];
      const Icon = widget.icon;

      const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
      ) => {
        const scale = dragX.interpolate({
          inputRange: [-100, 0],
          outputRange: [1, 0],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            style={[
              styles.deleteAction,
              {
                transform: [{ scale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemoveWidget(widgetId)}
            >
              <Trash2 color={Colors.textPrimary} size={24} />
            </TouchableOpacity>
          </Animated.View>
        );
      };

      return (
        <Swipeable
          renderRightActions={renderRightActions}
          overshootRight={false}
          friction={2}
        >
          <View style={styles.widgetItem}>
            <Sortable.Handle>
              <View style={styles.dragHandle}>
                <GripVertical color={Colors.textSecondary} size={24} />
              </View>
            </Sortable.Handle>

            <View style={styles.widgetInfo}>
              <View style={styles.widgetIconBadge}>
                <Icon size={18} color={Colors.textPrimary} />
              </View>
              <View style={styles.widgetText}>
                <Text style={styles.widgetTitle}>{widget.title}</Text>
                <Text style={styles.widgetDescription}>{widget.description}</Text>
              </View>
            </View>
          </View>
        </Swipeable>
      );
    },
    [handleRemoveWidget]
  );

  // Show loading while store is hydrating from AsyncStorage
  if (!hasHydrated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color={Colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Widgets</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.success} />
          <Text style={styles.loadingText}>Loading widgets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Widgets</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Active Widgets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE WIDGETS</Text>
          <Text style={styles.sectionSubtitle}>
            Drag to reorder • Swipe left to remove
          </Text>

          {activeWidgets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No active widgets</Text>
              <Text style={styles.emptySubtext}>Add widgets from below</Text>
            </View>
          ) : (
            <View style={styles.sortableContainer}>
              <Sortable.Grid
                activeItemScale={1.05}
                columns={1}
                data={activeWidgets}
                overDrag="vertical"
                renderItem={renderActiveWidget}
                rowGap={12}
                customHandle
                onDragEnd={handleDragEnd}
              />
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
            <View style={styles.sortableContainer}>
              <Sortable.Grid
                activeItemScale={1.05}
                columns={1}
                data={inactiveWidgets}
                overDrag="vertical"
                renderItem={renderInactiveWidget}
                rowGap={12}
              />
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  sortableContainer: {
    flex: 1,
  },
  widgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    minHeight: 72,
    borderWidth: 1,
    borderColor: Colors.border,
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
  widgetIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetText: {
    flex: 1,
    gap: 4,
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  widgetDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    backgroundColor: Colors.primary,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginLeft: 12,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

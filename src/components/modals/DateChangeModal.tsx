import React, { ForwardedRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { Colors } from '@/constants/theme';

interface DateModalProps {
  onDismiss?: () => void;
  onSelectDate?: (date: string) => void;
}

function DateChangeModalComponent(
  { onDismiss, onSelectDate }: DateModalProps,
  ref: ForwardedRef<BottomSheetHandle>
) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const sheetHeight = useMemo(() => Math.round(height * 0.5), [height]);
  const translateY = React.useRef(new Animated.Value(-sheetHeight)).current;

  useEffect(() => {
    if (!visible) {
      translateY.setValue(-sheetHeight);
    }
  }, [sheetHeight, translateY, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    translateY.stopAnimation();
    translateY.setValue(-sheetHeight);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetHeight, translateY, visible]);

  const dismiss = useCallback(() => {
    if (!visible) {
      return;
    }
    translateY.stopAnimation();
    Animated.timing(translateY, {
      toValue: -sheetHeight,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setVisible(false);
        onDismiss?.();
      }
    });
  }, [onDismiss, sheetHeight, translateY, visible]);

  const present = useCallback(() => {
    if (visible) {
      return;
    }
    setVisible(true);
  }, [visible]);

  useImperativeHandle(
    ref,
    () => ({
      present,
      dismiss,
    }),
    [dismiss, present]
  );

  const handleClose = useCallback(() => {
    dismiss();
  }, [dismiss]);

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      setSelected(day.dateString);
      onSelectDate?.(day.dateString);
    },
    [onSelectDate]
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              minHeight: sheetHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.sheetContent, { paddingTop: insets.top + 16 }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Select Date</Text>
              <Pressable onPress={handleClose} hitSlop={10}>
                <Ionicons name="close" size={26} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.calendarWrapper}>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={
                  selected
                    ? { [selected]: { selected: true, selectedColor: Colors.primary } }
                    : undefined
                }
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: Colors.textSecondary,
                  dayTextColor: Colors.textPrimary,
                  monthTextColor: Colors.textPrimary,
                  arrowColor: Colors.textPrimary,
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: Colors.primary,
                }}
                style={styles.calendar}
              />
            </View>

            {selected && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>Selected: {selected}</Text>
                <Pressable onPress={handleClose} style={styles.confirmButton}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay.heavy,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    elevation: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  calendar: {
    backgroundColor: 'transparent',
  },
  calendarWrapper: {
    flex: 1,
  },
  footer: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default React.forwardRef<BottomSheetHandle, DateModalProps>(DateChangeModalComponent);

import React, {
  ForwardedRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

import CustomBottomSheet, { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { Colors } from '@/constants/Colors';

interface DateModalProps {
  onDismiss?: () => void;
  onSelectDate?: (date: string) => void;
}

function DateChangeModalComponent(
  { onDismiss, onSelectDate }: DateModalProps,
  ref: ForwardedRef<BottomSheetHandle>
) {
  const internalRef = useRef<BottomSheetHandle>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => internalRef.current?.present(),
      dismiss: () => internalRef.current?.dismiss(),
    }),
    []
  );

  const handleClose = useCallback(() => {
    internalRef.current?.dismiss();
    onDismiss?.();
  }, [onDismiss]);

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      setSelected(day.dateString);
      onSelectDate?.(day.dateString);
    },
    [onSelectDate]
  );

  return (
    <CustomBottomSheet
      ref={internalRef}
      snapPoints={['CONTENT_HEIGHT']}
      onDismiss={onDismiss}
      contentContainerStyle={styles.sheetContent}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Select Date</Text>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Ionicons name="close" size={26} color={Colors.textSecondary} />
        </Pressable>
      </View>

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

      {selected && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Selected: {selected}</Text>
          <Pressable onPress={handleClose} style={styles.confirmButton}>
            <Text style={styles.confirmText}>Confirm</Text>
          </Pressable>
        </View>
      )}
    </CustomBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingTop: 20,
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

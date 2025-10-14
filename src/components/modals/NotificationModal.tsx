import { Colors } from '@/constants/Colors';
import React, {
  ForwardedRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bell, Dumbbell, PartyPopper } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import CustomBottomSheet, { BottomSheetHandle } from '@/components/modals/BottomSheet';

interface NotificationModalProps {
  onDismiss?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  image?: any;
  icon?: any;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Time to do some SPORT',
    message: 'Arnold Schwarzenegger',
    time: '34m ago',
    image: require('@assets/images/notifImage.jpg'),
    icon: Dumbbell,
  },
  {
    id: '2',
    title: 'Payment Successful',
    message: 'Your monthly subscription is active.',
    time: '1h ago',
    icon: Bell,
  },
  {
    id: '3',
    title: 'Goal achieved 🎯',
    message: 'Weekly progress complete — keep it up!',
    time: 'Yesterday',
    image: require('@assets/images/notifImage.jpg'),
    icon: PartyPopper,
  },
  {
    id: '4',
    title: 'Goal achieved 🎯',
    message: 'Weekly progress complete — keep it up!',
    time: 'Yesterday',
    image: require('@assets/images/notifImage.jpg'),
    icon: PartyPopper,
  },
];

function NotificationModalComponent(
  { onDismiss }: NotificationModalProps,
  ref: ForwardedRef<BottomSheetHandle>
) {
  const internalRef = useRef<BottomSheetHandle>(null);
  const notifications = useMemo(() => MOCK_NOTIFICATIONS, []);

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

  const handleSelect = useCallback((item: NotificationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Notification opened:', item.title);
  }, []);

  return (
    <CustomBottomSheet
      ref={internalRef}
      onDismiss={onDismiss}
      contentContainerStyle={styles.sheetContent}
      isFullScreen
    >
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Ionicons name="close" size={26} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <BottomSheetFlatList
        data={notifications}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.noResults}>No new notifications</Text>}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }: { item: any }) => {
          const IconComponent = item.icon || Bell;

          return (
            <Pressable
              onPress={() => handleSelect(item)}
              style={({ pressed }) => [styles.notificationItem, pressed && { opacity: 0.6 }]}
            >
              <View style={styles.card}>
                <View style={styles.notificationHeader}>
                  <View style={styles.iconBox}>
                    <IconComponent size={20} color="#fff" strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                  </View>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>

                {item.image && (
                  <Image source={item.image} style={styles.notificationImage} resizeMode="cover" />
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </CustomBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notificationItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  notificationTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  notificationMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  notificationTime: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
  notificationImage: {
    width: '100%',
    height: 160,
  },
  noResults: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 40,
  },
});

export default React.forwardRef<BottomSheetHandle, NotificationModalProps>(NotificationModalComponent);

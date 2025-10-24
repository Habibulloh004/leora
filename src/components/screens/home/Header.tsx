import DateChangeModal from '@/components/modals/DateChangeModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { BellFilledIcon, ListSearchIcon } from '@assets/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppTheme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface HeaderProps {
  scrollY?: SharedValue<number>;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  hasNotifications?: boolean;
}

export default function Header({
  scrollY,
  onSearchPress,
  onNotificationPress,
  hasNotifications = true,
}: HeaderProps) {
  const dateSheetRef = useRef<BottomSheetHandle>(null);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const theme = useAppTheme();

  const initials = useMemo(() => {
    const source = user?.fullName || user?.username || 'U';
    return source.slice(0, 1).toUpperCase();
  }, [user]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return {
        transform: [{ translateY: 0 }],
        opacity: 1,
      };
    }

    const progress = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = -100 * progress;
    const opacity = 1 - progress;

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.header, animatedStyle]}>
      <View style={styles.ProfileLogo}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.navigate('/profile')}
          style={[styles.avatar, { backgroundColor: theme.colors.surfaceElevated }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.logo, { color: theme.colors.textPrimary }]}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <Pressable onPress={() => dateSheetRef.current?.present()}>
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>Monday</Text>
          <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>September 8</Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
          <ListSearchIcon color={theme.colors.textSecondary} size={22} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
          <BellFilledIcon color={theme.colors.textSecondary} size={22} />
          {hasNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>
      <DateChangeModal ref={dateSheetRef} />
    </Animated.View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  header: {
    height: 64,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: Platform.OS === 'ios' ? 56 : 34,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    zIndex: 100,
  },
  ProfileLogo: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
  },
  logo: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 4,
    marginLeft: 6,
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFA500',
  },
});

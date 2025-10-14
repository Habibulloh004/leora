import DateChangeModal from '@/components/modals/DateChangeModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { BellFilledIcon, ListSearchIcon } from '@assets/icons';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  return (
    <Animated.View style={[styles.header, animatedStyle]}>
      <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "flex-start" }}>
        <View style={[styles.avatar]}>
          <Text style={styles.logo}>S</Text>
        </View>
      </View>

      <Pressable onPress={() => dateSheetRef.current?.present()}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>Monday</Text>
          <Text style={styles.dateText}>September 8</Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
          <ListSearchIcon color="#A6A6B9" size={22} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
          <BellFilledIcon color="#A6A6B9" size={22} />
          {hasNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>
      <DateChangeModal ref={dateSheetRef} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
    backgroundColor: '#25252B',
    zIndex: 100,
  },
  avatar: {
    padding: 4,
    borderRadius: 100,
    width: 40,
    height: 40,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold"
  },
  dateContainer: {
    flex: 1,
    justifyContent: "center",
    flexDirection: 'column',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#A6A6B9',
  },
  logo: {
    fontSize: 18,
    fontWeight: '400',
    color: '#A6A6B9',
    letterSpacing: 3,
  },
  actions: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: "flex-end"
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

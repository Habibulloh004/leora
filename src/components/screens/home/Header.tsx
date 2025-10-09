import { BellFilledIcon, ListSearchIcon } from '@assets/icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withTiming,
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
  const animatedStyle = useAnimatedStyle(() => {
    // Проверяем что scrollY существует
    if (!scrollY) {
      return {
        transform: [{ translateY: 0 }],
        opacity: 1,
      };
    }

    // Move header up when scrolling down, back down when scrolling up
    const translateY = withTiming(
      interpolate(scrollY.value, [0, 100], [0, -120], 'clamp'),
      { duration: 300 }
    );

    const opacity = withTiming(
      interpolate(scrollY.value, [0, 50], [1, 0], 'clamp'),
      { duration: 250 }
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.header, animatedStyle]}>
      <Text style={styles.logo}>Sarvar</Text>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>Monday</Text>
        <Text style={styles.dateText}>September 8</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
          <ListSearchIcon color="#A6A6B9" size={22} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
          <BellFilledIcon color="#A6A6B9" size={22} />
          {hasNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>
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
    paddingTop:52,
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
    backgroundColor: '#25252B',
    zIndex: 100,
  },
  dateContainer: {
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
    alignItems: 'center',
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
import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import DateChangeModal from '@/components/modals/DateChangeModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { BellFilledIcon, ListSearchIcon } from '@assets/icons';
import ProgressIndicators from './ProgressIndicators';

type HeaderMode = 'overlay' | 'inline';

interface HeaderProps {
  scrollY?: SharedValue<number>;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  hasNotifications?: boolean;
  mode?: HeaderMode;
}

const HEADER_FADE_THRESHOLD = 110;
const STATS_APPEAR_START = 20;
const STATS_APPEAR_END = 160;

export default function Header({
  scrollY,
  onSearchPress,
  onNotificationPress,
  hasNotifications = true,
  mode = 'overlay',
}: HeaderProps) {
  const dateSheetRef = useRef<BottomSheetHandle>(null);
  const isOverlay = mode === 'overlay';

  const headerContentStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] };
    }

    if (isOverlay) {
      const progress = interpolate(
        scrollY.value,
        [0, 100],
        [0, 1],
        Extrapolation.CLAMP,
      );
      return {
        opacity: 1 - progress,
        transform: [{ translateY: -progress * 100 }],
      };
    }

    const collapse = interpolate(
      scrollY.value,
      [0, HEADER_FADE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: 1 - collapse,
      transform: [
        { translateY: -collapse * 32 },
        { scale: 1 - collapse * 0.08 },
      ],
    };
  }, [scrollY, isOverlay]);

  const statsStyle = useAnimatedStyle(() => {
    if (isOverlay || !scrollY) {
      return { opacity: 0, transform: [{ translateY: 16 }, { scale: 1 }] };
    }

    const appear = interpolate(
      scrollY.value,
      [STATS_APPEAR_START, STATS_APPEAR_END],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const scale = 1 - appear * 0.12;
    const elevation = appear * 6;

    return {
      opacity: appear,
      transform: [
        { translateY: (1 - appear) * 28 },
        { scale },
      ],
      shadowOpacity: 0.08 + appear * 0.22,
      elevation,
    };
  }, [scrollY, isOverlay]);

  const containerStyles = [
    styles.wrapper,
    isOverlay ? styles.wrapperOverlay : styles.wrapperInline,
  ];

  return (
    <Animated.View style={containerStyles}>
      <Animated.View style={[styles.headerContent, headerContentStyle]}>
        <View style={styles.avatarShell}>
          <View style={styles.avatar}>
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
      </Animated.View>

      {!isOverlay && (
        <Animated.View
          pointerEvents="none"
          style={[styles.statsContainer, styles.statsShadow, statsStyle]}
        >
          <ProgressIndicators
            variant="inline"
            scrollY={scrollY}
            tasks={50}
            budget={90}
            focus={75}
          />
        </Animated.View>
      )}

      <DateChangeModal ref={dateSheetRef} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#25252B',
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
  },
  wrapperOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    zIndex: 100,
  },
  wrapperInline: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  statsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    justifyContent: 'center',
    zIndex: 1,
  },
  statsShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 0,
  },
  avatarShell: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flex: 1,
  },
  avatar: {
    padding: 4,
    borderRadius: 100,
    width: 40,
    height: 40,
    backgroundColor: '#000000',
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

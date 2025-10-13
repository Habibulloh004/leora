import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  scrollY: SharedValue<number>;
  tasks?: number;
  budget?: number;
  focus?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number;
  color: string;
}

// CircularProgress har doim bir xil o'lchamda
const CircularProgress = React.memo(({ progress, color }: CircularProgressProps) => {
  const size = 96;
  const strokeWidth = 7;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    return {
      strokeDashoffset: withTiming(strokeDashoffset, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    };
  });

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#34343D"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <AnimatedCircle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeLinecap="round"
        rotation="-90"
        origin={`${center}, ${center}`}
        animatedProps={animatedProps}
      />
    </Svg>
  );
});

CircularProgress.displayName = 'CircularProgress';

export default function ProgressIndicators({
  scrollY,
  tasks = 50,
  budget = 62,
  focus = 52,
}: Props) {
  const SCROLL_THRESHOLD = 100;

  const TIMING_CONFIG = {
    duration: 350,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  };

  const SPRING_CONFIG = {
    damping: 70,
    stiffness: 300,
  };

  const containerStyle = useAnimatedStyle(() => {
    const height = withTiming(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [160, 40], 'clamp'),
      TIMING_CONFIG
    );

    return { height };
  });

  // Scale orqali kichraytirish - SVG o'lchami o'zgarmaydi!
  const circleContainerStyle = useAnimatedStyle(() => {
    const scale = withSpring(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [1, 0.208], 'clamp'), // 96 -> 20
      SPRING_CONFIG
    );
    const translateX = withSpring(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, -10], 'clamp'),
      SPRING_CONFIG
    );

    const translateY = withSpring(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, 90], 'clamp'),
      SPRING_CONFIG
    );

    return {
      transform: [{ scale }, { translateX }, { translateY }],
    };
  });

  const percentStyle = useAnimatedStyle(() => {
    const opacity = withTiming(
      interpolate(scrollY.value, [0, 50], [1, 0], 'clamp'),
      { duration: 250 }
    );

    const scale = withTiming(
      interpolate(scrollY.value, [0, 50], [1, 0.78], 'clamp'), // 18 -> 14
      { duration: 250 }
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  /* CHANGED: Staggered animation - label moves RIGHT first (0-60), then UP later (40-100).
     This prevents overlap by clearing the circle horizontally before moving vertically. */
  const labelStyle = useAnimatedStyle(() => {
    // Move right early in the animation (completes at 60% of scroll)
    const translateX = withSpring(
      interpolate(scrollY.value, [0, 60], [0, 45], 'clamp'),
      SPRING_CONFIG
    );

    // Move up later in the animation (starts at 40% of scroll)
    const translateY = withSpring(
      interpolate(scrollY.value, [50, SCROLL_THRESHOLD], [0, -44], 'clamp'),
      SPRING_CONFIG
    );

    return {
      transform: [{ translateX }, { translateY }],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const paddingRight = withTiming(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, 55], 'clamp'),
      TIMING_CONFIG
    );

    return {
      paddingRight,
    };
  });

  const colorForValue = (value: number) => {
    if (value >= 80) return '#00E676';
    if (value >= 65) return '#4CAF50';
    if (value >= 50) return '#FFC107';
    if (value >= 35) return '#FF9800';
    return '#F44336';
  };

  const progressItems = [
    { label: 'TASKS', value: tasks, color: colorForValue(tasks) },
    { label: 'BUDGET', value: budget, color: colorForValue(budget) },
    { label: 'FOCUS', value: focus, color: colorForValue(focus) },
  ];

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.innerContainer, progressAnimatedStyle]}>
        {progressItems.map((item, index) => (
          <View key={index} style={styles.itemWrapper}>
            <Animated.View style={[styles.circleContainer, circleContainerStyle]}>
              <CircularProgress
                progress={item.value}
                color={item.color}
              />

              <Animated.Text style={[styles.percentText, percentStyle]}>
                {Math.round(item.value)}%
              </Animated.Text>
            </Animated.View>

            <Animated.Text style={[styles.labelText, labelStyle]}>
              {item.label}
            </Animated.Text>
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25252B',
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
    zIndex: 99,
    justifyContent: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  itemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleContainer: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  percentText: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelText: {
    color: '#A6A6B9',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 8,
  },
});

/*
 * FIX: Used staggered animation timing to prevent overlap during transition.
 * - translateX animates from scrollY 0-60 (label moves right early, clearing the circle)
 * - translateY animates from scrollY 40-100 (label moves up later, after clearing horizontally)
 * This ensures the label is safely to the right side before it starts moving upward.
 */
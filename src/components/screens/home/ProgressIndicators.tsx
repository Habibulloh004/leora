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
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
}

function CircularProgress({ size, strokeWidth, progress, color }: CircularProgressProps) {
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
      {/* Background circle */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
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
}

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
    damping: 25,
    stiffness: 120,
  };

  // Контейнер
  const containerStyle = useAnimatedStyle(() => {
    const height = withTiming(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [160, 40], 'clamp'),
      TIMING_CONFIG
    );

    return { height };
  });

  // Размер кольца - напрямую меняем размер, БЕЗ scale
  const circleContainerStyle = useAnimatedStyle(() => {
    const size = withSpring(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [96, 20], 'clamp'),
      SPRING_CONFIG
    );

    return {
      width: size,
      height: size,
    };
  });

  // Stroke width тоже уменьшаем
  const strokeWidthAnimated = useAnimatedStyle(() => {
    const width = withSpring(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [7, 4], 'clamp'),
      SPRING_CONFIG
    );

    return { width };
  });

  // Проценты
  const percentStyle = useAnimatedStyle(() => {
    const opacity = withTiming(
      interpolate(scrollY.value, [0, 50], [1, 0], 'clamp'),
      { duration: 250 }
    );

    const fontSize = withTiming(
      interpolate(scrollY.value, [0, 50], [18, 14], 'clamp'),
      { duration: 250 }
    );

    return {
      opacity,
      fontSize,
    };
  });

  // Лейбл
  const labelStyle = useAnimatedStyle(() => {
    const translateX = withSpring(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, 42], 'clamp')
    );

    const translateY = withSpring(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, -23], 'clamp')
    );

    const fontSize = withTiming(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [12, 9], 'clamp'),
      TIMING_CONFIG
    );

    const opacity = withTiming(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [1, 0.9], 'clamp'),
      TIMING_CONFIG
    );

    return {
      fontSize,
      opacity,
      transform: [{ translateX }, { translateY }],
    };
  });
  const progressAnimatedStyle = useAnimatedStyle(() => {
    const paddingRight = withTiming(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, 55], 'clamp'),
      TIMING_CONFIG
    );
    const paddingTop = withTiming(
      interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, 20], 'clamp'),
      TIMING_CONFIG
    );

    return {
      paddingRight,
      paddingTop
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
            {/* Кольцо с динамическим размером */}
            <Animated.View style={[styles.circleContainer, circleContainerStyle]}>
              <CircularProgressAnimated
                scrollY={scrollY}
                progress={item.value}
                color={item.color}
                threshold={SCROLL_THRESHOLD}
              />

              {/* Процент в центре */}
              <Animated.Text style={[styles.percentText, percentStyle]}>
                {Math.round(item.value)}%
              </Animated.Text>
            </Animated.View>

            {/* Лейбл */}
            <Animated.Text style={[styles.labelText, labelStyle]}>
              {item.label}
            </Animated.Text>
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

// Обертка для анимированного размера
interface CircularProgressAnimatedProps {
  scrollY: SharedValue<number>;
  progress: number;
  color: string;
  threshold: number;
}

function CircularProgressAnimated({
  scrollY,
  progress,
  color,
  threshold,
}: CircularProgressAnimatedProps) {
  // Используем derived values
  const animatedSize = interpolate(
    scrollY.value,
    [0, threshold],
    [96, 20],
    'clamp'
  );

  const animatedStrokeWidth = interpolate(
    scrollY.value,
    [0, threshold],
    [7, 2.5],
    'clamp'
  );

  return (
    <CircularProgress
      size={animatedSize}
      strokeWidth={animatedStrokeWidth}
      progress={progress}
      color={color}
    />
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  percentText: {
    position: 'absolute',
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  labelText: {
    color: '#A6A6B9',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 8,
  },
});
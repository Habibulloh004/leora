import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme } from '@/constants/theme';
import type { ProgressData } from '@/types/home';

interface Props {
  scrollY: SharedValue<number>;
  data?: ProgressData | null;
  isLoading?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number;
  color: string;
  trackColor: string;
}

const CircularProgress = React.memo(({ progress, color, trackColor }: CircularProgressProps) => {
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
        stroke={trackColor}
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
  data,
  isLoading = false,
}: Props) {
  const theme = useAppTheme();
  const SCROLL_THRESHOLD = 100;
  const hasData = Boolean(data);

  const containerStyle = useAnimatedStyle(() => {
    const collapse = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const height = 180 - collapse * 120;

    return { height };
  });

  const circleContainerStyle = useAnimatedStyle(() => {
    const collapse = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = 1 - collapse * 0.792;
    const translateX = -10 * collapse;
    const translateY = 90 * collapse;

    return {
      transform: [{ scale }, { translateX }, { translateY }],
    };
  });

  const percentStyle = useAnimatedStyle(() => {
    const hideProgress = interpolate(
      scrollY.value,
      [0, 50],
      [0, 1],
      Extrapolation.CLAMP
    );
    const opacity = 1 - hideProgress;
    const scale = 1 - hideProgress * 0.22;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const rightShift = interpolate(
      scrollY.value,
      [0, 60],
      [0, 1],
      Extrapolation.CLAMP
    );
    const verticalShift = interpolate(
      scrollY.value,
      [50, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateX = 45 * rightShift;
    const translateY = -44 * verticalShift;

    return {
      transform: [{ translateX }, { translateY }],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const collapse = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const paddingRight = 55 * collapse;

    return {
      paddingRight,
    };
  });

  const colorForValue = useCallback(
    (value: number, hasContent: boolean) => {
      if (!hasContent) {
        return theme.colors.border;
      }
      if (value >= 66) {
        return theme.colors.success;
      }
      if (value >= 34) {
        return theme.colors.warning;
      }
      return theme.colors.danger;
    },
    [theme.colors.border, theme.colors.danger, theme.colors.success, theme.colors.warning],
  );

  const progressItems = useMemo(
    () => [
      { key: 'tasks', label: 'TASKS', value: data?.tasks ?? 0 },
      { key: 'budget', label: 'BUDGET', value: data?.budget ?? 0 },
      { key: 'focus', label: 'FOCUS', value: data?.focus ?? 0 },
    ],
    [data],
  );

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.innerContainer, progressAnimatedStyle]}>
        {progressItems.map((item) => {
          const progressValue = hasData ? item.value : 0;
          const circleColor = colorForValue(item.value, hasData);
          const valueText = hasData ? `${Math.round(item.value)}%` : '--%';
          const valueColor = hasData ? theme.colors.textPrimary : theme.colors.textSecondary;
          const labelColor = hasData ? theme.colors.textSecondary : theme.colors.textTertiary;

          return (
            <View key={item.key} style={styles.itemWrapper}>
              <Animated.View style={[styles.circleContainer, circleContainerStyle]}>
                <CircularProgress
                  progress={progressValue}
                  color={circleColor}
                  trackColor={theme.mode === "light" ? theme.colors.cardItem : theme.colors.card}
                />

                <Animated.Text style={[styles.percentText, percentStyle, { color: valueColor }]}>
                  {isLoading ? '--%' : valueText}
                </Animated.Text>
              </Animated.View>

              <Animated.Text style={[styles.labelText, labelStyle, { color: labelColor }]}>
                {item.label}
              </Animated.Text>
            </View>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    zIndex: 99,
    justifyContent: 'center',
    paddingTop: 20,
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
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 8,
  },
});

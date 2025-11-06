import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path as SvgPath, G, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.75;
const NUM_LINES = 120; // Количество линий для создания объема
const NUM_POINTS = 60; // Точек на линию
const MAX_AMPLITUDE = 80; // Максимальная высота волны

type PointTemplate = {
  progress: number;
  x: number;
};

type PathRef = {
  setNativeProps: (props: { d?: string }) => void;
} | null;

// Получение цвета и прозрачности для линии
const getLineStyle = (index: number): { color: string; opacity: number; strokeWidth: number } => {
  const position = index / NUM_LINES;
  const centerDistance = Math.abs(position - 0.5) * 2;

  // Определяем цветовую зону
  let color: string;
  let opacity: number;

  if (position < 0.25) {
    // Cyan начало
    color = '#00d4ff';
    opacity = 0.5 + (0.25 - position) * 2;
  } else if (position < 0.4) {
    // Cyan к Purple
    const blend = (position - 0.25) / 0.15;
    color = position < 0.32 ? '#00d4ff' : '#7099ff';
    opacity = 0.7 - blend * 0.2;
  } else if (position < 0.6) {
    // Purple центр
    color = '#b366ff';
    opacity = 0.8 - centerDistance * 0.3;
  } else if (position < 0.75) {
    // Purple к Pink
    const blend = (position - 0.6) / 0.15;
    color = position < 0.68 ? '#b366ff' : '#dd66dd';
    opacity = 0.7 - blend * 0.2;
  } else {
    // Pink конец
    color = '#ff66cc';
    opacity = 0.5 + (position - 0.75) * 2;
  }

  // Толщина линии
  const strokeWidth = 0.8 + (1 - centerDistance) * 1.2;

  return {
    color,
    opacity: Math.min(Math.max(opacity, 0.2), 0.95),
    strokeWidth,
  };
};

const VoiceVisualizerPro: React.FC = () => {
  const timeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const audioLevelRef = useRef(0.5);
  const lineRefs = useRef<PathRef[]>(Array.from({ length: NUM_LINES }, () => null));

  const pointTemplate = useMemo<PointTemplate[]>(() => {
    const startX = CIRCLE_SIZE * 0.08;
    const lineWidth = CIRCLE_SIZE * 0.84;

    return Array.from({ length: NUM_POINTS + 1 }, (_, i) => {
      const progress = i / NUM_POINTS;
      return {
        progress,
        x: startX + progress * lineWidth,
      };
    });
  }, []);

  const yBuffer = useMemo(() => new Float32Array(NUM_POINTS + 1), []);

  const buildWavePath = useCallback(
    (lineIndex: number, time: number, audioLevel: number) => {
      if (!pointTemplate.length) {
        return '';
      }

      const depth = lineIndex / NUM_LINES - 0.5;
      const depthOffset = depth * 30;
      const depthScale = 1 - Math.abs(depth) * 0.5;
      const centerY = CIRCLE_SIZE / 2;
      const basePhase = time * 0.02;
      const linePhase = lineIndex * 0.05;

      for (let i = 0; i < pointTemplate.length; i++) {
        const { progress } = pointTemplate[i];
        const wave1 = Math.sin(progress * Math.PI * 4 + basePhase + linePhase) * 0.35;
        const wave2 = Math.sin(progress * Math.PI * 6 - basePhase * 1.3 + linePhase * 1.2) * 0.25;
        const wave3 = Math.sin(progress * Math.PI * 8 + basePhase * 0.8 + linePhase * 0.8) * 0.2;
        const wave4 = Math.sin(progress * Math.PI * 3 - basePhase * 0.6 + linePhase * 1.5) * 0.15;
        const noise = Math.sin(progress * 50 + time * 0.1 + lineIndex) * 0.05;

        const combinedWave =
          (wave1 + wave2 + wave3 + wave4 + noise) * audioLevel * MAX_AMPLITUDE * depthScale;
        yBuffer[i] = centerY + combinedWave + depthOffset * audioLevel * 0.3;
      }

      const lastPointIndex = pointTemplate.length - 1;
      const pathParts = [`M ${pointTemplate[0].x},${yBuffer[0]}`];

      for (let i = 1; i <= lastPointIndex; i++) {
        const prevIndex = i - 1;
        const nextIndex = i === lastPointIndex ? lastPointIndex : i + 1;

        const p0x = pointTemplate[prevIndex].x;
        const p0y = yBuffer[prevIndex];
        const p1x = pointTemplate[i].x;
        const p1y = yBuffer[i];
        const p2x = pointTemplate[nextIndex].x;
        const p2y = yBuffer[nextIndex];

        const cp1x = p0x + (p1x - p0x) * 0.5;
        const cp1y = p0y + (p1y - p0y) * 0.5;
        const cp2x = p1x - (p2x - p1x) * 0.3;
        const cp2y = p1y - (p2y - p1y) * 0.3;

        pathParts.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1x},${p1y}`);
      }

      return pathParts.join(' ');
    },
    [pointTemplate, yBuffer]
  );

  const lineStyles = useMemo(
    () => Array.from({ length: NUM_LINES }, (_, index) => getLineStyle(index)),
    []
  );

  const lineRefCallbacks = useMemo(
    () =>
      Array.from({ length: NUM_LINES }, (_, index) => (ref: PathRef) => {
        lineRefs.current[index] = ref;
      }),
    []
  );

  // Симуляция изменения аудио уровня
  useEffect(() => {
    const updateAudioLevel = () => {
      const target = 0.4 + Math.random() * 0.6;
      const step = (target - audioLevelRef.current) * 0.15;
      audioLevelRef.current += step;
    };

    const audioInterval = setInterval(updateAudioLevel, 120);
    return () => clearInterval(audioInterval);
  }, []);

  // Основной цикл анимации
  useEffect(() => {
    let isMounted = true;

    const animate = () => {
      if (!isMounted) {
        return;
      }

      timeRef.current += 1;
      const currentTime = timeRef.current;
      const audioLevel = audioLevelRef.current;

      for (let i = 0; i < NUM_LINES; i++) {
        const ref = lineRefs.current[i];
        if (!ref) {
          continue;
        }

        const path = buildWavePath(i, currentTime, audioLevel);
        ref.setNativeProps({ d: path });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [buildWavePath]);

  return (
    <View style={styles.container}>
      {/* Фоновое свечение */}
      <View style={styles.backgroundGlow} />

      <View style={styles.circleContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          <Defs>
            <RadialGradient id="bgGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="rgba(80, 80, 180, 0.03)" />
              <Stop offset="100%" stopColor="rgba(26, 29, 46, 0)" />
            </RadialGradient>
          </Defs>

          {/* Фон круга */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_SIZE / 2 - 2}
            fill="url(#bgGradient)"
          />

          {/* Рендер всех волновых линий */}
          <G>
            {lineStyles.map(({ color, opacity, strokeWidth }, index) => (
              <SvgPath
                key={index}
                ref={lineRefCallbacks[index]}
                d="M 0 0"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={opacity}
              />
            ))}
          </G>

          {/* Граница круга */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_SIZE / 2 - 2}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            fill="none"
          />
        </Svg>

        {/* Центральное свечение */}
        <View style={styles.centerGlow} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>LISTENING</Text>
        <Text style={styles.subtitle}>Speak naturally</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGlow: {
    position: 'absolute',
    width: width * 0.65,
    height: width * 0.65,
    backgroundColor: '#3d4270',
    borderRadius: width * 0.35,
    opacity: 0.12,
    shadowColor: '#5566ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 70,
    elevation: 20,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    position: 'relative',
  },
  centerGlow: {
    position: 'absolute',
    width: CIRCLE_SIZE * 0.45,
    height: CIRCLE_SIZE * 0.22,
    backgroundColor: '#5a5fd5',
    borderRadius: CIRCLE_SIZE,
    opacity: 0.18,
    shadowColor: '#6366ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 55,
    elevation: 18,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: 12,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#8b92a8',
    letterSpacing: 0.5,
  },
});

export default VoiceVisualizerPro;

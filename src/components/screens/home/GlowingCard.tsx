import { Blur, Canvas, Group, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';
import { Gyroscope } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface GlowingCardProps {
  children: React.ReactNode;
  glowColor?: string;
  glowIntensity?: number;
  enableGyroscope?: boolean;
}

export function GlowingCard({
  children,
  glowColor = '#3d7aed',
  glowIntensity = 0.6,
  enableGyroscope = true,
}: GlowingCardProps) {
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
  const [isAvailable, setIsAvailable] = useState(false);

  // Позиция спекулярного блика
  const highlightPos = useSharedValue({ x: dimensions.width / 2, y: dimensions.height / 2 });
  
  // Гироскоп с Reanimated для максимальной производительности
  const gravity = useAnimatedSensor(SensorType.GRAVITY, {
    interval: 16, // 60 FPS
    adjustToInterfaceOrientation: true,
  });

  useEffect(() => {
    if (enableGyroscope) {
      Gyroscope.isAvailableAsync().then(setIsAvailable);
    }
  }, [enableGyroscope]);

  // Вычисляем позицию блика на основе гироскопа
  const highlightPosition = useDerivedValue(() => {
    if (!isAvailable || !enableGyroscope) {
      return { x: dimensions.width / 2, y: dimensions.height * 0.3 };
    }

    const { x, y } = gravity.sensor.value;
    const SENSITIVITY = 30;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Инвертируем оси для естественного движения
    const offsetX = -y * SENSITIVITY;
    const offsetY = x * SENSITIVITY;

    const newX = centerX + offsetX;
    const newY = centerY + offsetY;

    // Плавное обновление с ограничениями
    const clampedX = Math.max(50, Math.min(dimensions.width - 50, newX));
    const clampedY = Math.max(50, Math.min(dimensions.height - 50, newY));

    return { x: clampedX, y: clampedY };
  });

  // Анимированные стили для карточки (легкий параллакс)
  const cardStyle = useAnimatedStyle(() => {
    if (!isAvailable || !enableGyroscope) return {};

    const { x, y } = gravity.sensor.value;
    const TILT_SENSITIVITY = 5;

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: withSpring(`${y * TILT_SENSITIVITY}deg`, { damping: 20 }) },
        { rotateY: withSpring(`${-x * TILT_SENSITIVITY}deg`, { damping: 20 }) },
      ],
    };
  });

  // Конвертируем hex в rgba для свечения
  const glowRgba = hexToRgba(glowColor, glowIntensity);

  return (
    <View style={styles.container}>
      {/* Слой 1: Внешнее свечение (ambient glow) */}
      <View style={[styles.outerGlow, { 
        boxShadow: `
          0 0 30px 10px ${glowRgba},
          0 0 60px 20px ${hexToRgba(glowColor, glowIntensity * 0.6)},
          0 0 100px 40px ${hexToRgba(glowColor, glowIntensity * 0.3)}
        `
      }]} />

      {/* Слой 2: Основная карточка с параллаксом */}
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Слой 3: Базовый фон */}
        <View style={styles.cardBackground}>
          
          {/* Слой 4: Динамический спекулярный блик (Canvas/Skia) */}
          <Canvas style={StyleSheet.absoluteFill}>
            <Group>
              <Blur blur={15} />
              <Rect x={0} y={0} width={dimensions.width} height={dimensions.height}>
                <RadialGradient
                  c={vec(highlightPosition.value.x, highlightPosition.value.y)}
                  r={100}
                  colors={[
                    'rgba(255, 255, 255, 0.6)',
                    'rgba(255, 255, 255, 0.3)',
                    'rgba(255, 255, 255, 0)'
                  ]}
                />
              </Rect>
            </Group>
          </Canvas>

          {/* Слой 5: Верхний градиент (имитация выпуклости) */}
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
            style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
          />

          {/* Слой 6: Контент */}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// Утилита для конвертации hex в rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: 320,
    height: 220,
    borderRadius: 20,
    zIndex: -1,
  },
  card: {
    width: 300,
    height: 200,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cardBackground: {
    flex: 1,
    backgroundColor: '#1D1E22',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10,
  },
});
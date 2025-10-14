// apps/mobile/src/components/LeoraSplashScreen.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface LeoraSplashScreenProps {
  onAnimationComplete?: () => void;
}

const LOADING_TEXTS = [
  'Initializing System',
  'Loading Resources',
  'Preparing Interface',
  'Finalizing Setup',
  'Ready to Launch',
];

// Цветовая палитра LEORA
const COLORS = {
  leoraBlack: '#000000',
  leoraWhite: '#ffffff',
  neutral50: '#fafafa',
  neutral100: '#f4f4f5',
  neutral200: '#e4e4e7',
  neutral300: '#d1d1d6',
  neutral400: '#a1a1aa',
  neutral500: '#71717a',
  neutral600: '#52525b',
  neutral700: '#3f3f46',
  neutral800: '#27272a',
  neutral850: '#1f1f23',
  neutral900: '#18181b',
  neutral925: '#121214',
  neutral950: '#09090b',
};

// Компонент частицы
const Particle = ({ delay, left }: { delay: number; left: string }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.delay(delay * 1000),
        Animated.loop(
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -100,
              duration: 8000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(opacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 1,
                duration: 6400,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
              }),
            ]),
          ])
        ),
      ]).start();
    };

    animate();
  }, [delay, translateY, opacity]);

  // FIX: Create proper typed style object
  const animatedStyle: Animated.WithAnimatedValue<ViewStyle> = {
    left: left as any, // TypeScript workaround for percentage strings
    opacity,
    transform: [{ translateY }],
  };

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
      ]}
    />
  );
};

export default function LeoraSplashScreen({ onAnimationComplete }: LeoraSplashScreenProps) {
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoTranslateY = useRef(new Animated.Value(30)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(15)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.8)).current;
  const gridOpacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    // Запуск всех анимаций
    const startAnimations = () => {
      // Анимация сетки
      Animated.loop(
        Animated.sequence([
          Animated.timing(gridOpacity, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(gridOpacity, {
            toValue: 0.1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Анимация логотипа
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Анимация текста LEORA
      Animated.sequence([
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Анимация подзаголовка
      Animated.sequence([
        Animated.delay(1500),
        Animated.parallel([
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(taglineTranslateY, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Анимация загрузки
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Анимация прогресс-бара
      Animated.sequence([
        Animated.delay(2500),
        Animated.timing(progressWidth, {
          toValue: 100,
          duration: 3000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();

      // Анимация свечения
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimations();

    // Изменение текста загрузки
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex++;
      if (textIndex < LOADING_TEXTS.length) {
        setLoadingText(LOADING_TEXTS[textIndex]);
      }
    }, 1000);

    // Завершение анимации
    const timer = setTimeout(() => {
      clearInterval(textInterval);
      // Анимация исчезновения
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(textInterval);
    };
  }, [
    fadeAnim,
    gridOpacity,
    logoOpacity,
    logoScale,
    logoTranslateY,
    textOpacity,
    textTranslateY,
    taglineOpacity,
    taglineTranslateY,
    loadingOpacity,
    progressWidth,
    glowOpacity,
    onAnimationComplete,
  ]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        },
      ]}
    >
      {/* Фоновая сетка */}
      <Animated.View style={[styles.gridBackground, { opacity: gridOpacity }]}>
        {Array.from({ length: Math.ceil(height / 60) }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: i * 60 }]} />
        ))}
        {Array.from({ length: Math.ceil(width / 60) }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * 60 }]} />
        ))}
      </Animated.View>

      {/* Радиальный градиент */}
      <LinearGradient
        colors={[COLORS.leoraBlack, COLORS.leoraBlack, COLORS.leoraBlack]}
        style={styles.gradientOverlay}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Частицы */}
      <Particle delay={0} left="10%" />
      <Particle delay={2} left="20%" />
      <Particle delay={4} left="30%" />
      <Particle delay={1} left="40%" />
      <Particle delay={3} left="50%" />
      <Particle delay={5} left="60%" />
      <Particle delay={1.5} left="70%" />
      <Particle delay={3.5} left="80%" />
      <Particle delay={0.5} left="90%" />

      {/* Логотип и текст */}
      <View style={styles.logoContainer}>
        {/* Логотип L */}
        <Animated.View
          style={[
            styles.logoMain,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoTranslateY },
                { skewX: '-15deg' },
              ],
            },
          ]}
        >
          {/* Вертикальная часть L */}
          <Animated.View style={[styles.logoVertical, { opacity: glowOpacity }]}>
            <LinearGradient
              colors={[COLORS.neutral50, COLORS.neutral100, COLORS.neutral200, COLORS.neutral300]}
              style={styles.gradientFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </Animated.View>
          
          {/* Горизонтальная часть L */}
          <Animated.View style={[styles.logoHorizontal, { opacity: glowOpacity }]}>
            <LinearGradient
              colors={[COLORS.neutral100, COLORS.neutral200, COLORS.neutral300, COLORS.neutral400]}
              style={styles.gradientFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </Animated.View>

        {/* Текст LEORA */}
        <Animated.Text
          style={[
            styles.brandText,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          LEORA
        </Animated.Text>

        {/* Подзаголовок */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          Order in Tasks & Money
        </Animated.Text>
      </View>

      {/* Индикатор загрузки */}
      <Animated.View style={[styles.loadingContainer, { opacity: loadingOpacity }]}>
        {/* Прогресс-бар */}
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.neutral400, COLORS.neutral200]}
              style={styles.gradientFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
        
        {/* Текст загрузки */}
        <Text style={styles.loadingText}>{loadingText}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.leoraBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: COLORS.neutral925,
  },
  gridLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: COLORS.neutral925,
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: COLORS.neutral700,
    borderRadius: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMain: {
    width: 80,
    height: 100,
    marginBottom: 24,
    position: 'relative',
  },
  logoVertical: {
    position: 'absolute',
    width: 18,
    height: 80,
    top: 0,
    left: 0,
    borderRadius: 2,
    shadowColor: COLORS.leoraWhite,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoHorizontal: {
    position: 'absolute',
    width: 70,
    height: 18,
    bottom: 0,
    left: 0,
    borderRadius: 2,
    shadowColor: COLORS.leoraWhite,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientFill: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  brandText: {
    fontSize: width > 400 ? 36 : 32,
    fontWeight: '900',
    color: COLORS.leoraWhite,
    letterSpacing: width > 400 ? 4 : 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  tagline: {
    fontSize: width > 400 ? 18 : 16,
    fontWeight: '400',
    color: COLORS.neutral500,
    letterSpacing: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: Math.min(300, width * 0.8),
    height: 2,
    backgroundColor: COLORS.neutral900,
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral600,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

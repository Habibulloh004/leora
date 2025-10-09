import { LinearGradient } from 'expo-linear-gradient';
import { DeviceMotion } from 'expo-sensors';
import React, { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface AnimatedBorderCardProps {
  children: ReactNode;
  style?: ViewStyle;
  borderWidth?: number;
  borderOpacity?: number;
  innerPadding?: number;
}

export default function AnimatedBorderCard({
  children,
  style,
  borderWidth = 5,
  borderOpacity = 0.5,
  innerPadding = 2.5,
}: AnimatedBorderCardProps) {
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let subscription: any;

    const setupMotion = async () => {
      try {
        const { status } = await DeviceMotion.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Motion sensor permission not granted');
          return;
        }

        DeviceMotion.setUpdateInterval(16);

        subscription = DeviceMotion.addListener(({ rotation }) => {
          if (!rotation) return;
          
          const { beta, gamma } = rotation;
          const maxAngle = Math.PI / 4;
          
          const normalizedX = Math.max(-1, Math.min(1, gamma / maxAngle));
          const normalizedY = Math.max(-1, Math.min(1, beta / maxAngle));

          Animated.parallel([
            Animated.spring(tiltX, {
              toValue: normalizedX,
              useNativeDriver: false,
              tension: 40,
              friction: 8,
            }),
            Animated.spring(tiltY, {
              toValue: normalizedY,
              useNativeDriver: false,
              tension: 40,
              friction: 8,
            }),
          ]).start();
        });
      } catch (error) {
        console.error('DeviceMotion setup error:', error);
      }
    };

    setupMotion();

    return () => {
      subscription?.remove();
    };
  }, []);

  const topOpacity = tiltY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [borderOpacity, 0.08, 0],
    extrapolate: 'clamp',
  });
  
  const bottomOpacity = tiltY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0.08, borderOpacity],
    extrapolate: 'clamp',
  });
  
  const leftOpacity = tiltX.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [borderOpacity, 0.08, 0],
    extrapolate: 'clamp',
  });
  
  const rightOpacity = tiltX.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0.08, borderOpacity],
    extrapolate: 'clamp',
  });

  const borderRadius = (style as any)?.borderRadius || 16;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.card, { borderRadius }]}>
        {/* Базовый фон с градиентом */}
        <LinearGradient
          colors={['#2A2A32', '#25252B', '#202025']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />

        {/* Тонкая внешняя граница */}
        <View style={[styles.outerBorder, { borderRadius }]} />

        {/* ВЕРХНИЙ КРАЙ */}
        <Animated.View style={[
          styles.edgeTop,
          { 
            opacity: topOpacity,
            height: borderWidth,
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
          }
        ]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.9)',
              'rgba(255,255,255,0.6)',
              'rgba(255,255,255,0.2)',
              'rgba(255,255,255,0)'
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* НИЖНИЙ КРАЙ */}
        <Animated.View style={[
          styles.edgeBottom,
          { 
            opacity: bottomOpacity,
            height: borderWidth,
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
          }
        ]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,0.2)',
              'rgba(255,255,255,0.6)',
              'rgba(255,255,255,0.9)'
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* ЛЕВЫЙ КРАЙ */}
        <Animated.View style={[
          styles.edgeLeft,
          { 
            opacity: leftOpacity,
            width: borderWidth,
            borderTopLeftRadius: borderRadius,
            borderBottomLeftRadius: borderRadius,
          }
        ]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.9)',
              'rgba(255,255,255,0.6)',
              'rgba(255,255,255,0.2)',
              'rgba(255,255,255,0)'
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* ПРАВЫЙ КРАЙ */}
        <Animated.View style={[
          styles.edgeRight,
          { 
            opacity: rightOpacity,
            width: borderWidth,
            borderTopRightRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
          }
        ]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,0.2)',
              'rgba(255,255,255,0.6)',
              'rgba(255,255,255,0.9)'
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Угловые акценты */}
        <Animated.View style={[
          styles.cornerTopLeft,
          { 
            opacity: topOpacity,
            borderTopLeftRadius: borderRadius,
          }
        ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View style={[
          styles.cornerBottomRight,
          { 
            opacity: bottomOpacity,
            borderBottomRightRadius: borderRadius,
          }
        ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Внутренняя маска */}
        <View style={[
          styles.innerMask,
          {
            top: innerPadding,
            left: innerPadding,
            right: innerPadding,
            bottom: innerPadding,
            borderRadius: borderRadius - 2.5,
            backgroundColor: (style as any)?.backgroundColor || '#25252B',
          }
        ]} />

        {/* Внутренний блик */}
        <Animated.View style={[
          styles.innerHighlight,
          { 
            opacity: topOpacity,
            borderTopLeftRadius: borderRadius - 3,
            borderTopRightRadius: borderRadius - 3,
          }
        ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* КОНТЕНТ */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  card: {
    overflow: 'hidden',
    position: 'relative',
  },
  outerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    pointerEvents: 'none',
  },
  edgeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  edgeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  edgeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  edgeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    overflow: 'hidden',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    overflow: 'hidden',
  },
  innerMask: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  innerHighlight: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    height: 40,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  content: {
    padding: 16,
    zIndex: 10,
  },
});
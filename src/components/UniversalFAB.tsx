import * as Haptics from 'expo-haptics';
import { Check, Clock, DollarSign, Minus, Plus, Target, Zap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTab } from '../contexts/TabContext';

interface FABAction {
  id: string;
  icon: any;
  label: string;
}

export default function UniversalFAB() {
  const { activeTab } = useTab();
  const insets = useSafeAreaInsets();

  const [expanded, setExpanded] = useState(false);

  // Универсальная функция для кросс-платформенной вибрации
  // expo-haptics автоматически работает на iOS и Android
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Main overlay + buttons animations (your originals)
  const [rotation] = useState(new Animated.Value(0));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [buttonAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  // Icon crossfade/rotate/scale (PLUS -> MINUS)
  const [iconProgress] = useState(new Animated.Value(0)); // 0 = PLUS, 1 = MINUS

  const actions: FABAction[] = useMemo(() => {
    switch (activeTab) {
      case 'index': // Home
        return [
          { id: 'add-task', icon: Check, label: 'ADD TASK' },
          { id: 'quick-expense', icon: DollarSign, label: 'QUICK EXPENSE' },
          { id: 'start-focus', icon: Clock, label: 'START FOCUS' },
          { id: 'voice-note', icon: Zap, label: 'VOICE NOTE' },
        ];
      case 'finance':
        return [
          { id: 'add-expense', icon: DollarSign, label: 'ADD EXPENSE' },
          { id: 'add-income', icon: Plus, label: 'ADD INCOME' },
          { id: 'transfer', icon: Target, label: 'TRANSFER' },
        ];
      case 'planner':
        return [
          { id: 'add-task', icon: Check, label: 'ADD TASK' },
          { id: 'start-focus', icon: Clock, label: 'START FOCUS' },
        ];
      case 'insights':
      case 'more':
      default:
        return [];
    }
  }, [activeTab]);

  if (actions.length === 0) return null;

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;

    // Rotate main container if you want (kept from your code)
    Animated.spring(rotation, {
      toValue,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Overlay fade
    Animated.timing(overlayOpacity, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Icon PLUS (0) <-> MINUS (1)
    Animated.spring(iconProgress, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 120,
    }).start();

    // Buttons appear/disappear with stagger
    if (!expanded) {
      const animations = buttonAnimations.slice(0, actions.length).map((anim, index) =>
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 50,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        })
      );
      Animated.parallel(animations).start();
    } else {
      const animations = buttonAnimations
        .slice(0, actions.length)
        .reverse()
        .map((anim, index) =>
          Animated.timing(anim, {
            toValue: 0,
            delay: index * 30,
            duration: 150,
            useNativeDriver: true,
          })
        );
      Animated.parallel(animations).start();
    }

    setExpanded(!expanded);
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const bottomOffset = 76 + insets.bottom; // tab bar + safe area

  return (
    <>
      {/* Overlay */}
      <Modal visible={expanded} transparent animationType="fade" statusBarTranslucent>
        <Pressable 
          style={styles.modalContainer} 
          onPress={() => {
            triggerHaptic(); // Вибрация при закрытии FAB через overlay
            toggleExpanded();
          }}
        >
          <Animated.View
            style={[
              styles.overlayContainer,
              { opacity: overlayOpacity },
            ]}
          />
        </Pressable>
      </Modal>

      {/* FAB + Actions */}
      <View style={[styles.container, { bottom: bottomOffset }]} pointerEvents="box-none">
        {/* Action Buttons */}
        {actions.map((action, index) => {
          const Icon = action.icon;
          const animValue = buttonAnimations[index];
          const buttonBottom = 72 + index * 72;

          return (
            <Animated.View
              key={action.id}
              style={[
                styles.actionContainer,
                {
                  bottom: buttonBottom,
                  opacity: animValue,
                  transform: [
                    {
                      scale: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                    {
                      translateY: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents={expanded ? 'auto' : 'none'}
            >
              <Animated.View
                style={[
                  styles.labelContainer,
                  {
                    opacity: animValue,
                    transform: [
                      {
                        translateX: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.label}>{action.label}</Text>
              </Animated.View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  triggerHaptic();
                  toggleExpanded();
                  setTimeout(() => {
                    // handleActionPress
                    switch (action.id) {
                      case 'add-task':
                        console.log('Add Task');
                        break;
                      case 'quick-expense':
                      case 'add-expense':
                        console.log('Add Expense');
                        break;
                      case 'add-income':
                        console.log('Add Income');
                        break;
                      case 'start-focus':
                        console.log('Start Focus');
                        break;
                      case 'transfer':
                        console.log('Transfer');
                        break;
                      case 'voice-note':
                        console.log('Voice Note');
                        break;
                    }
                  }, 300);
                }}
                activeOpacity={0.8}
              >
                <Icon color="#FFFFFF" size={24} strokeWidth={2} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => {
            triggerHaptic();
            toggleExpanded();
          }} 
          activeOpacity={0.9}
        >
          {/* Optional global rotate effect */}
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            {/* Icon stack: PLUS (default) -> MINUS (expanded) */}
            <View style={styles.iconStack}>
              {/* PLUS (visible when collapsed) */}
              <Animated.View
                style={[
                  styles.layeredIcon,
                  {
                    opacity: iconProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0],
                    }),
                    transform: [
                      {
                        rotate: iconProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '90deg'], // rotate out
                        }),
                      },
                      {
                        scale: iconProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.85], // shrink a bit
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Plus color="#ffffff" size={28} strokeWidth={2.5} />
              </Animated.View>

              {/* MINUS (visible when expanded) */}
              <Animated.View
                style={[
                  styles.layeredIcon,
                  {
                    opacity: iconProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                    transform: [
                      {
                        rotate: iconProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['90deg', '-90deg'], // rotate in
                        }),
                      },
                      {
                        scale: iconProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.85, 1], // grow to full
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Minus color="#ffffff" size={28} strokeWidth={2.5} />
              </Animated.View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34343D',
    alignItems: 'center',
    justifyContent: 'center',
    // Выразительная тень для эффекта глубины (как на скриншоте)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },  // Увеличенное смещение для большей глубины
    shadowOpacity: 0.4,  // Более интенсивная тень для заметности на темном фоне
    shadowRadius: 12,  // Большой радиус размытия для мягкого эффекта
    elevation: 12,  // Аналогичная тень для Android
  },
  modalContainer: {
    flex: 1,
    zIndex: 10,
  },
  overlayContainer: {
    flex: 1,
    position: 'relative',
  },
  actionContainer: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    width: '100%',
    zIndex: 999,
    minWidth: 160,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34343D99',
    alignItems: 'center',
    justifyContent: 'center',
    // Выразительная тень для эффекта глубины (как на скриншоте)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },  // Увеличенное смещение
    shadowOpacity: 0.4,  // Более интенсивная тень
    shadowRadius: 12,  // Большой радиус размытия для мягкости
    elevation: 12,  // Аналогичная тень для Android
  },
  labelContainer: {
    backgroundColor: '#34343D99',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    // Выразительная тень для эффекта глубины (как на скриншоте)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },  // Увеличенное смещение
    shadowOpacity: 0.4,  // Более интенсивная тень
    shadowRadius: 12,  // Большой радиус размытия для мягкости
    elevation: 12,  // Аналогичная тень для Android
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Icon layering for crossfade
  iconStack: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layeredIcon: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
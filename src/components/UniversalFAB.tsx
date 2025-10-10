import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Check, Clock, DollarSign, Minus, Plus, Target, Zap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTab } from '../contexts/TabContext';
import VoiceAiModal from './modals/VoiceAiModal';

interface FABAction {
  id: string;
  icon: any;
  label: string;
}

export default function UniversalFAB() {
  const { activeTab } = useTab();
  const insets = useSafeAreaInsets();

  const [expanded, setExpanded] = useState(false);
  const [voiceModaOpen, setVoiceModalOpen] = useState(false)
  const router = useRouter();

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const [rotation] = useState(new Animated.Value(0));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [buttonAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const [iconProgress] = useState(new Animated.Value(0));

  const actions: FABAction[] = useMemo(() => {
    switch (activeTab) {
      case 'index':
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
      default:
        return [];
    }
  }, [activeTab]);

  if (actions.length === 0) return null;

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;

    Animated.spring(rotation, {
      toValue,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();

    Animated.timing(overlayOpacity, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.spring(iconProgress, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 120,
    }).start();

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

  const bottomOffset = 76 + insets.bottom;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay with background image */}
      {expanded && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            triggerHaptic();
            toggleExpanded();
          }}
        >
          <ImageBackground
            source={require('@assets/images/backgroundModal.png')}
            style={StyleSheet.absoluteFill}
            imageStyle={{ opacity: 0.3 }}
          />
        </Pressable>
      )}

      {/* FAB + Actions */}
      <View style={[styles.container, { bottom: bottomOffset }]} pointerEvents="box-none">
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
                        setVoiceModalOpen(true)
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
          <View style={styles.fabBackground}>
            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
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
          </View>
        </TouchableOpacity>
      </View>

      <VoiceAiModal visible={voiceModaOpen} onClose={() => setVoiceModalOpen(false)} />
    </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  fabBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContainer: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    minWidth: 160,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34343D99',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    backgroundColor: '#34343D99',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
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

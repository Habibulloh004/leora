import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Check, Clock, DollarSign, Minus, Plus, Target, Zap, HeartPulse } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTab } from '../contexts/TabContext';
import VoiceAiModal from './modals/VoiceAiModal';
import { AddTaskIcon } from '@assets/icons/AddTaskIcon';
import { QuickExpIcon } from '@assets/icons/QuickExpIcon';
import { AIVoiceIcon } from '@assets/icons/AIVoiceIcon';
import { DebtIcon, InComingIcon, OutComingIcon, TransactionIcon } from '@assets/icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface FABAction {
  id: string;
  icon: any;
  label: string;
}

export default function UniversalFAB() {
  const { activeTab } = useTab();
  const insets = useSafeAreaInsets();
  const isOpen = useSharedValue(false);
  const rotation = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const iconProgress = useSharedValue(0);

  // Animation values for each button
  const buttonAnimations = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

  const [voiceModalOpen, setVoiceModalOpen] = React.useState(false);
  const router = useRouter();

  const actions: FABAction[] = useMemo(() => {
    switch (activeTab) {
      case 'index':
        return [
          { id: 'add-task', icon: AddTaskIcon, label: 'ADD TASK' },
          { id: 'quick-expense', icon: QuickExpIcon, label: 'QUICK EXPENSE' },
          { id: 'start-focus', icon: HeartPulse, label: 'START FOCUS' },
          { id: 'voice-note', icon: AIVoiceIcon, label: 'VOICE NOTE' },
        ];
      case 'finance':
        return [
          { id: 'debt', icon: DebtIcon, label: 'DEBT' },
          { id: 'transaction', icon: TransactionIcon, label: 'TRANSACTION' },
          { id: 'add-outcome', icon: OutComingIcon, label: '-OUTCOME' },
          { id: 'add-income', icon: InComingIcon, label: '+INCOME' },
        ];
      default:
        return [];
    }
  }, [activeTab]);

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const springConfig = {
      damping: 45,
      stiffness: 300,
    };

    const timingConfig = {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    };

    if (isOpen.value) {
      // Closing animation
      rotation.value = withSpring(0, springConfig);
      overlayOpacity.value = withTiming(0, timingConfig);
      iconProgress.value = withSpring(0, springConfig);

      // Animate buttons out in reverse order
      actions.forEach((_, index) => {
        buttonAnimations[index].value = withDelay(
          index * 30,
          withTiming(0, { duration: 150 })
        );
      });
    } else {
      // Opening animation
      rotation.value = withSpring(1, springConfig);
      overlayOpacity.value = withTiming(0.7, timingConfig);
      iconProgress.value = withSpring(1, springConfig);

      // Animate buttons in with stagger
      actions.forEach((_, index) => {
        buttonAnimations[index].value = withDelay(
          index * 50,
          withSpring(1, springConfig)
        );
      });
    }

    isOpen.value = !isOpen.value;
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    width: isOpen ? "100%" : 0,
    height: isOpen ? "100%" : 0
  }));

  const fabRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 90}deg` }],
  }));

  const plusIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - iconProgress.value,
    transform: [
      { rotate: `${iconProgress.value * 90}deg` },
      { scale: 1 - iconProgress.value * 0.15 },
    ],
  }));

  const minusIconStyle = useAnimatedStyle(() => ({
    opacity: iconProgress.value,
    transform: [
      { rotate: `${90 - iconProgress.value * 180}deg` },
      { scale: 0.85 + iconProgress.value * 0.15 },
    ],
  }));

  // Create animated styles for all possible buttons (max 4)
  const button0Style = useAnimatedStyle(() => ({
    bottom: 72,
    opacity: buttonAnimations[0].value,
    transform: [
      { scale: 0.3 + buttonAnimations[0].value * 0.7 },
      { translateY: 20 - buttonAnimations[0].value * 20 },
    ],
  }));

  const button1Style = useAnimatedStyle(() => ({
    bottom: 144,
    opacity: buttonAnimations[1].value,
    transform: [
      { scale: 0.3 + buttonAnimations[1].value * 0.7 },
      { translateY: 20 - buttonAnimations[1].value * 20 },
    ],
  }));

  const button2Style = useAnimatedStyle(() => ({
    bottom: 216,
    opacity: buttonAnimations[2].value,
    transform: [
      { scale: 0.3 + buttonAnimations[2].value * 0.7 },
      { translateY: 20 - buttonAnimations[2].value * 20 },
    ],
  }));

  const button3Style = useAnimatedStyle(() => ({
    bottom: 288,
    opacity: buttonAnimations[3].value,
    transform: [
      { scale: 0.3 + buttonAnimations[3].value * 0.7 },
      { translateY: 20 - buttonAnimations[3].value * 20 },
    ],
  }));

  const label0Style = useAnimatedStyle(() => ({
    opacity: buttonAnimations[0].value,
    transform: [{ translateX: 20 - buttonAnimations[0].value * 20 }],
  }));

  const label1Style = useAnimatedStyle(() => ({
    opacity: buttonAnimations[1].value,
    transform: [{ translateX: 20 - buttonAnimations[1].value * 20 }],
  }));

  const label2Style = useAnimatedStyle(() => ({
    opacity: buttonAnimations[2].value,
    transform: [{ translateX: 20 - buttonAnimations[2].value * 20 }],
  }));

  const label3Style = useAnimatedStyle(() => ({
    opacity: buttonAnimations[3].value,
    transform: [{ translateX: 20 - buttonAnimations[3].value * 20 }],
  }));

  const buttonStyles = [button0Style, button1Style, button2Style, button3Style];
  const labelStyles = [label0Style, label1Style, label2Style, label3Style];

  const bottomOffset = 76 + insets.bottom;

  // Return null after all hooks have been called
  if (actions.length === 0) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}>
      {/* Full Screen Background Overlay */}
      <Animated.View
        pointerEvents={isOpen.value ? "box-none" : "none"}
        style={[
          styles.overlayContainer,
          overlayStyle,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={toggleExpanded}
        >
          <MaskedView
            maskElement={
              <LinearGradient
                colors={['transparent', 'black', 'black']}
                locations={[0, 0.3, 1]}
                style={StyleSheet.absoluteFill}
              />
            }
          >
            <BlurView intensity={50} style={StyleSheet.absoluteFill} />
          </MaskedView>
          <ImageBackground
            source={require('@assets/images/backgroundModal.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlayTint} />
          </ImageBackground>
        </Pressable>
      </Animated.View>
      {/* Button fubs */}
      <View pointerEvents="box-none" style={{ position: 'absolute', bottom: 0, right: 0 }}>
        {/* FAB + Actions */}
        <View style={[styles.container, { bottom: bottomOffset }]} pointerEvents="box-none">
          {actions.map((action, index) => {
            const Icon = action.icon;

            return (
              <Animated.View
                key={action.id}
                style={[styles.actionContainer, buttonStyles[index]]}
              >
                <Animated.View style={[styles.labelContainer, labelStyles[index]]}>
                  <Text style={styles.label}>{action.label}</Text>
                </Animated.View>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    toggleExpanded();
                    setTimeout(() => {
                      switch (action.id) {
                        case 'add-task':
                          router.push('/(modals)/add-task');
                          break;
                        case 'quick-expense':
                        case 'add-expense':
                          console.log('Add Expense');
                          break;
                        case 'add-income':
                          console.log('Add Income');
                          break;
                        case 'start-focus':
                          router.push('/focus-mode');
                          break;
                        case 'transfer':
                          console.log('Transfer');
                          break;
                        case 'voice-note':
                          router.push('/(modals)/voice-ai');
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

          {/* Main FAB - Shadow wrapper */}
          <View style={styles.fabShadowWrapper}>
            <TouchableOpacity
              style={styles.fab}
              onPress={toggleExpanded}
              activeOpacity={0.9}
            >
              <Animated.View style={fabRotationStyle}>
                <View style={styles.iconStack}>
                  <Animated.View style={[styles.layeredIcon, plusIconStyle]}>
                    <Plus color="#ffffff" size={28} strokeWidth={2.5} />
                  </Animated.View>
                  <Animated.View style={[styles.layeredIcon, minusIconStyle]}>
                    <Minus color="#ffffff" size={28} strokeWidth={2.5} />
                  </Animated.View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        <VoiceAiModal visible={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998
  },
  container: {
    position: 'absolute',
    right: 16,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayTint: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  fabShadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 16,
    elevation: 16,
    borderRadius: 28,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34343D',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  labelContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
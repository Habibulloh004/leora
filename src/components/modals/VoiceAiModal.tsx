import { Colors } from '@/constants/Colors';
import React, {
  ForwardedRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import CustomBottomSheet, { BottomSheetHandle } from '@/components/modals/BottomSheet';

interface VoiceAiModalProps {
  onDismiss?: () => void;
}

function VoiceAiModalComponent({ onDismiss }: VoiceAiModalProps, ref: ForwardedRef<BottomSheetHandle>) {
  const internalRef = useRef<BottomSheetHandle>(null);
  const [listening, setListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useImperativeHandle(
    ref,
    () => ({
      present: () => internalRef.current?.present(),
      dismiss: () => internalRef.current?.dismiss(),
    }),
    []
  );

  const triggerPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      { iterations: listening ? -1 : 1 }
    ).start();
  }, [listening, pulseAnim]);

  const handleClose = useCallback(() => {
    internalRef.current?.dismiss();
    onDismiss?.();
  }, [onDismiss]);

  const handleMicPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setListening((prev) => !prev);
    triggerPulse();
  }, [triggerPulse]);

  return (
    <CustomBottomSheet
      ref={internalRef}
      snapPoints={['75%']}
      onDismiss={() => {
        setListening(false);
        onDismiss?.();
      }}
      contentContainerStyle={styles.sheetContent}
      scrollable
      scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Voice AI Assistant</Text>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Ionicons name="close" size={28} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>{listening ? "I'm listening..." : 'Ready to help'}</Text>
        <Text style={styles.description}>
          {listening
            ? "Speak naturally. I'll convert your voice into tasks, notes, or expenses."
            : "Tap the microphone and speak your command. I'll understand and help you."}
        </Text>
      </View>

      <View style={styles.micWrapper}>
        <Animated.View
          style={[
            styles.micOuter,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: listening ? Colors.primary + '33' : Colors.surface,
            },
          ]}
        >
          <Pressable
            onPress={handleMicPress}
            style={[styles.micButton, listening && { backgroundColor: Colors.primary }]}
          >
            <Ionicons
              name={listening ? 'mic' : 'mic-outline'}
              size={42}
              color={listening ? '#FFFFFF' : Colors.textPrimary}
            />
          </Pressable>
        </Animated.View>
        <Text style={styles.micLabel}>{listening ? 'Tap to stop' : 'Tap to start'}</Text>
      </View>
    </CustomBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  micWrapper: {
    alignItems: 'center',
  },
  micOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  micButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});

export default React.forwardRef<BottomSheetHandle, VoiceAiModalProps>(VoiceAiModalComponent);

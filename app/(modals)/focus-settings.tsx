import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useThemeColors } from '@/constants/theme';
import { useFocusSettingsStore } from '@/features/focus/useFocusSettingsStore';
import { useFocusTimerStore } from '@/features/focus/useFocusTimerStore';
import { LOCK_OPTIONS, MOTIVATION_OPTIONS, PRESET_MINUTES, TECHNIQUES, TOGGLE_OPTIONS, MotivationId, LockId, ToggleId } from '@/features/focus/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const ToggleRow = ({
  icon,
  label,
  value,
  onToggle,
  colors,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) => {
  const progress = useSharedValue(value ? 1 : 0);
  const press = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [progress, value]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.97]) }],
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceElevated,
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface, colors.primary]),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, 22]) }],
  }));

  return (
    <AnimatedPressable
      onPress={onToggle}
      onPressIn={() => (press.value = withTiming(1, { duration: 80 }))}
      onPressOut={() => (press.value = withTiming(0, { duration: 120 }))}
      style={[styles.toggleCard, containerStyle]}
    >
      <View style={styles.toggleLeft}>
        <View style={[styles.iconTile, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons name={icon} size={18} color={colors.textSecondary} />
        </View>
        <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      <Animated.View style={[styles.switchTrack, trackStyle]}>
        <Animated.View style={[styles.switchKnob, { backgroundColor: colors.white }, knobStyle]} />
      </Animated.View>
    </AnimatedPressable>
  );
};

const FocusCheckbox = ({
  label,
  value,
  onToggle,
  colors,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) => {
  const progress = useSharedValue(value ? 1 : 0);
  const animatedBox = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.primary]),
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface, colors.overlaySoft]),
  }));
  const checkOpacity = useAnimatedStyle(() => ({ opacity: progress.value }));

  React.useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 180 });
  }, [progress, value]);

  return (
    <Pressable onPress={onToggle} style={styles.checkboxRow}>
      <Animated.View style={[styles.checkboxBox, animatedBox]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.checkboxFill, checkOpacity]}>
          <Feather name="check" size={16} color={colors.white} />
        </Animated.View>
      </Animated.View>
      <Text style={[styles.checkboxLabel, { color: colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
};

const SettingsNumberInput = ({
  value,
  onChange,
  placeholder,
  suffix,
  colors,
  min = 0,
  max = 480,
}: {
  value: number;
  onChange: (next: number) => void;
  placeholder: string;
  suffix: string;
  colors: ReturnType<typeof useThemeColors>;
  min?: number;
  max?: number;
}) => {
  const [textValue, setTextValue] = useState(String(value));

  React.useEffect(() => {
    setTextValue(String(value));
  }, [value]);

  const handleChange = useCallback(
    (next: string) => {
      setTextValue(next);
      const numeric = Number.parseInt(next, 10);
      if (!Number.isNaN(numeric)) onChange(clamp(numeric, min, max));
    },
    [max, min, onChange],
  );

  const handleBlur = useCallback(() => {
    if (textValue.trim() === '') setTextValue(String(value));
  }, [textValue, value]);

  return (
    <View style={[styles.sessionInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TextInput
        value={textValue}
        onChangeText={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType="number-pad"
        style={[styles.sessionInputText, { color: colors.textPrimary }]}
      />
      <Text style={[styles.sessionInputSuffix, { color: colors.textSecondary }]}>{suffix}</Text>
    </View>
  );
};

export default function FocusSettingsModal() {
  const colors = useThemeColors();
  const router = useRouter();

  const motivation = useFocusSettingsStore((state) => state.motivation);
  const locks = useFocusSettingsStore((state) => state.locks);
  const techniqueKey = useFocusSettingsStore((state) => state.techniqueKey);
  const workMinutes = useFocusSettingsStore((state) => state.workMinutes);
  const breakMinutes = useFocusSettingsStore((state) => state.breakMinutes);
  const toggles = useFocusSettingsStore((state) => state.toggles);
  const toggleMotivation = useFocusSettingsStore((state) => state.toggleMotivation);
  const toggleLock = useFocusSettingsStore((state) => state.toggleLock);
  const toggleSetting = useFocusSettingsStore((state) => state.toggleSetting);
  const setTechnique = useFocusSettingsStore((state) => state.setTechnique);
  const setWorkMinutes = useFocusSettingsStore((state) => state.setWorkMinutes);
  const setBreakMinutes = useFocusSettingsStore((state) => state.setBreakMinutes);
  const resetTimer = useFocusTimerStore((state) => state.reset);

  const [pendingMinutes, setPendingMinutes] = useState(workMinutes);
  const [pendingSeconds, setPendingSeconds] = useState(0);

  const handlePreset = useCallback((minutes: number) => {
    setPendingMinutes(minutes);
    setPendingSeconds(0);
  }, []);

  const handleSave = useCallback(() => {
    const total = clamp(pendingMinutes * 60 + pendingSeconds, 1, 24 * 60 * 60);
    setWorkMinutes(Math.max(1, Math.round(total / 60)));
    resetTimer(total);
    router.back();
  }, [pendingMinutes, pendingSeconds, resetTimer, router, setWorkMinutes]);

  const handleReset = useCallback(() => {
    const base = TECHNIQUES[0];
    setTechnique(base.key);
    setWorkMinutes(base.workMinutes);
    setBreakMinutes(base.breakMinutes);
    setPendingMinutes(base.workMinutes);
    setPendingSeconds(0);
    resetTimer(base.workMinutes * 60);
  }, [resetTimer, setBreakMinutes, setTechnique, setWorkMinutes]);

  return (
    <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.background }]} edges={['top', 'right', 'left']}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.flex}>
        <View style={styles.headerRow}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Focus Settings</Text>
          <Pressable onPress={() => router.back()} style={[styles.closeButton, { borderColor: colors.border }]}>
            <Feather name="x" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Focus toggles</Text>
          <View style={styles.toggleList}>
            {TOGGLE_OPTIONS.map((toggle) => (
              <ToggleRow
                key={toggle.id}
                icon={toggle.icon}
                label={toggle.label}
                value={toggles[toggle.id as ToggleId]}
                onToggle={() => toggleSetting(toggle.id as ToggleId)}
                colors={colors}
              />
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Focus duration</Text>
          <View style={styles.presetRow}>
            {PRESET_MINUTES.map((preset) => {
              const selected = pendingMinutes === preset && pendingSeconds === 0;
              return (
                <Pressable
                  key={preset}
                  onPress={() => handlePreset(preset)}
                  style={[
                    styles.presetButton,
                    {
                      backgroundColor: selected ? colors.primary : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.presetButtonLabel, { color: selected ? colors.onPrimary : colors.textPrimary }]}>{preset} min</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sessionGrid}>
            <SettingsNumberInput
              value={pendingMinutes}
              onChange={setPendingMinutes}
              placeholder="Minutes"
              suffix="Minutes"
              colors={colors}
              min={0}
              max={24 * 60}
            />
            <SettingsNumberInput
              value={pendingSeconds}
              onChange={setPendingSeconds}
              placeholder="Seconds"
              suffix="Seconds"
              colors={colors}
              min={0}
              max={59}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Techniques</Text>
          <View style={styles.segmentedControl}>
            {TECHNIQUES.map((item) => {
              const selected = item.key === techniqueKey;
              return (
                <AnimatedPressable
                  key={item.key}
                  onPress={() => setTechnique(item.key)}
                  style={[
                    styles.segmentButton,
                    {
                      backgroundColor: selected ? colors.surface : colors.background,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.segmentLabel, { color: selected ? colors.textPrimary : colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[styles.segmentSummary, { color: selected ? colors.textSecondary : colors.textTertiary }]}>{item.summary}</Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Session duration</Text>
          <View style={styles.sessionGrid}>
            <SettingsNumberInput
              value={workMinutes}
              onChange={setWorkMinutes}
              placeholder="Work"
              suffix="Work time (m)"
              colors={colors}
              min={1}
              max={24 * 60}
            />
            <SettingsNumberInput
              value={breakMinutes}
              onChange={setBreakMinutes}
              placeholder="Break"
              suffix="Break time (m)"
              colors={colors}
              min={0}
              max={24 * 60}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Locks</Text>
          <View style={styles.checkboxGrid}>
            {LOCK_OPTIONS.map((item) => (
              <FocusCheckbox key={item.id} label={item.label} value={locks[item.id as LockId]} onToggle={() => toggleLock(item.id as LockId)} colors={colors} />
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Motivation</Text>
          <View style={styles.checkboxGrid}>
            {MOTIVATION_OPTIONS.map((item) => (
              <FocusCheckbox key={item.id} label={item.label} value={motivation[item.id as MotivationId]} onToggle={() => toggleMotivation(item.id as MotivationId)} colors={colors} />
            ))}
          </View>
        </ScrollView>

        <View style={styles.modalButtonsRow}>
          <Pressable onPress={handleReset} style={[styles.modalButton, styles.modalButtonGhost, { borderColor: colors.border }]}>
            <Text style={[styles.modalButtonGhostText, { color: colors.textSecondary }]}>Reset</Text>
          </Pressable>
          <Pressable onPress={handleSave} style={[styles.modalButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.modalButtonText, { color: colors.onPrimary }]}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modalSafeArea: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  closeButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  modalScroll: { flex: 1 },
  modalContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 18 },
  sectionLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  toggleList: { gap: 12 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 12 },
  presetButton: { flexBasis: '47%', borderRadius: 14, borderWidth: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  presetButtonLabel: { fontSize: 14, fontWeight: '600' },
  sessionGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 12 },
  sessionInput: { flexBasis: '47%', borderRadius: 14, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'column' },
  sessionInputText: { fontSize: 18, fontWeight: '600' },
  sessionInputSuffix: { fontSize: 11, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 },
  segmentedControl: { flexDirection: 'row', gap: 12 },
  segmentButton: { flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center' },
  segmentLabel: { fontSize: 14, fontWeight: '600' },
  segmentSummary: { fontSize: 12, marginTop: 2 },
  checkboxGrid: { gap: 12 },
  toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: { fontSize: 14, fontWeight: '500' },
  switchTrack: { width: 48, height: 26, borderRadius: 14, padding: 2, justifyContent: 'center' },
  switchKnob: { width: 22, height: 22, borderRadius: 11 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkboxBox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  checkboxFill: { alignItems: 'center', justifyContent: 'center' },
  checkboxLabel: { fontSize: 14, fontWeight: '500' },
  modalButtonsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12 },
  modalButton: { flex: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  modalButtonGhost: { borderWidth: 1 },
  modalButtonText: { fontSize: 16, fontWeight: '600' },
  modalButtonGhostText: { fontSize: 16, fontWeight: '500' },
});

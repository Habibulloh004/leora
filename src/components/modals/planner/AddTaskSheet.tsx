// components/modals/planner/AddTaskSheet.tsx
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Switch,
} from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Easing } from 'react-native-reanimated';
import {
  CalendarDays,
  Clock4,
  ChevronDown,
  ChevronUp,
  Zap,
  Flag,
  FolderClosed,
  AtSign,
  Plus,
} from 'lucide-react-native';

import CustomBottomSheet, {
  BottomSheetHandle,
} from '@/components/modals/BottomSheet';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

// =========================
// Types
// =========================
export type EnergyLevel = 'low' | 'medium' | 'high';
export type PriorityLevel = 'low' | 'medium' | 'high';

export type AddTaskPayload = {
  title: string;
  dateMode: 'today' | 'tomorrow' | 'pick';
  date?: string; // ISO 8601, dateMode === 'pick' bo'lsa
  time?: string; // "HH:mm"
  description?: string;

  project?: string;
  context?: string;   // masalan: @work, @home
  energy: EnergyLevel;
  priority: PriorityLevel;

  reminderEnabled: boolean;
  remindBeforeMin?: number; // 5/10/15/30
  repeatEnabled: boolean;
  repeatRule?: string; // masalan: Everyday
  needFocus: boolean;

  subtasks: string[];
};

export interface AddTaskSheetHandle {
  open: () => void;
  close: () => void;
  edit: (initial: Partial<AddTaskPayload>) => void;
}

type Pill = { id: string; label: string };

// =========================
// Constants
// =========================
const DATE_PILLS: Pill[] = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'pick', label: 'Pick a date' },
];

const REMIND_STEPS = [5, 10, 15, 30];

// =========================
// Component
// =========================
const AddTaskSheet = forwardRef<AddTaskSheetHandle, {
  onCreate?: (payload: AddTaskPayload, options?: { keepOpen?: boolean }) => void;
}>(({ onCreate }, ref) => {
  const theme = useAppTheme();
  const sheetRef = useRef<BottomSheetHandle>(null);

  // ---- form state
  const [title, setTitle] = useState('');
  const [dateMode, setDateMode] = useState<'today' | 'tomorrow' | 'pick'>('tomorrow');
  const [date, setDate] = useState<string | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');

  const [project, setProject] = useState<string | undefined>(undefined);
  const [context, setContext] = useState<string | undefined>('@work');
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [priority, setPriority] = useState<PriorityLevel>('medium');

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [remindBeforeMin, setRemindBeforeMin] = useState<number>(15);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatRule, setRepeatRule] = useState<string | undefined>('Everyday');
  const [needFocus, setNeedFocus] = useState(false);

  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);

  // ---- control
  const snapPoints = useMemo<(string | number)[]>((): any => ['78%', '96%'], []);

  const open = useCallback((): any => sheetRef.current?.present(), []);
  const close = useCallback((): any => sheetRef.current?.dismiss(), []);

  const edit = useCallback((initial: Partial<AddTaskPayload>) => {
    setTitle(initial.title ?? '');
    setDateMode((initial.dateMode as any) ?? 'tomorrow');
    setDate(initial.date);
    setTime(initial.time);
    setDescription(initial.description ?? '');
    setProject(initial.project);
    setContext(initial.context ?? '@work');
    setEnergy(initial.energy ?? 'medium');
    setPriority(initial.priority ?? 'medium');
    setReminderEnabled(initial.reminderEnabled ?? true);
    setRemindBeforeMin(initial.remindBeforeMin ?? 15);
    setRepeatEnabled(initial.repeatEnabled ?? false);
    setRepeatRule(initial.repeatRule ?? 'Everyday');
    setNeedFocus(initial.needFocus ?? false);
    setSubtasks(initial.subtasks ?? []);
    open();
  }, [open]);

  useImperativeHandle(ref, () => ({ open, close, edit }), [open, close, edit]);

  // ---- actions
  const cycleReminder = useCallback(() => {
    const idx = REMIND_STEPS.indexOf(remindBeforeMin);
    const next = REMIND_STEPS[(idx + 1) % REMIND_STEPS.length];
    setRemindBeforeMin(next);
  }, [remindBeforeMin]);

  const addSubtask = useCallback(() => {
    setSubtasks((prev) => [...prev, '']);
  }, []);

  const updateSubtask = useCallback((i: number, v: string) => {
    setSubtasks((prev) => prev.map((s, idx) => (idx === i ? v : s)));
  }, []);

  const buildPayload = useCallback((): AddTaskPayload => ({
    title,
    dateMode,
    date,
    time,
    description,
    project,
    context,
    energy,
    priority,
    reminderEnabled,
    remindBeforeMin,
    repeatEnabled,
    repeatRule,
    needFocus,
    subtasks,
  }), [
    title, dateMode, date, time, description, project, context,
    energy, priority, reminderEnabled, remindBeforeMin,
    repeatEnabled, repeatRule, needFocus, subtasks,
  ]);

  const handleCreate = useCallback((keepOpen?: boolean) => {
    const payload = buildPayload();
    onCreate?.(payload, { keepOpen });
    if (!keepOpen) close();
    // optional: reset for next
    if (!keepOpen) {
      setTitle('');
      setDescription('');
      setTime(undefined);
      setDate(undefined);
      setProject(undefined);
      setEnergy('medium');
      setPriority('medium');
      setSubtasks([]);
      setNeedFocus(false);
      setRepeatEnabled(false);
      setReminderEnabled(true);
      setRemindBeforeMin(15);
    }
  }, [buildPayload, onCreate, close]);

  // ---- UI helpers
  const EnergyView = () => {
    const iconColor = (lvl: EnergyLevel) =>
      energy === lvl ? theme.colors.white : theme.colors.textSecondary;

    const pillBg = (lvl: EnergyLevel) =>
      energy === lvl ? theme.colors.primary : 'transparent';

    const pillBorder = (lvl: EnergyLevel) =>
      energy === lvl ? theme.colors.primary : theme.colors.border;

    const count = (lvl: EnergyLevel) => (lvl === 'low' ? 1 : lvl === 'medium' ? 2 : 3);

    return (
      <View style={styles.inlineRow}>
        {(['low', 'medium', 'high'] as EnergyLevel[]).map((lvl) => (
          <Pressable
            key={lvl}
            onPress={() => setEnergy(lvl)}
            style={({ pressed }) => [
              styles.pill,
              { backgroundColor: pillBg(lvl), borderColor: pillBorder(lvl) },
              pressed && styles.pressed,
            ]}
          >
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {Array.from({ length: count(lvl) }).map((_, i) => (
                <Zap key={i} size={14} color={iconColor(lvl)} />
              ))}
            </View>
          </Pressable>
        ))}
      </View>
    );
  };

  const PriorityView = () => {
    const label = (p: PriorityLevel) =>
      p === 'low' ? 'Low' : p === 'medium' ? 'Medium' : 'High';

    return (
      <View style={styles.inlineRow}>
        {(['low', 'medium', 'high'] as PriorityLevel[]).map((lvl) => {
          const active = priority === lvl;
          return (
            <Pressable
              key={lvl}
              onPress={() => setPriority(lvl)}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: active ? theme.colors.primary : 'transparent',
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Flag size={14} color={active ? theme.colors.white : theme.colors.textSecondary} />
                <Text
                  style={[
                    styles.pillLabel,
                    { color: active ? theme.colors.white : theme.colors.textSecondary },
                  ]}
                >
                  {label(lvl)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const DatePills = () => (
    <View style={styles.inlineRow}>
      {DATE_PILLS.map((p) => {
        const active = p.id === dateMode;
        return (
          <Pressable
            key={p.id}
            onPress={() => setDateMode(p.id as any)}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: active ? theme.colors.primary : 'transparent',
                borderColor: active ? theme.colors.primary : theme.colors.border,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.pillLabel,
                { color: active ? theme.colors.white : theme.colors.textSecondary },
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <CustomBottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      animationConfigs={{ duration: 320, easing: Easing.linear }}
      enableDynamicSizing={false}
      backgroundStyle={[
        styles.sheetBackground,
        {
          backgroundColor:
            theme.mode === 'dark'
              ? 'rgba(18,18,22,0.92)'
              : 'rgba(24,24,28,0.92)',
          borderColor: theme.colors.borderMuted,
        },
      ]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: theme.colors.textMuted },
      ]}
      scrollable
      scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
      contentContainerStyle={styles.containerPad}
    >
      {/* Header */}
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: theme.colors.textSecondary }]}>
          NEW TASK
        </Text>
      </View>

      {/* Title */}
      <View style={styles.group}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          Task title
        </Text>
        <AdaptiveGlassView
          style={[
            styles.inputWrap,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
          ]}
        >
          <BottomSheetTextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            placeholder="Title"
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </AdaptiveGlassView>
      </View>

      {/* When */}
      <View style={styles.group}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          When
        </Text>

        <DatePills />

        <View style={styles.row2}>
          <AdaptiveGlassView
            style={[
              styles.inputIconWrap,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
            ]}
          >
            <CalendarDays size={16} color={theme.colors.textSecondary} />
            <Pressable style={{ flex: 1 }} onPress={() => setDate(new Date().toISOString().slice(0, 10))}>
              <Text style={[styles.inputLike, { color: theme.colors.textSecondary }]}>
                {dateMode === 'pick' ? (date ?? 'Choose date') : (dateMode === 'today' ? 'Today' : 'Tomorrow')}
              </Text>
            </Pressable>
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          </AdaptiveGlassView>

          <AdaptiveGlassView
            style={[
              styles.inputIconWrap,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
            ]}
          >
            <Clock4 size={16} color={theme.colors.textSecondary} />
            <Pressable style={{ flex: 1 }} onPress={() => setTime('07:30')}>
              <Text style={[styles.inputLike, { color: theme.colors.textSecondary }]}>
                {time ?? 'Choose time'}
              </Text>
            </Pressable>
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          </AdaptiveGlassView>
        </View>
      </View>

      {/* Description */}
      <View style={styles.group}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          Description
        </Text>
        <AdaptiveGlassView
          style={[
            styles.inputWrap,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
          ]}
        >
          <BottomSheetTextInput
            style={[styles.input, { color: theme.colors.textPrimary, height: 84 }]}
            placeholder="Description (not necessary)"
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </AdaptiveGlassView>
      </View>

      {/* Project / Context / Energy / Priority */}
      <View style={styles.group}>
        <View style={styles.row2}>
          <AdaptiveGlassView
            style={[
              styles.inputIconWrap,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
            ]}
          >
            <FolderClosed size={16} color={theme.colors.textSecondary} />
            <Pressable style={{ flex: 1 }} onPress={() => setProject('LEORA')}>
              <Text style={[styles.inputLike, { color: project ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                {project ? project : 'Choose your project'}
              </Text>
            </Pressable>
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          </AdaptiveGlassView>

          <AdaptiveGlassView
            style={[
              styles.inputIconWrap,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
            ]}
          >
            <AtSign size={16} color={theme.colors.textSecondary} />
            <Pressable style={{ flex: 1 }} onPress={() => setContext('@work')}>
              <Text style={[styles.inputLike, { color: theme.colors.textPrimary }]}>
                {context ?? '@context'}
              </Text>
            </Pressable>
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          </AdaptiveGlassView>
        </View>

        <View style={styles.row2}>
          <AdaptiveGlassView
            style={[
              styles.inputIconWrap,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
            ]}
          >
            <Zap size={16} color={theme.colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <EnergyView />
            </View>
          </AdaptiveGlassView>

          <AdaptiveGlassView
            style={[
              styles.inputIconWrap,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
            ]}
          >
            <Flag size={16} color={theme.colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <PriorityView />
            </View>
          </AdaptiveGlassView>
        </View>
      </View>

      {/* Additional */}
      <View style={styles.group}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
          Additional
        </Text>

        {/* Reminder */}
        <RowSwitch
          label="Reminder before"
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          rightEl={
            <Pressable onPress={cycleReminder} style={({ pressed }) => [styles.badge, pressed && styles.pressed]}>
              <Text style={[styles.badgeText, { color: theme.colors.textPrimary }]}>
                ({remindBeforeMin} min)
              </Text>
            </Pressable>
          }
          colors={theme.colors}
        />

        {/* Repeat */}
        <RowSwitch
          label="Repeat"
          value={repeatEnabled}
          onValueChange={setRepeatEnabled}
          rightEl={
            <Pressable onPress={() => setRepeatRule('Everyday')} style={({ pressed }) => [styles.badge, pressed && styles.pressed]}>
              <Text style={[styles.badgeText, { color: theme.colors.textPrimary }]}>
                ({repeatRule})
              </Text>
            </Pressable>
          }
          colors={theme.colors}
        />

        {/* Focus */}
        <RowSwitch
          label="Need FOCUS"
          value={needFocus}
          onValueChange={setNeedFocus}
          colors={theme.colors}
        />

        {/* Subtasks */}
        <Pressable
          onPress={() => setSubtasksOpen((v) => !v)}
          style={({ pressed }) => [styles.subHeader, pressed && styles.pressed]}
        >
          <Text style={[styles.subHeaderText, { color: theme.colors.textSecondary }]}>
            Subtasks:
          </Text>
          {subtasksOpen
            ? <ChevronUp size={16} color={theme.colors.textSecondary} />
            : <ChevronDown size={16} color={theme.colors.textSecondary} />}
        </Pressable>

        {subtasksOpen && (
          <View style={{ gap: 10 }}>
            {subtasks.map((s, i) => (
              <AdaptiveGlassView
                key={`st-${i}`}
                style={[
                  styles.inputWrap,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
                ]}
              >
                <BottomSheetTextInput
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  placeholder={`Subtask ${i + 1}`}
                  placeholderTextColor={theme.colors.textMuted}
                  value={s}
                  onChangeText={(v) => updateSubtask(i, v)}
                />
              </AdaptiveGlassView>
            ))}
            <Pressable onPress={addSubtask} style={({ pressed }) => [styles.addSubtask, { borderColor: theme.colors.border }, pressed && styles.pressed]}>
              <Plus size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.addSubtaskText, { color: theme.colors.textSecondary }]}>
                Add subtask
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* AI helper block (static copy as in mock) */}
      <View style={styles.aiBlock}>
        <Text style={[styles.aiText, { color: theme.colors.textSecondary }]}>
          Ai: “At the current pace, you will reach your goal in March.
          If you increase contributions by 100k per month…”
        </Text>
        <Text style={[styles.aiText, { color: theme.colors.textSecondary }]}>
          Ai: “At the current pace, you will reach your goal in March.
          if you increase contributions by 100k per month”
        </Text>
      </View>

      {/* Bottom actions */}
      <View
        style={[
          styles.actionsRow,
          { borderColor: theme.colors.borderMuted },
        ]}
      >
        <Pressable
          onPress={() => handleCreate(true)}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.secondaryText, { color: theme.colors.textSecondary }]}>
            Create and more
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleCreate(false)}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: theme.colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.primaryText, { color: theme.colors.white }]}>
            Create task
          </Text>
        </Pressable>
      </View>
    </CustomBottomSheet>
  );
});

AddTaskSheet.displayName = 'AddTaskSheet';

export default AddTaskSheet;

// =========================
// Small sub-components
// =========================
const RowSwitch: React.FC<{
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  rightEl?: React.ReactNode;
  colors: ReturnType<typeof useAppTheme>['colors'];
}> = ({ label, value, onValueChange, rightEl, colors }) => {
  return (
    <View style={styles.switchRow}>
      <Text style={[styles.switchLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {rightEl}
        <Switch
          value={value}
          onValueChange={onValueChange}
          thumbColor={value ? colors.white : colors.iconTextSecondary}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>
    </View>
  );
};

// =========================
// Styles
// =========================
const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
  },
  handleIndicator: {
    width: 42,
    height: 4,
    borderRadius: 10,
    opacity: 0.65,
  },
  containerPad: {
    paddingBottom: 18,
  },

  headerCenter: {
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  group: {
    gap: 12,
    marginBottom: 16,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  inputWrap: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    fontSize: 14,
    paddingVertical: 10,
  },

  row2: {
    flexDirection: 'row',
    gap: 12,
  },
  inputIconWrap: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputLike: {
    fontSize: 14,
    paddingVertical: 2,
  },

  inlineRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  subHeader: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  subHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addSubtask: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addSubtaskText: {
    fontSize: 13,
    fontWeight: '600',
  },

  aiBlock: {
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  aiText: {
    fontSize: 12,
    lineHeight: 18,
  },

  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
  },

  pressed: { opacity: 0.85 },
});

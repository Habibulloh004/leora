import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { createThemedStyles, useAppTheme } from '@/constants/theme';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Link2,
  PencilLine,
  UserRound,
  Eye,
  Check,
  Square,
  Star,
  Trophy,
} from 'lucide-react-native';
import { LevelProgress } from '@/components/shared/LevelProgress';

/* -------------------------- Static profile data -------------------------- */
const profileData = {
  name: 'Ivan Petrov',
  email: 'ivan.petrov@email.com',
  phone: '+998 90 123-45-67',
  birthday: '15 march 1990',
  username: '@ivanpetrov',
  visibility: 'Friends',
  bio: 'Целеустремлённый предприниматель, фокус на финансовой независимости',
  stats: {
    daysWithLeora: 145,
    activeDays: '142 (98%)',
    bestStreak: '45 days',
    currentLevelText: '12 (3,500/4,000 XP)',
  },
  level: {
    number: 12,
    next: 13,
    currentXp: 3500,
    targetXp: 4000,
    toNext: 500, // 4000 - 3500
  },
  earnXp: [
    ['Daily Login', '+10 XP'],
    ['Add Transaction', '+5 XP'],
    ['Complete task', '+10 XP'],
    ['Reach Daily Goal', '+50 XP'],
    ['Week Streak', '+100 XP'],
    ['New Habit 7 days', '+200 XP'],
  ] as [string, string][],
  rewards: [
    ['Level 15', 'New Mentor Unlocked'],
    ['Level 20', 'Exclusive Theme Unlocked'],
    ['Level 25', 'VIP Community Status'],
    ['Level 30', '1 Month Premium for ...'],
  ] as [string, string][],
};

/* ------------------------------- Styles ---------------------------------- */
const useStyles = createThemedStyles((theme) => ({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl * 2,
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  card: {
    borderRadius: 16,
    backgroundColor: theme.colors.card,
  },
  cardInner: {
    padding: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md - 2,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexShrink: 1,
  },
  rowLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
    marginVertical: 2,
  },

  /* Profile header */
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    opacity: 0.9,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  /* BIO */
  textarea: {
    borderRadius: 12,
    padding: theme.spacing.md,
  },
  textareaText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textPrimary,
  },

  /* Pills & small badges */
  chip: {
    borderRadius: 28,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Check toggle */
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },

  rewardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
}));

/* ------------------------- Utility sub‑components ------------------------- */
const Divider = () => {
  const styles = useStyles();
  return <View style={styles.divider} />;
};

type KVProps = { label: string; value: string; rightIcon?: React.ReactNode };
const KeyValueRow: React.FC<KVProps> = ({ label, value, rightIcon }) => {
  const styles = useStyles();
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowLeft}>
        <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
        {rightIcon ? <View>{rightIcon}</View> : null}
      </View>
    </View>
  );
};

type CheckboxRowProps = { label: string; value: boolean; onChange?: (v: boolean) => void };
const CheckboxRow: React.FC<CheckboxRowProps> = ({ label, value, onChange }) => {
  const styles = useStyles();
  const theme = useAppTheme();
  const bg = theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)';
  const color = theme.colors.textPrimary;

  return (
    <Pressable
      onPress={() => onChange?.(!value)}
      style={({ pressed }) => [
        styles.checkboxRow,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <AdaptiveGlassView style={[styles.checkbox, { backgroundColor: bg }]}>
        {value ? <Check size={16} color={color} /> : <Square size={16} color={color} />}
      </AdaptiveGlassView>
      <Text style={styles.rowValue}>{label}</Text>
    </Pressable>
  );
};

const ProfileScreen: React.FC = () => {
  const styles = useStyles();
  const theme = useAppTheme();

  // Local UI states (static – no persistence)
  const [visibility] = useState(profileData.visibility);
  const [showLevel, setShowLevel] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);
  const [showStatistics, setShowStatistics] = useState(false);
  const [isPublicProfile, setIsPublicProfile] = useState(true);

  const glassSubtle = theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ------------------------------- Profile ------------------------------- */}
        <AdaptiveGlassView style={styles.card}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>Profile</Text>

              <View style={styles.profileHeader}>
                <AdaptiveGlassView style={[styles.avatarWrap, { backgroundColor: theme.colors.background }]}>
                  <UserRound size={44} color={theme.colors.icon} style={styles.avatarIcon} />
                </AdaptiveGlassView>

                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>{profileData.name}</Text>
                  <Text style={styles.subtitle}>{profileData.email}</Text>

                  <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.linkRow]}>
                    <Link2 size={16} color={theme.colors.primary} />
                    <Text style={styles.linkText}>Change profile picture</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Animated.View>
        </AdaptiveGlassView>

        {/* ------------------------ Personal information ------------------------ */}
        <AdaptiveGlassView style={styles.card}>
          <Animated.View entering={FadeInDown.delay(40)} >
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>Personal information</Text>

              <KeyValueRow label="Name:" value={profileData.name} rightIcon={<Edit3 size={18} color={theme.colors.icon} />} />
              <Divider />
              <KeyValueRow label="Email:" value={profileData.email} rightIcon={<Edit3 size={18} color={theme.colors.icon} />} />
              <Divider />
              <KeyValueRow label="Phone:" value={profileData.phone} rightIcon={<Edit3 size={18} color={theme.colors.icon} />} />
              <Divider />
              <KeyValueRow label="Birth day:" value={profileData.birthday} rightIcon={<Edit3 size={18} color={theme.colors.icon} />} />
            </View>
          </Animated.View>
        </AdaptiveGlassView>

        {/* --------------------------- Usage statistics -------------------------- */}
        <AdaptiveGlassView style={styles.card}>
          <Animated.View entering={FadeInDown.delay(80)}>
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>Usage statistics</Text>

              <KeyValueRow label="Days with LEORA:" value={`${profileData.stats.daysWithLeora}`} />
              <Divider />
              <KeyValueRow label="Active days:" value={profileData.stats.activeDays} />
              <Divider />
              <KeyValueRow label="Best streak:" value={profileData.stats.bestStreak} />
              <Divider />
              <KeyValueRow label="Current level:" value={profileData.stats.currentLevelText} />
            </View>
          </Animated.View>
        </AdaptiveGlassView>

        {/* ---------------------------- Public profile --------------------------- */}
        <AdaptiveGlassView style={styles.card}>
          <Animated.View entering={FadeInDown.delay(120)}>
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>Public profile</Text>

              <KeyValueRow
                label="Username:"
                value={profileData.username}
                rightIcon={<PencilLine size={18} color={theme.colors.icon} />}
              />
              <Divider />

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Visibility:</Text>
                <View style={styles.rowLeft}>
                  <Eye size={18} color={theme.colors.icon} />
                  <Text style={styles.rowValue}>{visibility}</Text>
                  <ChevronDown size={18} color={theme.colors.icon} />
                </View>
              </View>
              <Divider />

              <View>
                <Text style={[styles.rowLabel, { marginBottom: 6 }]}>Show:</Text>
                <CheckboxRow label="Level" value={showLevel} onChange={setShowLevel} />
                <CheckboxRow label="Achievements" value={showAchievements} onChange={setShowAchievements} />
                <CheckboxRow label="Statistics" value={showStatistics} onChange={setShowStatistics} />
              </View>
            </View>
          </Animated.View>
        </AdaptiveGlassView>

        {/* ---------------------------------- BIO -------------------------------- */}
        <AdaptiveGlassView style={styles.card}>
          <Animated.View entering={FadeInDown.delay(160)}>
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>BIO</Text>

              <AdaptiveGlassView style={[styles.textarea, { backgroundColor: glassSubtle }]}>
                <Text style={styles.textareaText}>{profileData.bio}</Text>
              </AdaptiveGlassView>
            </View>
          </Animated.View>
        </AdaptiveGlassView>

        {/* -------------------------- Level & XP system -------------------------- */}
        <AdaptiveGlassView style={styles.card}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>Level and XP system</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={[styles.chip, { backgroundColor: glassSubtle }]}>
                  <Trophy size={16} color={theme.colors.textPrimary} />
                  <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>
                    Level {profileData.level.number}
                  </Text>
                </View>

                <Text style={styles.subtitle}>{profileData.level.toNext} Points to next level</Text>
              </View>

              <LevelProgress
                level={profileData.level.number}
                nextLevel={profileData.level.next}
                currentXp={profileData.level.currentXp}
                targetXp={profileData.level.targetXp}
              />

              {/* Small compact progress chip */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <AdaptiveGlassView style={[styles.chip, { backgroundColor: glassSubtle }]}>
                  <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>12</Text>
                  <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>Level 12</Text>
                </AdaptiveGlassView>

                <AdaptiveGlassView style={[styles.chip, { backgroundColor: glassSubtle }]}>
                  <Star size={16} color="#FACC15" fill="#FACC15" />
                  <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>
                    {profileData.level.currentXp}/{profileData.level.targetXp}
                  </Text>
                </AdaptiveGlassView>

                <AdaptiveGlassView style={[styles.chip, { backgroundColor: glassSubtle, paddingHorizontal: 14 }]}>
                  <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>{profileData.level.next}</Text>
                </AdaptiveGlassView>
              </View>
            </View>
          </Animated.View>
        </AdaptiveGlassView>

        {/* ------------------------------ Earn XP list --------------------------- */}
        <AdaptiveGlassView style={styles.card}>
          <Animated.View entering={FadeInDown.delay(240)}>
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>How to earn xp</Text>

              {profileData.earnXp.map(([label, value], idx) => (
                <View key={label}>
                  <View style={styles.row}>
                    <Text style={styles.rowValue}>{label}</Text>
                    <Text style={[styles.rowValue, { color: theme.colors.textSecondary }]}>{value}</Text>
                  </View>
                  {idx < profileData.earnXp.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          </Animated.View>
        </AdaptiveGlassView>

        {/* ---------------------------- Level-up rewards ------------------------- */}
        <AdaptiveGlassView style={styles.card}>
          <Animated.View entering={FadeInDown.delay(280)}>
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>Level-up Rewards</Text>

              {profileData.rewards.map(([lvl, desc], idx) => (
                <View key={lvl}>
                  <View style={styles.row}>
                    <View style={styles.rewardRowLeft}>
                      <View style={[styles.chip, { backgroundColor: glassSubtle, paddingVertical: 4 }]}>
                        <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>{lvl}</Text>
                      </View>
                      <Text style={styles.rowValue}>{desc}</Text>
                    </View>
                    <ChevronRight size={18} color={theme.colors.icon} />
                  </View>
                  {idx < profileData.rewards.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          </Animated.View>
        </AdaptiveGlassView>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

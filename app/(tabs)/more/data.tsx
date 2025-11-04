import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  Database,
  Download,
  FileArchive,
  HardDrive,
  History,
  Layers,
  RefreshCcw,
  Save,
  Settings,
  Trash2,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { Theme, useAppTheme } from '@/constants/theme';

type SectionKey = 'backup' | 'export' | 'storage';

type SectionContent = {
  title: string;
  subtitle: string;
};

const SECTION_METADATA: Record<SectionKey, SectionContent> = {
  backup: {
    title: 'Backup & restore',
    subtitle: 'Keep snapshots of your workspace and bring them back when needed.',
  },
  export: {
    title: 'Export data',
    subtitle: 'Generate copies of your information for reports or external tools.',
  },
  storage: {
    title: 'Storage & cache',
    subtitle: 'Manage local data, cache, and storage usage across devices.',
  },
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingBottom: 32,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
      gap: theme.spacing.xl,
    },
    filterBar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 10,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(38,41,52,0.65)'
          : 'rgba(226,232,240,0.75)',
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.3,
      color: theme.colors.textSecondary,
    },
    chipTextActive: {
      color: theme.colors.onPrimary,
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      letterSpacing: -0.2,
    },
    sectionSubtitle: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      letterSpacing: 0.25,
    },
    sectionCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    rowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(34,36,44,0.8)'
          : 'rgba(226,232,240,0.85)',
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flex: 1,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(52,56,72,0.8)'
          : 'rgba(210,217,228,0.9)',
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      letterSpacing: -0.1,
    },
    rowSubtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    actionPill: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 8,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(51,152,255,0.16)'
          : 'rgba(59,130,246,0.15)',
    },
    actionText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 0.4,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },
    summaryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    summaryKey: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
  });

const useSectionRegistry = () => {
  const scrollRef = useRef<ScrollView | null>(null);
  const mapRef = useRef<Partial<Record<SectionKey, number>>>({});
  const pending = useRef<SectionKey | null>(null);

  const scrollTo = useCallback((key: SectionKey) => {
    const y = mapRef.current[key];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(y - 96, 0), animated: true });
    }
  }, []);

  const register = useCallback(
    (key: SectionKey) => (event: { nativeEvent: { layout: { y: number } } }) => {
      mapRef.current[key] = event.nativeEvent.layout.y;
      if (pending.current === key) {
        pending.current = null;
        requestAnimationFrame(() => scrollTo(key));
      }
    },
    [scrollTo],
  );

  const schedule = useCallback(
    (key: SectionKey) => {
      pending.current = key;
      requestAnimationFrame(() => scrollTo(key));
    },
    [scrollTo],
  );

  return { scrollRef, register, schedule };
};

const DataScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const { section } = useLocalSearchParams<{ section?: string }>();
  const normalizedSection = (section?.toLowerCase() ?? 'backup') as SectionKey;

  const [activeSection, setActiveSection] = useState<SectionKey>(
    SECTION_METADATA[normalizedSection] ? normalizedSection : 'backup',
  );

  const { scrollRef, register, schedule } = useSectionRegistry();

  useEffect(() => {
    if (SECTION_METADATA[normalizedSection]) {
      setActiveSection(normalizedSection);
      schedule(normalizedSection);
    }
  }, [normalizedSection, schedule]);

  const handleFilterPress = useCallback(
    (target: SectionKey) => {
      setActiveSection(target);
      schedule(target);
      router.setParams({ section: target });
    },
    [router, schedule],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View onLayout={register('backup')} style={{ gap: theme.spacing.sm }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{SECTION_METADATA.backup.title}</Text>
            <Text style={styles.sectionSubtitle}>{SECTION_METADATA.backup.subtitle}</Text>
          </View>
          <AdaptiveGlassView style={styles.sectionCard}>
            <AdaptiveGlassView style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <AdaptiveGlassView style={styles.iconWrap}>
                  <Save size={18} color={theme.colors.iconText} />
                </AdaptiveGlassView>
                <View>
                  <Text style={styles.rowTitle}>Create manual backup</Text>
                  <Text style={styles.rowSubtitle}>
                    Capture a fresh snapshot of your workspace.
                  </Text>
                </View>
              </View>
              <AdaptiveGlassView style={styles.actionPill}>
                <Text style={styles.actionText}>Start</Text>
              </AdaptiveGlassView>
            </AdaptiveGlassView>

            <AdaptiveGlassView style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <AdaptiveGlassView style={styles.iconWrap}>
                  <RefreshCcw size={18} color={theme.colors.iconText} />
                </AdaptiveGlassView>
                <View>
                  <Text style={styles.rowTitle}>Restore backup</Text>
                  <Text style={styles.rowSubtitle}>Select from stored snapshots.</Text>
                </View>
              </View>
              <AdaptiveGlassView style={styles.actionPill}>
                <Text style={styles.actionText}>Choose file</Text>
              </AdaptiveGlassView>
            </AdaptiveGlassView>

            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <History size={14} color={theme.colors.textMuted} />
                <Text style={styles.summaryKey}>Last automatic backup</Text>
              </View>
              <Text style={styles.summaryValue}>3 days ago</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Layers size={14} color={theme.colors.textMuted} />
                <Text style={styles.summaryKey}>Stored snapshots</Text>
              </View>
              <Text style={styles.summaryValue}>4 snapshots</Text>
            </View>
          </AdaptiveGlassView>
        </View>

        <View onLayout={register('export')} style={{ gap: theme.spacing.sm }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{SECTION_METADATA.export.title}</Text>
            <Text style={styles.sectionSubtitle}>{SECTION_METADATA.export.subtitle}</Text>
          </View>
          <AdaptiveGlassView style={styles.sectionCard}>
            <AdaptiveGlassView style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <AdaptiveGlassView style={styles.iconWrap}>
                  <Download size={18} color={theme.colors.iconText} />
                </AdaptiveGlassView>
                <View>
                  <Text style={styles.rowTitle}>Export transactions</Text>
                  <Text style={styles.rowSubtitle}>Generate CSV or XLSX reports.</Text>
                </View>
              </View>
              <AdaptiveGlassView style={styles.actionPill}>
                <Text style={styles.actionText}>Configure</Text>
              </AdaptiveGlassView>
            </AdaptiveGlassView>

            <AdaptiveGlassView style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <AdaptiveGlassView style={styles.iconWrap}>
                  <FileArchive size={18} color={theme.colors.iconText} />
                </AdaptiveGlassView>
                <View>
                  <Text style={styles.rowTitle}>Export archive</Text>
                  <Text style={styles.rowSubtitle}>
                    Bundle everything into a password-protected archive.
                  </Text>
                </View>
              </View>
              <AdaptiveGlassView style={styles.actionPill}>
                <Text style={styles.actionText}>Generate</Text>
              </AdaptiveGlassView>
            </AdaptiveGlassView>

            <AdaptiveGlassView style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <AdaptiveGlassView style={styles.iconWrap}>
                  <Database size={18} color={theme.colors.iconText} />
                </AdaptiveGlassView>
                <View>
                  <Text style={styles.rowTitle}>API access</Text>
                  <Text style={styles.rowSubtitle}>Create or manage personal access tokens.</Text>
                </View>
              </View>
              <AdaptiveGlassView style={styles.actionPill}>
                <Text style={styles.actionText}>Manage</Text>
              </AdaptiveGlassView>
            </AdaptiveGlassView>
          </AdaptiveGlassView>
        </View>

        <View onLayout={register('storage')} style={{ gap: theme.spacing.sm }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{SECTION_METADATA.storage.title}</Text>
            <Text style={styles.sectionSubtitle}>{SECTION_METADATA.storage.subtitle}</Text>
          </View>
          <AdaptiveGlassView style={styles.sectionCard}>
            <AdaptiveGlassView style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <AdaptiveGlassView style={styles.iconWrap}>
                  <HardDrive size={18} color={theme.colors.iconText} />
                </AdaptiveGlassView>
                <View>
                  <Text style={styles.rowTitle}>Local cache</Text>
                  <Text style={styles.rowSubtitle}>Current size 45 MB on this device.</Text>
                </View>
              </View>
              <AdaptiveGlassView style={styles.actionPill}>
                <Text style={styles.actionText}>Clear</Text>
              </AdaptiveGlassView>
            </AdaptiveGlassView>

            <AdaptiveGlassView style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <AdaptiveGlassView style={styles.iconWrap}>
                  <Trash2 size={18} color={theme.colors.iconText} />
                </AdaptiveGlassView>
                <View>
                  <Text style={styles.rowTitle}>Temporary files</Text>
                  <Text style={styles.rowSubtitle}>Delete generated previews and logs.</Text>
                </View>
              </View>
              <AdaptiveGlassView style={styles.actionPill}>
                <Text style={styles.actionText}>Review</Text>
              </AdaptiveGlassView>
            </AdaptiveGlassView>

            <AdaptiveGlassView style={styles.rowCard}>
              <View style={styles.rowLeft}>
                <AdaptiveGlassView style={styles.iconWrap}>
                  <Settings size={18} color={theme.colors.iconText} />
                </AdaptiveGlassView>
                <View>
                  <Text style={styles.rowTitle}>Storage preferences</Text>
                  <Text style={styles.rowSubtitle}>Decide what gets cached locally.</Text>
                </View>
              </View>
              <AdaptiveGlassView style={styles.actionPill}>
                <Text style={styles.actionText}>Adjust</Text>
              </AdaptiveGlassView>
            </AdaptiveGlassView>

            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Database size={14} color={theme.colors.textMuted} />
                <Text style={styles.summaryKey}>Synced workspace size</Text>
              </View>
              <Text style={styles.summaryValue}>128 MB</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <ArrowRight size={14} color={theme.colors.textMuted} />
                <Text style={styles.summaryKey}>Downloads this month</Text>
              </View>
              <Text style={styles.summaryValue}>6 exports</Text>
            </View>
          </AdaptiveGlassView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DataScreen;

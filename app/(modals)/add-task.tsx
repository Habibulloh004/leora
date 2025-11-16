import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useThemeColors } from "@/constants/theme";
import LeoraLogo, { LeoraLogoHorizontal, LeoraLogoVertical } from "@/components/ui/LeoraLogo";
import Svg, { Rect, Line } from "react-native-svg";

export default function AddTask() {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'macos' | 'windows' | 'web'>('ios');

  // Download Card Component
  const DownloadCard = ({ 
    icon, 
    title, 
    description, 
    onPress 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    description: string; 
    onPress: () => void 
  }) => (
    <View style={styles.downloadCard}>
      <View style={styles.cardIcon}>{icon}</View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <TouchableOpacity style={styles.downloadBtn} onPress={onPress}>
        <Text style={styles.downloadBtnText}>Download</Text>
      </TouchableOpacity>
    </View>
  );

  // Logo Variant Card
  const LogoCard = ({ 
    children, 
    label, 
    inverted = false 
  }: { 
    children: React.ReactNode; 
    label: string; 
    inverted?: boolean 
  }) => (
    <TouchableOpacity 
      style={[styles.logoCard, inverted && styles.logoCardInverted]}
      activeOpacity={0.7}
    >
      <View style={styles.logoCardContent}>
        {children}
      </View>
      <Text style={[styles.logoCardLabel, inverted && styles.logoCardLabelInverted]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Icon Item for App Icons
  const IconItem = ({ 
    children, 
    label 
  }: { 
    children: React.ReactNode; 
    label: string 
  }) => (
    <TouchableOpacity style={styles.iconItem} activeOpacity={0.7}>
      <View style={styles.iconPreview}>
        {children}
      </View>
      <Text style={styles.iconLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogo}>
          <LeoraLogo size="medium" variant="gradient" />
          <Text style={styles.headerTitle}>
            LEORA<Text style={styles.headerTitleSup}>®</Text>
          </Text>
        </View>
        <Text style={styles.headerSubtitle}>BRAND ASSETS DOWNLOAD CENTER</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContainer}>
        {/* Download Section */}
        <View style={styles.section}>
          <View style={styles.downloadGrid}>
            {/* Logo Package */}
            <DownloadCard
              icon={<LeoraLogo size="small" variant="gradient" />}
              title="Logo Package"
              description="All logo variations in SVG, PNG, and PDF formats"
              onPress={() => console.log('Download Logos')}
            />

            {/* Icon Set */}
            <DownloadCard
              icon={
                <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <Rect x="4" y="4" width="18" height="18" rx="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <Rect x="26" y="4" width="18" height="18" rx="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <Rect x="4" y="26" width="18" height="18" rx="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <Rect x="26" y="26" width="18" height="18" rx="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                </Svg>
              }
              title="Icon Set"
              description="Platform-specific app icons in all required sizes"
              onPress={() => console.log('Download Icons')}
            />

            {/* Brand Manual */}
            <DownloadCard
              icon={
                <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <Rect x="10" y="6" width="28" height="36" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <Line x1="16" y1="14" x2="32" y2="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                  <Line x1="16" y1="20" x2="28" y2="20" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                  <Line x1="16" y1="26" x2="32" y2="26" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                </Svg>
              }
              title="Brand Manual"
              description="Complete PDF guidelines with usage examples"
              onPress={() => console.log('Download Manual')}
            />
          </View>
        </View>

        {/* Logo Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo Variants</Text>
          <Text style={styles.sectionSubtitle}>CLICK ANY LOGO TO COPY SVG CODE</Text>
          
          <View style={styles.logoGrid}>
            {/* Primary Mark */}
            <LogoCard label="Primary Mark">
              <LeoraLogo size="medium" variant="gradient" />
            </LogoCard>

            {/* Wordmark */}
            <LogoCard label="Wordmark">
              <Text style={styles.wordmark}>
                LEORA<Text style={styles.wordmarkSup}>®</Text>
              </Text>
            </LogoCard>

            {/* Horizontal */}
            <LogoCard label="Horizontal">
              <LeoraLogoHorizontal size="small" variant="gradient" showText={true} />
            </LogoCard>

            {/* Vertical */}
            <LogoCard label="Vertical">
              <LeoraLogoVertical size="small" variant="gradient" showText={true} />
            </LogoCard>

            {/* Monochrome */}
            <LogoCard label="Monochrome">
              <LeoraLogo size="medium" variant="mono" />
            </LogoCard>

            {/* Inverted */}
            <LogoCard label="Inverted" inverted={true}>
              <LeoraLogo size="medium" variant="inverted" />
            </LogoCard>
          </View>
        </View>

        {/* App Icons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Icons</Text>
          <Text style={styles.sectionSubtitle}>PLATFORM-SPECIFIC SIZES</Text>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            {(['ios', 'android', 'macos', 'windows', 'web'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'ios' ? 'iOS' : tab === 'macos' ? 'macOS' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content - iOS */}
          {activeTab === 'ios' && (
            <View style={styles.iconGrid}>
              <IconItem label="1024×1024">
                <View style={[styles.iconIos, { width: 100, height: 100 }]}>
                  <LeoraLogo size="tiny" variant="mono" />
                </View>
              </IconItem>
              <IconItem label="180×180">
                <View style={[styles.iconIos, { width: 60, height: 60 }]}>
                  <View style={{ transform: [{ scale: 0.6 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
              <IconItem label="120×120">
                <View style={[styles.iconIos, { width: 40, height: 40 }]}>
                  <View style={{ transform: [{ scale: 0.4 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
            </View>
          )}

          {/* Tab Content - Android */}
          {activeTab === 'android' && (
            <View style={styles.iconGrid}>
              <IconItem label="512×512">
                <View style={[styles.iconAndroid, { width: 100, height: 100 }]}>
                  <LeoraLogo size="tiny" variant="mono" />
                </View>
              </IconItem>
              <IconItem label="192×192">
                <View style={[styles.iconAndroid, { width: 64, height: 64 }]}>
                  <View style={{ transform: [{ scale: 0.64 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
              <IconItem label="96×96">
                <View style={[styles.iconAndroid, { width: 32, height: 32 }]}>
                  <View style={{ transform: [{ scale: 0.32 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
            </View>
          )}

          {/* Tab Content - macOS */}
          {activeTab === 'macos' && (
            <View style={styles.iconGrid}>
              <IconItem label="1024×1024">
                <View style={[styles.iconMacos, { width: 100, height: 100 }]}>
                  <LeoraLogo size="tiny" variant="mono" />
                </View>
              </IconItem>
              <IconItem label="512×512">
                <View style={[styles.iconMacos, { width: 84, height: 84 }]}>
                  <View style={{ transform: [{ scale: 0.84 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
              <IconItem label="256×256">
                <View style={[styles.iconMacos, { width: 42, height: 42 }]}>
                  <View style={{ transform: [{ scale: 0.42 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
            </View>
          )}

          {/* Tab Content - Windows */}
          {activeTab === 'windows' && (
            <View style={styles.iconGrid}>
              <IconItem label="256×256">
                <View style={[styles.iconWindows, { width: 100, height: 100 }]}>
                  <LeoraLogo size="tiny" variant="mono" />
                </View>
              </IconItem>
              <IconItem label="48×48">
                <View style={[styles.iconWindows, { width: 48, height: 48 }]}>
                  <View style={{ transform: [{ scale: 0.48 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
              <IconItem label="32×32">
                <View style={[styles.iconWindows, { width: 32, height: 32 }]}>
                  <View style={{ transform: [{ scale: 0.32 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
            </View>
          )}

          {/* Tab Content - Web */}
          {activeTab === 'web' && (
            <View style={styles.iconGrid}>
              <IconItem label="PWA 512×512">
                <View style={[styles.iconAndroid, { width: 100, height: 100 }]}>
                  <LeoraLogo size="tiny" variant="mono" />
                </View>
              </IconItem>
              <IconItem label="Apple Touch">
                <View style={[styles.iconIos, { width: 60, height: 60 }]}>
                  <View style={{ transform: [{ scale: 0.6 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
              <IconItem label="Favicon 64×64">
                <View style={[styles.iconWindows, { width: 64, height: 64, borderRadius: 8 }]}>
                  <View style={{ transform: [{ scale: 0.64 }] }}>
                    <LeoraLogo size="tiny" variant="mono" />
                  </View>
                </View>
              </IconItem>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Header
  header: {
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: '200',
    letterSpacing: 6,
    color: 'rgba(255, 255, 255, 1)',
  },
  headerTitleSup: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.6,
  },
  headerSubtitle: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 8,
  },

  // Main Container
  mainContainer: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },

  // Section
  section: {
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '200',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 40,
  },

  // Download Cards
  downloadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  downloadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 32,
    flex: 1,
    minWidth: 300,
  },
  cardIcon: {
    width: 64,
    height: 64,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
    lineHeight: 22,
  },
  downloadBtn: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadBtnText: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.5,
  },

  // Logo Grid
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 48,
  },
  logoCard: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 48,
    minHeight: 240,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 280,
  },
  logoCardInverted: {
    backgroundColor: '#FFFFFF',
  },
  logoCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCardLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 24,
    letterSpacing: 0.5,
  },
  logoCardLabelInverted: {
    color: 'rgba(0, 0, 0, 0.6)',
  },
  wordmark: {
    fontSize: 32,
    fontWeight: '200',
    letterSpacing: 4.8,
    color: 'white',
  },
  wordmarkSup: {
    fontSize: 11,
    fontWeight: '400',
    opacity: 0.6,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  tabTextActive: {
    color: 'rgba(255, 255, 255, 1)',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'white',
  },

  // Icon Grid
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  iconItem: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 160,
  },
  iconPreview: {
    width: 120,
    height: 120,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },

  // Platform Icons
  iconIos: {
    backgroundColor: '#27272a',
    borderRadius: 22.37,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconAndroid: {
    backgroundColor: '#18181b',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconMacos: {
    backgroundColor: '#1f1f23',
    borderRadius: 22.37,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWindows: {
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
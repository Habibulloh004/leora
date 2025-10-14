// app/(modals)/voice-ai.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, X, Check, Edit3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Import components
import { ListeningVisualization } from '@/components/screens/VoiceAI/ListeningVisualization';
import { ThinkingVisualization } from '@/components/screens/VoiceAI/ThinkingVisualization';
import { ConfirmVisualization } from '@/components/screens/VoiceAI/ConfirmVisualization';
import { SuccessVisualization } from '@/components/screens/VoiceAI/SuccessVisualization';
import { StatusDisplay } from '@/components/screens/VoiceAI/StatusDisplay';
import { TranscriptCard } from '@/components/screens/VoiceAI/TranscriptCard';
import { ParsedDataCard } from '@/components/screens/VoiceAI/ParsedDataCard';

// Import utils
import { parseCommandWithAI, ParsedData } from '@/utils/aiParser';
import { Colors } from '@/constants/Colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== TYPES ====================
type AIStage = 'idle' | 'listening' | 'thinking' | 'confirm' | 'editing' | 'success';

// ==================== CONSTANTS ====================
const EXAMPLE_COMMANDS = [
  "Потратил 100 долларов на ресторан",
  "Отдал долг Азизу 500 тысяч сум",
  "Получил зарплату 5 миллионов",
  "Перевести 200 долларов с кошелька на карту",
  "Купил продукты на 150 тысяч сум",
  "Оплатил такси 50 тысяч"
];

const STAGE_META: Record<AIStage, { label: string; headline: string; caption?: string; accent: string }> = {
  idle: {
    label: 'VOICE AI',
    headline: 'Голосовой ассистент',
    caption: 'Записывайте траты, доходы и переводы в разговорном формате.',
    accent: Colors.textSecondary,
  },
  listening: {
    label: 'В ПРОЦЕССЕ',
    headline: 'Слушаю команду',
    caption: 'Говорите естественно и четко называйте суммы и категории.',
    accent: Colors.info,
  },
  thinking: {
    label: 'АНАЛИЗ',
    headline: 'Обрабатываю данные',
    caption: 'AI извлекает суммы, категории и контекст из сказанного.',
    accent: Colors.secondary,
  },
  confirm: {
    label: 'ПРОВЕРЬТЕ',
    headline: 'Все ли верно?',
    caption: 'Сверьте распознанные данные перед добавлением в учет.',
    accent: Colors.primary,
  },
  editing: {
    label: 'РЕДАКТИРОВАНИЕ',
    headline: 'Корректируем детали',
    caption: 'При необходимости измените суммы или категории вручную.',
    accent: Colors.warning,
  },
  success: {
    label: 'ГОТОВО',
    headline: 'Команда выполнена',
    caption: 'Запись сохранена и синхронизирована с финансовым дэшбордом.',
    accent: Colors.success,
  },
};

// ==================== MAIN COMPONENT ====================
export default function VoiceAIScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<AIStage>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiParsed, setAiParsed] = useState<ParsedData | null>(null);
  const [currentExample, setCurrentExample] = useState(0);
  const stageMeta = useMemo(() => STAGE_META[stage], [stage]);
  const backgroundTint = useMemo(() => stageMeta.accent + '12', [stageMeta]);

  // ==================== HANDLERS ====================
  const handleVoiceStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStage('listening');
    setTranscript('');
    
    // Симуляция распознавания речи (2.5 секунды)
    setTimeout(() => {
      const example = EXAMPLE_COMMANDS[currentExample];
      setTranscript(example);
      setStage('thinking');
      
      // AI обработка (1.8 секунды)
      setTimeout(() => {
        const parsed = parseCommandWithAI(example);
        setAiParsed(parsed);
        setStage('confirm');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 1800);
    }, 2500);
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStage('success');
    
    // Success animation показываем 2 секунды
    setTimeout(() => {
      setStage('idle');
      setTranscript('');
      setAiParsed(null);
      setCurrentExample((prev) => (prev + 1) % EXAMPLE_COMMANDS.length);
    }, 2000);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStage('idle');
    setTranscript('');
    setAiParsed(null);
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStage('editing');
    // TODO: Открыть модальное окно редактирования
  };

  const handleExamplePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentExample(index);
    handleVoiceStart();
  };

  // ==================== RENDER VISUALIZATION ====================
  const renderVisualization = () => {
    switch (stage) {
      case 'listening':
        return <ListeningVisualization />;
      case 'thinking':
        return <ThinkingVisualization />;
      case 'confirm':
      case 'editing':
        return <ConfirmVisualization />;
      case 'success':
        return <SuccessVisualization />;
      default:
        return null;
    }
  };

  // ==================== RENDER ====================
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Gradient */}
      <View style={[styles.backgroundOverlay, { backgroundColor: backgroundTint }]} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LEORA</Text>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <X color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stageMetaCard}>
          <View
            style={[
              styles.stageBadge,
              {
                backgroundColor: stageMeta.accent + '1A',
                borderColor: stageMeta.accent + '33',
              },
            ]}
          >
            <View style={[styles.stageDot, { backgroundColor: stageMeta.accent }]} />
            <Text style={styles.stageBadgeText}>{stageMeta.label}</Text>
          </View>
          <Text style={styles.stageHeadline}>{stageMeta.headline}</Text>
          {stageMeta.caption ? (
            <Text style={styles.stageCaption}>{stageMeta.caption}</Text>
          ) : null}
        </View>

        {/* Visualization Section */}
        {stage !== 'idle' && (
          <View style={styles.visualizationCard}>
            {renderVisualization()}
            <StatusDisplay stage={stage} />
          </View>
        )}

        {/* Idle State */}
        {stage === 'idle' && (
          <View style={styles.idleCard}>
            <View style={styles.idleIconContainer}>
              <Mic color="rgba(255,255,255,0.65)" size={40} strokeWidth={1.4} />
            </View>
            <Text style={styles.idleTitle}>Говорите свободно</Text>
            <Text style={styles.idleSubtitle}>
              Расскажите ассистенту про покупку, перевод или доход своим языком — мы разберём текст за вас.
            </Text>
          </View>
        )}

        {/* Transcript and Parsed Data Section */}
        {transcript && stage !== 'success' && (
          <View style={styles.dataSection}>
            <TranscriptCard transcript={transcript} />
            {(stage === 'confirm' || stage === 'editing') && aiParsed && (
              <ParsedDataCard data={aiParsed} />
            )}
          </View>
        )}

        {/* Examples Section */}
        {stage === 'idle' && (
          <View style={styles.examplesSection}>
            <Text style={styles.examplesTitle}>Примеры команд</Text>
            <View style={styles.examplesGrid}>
              {EXAMPLE_COMMANDS.map((cmd, idx) => {
                const isActive = idx === currentExample;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleExamplePress(idx)}
                    style={[styles.exampleChip, isActive && styles.exampleChipActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.exampleChipText, isActive && styles.exampleChipTextActive]}>
                      {cmd}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Idle: Start Button */}
        {stage === 'idle' && (
          <TouchableOpacity
            onPress={handleVoiceStart}
            style={styles.startButton}
            activeOpacity={0.85}
          >
            <Mic color={Colors.textPrimary} size={20} />
            <Text style={styles.startButtonText}>Начать запись</Text>
          </TouchableOpacity>
        )}

        {/* Confirm/Editing: Action Buttons */}
        {(stage === 'confirm' || stage === 'editing') && (
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              onPress={handleCancel} 
              style={styles.cancelButton} 
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleEdit} 
              style={styles.editButton} 
              activeOpacity={0.8}
            >
              <Edit3 color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.confirmButton}
              activeOpacity={0.85}
            >
              <Check color={Colors.background} size={20} />
              <Text style={styles.confirmButtonText}>Подтвердить</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Listening: Stop Button */}
        {stage === 'listening' && (
          <TouchableOpacity 
            onPress={handleCancel} 
            style={styles.stopButton} 
            activeOpacity={0.8}
          >
            <Text style={styles.stopButtonText}>Остановить запись</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.35,
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlay.light,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 4,
  },
  stageMetaCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginBottom: 20,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  stageDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  stageBadgeText: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  stageHeadline: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  stageCaption: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  visualizationCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    marginBottom: 24,
  },
  idleCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  idleIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.overlay.light,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  idleTitle: {
    fontSize: 21,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  idleSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  dataSection: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginBottom: 24,
    gap: 12,
  },
  examplesSection: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginBottom: 28,
  },
  examplesTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  exampleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  exampleChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  exampleChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  exampleChipTextActive: {
    color: Colors.textPrimary,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 10,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 999,
    gap: 10,
    backgroundColor: Colors.primary,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    columnGap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  editButton: {
    width: 52,
    height: 52,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 999,
    gap: 8,
    backgroundColor: Colors.success,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.background,
  },
  stopButton: {
    marginTop: 6,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});

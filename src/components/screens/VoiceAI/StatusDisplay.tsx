import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AIStage } from '@/types/voice-ai.types';
interface StatusDisplayProps {
  stage: AIStage;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ stage }) => {
  const getStatusText = () => {
    switch (stage) {
      case 'listening': return 'СЛУШАЮ';
      case 'thinking': return 'АНАЛИЗИРУЮ';
      case 'confirm': return 'ПОДТВЕРЖДЕНИЕ';
      case 'editing': return 'РЕДАКТИРОВАНИЕ';
      case 'success': return 'ГОТОВО';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (stage) {
      case 'listening': return 'Говорите естественно';
      case 'thinking': return 'Обработка данных...';
      default: return null;
    }
  };

  if (stage === 'idle' || stage === 'success') return null;

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {stage === 'listening' && (
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, { opacity: 1 }]} />
            <View style={[styles.dot, { opacity: 0.7 }]} />
            <View style={[styles.dot, { opacity: 0.4 }]} />
          </View>
        )}
      </View>
      {getSubtitle() && (
        <Text style={styles.statusSubtitle}>{getSubtitle()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  statusSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 12,
  },
});

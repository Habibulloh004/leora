// app/(tabs)/(insights)/(tabs)/wisdom.tsx - Wisdom Tab
import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { RefreshCw, Target, Sun, Heart, TrendingUp, Book, Sprout } from 'lucide-react-native';

export default function WisdomTab() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Quote of the Day */}
      <View style={styles.quoteCard}>
        <View style={styles.quoteHeader}>
          <Text style={styles.quoteTitle}>МУДРОСТЬ ДНЯ</Text>
          <Pressable>
            <RefreshCw color="#A6A6B9" size={20} />
          </Pressable>
        </View>
        <Text style={styles.quoteText}>
          &ldquo;Время - это самая ценная вещь, которую человек может потратить.&rdquo;
        </Text>
        <Text style={styles.quoteAuthor}>— Теофраст</Text>
      </View>

      {/* Personal Lessons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Персональные уроки месяца</Text>

        <View style={styles.lessonCard}>
          <View style={styles.lessonNumber}>
            <Text style={styles.lessonNumberText}>1</Text>
          </View>
          <View style={styles.lessonContent}>
            <Text style={styles.lessonTitle}>Сила малых шагов</Text>
            <Text style={styles.lessonDescription}>
              Ваши ежедневные 15-минутные медитации привели к снижению стресса на 40%.
              Маленькие действия создают большие изменения.
            </Text>
          </View>
        </View>

        <View style={styles.lessonCard}>
          <View style={styles.lessonNumber}>
            <Text style={styles.lessonNumberText}>2</Text>
          </View>
          <View style={styles.lessonContent}>
            <Text style={styles.lessonTitle}>Осознанные расходы</Text>
            <Text style={styles.lessonDescription}>
              Отказ от 3 импульсивных покупок сэкономил 280,000 сум.
              Пауза перед покупкой - ваша суперсила.
            </Text>
          </View>
        </View>

        <View style={styles.lessonCard}>
          <View style={styles.lessonNumber}>
            <Text style={styles.lessonNumberText}>3</Text>
          </View>
          <View style={styles.lessonContent}>
            <Text style={styles.lessonTitle}>Время как инвестиция</Text>
            <Text style={styles.lessonDescription}>
              2 часа обучения в неделю увеличили вашу продуктивность на 25%.
              Знания - лучшая инвестиция.
            </Text>
          </View>
        </View>
      </View>

      {/* Success Principles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Принципы успеха</Text>

        <View style={styles.principlesGrid}>
          <View style={styles.principleCard}>
            <Target color="#4CAF50" size={32} />
            <Text style={styles.principleTitle}>Ясность</Text>
            <Text style={styles.principleDescription}>
              Четкие цели ведут к четким результатам
            </Text>
          </View>

          <View style={styles.principleCard}>
            <TrendingUp color="#00BCD4" size={32} />
            <Text style={styles.principleTitle}>Постоянство</Text>
            <Text style={styles.principleDescription}>
              Маленькие шаги каждый день
            </Text>
          </View>

          <View style={styles.principleCard}>
            <Heart color="#F44336" size={32} />
            <Text style={styles.principleTitle}>Страсть</Text>
            <Text style={styles.principleDescription}>
              Делайте то, что любите
            </Text>
          </View>

          <View style={styles.principleCard}>
            <TrendingUp color="#FFD700" size={32} />
            <Text style={styles.principleTitle}>Рост</Text>
            <Text style={styles.principleDescription}>
              1% лучше каждый день
            </Text>
          </View>
        </View>
      </View>

      {/* Reflection Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Вопросы для размышления</Text>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            &ldquo;Что бы вы делали, если бы знали, что не можете потерпеть неудачу?&rdquo;
          </Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            &ldquo;Какие три привычки изменили бы вашу жизнь через год?&rdquo;
          </Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            &ldquo;За что вы благодарны сегодня?&rdquo;
          </Text>
        </View>
      </View>

      {/* Wisdom Board */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Доска мудрости</Text>

        <View style={styles.boardGrid}>
          <View style={styles.boardCard}>
            <Target color="#4CAF50" size={24} />
            <Text style={styles.boardLabel}>Фокус месяца</Text>
            <Text style={styles.boardValue}>Финансовая свобода</Text>
          </View>

          <View style={styles.boardCard}>
            <Sun color="#FFD700" size={24} />
            <Text style={styles.boardLabel}>Инсайт недели</Text>
            <Text style={styles.boardValue}>Утро решает день</Text>
          </View>

          <View style={styles.boardCard}>
            <Book color="#00BCD4" size={24} />
            <Text style={styles.boardLabel}>Книга месяца</Text>
            <Text style={styles.boardValue}>Атомные привычки</Text>
          </View>

          <View style={styles.boardCard}>
            <Sprout color="#4CAF50" size={24} />
            <Text style={styles.boardLabel}>Навык</Text>
            <Text style={styles.boardValue}>Осознанность</Text>
          </View>
        </View>
      </View>

      {/* Stoic Wisdom */}
      <View style={styles.stoicCard}>
        <Text style={styles.stoicTitle}>Memento Mori</Text>
        <Text style={styles.stoicSubtitle}>Помни о смерти</Text>
        <Text style={styles.stoicDescription}>
          Осознание конечности жизни делает каждый день ценным.
          Не откладывайте важное, живите полно сегодня.
        </Text>
      </View>

      {/* Wisdom Index */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Индекс жизненной мудрости</Text>

        <View style={styles.wisdomIndexCard}>
          <View style={styles.wisdomCircle}>
            <Text style={styles.wisdomScore}>87</Text>
            <Text style={styles.wisdomLabel}>баллов</Text>
          </View>

          <View style={styles.wisdomComponents}>
            <View style={styles.wisdomComponent}>
              <Text style={styles.componentLabel}>Опыт</Text>
              <View style={styles.componentBarContainer}>
                <View style={[styles.componentBar, { width: '90%' }]} />
              </View>
              <Text style={styles.componentValue}>90%</Text>
            </View>

            <View style={styles.wisdomComponent}>
              <Text style={styles.componentLabel}>Рефлексия</Text>
              <View style={styles.componentBarContainer}>
                <View style={[styles.componentBar, { width: '85%' }]} />
              </View>
              <Text style={styles.componentValue}>85%</Text>
            </View>

            <View style={styles.wisdomComponent}>
              <Text style={styles.componentLabel}>Применение</Text>
              <View style={styles.componentBarContainer}>
                <View style={[styles.componentBar, { width: '82%' }]} />
              </View>
              <Text style={styles.componentValue}>82%</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  contentContainer: {
    padding: 16,
  },
  quoteCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quoteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A6A6B9',
    letterSpacing: 1,
  },
  quoteText: {
    fontSize: 20,
    fontStyle: 'italic',
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 16,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    gap: 16,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#A6A6B9',
    lineHeight: 22,
  },
  principlesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  principleCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  principleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  principleDescription: {
    fontSize: 12,
    color: '#A6A6B9',
    textAlign: 'center',
    lineHeight: 18,
  },
  questionCard: {
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  boardCard: {
    width: '48%',
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  boardLabel: {
    fontSize: 12,
    color: '#A6A6B9',
  },
  boardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stoicCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  stoicTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stoicSubtitle: {
    fontSize: 16,
    color: '#A6A6B9',
    marginBottom: 16,
  },
  stoicDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  wisdomIndexCard: {
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 20,
  },
  wisdomCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  wisdomScore: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wisdomLabel: {
    fontSize: 12,
    color: '#A6A6B9',
  },
  wisdomComponents: {
    gap: 16,
  },
  wisdomComponent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  componentLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    width: 100,
  },
  componentBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  componentBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  componentValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 40,
    textAlign: 'right',
  },
  bottomSpacer: {
    height: 100,
  },
});

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircleProgressProps {
  label: string;
  value: number;
  color: string;
  size?: number;
}

interface ProgressIndicatorsProps {
  tasksProgress?: number;
  budgetProgress?: number;
  focusProgress?: number;
}

const CircleProgress = ({ label, value, color, size = 96 }: CircleProgressProps) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <View style={styles.circleContainer}>
      <View style={styles.circleWrapper}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1A1A1A"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        <View style={styles.circleText}>
          <Text style={styles.circleValue}>{value}%</Text>
        </View>
      </View>
      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
};

export default function ProgressIndicators({
  tasksProgress = 50,
  budgetProgress = 62,
  focusProgress = 75,
}: ProgressIndicatorsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <CircleProgress label="TASKS" value={tasksProgress} color="#4CAF50" />
      <CircleProgress label="BUDGET" value={budgetProgress} color="#2196F3" />
      <CircleProgress label="FOCUS" value={focusProgress} color="#FF9800" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  circleContainer: {
    alignItems: 'center',
    minWidth: 100,
  },
  circleWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  circleText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  circleLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    letterSpacing: 1,
  },
});

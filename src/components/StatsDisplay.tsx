import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameState } from '../hooks/useGameState';

interface Props {
  gameState: GameState;
}

const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={styles.statContainer}>
    <View style={styles.statHeader}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{Math.round(value)}%</Text>
    </View>
    <View style={styles.barBackground}>
      <View 
        style={[
          styles.barFill, 
          { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }
        ]} 
      />
    </View>
  </View>
);

export const StatsDisplay: React.FC<Props> = ({ gameState }) => {
  return (
    <View style={styles.container}>
      <StatBar label="Hunger" value={gameState.hunger} color="#F97316" />
      <StatBar label="Happiness" value={gameState.happiness} color="#EC4899" />
      <StatBar label="Energy" value={gameState.energy} color="#3B82F6" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  statContainer: {
    marginBottom: 8,
    width: '100%',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    fontWeight: 'bold',
    color: '#374151',
  },
  statValue: {
    color: '#6B7280',
  },
  barBackground: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
  },
});

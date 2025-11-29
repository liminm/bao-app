import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameState } from '../hooks/useGameState';

interface Props {
  gameState: GameState;
}

const StatBar = ({ label, value, color, icon }: { label: string; value: number; color: string; icon?: string }) => (
  <View style={styles.statContainer}>
    <View style={styles.statHeader}>
      <Text style={styles.statLabel}>{icon} {label}</Text>
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

const STAT_CONFIG = {
  dough: {
    moisture: { label: 'Hydration', color: '#3B82F6', icon: '💧' },
    fullness: { label: 'Gluten', color: '#F97316', icon: '🍞' },
    hygiene: { label: 'Smoothness', color: '#8B5CF6', icon: '✨' },
  },
  wrapper: {
    moisture: { label: 'Pliability', color: '#14B8A6', icon: '🌊' },
    fullness: { label: 'Stuffing', color: '#EF4444', icon: '🥩' },
    hygiene: { label: 'Freshness', color: '#EC4899', icon: '🍃' }, // Changed from Flavor to Freshness to match hygiene decay logic better
  },
  dish: {
    moisture: { label: 'Temp', color: '#F59E0B', icon: '🔥' },
    fullness: { label: 'Satisfaction', color: '#10B981', icon: '😊' },
    hygiene: { label: 'Aroma', color: '#F472B6', icon: '🌸' },
  },
  leftover: {
    moisture: { label: 'Moisture', color: '#9CA3AF', icon: '💧' },
    fullness: { label: 'Fullness', color: '#9CA3AF', icon: '🍖' },
    hygiene: { label: 'Hygiene', color: '#9CA3AF', icon: '🧼' },
  },
};

export const StatsDisplay: React.FC<Props> = ({ gameState }) => {
  const stageConfig = STAT_CONFIG[gameState.stage] || STAT_CONFIG.dough;

  return (
    <View style={styles.container}>
      {/* Moisture / Hydration / Pliability / Temp */}
      <StatBar
        label={stageConfig.moisture.label}
        value={gameState.moisture}
        color={stageConfig.moisture.color}
        icon={stageConfig.moisture.icon}
      />

      {/* Fullness / Gluten / Stuffing / Satisfaction */}
      <StatBar
        label={stageConfig.fullness.label}
        value={gameState.fullness}
        color={stageConfig.fullness.color}
        icon={stageConfig.fullness.icon}
      />

      {/* Hygiene / Smoothness / Freshness / Aroma */}
      <StatBar
        label={stageConfig.hygiene.label}
        value={gameState.hygiene}
        color={stageConfig.hygiene.color}
        icon={stageConfig.hygiene.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 32,
    paddingVertical: 8, // Reduced from 16
  },
  statContainer: {
    marginBottom: 4, // Reduced from 8
    width: '100%',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2, // Reduced from 4
  },
  statLabel: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 12, // Smaller font
  },
  statValue: {
    color: '#6B7280',
    fontSize: 12, // Smaller font
  },
  barBackground: {
    height: 8, // Reduced from 16
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});

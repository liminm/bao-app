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
      {/* Moisture with Steam Zone indicator */}
      <View style={styles.statContainer}>
        <View style={styles.statHeader}>
          <Text style={styles.statLabel}>Moisture (HP)</Text>
          <Text style={styles.statValue}>{Math.round(gameState.moisture)}%</Text>
        </View>
        <View style={styles.barBackground}>
          {/* Steam Zone Marker (40-80%) */}
          <View
            style={{
              position: 'absolute',
              left: '40%',
              width: '40%', // 80 - 40 = 40%
              height: '100%',
              backgroundColor: 'rgba(59, 130, 246, 0.2)', // Light blue tint
              zIndex: 1,
            }}
          />
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.max(0, Math.min(100, gameState.moisture))}%`,
                backgroundColor: gameState.moisture < 40 ? '#EF4444' : gameState.moisture > 80 ? '#3B82F6' : '#10B981', // Red if low, Blue if high, Green if good
                zIndex: 2,
                opacity: 0.8,
              }
            ]}
          />
        </View>
      </View>

      <StatBar label="Fullness" value={gameState.fullness} color="#F97316" />
      <StatBar label="Hygiene" value={gameState.hygiene} color="#8B5CF6" />
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

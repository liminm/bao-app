import React, { useState, useCallback } from 'react';
import { View, SafeAreaView, Text, StatusBar, StyleSheet } from 'react-native';
import { useGameState } from './src/hooks/useGameState';
import { BaoCharacter } from './src/components/BaoCharacter';
import { StatsDisplay } from './src/components/StatsDisplay';
import { Controls } from './src/components/Controls';

export default function App() {
  const { gameState, feed, play, clean, isLoaded } = useGameState();
  const [interaction, setInteraction] = useState<'feed' | 'play' | 'clean' | null>(null);

  const handleInteraction = useCallback((type: 'feed' | 'play' | 'clean', action: () => void) => {
    action();
    setInteraction(type);
    setTimeout(() => setInteraction(null), 2000);
  }, []);

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Waking up Bao...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Bao</Text>
        <Text style={styles.subtitle}>Your Dumpling Friend</Text>
      </View>

      <View style={styles.characterArea}>
        <BaoCharacter gameState={gameState} interaction={interaction === 'clean' ? 'sleep' : interaction} />
      </View>

      <View style={styles.bottomPanel}>
        <StatsDisplay gameState={gameState} />
        <Controls
          onFeed={() => handleInteraction('feed', feed)}
          onPlay={() => handleInteraction('play', play)}
          onClean={() => handleInteraction('clean', clean)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF3C7',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
  },
  characterArea: {
    flex: 1,
  },
  bottomPanel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});

import React, { useState, useCallback, useEffect } from 'react';
import { View, SafeAreaView, Text, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameState, IngredientType, IngredientVariant } from './src/hooks/useGameState';
import { BaoCharacter } from './src/components/BaoCharacter';
import { StatsDisplay } from './src/components/StatsDisplay';
import { CabbageBed } from './src/components/CabbageBed';
import { LazySusan } from './src/components/LazySusan';
import { Teapot } from './src/components/Teapot';
import { EvolutionOverlay } from './src/components/EvolutionOverlay';
import { RollingPin } from './src/components/RollingPin';

export default function App() {
  const { gameState, feed, pourWater, swapLeaf, flatten, evolve, resetGame, isLoaded, STAGE_1_DURATION } = useGameState();
  const [interaction, setInteraction] = useState<string | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);

  // Check for evolution readiness
  useEffect(() => {
    if (gameState.stage === 'wrapper' && gameState.age >= STAGE_1_DURATION) {
      setShowEvolution(true);
    }
  }, [gameState.age, gameState.stage, STAGE_1_DURATION]);

  const handleEvolve = useCallback(() => {
    evolve();
    setShowEvolution(false);
  }, [evolve]);

  const handleFeed = useCallback((type: IngredientType, variant: IngredientVariant) => {
    feed(type, variant);

    let animType = 'feed';
    if (type === 'dough_modifier') {
      if (variant === 'flour') animType = 'feed-flour';
      else if (variant === 'water_drop') animType = 'feed-water';
    } else if (type === 'spice') {
      animType = 'feed-spice';
    } else if (type === 'filling') {
      animType = 'feed-filling';
    }

    setInteraction(animType as any);
    setTimeout(() => setInteraction(null), 2000);
  }, [feed]);

  const handlePour = useCallback(() => {
    pourWater();
    setInteraction('play'); // Pouring makes him happy/loving
    setTimeout(() => setInteraction(null), 2000);
  }, [pourWater]);

  const handleSwap = useCallback(() => {
    swapLeaf();
    setInteraction('clean');
    setTimeout(() => setInteraction(null), 2000);
  }, [swapLeaf]);

  const handleTool = useCallback((tool: 'rolling_pin') => {
    if (tool === 'rolling_pin') {
      flatten();
      setInteraction('flatten');
      setTimeout(() => setInteraction(null), 500);
    }
  }, [flatten]);

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
        <Text style={styles.stageText}>Stage: {gameState.stage.toUpperCase()}</Text>
        <StatsDisplay gameState={gameState} />
      </View>

      <View style={styles.gameArea}>
        {/* Layer 1: Cabbage Bed - Only show after dough stage */}
        {gameState.stage !== 'dough' && (
          <CabbageBed leafHealth={gameState.leafHealth} onSwap={handleSwap} />
        )}

        {/* Layer 2: Character */}
        {/* Map 'clean' interaction to 'sleep' for BaoCharacter compatibility if needed, or update BaoCharacter */}
        <BaoCharacter gameState={gameState} interaction={interaction === 'clean' ? 'sleep' : interaction} />

        {/* Layer 3: Tools Overlay */}
        <View style={styles.toolsOverlay}>
          {gameState.stage !== 'dough' && (
            <View style={styles.teapotContainer}>
              <Teapot onPour={handlePour} />
            </View>
          )}

          {/* Debug Reset Button */}
          <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
            <Text style={styles.resetText}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomPanel}>
        <LazySusan onFeed={handleFeed} onTool={handleTool} stage={gameState.stage} />
      </View>

      <EvolutionOverlay isVisible={showEvolution} onEvolve={handleEvolve} />
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
    paddingTop: 10, // Reduced from 60. SafeAreaView should handle status bar, but we can add a small buffer if needed.
    paddingBottom: 4,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  stageText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  toolsOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
    zIndex: 50,
  },
  teapotContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 24,
    color: '#4B5563',
  },
  bottomPanel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 100, // Ensure height for placeholder
    justifyContent: 'center',
  },
  placeholderPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
  }
});

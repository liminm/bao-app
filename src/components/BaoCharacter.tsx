import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { GameState } from '../hooks/useGameState';

const IMAGES = {
  happy: require('../assets/images/bao-happy.png'),
  love: require('../assets/images/bao-love.png'),
  surprised: require('../assets/images/bao-surprised.png'),
  winking: require('../assets/images/bao-winking.png'),
  spicy: require('../assets/images/bao-spicy.png'),
};

interface Props {
  gameState: GameState;
  interaction?: 'feed' | 'play' | 'sleep' | null;
}

export const BaoCharacter: React.FC<Props> = ({ gameState, interaction }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Breathing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -5, // Reduced from -10
          duration: 2000, // Slower breathing (was 1000)
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2000, // Slower breathing (was 1000)
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interaction animation
  useEffect(() => {
    if (interaction) {
      if (interaction === 'flatten') {
        // Squish animation for flattening
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1, // Wider
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.9, // Flatter
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [interaction]);

  const getImage = () => {
    // Stage 0: Dough
    if (gameState.stage === 'dough') return require('../assets/images/bao-dough.jpg');

    // Stage 1: Wrapper
    if (gameState.stage === 'wrapper') return require('../assets/images/bao-wrapper.jpg');

    // Stage 2: Dish (Final)
    if (gameState.stage === 'dish') {
      const type = gameState.dishType || 'standard';

      switch (type) {
        case 'potsticker': return require('../assets/images/bao-dish-potsticker.png');
        case 'shumai': return require('../assets/images/bao-dish-shumai.jpg');
        case 'wonton': return require('../assets/images/bao-dish-wonton.png');
        case 'xlb': return require('../assets/images/bao-dish-xlb.png');
        case 'standard':
        default:
          return require('../assets/images/bao-dish-standard.png');
      }
    }

    // Fail State
    if (gameState.stage === 'leftover') return IMAGES.spicy; // Placeholder for leftover

    // Fallback to original logic for safety (shouldn't be reached if stage is set)
    if (gameState.moisture < 40) return IMAGES.surprised;
    if (gameState.moisture > 80) return IMAGES.winking;
    if (gameState.hygiene < 30) return IMAGES.spicy;
    if (gameState.moisture >= 40 && gameState.moisture <= 80) return IMAGES.love;

    return IMAGES.happy;
  };

  // Calculate tint color based on flavor (Only for Dish stage or subtle hint in Fold)
  const getTintColor = () => {
    if (gameState.stage === 'wrapper') return undefined;

    const { spicy, sweet, salty } = gameState.flavor;
    const total = spicy + sweet + salty;
    if (total === 0) return undefined;

    // Much more subtle opacity (0.1 instead of 0.3)
    if (spicy > sweet && spicy > salty) return 'rgba(239, 68, 68, 0.1)'; // Reddish
    if (sweet > spicy && sweet > salty) return 'rgba(244, 114, 182, 0.1)'; // Pinkish
    if (salty > spicy && salty > sweet) return 'rgba(210, 180, 140, 0.1)'; // Beige/Brownish

    return undefined;
  };

  // Calculate opacity/gloss based on moisture
  // Dry (<40) = Matte (Normal opacity)
  // Wet (>80) = Glossy (High opacity + shine)
  // We can simulate "Dry" by reducing opacity slightly or adding a "cracked" overlay (not implemented yet)
  // We simulate "Wet" by adding a white gloss overlay

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
        <Image
          source={getImage()}
          style={styles.image}
          resizeMode="contain"
        />
        {/* Flavor Tint Overlay */}
        <View style={[styles.overlay, { backgroundColor: getTintColor() }]} />

        {/* Moisture Gloss Overlay (Simple white opacity) */}
        {gameState.moisture > 80 && (
          <View style={[styles.overlay, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  image: {
    width: 256,
    height: 256,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 128, // Match image shape roughly
  },
});

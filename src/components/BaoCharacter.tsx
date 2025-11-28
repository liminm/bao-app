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
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interaction animation
  useEffect(() => {
    if (interaction) {
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
  }, [interaction]);

  const getImage = () => {
    if (interaction === 'play') return IMAGES.love;
    if (interaction === 'feed') return IMAGES.happy;
    if (interaction === 'sleep') return IMAGES.winking; // Sleep is now Clean, but keeping the interaction name for now until Controls update

    // State based images
    if (gameState.moisture < 40) return IMAGES.surprised; // Dried out
    if (gameState.moisture > 80) return IMAGES.winking; // Soggy
    if (gameState.hygiene < 30) return IMAGES.spicy; // Dirty/Moldy

    if (gameState.moisture >= 40 && gameState.moisture <= 80) return IMAGES.love; // Ideal Steam Zone

    return IMAGES.happy;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
        <Image
          source={getImage()}
          style={styles.image}
          resizeMode="contain"
        />
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
});

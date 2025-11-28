import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { GameState } from '../hooks/useGameState';

const IMAGES = {
  happy: require('../assets/images/bao-happy.png'),
  love: require('../assets/images/bao-love.png'),
  surprised: require('../assets/images/bao-surprised.png'),
  winking: require('../assets/images/bao-winking.jpg'),
  spicy: require('../assets/images/bao-spicy.png'),
};

interface Props {
  gameState: GameState;
  interaction?: 'feed' | 'play' | 'sleep' | null;
}

export const BaoCharacter: React.FC<Props> = ({ gameState, interaction }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (interaction) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [interaction]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const getImage = () => {
    if (interaction === 'play') return IMAGES.love;
    if (interaction === 'feed') return IMAGES.happy;
    if (interaction === 'sleep') return IMAGES.winking;

    if (gameState.happiness > 80) return IMAGES.love;
    if (gameState.hunger < 30) return IMAGES.surprised;
    
    return IMAGES.happy;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
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

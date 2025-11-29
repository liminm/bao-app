import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
    onFlatten: () => void;
}

export const RollingPin: React.FC<Props> = ({ onFlatten }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const lastGesture = useRef({ dx: 0, dy: 0 });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.extractOffset();
                Haptics.selectionAsync();
            },
            onPanResponderMove: (evt, gestureState) => {
                // Track total distance moved to simulate rolling
                const distance = Math.sqrt(
                    Math.pow(gestureState.dx - lastGesture.current.dx, 2) +
                    Math.pow(gestureState.dy - lastGesture.current.dy, 2)
                );

                if (distance > 20) { // Threshold for a "roll"
                    onFlatten();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    lastGesture.current = { dx: gestureState.dx, dy: gestureState.dy };
                }

                Animated.event(
                    [
                        null,
                        { dx: pan.x, dy: pan.y }
                    ],
                    { useNativeDriver: false }
                )(evt, gestureState);
            },
            onPanResponderRelease: () => {
                pan.flattenOffset();
                // Spring back to center
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
                lastGesture.current = { dx: 0, dy: 0 };
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
            ]}
            {...panResponder.panHandlers}
        >
            <Text style={styles.icon}>🥖</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D1D5DB',
        borderRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 100, // Boost elevation
        zIndex: 100,
    },
    icon: {
        fontSize: 40,
    }
});

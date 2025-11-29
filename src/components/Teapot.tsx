import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
    onPour: () => void;
}

export const Teapot: React.FC<Props> = ({ onPour }) => {
    const [isPouring, setIsPouring] = useState(false);
    const tilt = useRef(new Animated.Value(0)).current;
    const steamOpacity = useRef(new Animated.Value(0)).current;

    const pourInterval = useRef<NodeJS.Timeout | null>(null);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setIsPouring(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                // Tilt animation
                Animated.timing(tilt, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();

                // Steam animation
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(steamOpacity, { toValue: 0.8, duration: 500, useNativeDriver: true }),
                        Animated.timing(steamOpacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
                    ])
                ).start();

                // Start pouring loop
                const interval = setInterval(() => {
                    onPour();
                    Haptics.selectionAsync();
                }, 200);

                // Store interval to clear later
                pourInterval.current = interval;
            },
            onPanResponderRelease: () => {
                setIsPouring(false);
                if (pourInterval.current) {
                    clearInterval(pourInterval.current);
                    pourInterval.current = null;
                }

                // Reset animations
                Animated.timing(tilt, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();

                Animated.timing(steamOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            },
        })
    ).current;

    const rotate = tilt.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-45deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.teapot, { transform: [{ rotate }] }]}
                {...panResponder.panHandlers}
            >
                <Text style={styles.icon}>🫖</Text>
            </Animated.View>

            {/* Steam Effect */}
            <Animated.View
                style={[
                    styles.steam,
                    {
                        opacity: steamOpacity,
                        transform: [{ translateY: -50 }]
                    }
                ]}
            >
                <Text style={styles.steamIcon}>💨</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
    },
    teapot: {
        width: 64,
        height: 64,
        backgroundColor: '#374151',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
    },
    icon: {
        fontSize: 32,
    },
    steam: {
        position: 'absolute',
        top: -20,
        left: -20,
    },
    steamIcon: {
        fontSize: 24,
    }
});

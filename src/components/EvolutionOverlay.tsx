import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
    isVisible: boolean;
    onEvolve: () => void;
}

const { width, height } = Dimensions.get('window');

export const EvolutionOverlay: React.FC<Props> = ({ isVisible, onEvolve }) => {
    const [steamCleared, setSteamCleared] = useState(0); // 0 to 10
    const opacity = useRef(new Animated.Value(0)).current;
    const steamOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
            setSteamCleared(0);
            steamOpacity.setValue(1);
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    const handleTap = () => {
        if (!isVisible) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newCleared = steamCleared + 1;
        setSteamCleared(newCleared);

        // Fade out steam as you tap
        steamOpacity.setValue(1 - (newCleared / 10));

        if (newCleared >= 10) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onEvolve();
        }
    };

    if (!isVisible && opacity._value === 0) return null;

    return (
        <Animated.View style={[styles.container, { opacity }]} pointerEvents={isVisible ? 'auto' : 'none'}>
            <TouchableOpacity style={styles.touchArea} activeOpacity={1} onPress={handleTap}>
                <Animated.View style={[styles.steamLayer, { opacity: steamOpacity }]}>
                    <Text style={styles.steamText}>💨 Tap to Clear Steam! 💨</Text>
                    <View style={styles.cloud1}><Text style={styles.cloudText}>☁️</Text></View>
                    <View style={styles.cloud2}><Text style={styles.cloudText}>☁️</Text></View>
                    <View style={styles.cloud3}><Text style={styles.cloudText}>☁️</Text></View>
                </Animated.View>

                {steamCleared >= 10 && (
                    <View style={styles.reveal}>
                        <Text style={styles.revealText}>DING! 🔔</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(240, 240, 240, 0.95)', // Slightly darker/opaque
        zIndex: 1000, // High z-index
        elevation: 20, // High elevation for Android
        alignItems: 'center',
        justifyContent: 'center',
    },
    touchArea: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    steamLayer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    steamText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 60,
        textAlign: 'center',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    cloud1: {
        position: 'absolute',
        top: -80,
        left: -120,
        opacity: 0.9,
        transform: [{ scale: 1.5 }],
    },
    cloud2: {
        position: 'absolute',
        top: 60,
        right: -120,
        opacity: 0.9,
        transform: [{ scale: 2 }],
    },
    cloud3: {
        position: 'absolute',
        bottom: -80,
        left: 40,
        opacity: 0.9,
        transform: [{ scale: 1.2 }],
    },
    cloudText: {
        fontSize: 80, // Using emoji clouds for better visual
    },
    reveal: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 20,
        borderRadius: 20,
        elevation: 10,
    },
    revealText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#F59E0B',
    }
});

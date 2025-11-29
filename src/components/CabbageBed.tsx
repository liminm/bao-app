import React, { useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';

interface Props {
    leafHealth: number;
    onSwap: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export const CabbageBed: React.FC<Props> = ({ leafHealth, onSwap }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD || Math.abs(gestureState.dy) > SWIPE_THRESHOLD) {
                    // Swipe detected
                    Animated.parallel([
                        Animated.timing(pan, {
                            toValue: { x: gestureState.dx * 2, y: gestureState.dy * 2 }, // Fly off screen
                            duration: 200,
                            useNativeDriver: false,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: false,
                        }),
                    ]).start(() => {
                        onSwap();
                        // Reset position instantly
                        pan.setValue({ x: 0, y: 0 });
                        opacity.setValue(1);
                    });
                } else {
                    // Reset
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    // Visuals based on health
    // 100 = Fresh Green (#4ADE80)
    // 0 = Wilted Brown (#92400E)
    const backgroundColor = leafHealth > 50 ? '#4ADE80' : '#92400E';

    // Calculate rotation/scale for wilted effect
    const scale = leafHealth < 50 ? 0.9 : 1;

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.leaf,
                    {
                        backgroundColor,
                        transform: [
                            { translateX: pan.x },
                            { translateY: pan.y },
                            { scale },
                        ],
                        opacity,
                    },
                ]}
                {...panResponder.panHandlers}
            >
                {/* Leaf veins/texture details could go here */}
                <View style={styles.vein} />
                <View style={[styles.vein, { transform: [{ rotate: '45deg' }] }]} />
                <View style={[styles.vein, { transform: [{ rotate: '-45deg' }] }]} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1, // Behind dumpling
    },
    leaf: {
        width: 300,
        height: 300,
        borderRadius: 150,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#166534', // Dark green border
    },
    vein: {
        position: 'absolute',
        width: '80%',
        height: 2,
        backgroundColor: '#166534',
        opacity: 0.3,
    },
});

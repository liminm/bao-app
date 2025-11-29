import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';

interface Props {
    onStart: () => void;
}

const { width } = Dimensions.get('window');

export const StartupScreen: React.FC<Props> = ({ onStart }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }, { translateY }]
                    }
                ]}
            >
                <Text style={styles.title}>Bao</Text>
                <Text style={styles.subtitle}>The Little Dumpling</Text>

                <View style={styles.imageContainer}>
                    <Image
                        source={require('../assets/images/bao-happy.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Start Cooking</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF3C7', // Matches App background
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 20,
        color: '#6B7280',
        marginBottom: 40,
        fontWeight: '500',
    },
    imageContainer: {
        marginBottom: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    image: {
        width: 200,
        height: 200,
    },
    button: {
        backgroundColor: '#F59E0B', // Amber-500
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

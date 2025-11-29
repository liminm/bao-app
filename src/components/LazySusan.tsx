import React, { useRef } from 'react';
import { View, StyleSheet, Text, PanResponder, Animated, ScrollView, TouchableOpacity } from 'react-native';
import { IngredientType, IngredientVariant } from '../hooks/useGameState';
import * as Haptics from 'expo-haptics';

export type ToolType = 'rolling_pin';

interface Props {
    onFeed: (type: IngredientType, variant: IngredientVariant) => void;
    onTool?: (tool: ToolType) => void;
    stage?: string;
}

type ItemType = 'ingredient' | 'tool';

interface Item {
    type: ItemType;
    subType: IngredientType | ToolType;
    variant?: IngredientVariant;
    label: string;
    color: string;
}

const WRAPPER_ITEMS: Item[] = [
    { type: 'ingredient', subType: 'filling', variant: 'pork', label: '🥩', color: '#FCA5A5' },
    { type: 'ingredient', subType: 'filling', variant: 'shrimp', label: '🦐', color: '#FDBA74' },
    { type: 'ingredient', subType: 'filling', variant: 'veggie', label: '🥬', color: '#86EFAC' },
    { type: 'ingredient', subType: 'spice', variant: 'chili', label: '🌶️', color: '#EF4444' },
    { type: 'ingredient', subType: 'spice', variant: 'sugar', label: '🍬', color: '#F9A8D4' },
    { type: 'ingredient', subType: 'spice', variant: 'soy', label: '🫗', color: '#A8A29E' },
];

const DOUGH_ITEMS: Item[] = [
    { type: 'ingredient', subType: 'dough_modifier', variant: 'flour', label: '🥡', color: '#F3F4F6' },
    { type: 'ingredient', subType: 'dough_modifier', variant: 'water_drop', label: '💧', color: '#60A5FA' },
    { type: 'tool', subType: 'rolling_pin', label: '🥖', color: '#D1D5DB' },
];

const DISH_ITEMS: Item[] = [
    { type: 'ingredient', subType: 'snack', variant: 'rice', label: '🍚', color: '#FFFFFF' },
    { type: 'ingredient', subType: 'snack', variant: 'dim_sum', label: '🥟', color: '#FDE047' },
];

const DraggableItem = ({ item, onFeed, onTool }: { item: Item, onFeed: Props['onFeed'], onTool?: Props['onTool'] }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value
                });
                pan.setValue({ x: 0, y: 0 });
                Haptics.selectionAsync();
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                pan.flattenOffset();

                // Simple drop detection: if dragged up significantly (towards Bao)
                if (gestureState.dy < -100) {
                    if (item.type === 'ingredient') {
                        onFeed(item.subType as IngredientType, item.variant as IngredientVariant);
                    } else if (item.type === 'tool' && onTool) {
                        onTool(item.subType as ToolType);
                    }
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    // Reset position
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start();
                } else {
                    // Return to start
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start();
                }
            }
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.ingredient,
                { backgroundColor: item.color, transform: [{ translateX: pan.x }, { translateY: pan.y }] }
            ]}
            {...panResponder.panHandlers}
        >
            <Text style={styles.ingredientIcon}>{item.label}</Text>
        </Animated.View>
    );
};

export const LazySusan: React.FC<Props> = ({ onFeed, onTool, stage }) => {
    let items: Item[] = [];
    if (stage === 'dough') items = DOUGH_ITEMS;
    else if (stage === 'wrapper') items = WRAPPER_ITEMS;
    else if (stage === 'dish') items = DISH_ITEMS;

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {items.map((item, index) => (
                    <DraggableItem key={index} item={item} onFeed={onFeed} onTool={onTool} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginHorizontal: 20,
        marginBottom: 30, // Move up slightly
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        justifyContent: 'center',
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 20,
    },
    ingredient: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    ingredientIcon: {
        fontSize: 36,
    },
});

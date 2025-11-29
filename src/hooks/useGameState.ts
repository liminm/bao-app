import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'BAO_GAME_STATE';

// Decay rates (points per hour)
const MOISTURE_DECAY_BASE = 10;
const FULLNESS_DECAY = 15;
const HYGIENE_DECAY = 5;
const LEAF_DECAY = 10;

export type EvolutionStage = 'dough' | 'wrapper' | 'dish' | 'leftover';
export type DishType = 'potsticker' | 'shumai' | 'wonton' | 'standard' | 'xlb';

export interface GameState {
    moisture: number; // 0-100 (HP). 40-80 is "Steam Zone".
    fullness: number; // 0-100 (Hunger).
    hygiene: number; // 0-100 (Stickiness).
    leafHealth: number; // 0-100 (Cabbage Bed). 0 = Wilted/Brown.
    flavor: {
        spicy: number;
        sweet: number;
        salty: number;
    };
    stage: EvolutionStage;
    age: number; // Time alive in current stage (ms)
    flattenProgress: number; // 0-100 (For Dough -> Wrapper)
    dishType: DishType | null;
    lastSavedTime: number;
}

const INITIAL_STATE: GameState = {
    moisture: 60,
    fullness: 50,
    hygiene: 80,
    leafHealth: 100,
    flavor: { spicy: 0, sweet: 0, salty: 0 },
    stage: 'dough', // Start as dough
    age: 0,
    flattenProgress: 0,
    dishType: null,
    lastSavedTime: Date.now(),
};

// Evolution Thresholds
const STAGE_1_DURATION = 60 * 1000; // 1 minute for testing

export type IngredientType = 'filling' | 'spice' | 'dough_modifier' | 'snack';
export type IngredientVariant = 'pork' | 'shrimp' | 'veggie' | 'chili' | 'sugar' | 'soy' | 'flour' | 'water_drop' | 'rice' | 'dim_sum';

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [isLoaded, setIsLoaded] = useState(false);
    const appState = useRef(AppState.currentState);

    const calculateDecay = (state: GameState, timeDiffMs: number): GameState => {
        const hoursPassed = timeDiffMs / (1000 * 60 * 60);

        // Hygiene affects moisture decay
        const hygieneMultiplier = 1 + (1 - state.hygiene / 100);
        const moistureDecay = MOISTURE_DECAY_BASE * hygieneMultiplier;

        return {
            ...state,
            moisture: Math.max(0, state.moisture - (moistureDecay * hoursPassed)),
            fullness: Math.max(0, state.fullness - (FULLNESS_DECAY * hoursPassed)),
            hygiene: Math.max(0, state.hygiene - (HYGIENE_DECAY * hoursPassed)),
            leafHealth: Math.max(0, state.leafHealth - (LEAF_DECAY * hoursPassed)),
            age: state.age + timeDiffMs,
            lastSavedTime: Date.now(),
        };
    };

    // Load state on mount
    useEffect(() => {
        const loadState = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.leafHealth === undefined || parsed.stage === undefined) {
                        // Migration: Reset if major schema change
                        setGameState(INITIAL_STATE);
                    } else {
                        const now = Date.now();
                        const timeDiff = now - parsed.lastSavedTime;
                        const decayedState = calculateDecay(parsed, timeDiff);
                        setGameState(decayedState);
                    }
                }
            } catch (e) {
                console.error('Failed to load state', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadState();
    }, []);

    // Save state whenever it changes
    useEffect(() => {
        if (isLoaded) {
            const save = async () => {
                try {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...gameState, lastSavedTime: Date.now() }));
                } catch (e) {
                    console.error('Failed to save state', e);
                }
            };
            save();
        }
    }, [gameState, isLoaded]);

    // Handle AppState changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                setGameState(current => {
                    const now = Date.now();
                    const timeDiff = now - current.lastSavedTime;
                    return calculateDecay(current, timeDiff);
                });
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Game Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setGameState(current => calculateDecay(current, 1000)); // Tick every second for smoother age tracking
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const feed = useCallback((type: IngredientType, variant: IngredientVariant) => {
        setGameState(prev => {
            if (prev.leafHealth < 20 || prev.stage === 'leftover') return prev;

            let hungerChange = 0;
            let moistureChange = 0;
            let flavorChange = { spicy: 0, sweet: 0, salty: 0 };

            if (type === 'dough_modifier') {
                if (prev.stage !== 'dough') return prev;
                if (variant === 'flour') {
                    hungerChange = 10; // Adds Gluten
                    moistureChange = -10; // Reduces Hydration
                } else if (variant === 'water_drop') {
                    hungerChange = -5; // Reduces Gluten (dilutes)
                    moistureChange = 15; // Adds Hydration
                }
            } else if (type === 'filling') {
                if (prev.stage !== 'wrapper') return prev;
                hungerChange = 20;
                if (variant === 'pork') flavorChange.salty = 2;
                if (variant === 'shrimp') flavorChange.sweet = 2;
                if (variant === 'veggie') flavorChange.sweet = 1;
            } else if (type === 'spice') {
                if (prev.stage !== 'wrapper') return prev;
                hungerChange = 0;
                if (variant === 'chili') flavorChange.spicy = 10;
                if (variant === 'sugar') flavorChange.sweet = 10;
                if (variant === 'soy') flavorChange.salty = 10;
            } else if (type === 'snack') {
                if (prev.stage !== 'dish') return prev;
                if (variant === 'rice') hungerChange = 15;
                if (variant === 'dim_sum') hungerChange = 25;
            }

            return {
                ...prev,
                fullness: Math.min(100, Math.max(0, prev.fullness + hungerChange)),
                moisture: Math.min(100, Math.max(0, prev.moisture + moistureChange)),
                flavor: {
                    spicy: prev.flavor.spicy + flavorChange.spicy,
                    sweet: prev.flavor.sweet + flavorChange.sweet,
                    salty: prev.flavor.salty + flavorChange.salty,
                }
            };
        });
    }, []);

    const pourWater = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            moisture: Math.min(100, prev.moisture + 5), // Incremental increase while pouring
        }));
    }, []);

    const swapLeaf = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            leafHealth: 100,
            hygiene: Math.min(100, prev.hygiene + 20), // Swapping leaf improves hygiene
        }));
    }, []);

    const flatten = useCallback(() => {
        setGameState(prev => {
            if (prev.stage !== 'dough') return prev;

            const newProgress = prev.flattenProgress + 10; // 10 swipes to finish
            if (newProgress >= 100) {
                return {
                    ...prev,
                    stage: 'wrapper',
                    age: 0,
                    flattenProgress: 0,
                };
            }
            return {
                ...prev,
                flattenProgress: newProgress,
            };
        });
    }, []);

    const evolve = useCallback(() => {
        setGameState(prev => {
            if (prev.stage === 'wrapper' && prev.age >= STAGE_1_DURATION) {
                // Evolve directly to Dish
                const { spicy, sweet, salty } = prev.flavor;
                const { moisture } = prev;

                let type: DishType = 'standard';

                // Logic:
                // 1. High Moisture -> XLB (Soup Dumpling)
                // 2. Salty Dominant -> Potsticker (Fried/Pork)
                // 3. Sweet Dominant -> Shumai (Shrimp)
                // 4. Spicy Dominant -> Wonton
                // 5. Balanced/Low Flavor -> Standard

                if (moisture > 80) {
                    type = 'xlb';
                } else if (salty >= sweet && salty >= spicy && salty > 0) {
                    type = 'potsticker';
                } else if (sweet >= salty && sweet >= spicy && sweet > 0) {
                    type = 'shumai';
                } else if (spicy >= salty && spicy >= sweet && spicy > 0) {
                    type = 'wonton';
                } else {
                    type = 'standard';
                }

                return {
                    ...prev,
                    stage: 'dish',
                    age: 0,
                    dishType: type,
                };
            }
            return prev;
        });
    }, []);

    const resetGame = useCallback(() => {
        setGameState(INITIAL_STATE);
    }, []);

    return { gameState, feed, pourWater, swapLeaf, flatten, evolve, resetGame, isLoaded, STAGE_1_DURATION };
};

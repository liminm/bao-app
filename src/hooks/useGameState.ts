import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'BAO_GAME_STATE';

// Decay rates (points per hour)
const HUNGER_DECAY = 10;
const HAPPINESS_DECAY = 5;
const ENERGY_DECAY = 2;

export interface GameState {
    moisture: number; // 0-100 (HP). 40-80 is "Steam Zone". <40 Dried out, >80 Soggy.
    fullness: number; // 0-100 (Hunger).
    hygiene: number; // 0-100 (Stickiness). Lower hygiene = faster moisture decay.
    flavor: {
        spicy: number;
        sweet: number;
        salty: number;
    };
    lastSavedTime: number;
}

const INITIAL_STATE: GameState = {
    moisture: 60, // Start in the ideal zone
    fullness: 50,
    hygiene: 80,
    flavor: { spicy: 0, sweet: 0, salty: 0 },
    lastSavedTime: Date.now(),
};

// Decay rates (points per hour)
const MOISTURE_DECAY_BASE = 5;
const FULLNESS_DECAY = 10;
const HYGIENE_DECAY = 2;

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [isLoaded, setIsLoaded] = useState(false);
    const appState = useRef(AppState.currentState);

    const calculateDecay = (state: GameState, timeDiffMs: number): GameState => {
        const hoursPassed = timeDiffMs / (1000 * 60 * 60);
        
        // Hygiene affects moisture decay. Lower hygiene (sticky/moldy) -> faster moisture loss.
        // If hygiene is 100, multiplier is 1. If hygiene is 0, multiplier is 2.
        const hygieneMultiplier = 1 + (1 - state.hygiene / 100);
        const moistureDecay = MOISTURE_DECAY_BASE * hygieneMultiplier;

        return {
            ...state,
            moisture: Math.max(0, state.moisture - (moistureDecay * hoursPassed)),
            fullness: Math.max(0, state.fullness - (FULLNESS_DECAY * hoursPassed)),
            hygiene: Math.max(0, state.hygiene - (HYGIENE_DECAY * hoursPassed)),
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
                    // Migration check: if old keys exist, reset or map them. For now, just reset if keys don't match.
                    if (parsed.moisture === undefined) {
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

    // Handle AppState changes (Background -> Foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground, calculate decay
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

    // Game Loop (Tick every minute while active)
    useEffect(() => {
        const interval = setInterval(() => {
            setGameState(current => calculateDecay(current, 60 * 1000));
        }, 60 * 1000); // 1 minute

        return () => clearInterval(interval);
    }, []);

    const feed = useCallback(() => {
        setGameState(prev => {
            // Random flavor for now
            const flavors = ['spicy', 'sweet', 'salty'] as const;
            const randomFlavor = flavors[Math.floor(Math.random() * flavors.length)];
            
            return {
                ...prev,
                fullness: Math.min(100, prev.fullness + 20),
                flavor: {
                    ...prev.flavor,
                    [randomFlavor]: prev.flavor[randomFlavor] + 1
                }
            };
        });
    }, []);

    const play = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            moisture: Math.min(100, prev.moisture + 10), // Sweating increases moisture
            hygiene: Math.max(0, prev.hygiene - 10), // Gets sticky
            fullness: Math.max(0, prev.fullness - 5),
        }));
    }, []);

    const clean = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            hygiene: Math.min(100, prev.hygiene + 30),
            // Cleaning might slightly reduce moisture if we wipe it? Let's keep it simple for now.
        }));
    }, []);

    return { gameState, feed, play, clean, isLoaded };
};

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'BAO_GAME_STATE';

// Decay rates (points per hour)
const HUNGER_DECAY = 10;
const HAPPINESS_DECAY = 5;
const ENERGY_DECAY = 2;

export interface GameState {
    hunger: number; // 0-100 (0 = starving, 100 = full)
    happiness: number; // 0-100 (0 = sad, 100 = happy)
    energy: number; // 0-100 (0 = exhausted, 100 = energetic)
    lastSavedTime: number;
}

const INITIAL_STATE: GameState = {
    hunger: 50,
    happiness: 80,
    energy: 80,
    lastSavedTime: Date.now(),
};

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [isLoaded, setIsLoaded] = useState(false);
    const appState = useRef(AppState.currentState);

    const calculateDecay = (state: GameState, timeDiffMs: number): GameState => {
        const hoursPassed = timeDiffMs / (1000 * 60 * 60);

        return {
            ...state,
            hunger: Math.max(0, state.hunger - (HUNGER_DECAY * hoursPassed)),
            happiness: Math.max(0, state.happiness - (HAPPINESS_DECAY * hoursPassed)),
            energy: Math.max(0, state.energy - (ENERGY_DECAY * hoursPassed)),
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
                    const now = Date.now();
                    const timeDiff = now - parsed.lastSavedTime;
                    const decayedState = calculateDecay(parsed, timeDiff);
                    setGameState(decayedState);
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
        setGameState(prev => ({
            ...prev,
            hunger: Math.min(100, prev.hunger + 20),
            happiness: Math.min(100, prev.happiness + 5),
        }));
    }, []);

    const play = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            happiness: Math.min(100, prev.happiness + 15),
            energy: Math.max(0, prev.energy - 10),
            hunger: Math.max(0, prev.hunger - 5),
        }));
    }, []);

    const sleep = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            energy: Math.min(100, prev.energy + 30),
            hunger: Math.max(0, prev.hunger - 5),
        }));
    }, []);

    return { gameState, feed, play, sleep, isLoaded };
};
